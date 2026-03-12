import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILIES, FONT_SIZES, RADII, SPACING } from '@/constants';
import { buildPrayerCalendarForMonth, getIqamahTime } from '@/lib/prayer-times';
import { PrayerCalendarDay } from '@/types/prayer';

export default function PrayerCalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [days, setDays] = useState<PrayerCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const nextDays = await buildPrayerCalendarForMonth(currentMonth);
        if (!cancelled) {
          setDays(nextDays);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Unable to load the monthly prayer calendar.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [currentMonth]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>Prev</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'Europe/London' })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
            style={styles.monthButton}
          >
            <Text style={styles.monthButtonText}>Next</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={COLORS.deepNavy} />
            <Text style={styles.stateText}>Loading monthly prayer calendar…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Calendar Unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error
          ? days.map((day) => (
              <View key={day.date.toISOString()} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day.displayDate}</Text>
                {[
                  ['Fajr', day.prayerTimes.fajr, getIqamahTime('fajr', day.prayerTimes.fajr, day.iqamahTimes)],
                  ['Sunrise', day.prayerTimes.sunrise, '--:--'],
                  [day.date.getDay() === 5 ? 'Jummah' : 'Dhuhr', day.prayerTimes.dhuhr, day.date.getDay() === 5 ? day.iqamahTimes.jummah : getIqamahTime('dhuhr', day.prayerTimes.dhuhr, day.iqamahTimes)],
                  ['Asr', day.prayerTimes.asr, getIqamahTime('asr', day.prayerTimes.asr, day.iqamahTimes)],
                  ['Maghrib', day.prayerTimes.maghrib, getIqamahTime('maghrib', day.prayerTimes.maghrib, day.iqamahTimes)],
                  ['Isha', day.prayerTimes.isha, getIqamahTime('isha', day.prayerTimes.isha, day.iqamahTimes)],
                ].map(([label, adhan, iqamah]) => (
                  <View key={`${day.date.toISOString()}-${label}`} style={styles.row}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <View style={styles.rowTimes}>
                      <Text style={styles.rowTime}>{adhan}</Text>
                      <Text style={styles.rowTimeMuted}>{iqamah}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          : null}
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
    gap: SPACING.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthButton: {
    backgroundColor: COLORS.deepNavy,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  monthButtonText: {
    color: COLORS.offWhite,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.sm,
  },
  monthTitle: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.xxl,
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
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  dayTitle: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.surfaceMuted,
    paddingTop: SPACING.sm,
  },
  rowLabel: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.md,
  },
  rowTimes: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rowTime: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.md,
  },
  rowTimeMuted: {
    color: COLORS.textSecondary,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
});
