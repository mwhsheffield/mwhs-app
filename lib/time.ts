import { APP_CONFIG } from '@/constants';

function buildDateFromParts(reference: Date): Date {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(reference);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;

  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const second = Number(get('second'));

  if ([year, month, day, hour, minute, second].some(Number.isNaN)) {
    return new Date(Number.NaN);
  }

  return new Date(year, month - 1, day, hour, minute, second, 0);
}

export function getSheffieldNow(reference: Date = new Date()): Date {
  return buildDateFromParts(reference);
}

export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function parseTimeToDate(date: Date, time: string): Date | null {
  if (!isValidDate(date)) {
    return null;
  }

  if (!time || time === '-' || time === '--:--' || time === 'After Maghrib') {
    return null;
  }

  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const parsed = new Date(date);
  parsed.setHours(hours, minutes, 0, 0);
  return parsed;
}

export function formatSheffieldTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    timeZone: APP_CONFIG.timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_CONFIG.timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_CONFIG.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/\s/g, '')
    .toUpperCase();
}

export function isSameSheffieldDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
