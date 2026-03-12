import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '@/components/events/EventCard';
import { COLORS, FONT_FAMILIES, FONT_SIZES, RADII, SPACING } from '@/constants';
import { useEventsSubscription } from '@/lib/hooks/useEventsSubscription';

export default function EventsScreen() {
  const { events, loading, error } = useEventsSubscription();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>MWHS</Text>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Upcoming classes, circles, and community gatherings from the live MWHS schedule.</Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={COLORS.deepNavy} />
            <Text style={styles.stateText}>Loading events…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Events Unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>No Events Available</Text>
            <Text style={styles.stateText}>Check back soon for upcoming MWHS events.</Text>
          </View>
        ) : null}

        {!loading && !error ? events.map((event) => <EventCard key={event.id} event={event} onPress={() => router.push(`/events/${event.id}`)} />) : null}
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
  hero: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  kicker: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: 40,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  stateCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    gap: SPACING.xs,
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
    textAlign: 'center',
  },
});
