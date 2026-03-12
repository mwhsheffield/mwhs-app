import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

import { getFirebaseDb } from '@/lib/firebase';
import { Event, EventSchema } from '@/types/event';
import { formatEventDate, formatEventTime } from '@/lib/time';

const EVENTS_COLLECTION = 'events';

type EventDocSnapshot = QueryDocumentSnapshot | { id: string; data: () => Record<string, unknown> };

function isEvent(value: Event | null): value is Event {
  return value !== null;
}

export function mapDocToEvent(docSnapshot: EventDocSnapshot): Event | null {
  const parsedEvent = EventSchema.safeParse({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  });

  if (!parsedEvent.success) {
    return null;
  }

  return parsedEvent.data;
}

export function subscribeToEvents(callback: (events: Event[]) => void, onError?: (message: string) => void): Unsubscribe {
  const eventsRef = collection(getFirebaseDb(), EVENTS_COLLECTION);
  const eventsQuery = query(eventsRef, orderBy('time', 'asc'));

  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((docSnapshot) => mapDocToEvent(docSnapshot)).filter(isEvent));
    },
    (error) => {
      onError?.(error.message);
      callback([]);
    }
  );
}

export async function getAllEvents(): Promise<Event[]> {
  const eventsRef = collection(getFirebaseDb(), EVENTS_COLLECTION);
  const snapshot = await getDocs(query(eventsRef, orderBy('time', 'asc')));
  return snapshot.docs.map((docSnapshot) => mapDocToEvent(docSnapshot)).filter(isEvent);
}

export async function getEventById(id: string): Promise<Event | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), EVENTS_COLLECTION, id));
  if (!snapshot.exists()) {
    return null;
  }

  return mapDocToEvent({
    id: snapshot.id,
    data: () => snapshot.data() ?? {},
  });
}

export { formatEventDate, formatEventTime };
