import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, FONT_SIZES, RADII, SPACING } from '@/constants';
import { formatEventDate, formatEventTime } from '@/lib/events';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const accessibilityLabel = `${event.name}, ${formatEventDate(event.time)} at ${formatEventTime(event.time)}${
    event.location ? `, ${event.location}` : ''
  }`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : undefined]}
    >
      {event.poster ? <Image source={{ uri: event.poster }} contentFit="cover" style={styles.poster} /> : <View style={styles.posterFallback}><Text style={styles.posterFallbackText}>MWHS</Text></View>}
      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.meta}>{formatEventDate(event.time)}</Text>
        <Text style={styles.meta}>{formatEventTime(event.time)}</Text>
        {event.location ? <Text style={styles.location}>{event.location}</Text> : null}
        {event.recurrenceType && event.recurrenceType !== 'none' ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{event.recurrenceType === 'weekly' ? 'Weekly' : 'Biweekly'}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  cardPressed: {
    opacity: 0.92,
  },
  poster: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surfaceMuted,
  },
  posterFallback: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterFallbackText: {
    color: COLORS.offWhite,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.xxxl,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.xxl,
  },
  meta: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
  location: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansSemiBold,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(148, 178, 194, 0.18)',
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs,
  },
  badgeText: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansSemiBold,
    fontSize: FONT_SIZES.xs,
  },
});
