import { useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { COLORS, FONT_FAMILIES, FONT_SIZES, RADII, SPACING } from '@/constants';
import { formatEventDate, formatEventTime, getEventById } from '@/lib/events';
import { Event, isSafeHttpsUrl } from '@/types/event';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasSafeSignupLink = event?.signupLink ? isSafeHttpsUrl(event.signupLink) : false;

  const handleOpenSignupLink = () => {
    if (!event?.signupLink || !isSafeHttpsUrl(event.signupLink)) {
      return;
    }

    void Linking.openURL(event.signupLink);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const nextEvent = await getEventById(id);
        if (!cancelled) {
          setEvent(nextEvent);
          if (!nextEvent) {
            setError('This event could not be found.');
          }
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Unable to load this event.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={COLORS.deepNavy} />
            <Text style={styles.stateText}>Loading event…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Event Unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : null}

        {!loading && event ? (
          <View style={styles.card}>
            {event.poster ? <Image source={{ uri: event.poster }} contentFit="contain" style={styles.poster} /> : null}
            <Text style={styles.title}>{event.name}</Text>
            <Text style={styles.meta}>{formatEventDate(event.time)}</Text>
            <Text style={styles.meta}>{formatEventTime(event.time)}</Text>
            {event.location ? <Text style={styles.location}>{event.location}</Text> : null}
            {event.recurrenceType && event.recurrenceType !== 'none' ? (
              <Text style={styles.recurrence}>
                {event.recurrenceType === 'weekly' ? 'Weekly' : 'Biweekly'}
                {event.recurrenceEndDate ? ` until ${formatEventDate(event.recurrenceEndDate)}` : ''}
              </Text>
            ) : null}
            {hasSafeSignupLink ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Open signup link" onPress={handleOpenSignupLink} style={styles.button}>
                <Text style={styles.buttonText}>Open Signup Link</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  content: {
    padding: SPACING.lg,
  },
  stateCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stateText: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  errorTitle: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  poster: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.md,
  },
  title: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: 36,
  },
  meta: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.md,
  },
  location: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansSemiBold,
    fontSize: FONT_SIZES.lg,
  },
  recurrence: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.steelBlue,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.sm,
  },
});
