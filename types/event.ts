import { z } from 'zod';

export const RECURRENCE_TYPES = ['none', 'weekly', 'biweekly'] as const;

export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

function coerceFirestoreDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof value.toDate === 'function') {
      const parsed = value.toDate();
      return parsed instanceof Date ? parsed : undefined;
    }

    if ('seconds' in value && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
  }

  return undefined;
}

const FirestoreDateSchema = z.preprocess(coerceFirestoreDate, z.date());

export const HttpsUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Expected an https URL');

export const EventSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    time: FirestoreDateSchema,
    location: z
      .string()
      .trim()
      .optional()
      .catch('')
      .transform((value) => value ?? ''),
    poster: HttpsUrlSchema.optional().catch(undefined),
    signupLink: HttpsUrlSchema.optional().catch(undefined),
    signupEnabled: z
      .boolean()
      .optional()
      .catch(false)
      .transform((value) => value ?? false),
    recurrenceType: z.enum(RECURRENCE_TYPES).optional().catch(undefined),
    recurrenceEndDate: FirestoreDateSchema.optional().catch(undefined),
    createdAt: FirestoreDateSchema.optional().catch(undefined),
    updatedAt: FirestoreDateSchema.optional().catch(undefined),
  })
  .transform((event) => ({
    ...event,
    createdAt: event.createdAt ?? event.time,
  }));

export type Event = z.infer<typeof EventSchema>;

export function isSafeHttpsUrl(url: string): boolean {
  return HttpsUrlSchema.safeParse(url).success;
}
