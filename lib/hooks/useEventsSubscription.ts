import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { subscribeToEvents } from '@/lib/events';
import { Event } from '@/types/event';

export function useEventsSubscription() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  useEffect(() => {
    if (!isFocused || appState !== 'active') {
      return;
    }

    setLoading(true);
    let unsubscribe = () => {};

    try {
      unsubscribe = subscribeToEvents(
        (nextEvents) => {
          setEvents(nextEvents);
          setError(null);
          setLoading(false);
        },
        (message) => {
          setError(message);
          setLoading(false);
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load events.');
      setLoading(false);
    }

    return () => unsubscribe();
  }, [appState, isFocused]);

  return { events, loading, error };
}
