import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILIES, FONT_SIZES, RADII, SPACING } from '@/constants';
import { buildPrayerCards, buildPrayerDayBundle, formatDateForDisplay, getNextPrayerCountdown } from '@/lib/prayer-times';
import { getSheffieldNow } from '@/lib/time';
import { PrayerDayBundle } from '@/types/prayer';

export default function PrayerScreen() {
  const [bundle, setBundle] = useState<PrayerDayBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => getSheffieldNow());

  useEffect(() => {
    const timer = setInterval(() => setNow(getSheffieldNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadPrayerData = async () => {
    try {
      setError(null);
      const nextBundle = await buildPrayerDayBundle(getSheffieldNow());
      setBundle(nextBundle);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load prayer times.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPrayerData();
  }, []);

  const cards = bundle ? buildPrayerCards(bundle, now) : [];
  const countdown = bundle ? getNextPrayerCountdown(bundle, now) : null;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl tintColor={COLORS.steelBlue} refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          void loadPrayerData();
        }} />}
      >
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={COLORS.steelBlue} />
            <Text style={styles.loadingText}>Loading prayer times…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Prayer Times Unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && bundle ? (
          <>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{formatDateForDisplay(now)}</Text>
              <Text style={styles.hijriText}>{bundle.hijriDate}</Text>
            </View>

            {countdown ? (
              <View style={styles.countdownSection}>
                <Text style={styles.countdownLabel}>
                  The {countdown.eventLabel} of{' '}
                  <Text style={styles.countdownHighlight}>{countdown.prayerName.toUpperCase()}</Text> is in
                </Text>
                <View style={styles.timerRow}>
                  {[
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Minutes' },
                    { value: countdown.seconds, label: 'Seconds' },
                  ].map((item, index) => (
                    <View key={item.label} style={styles.timerChunk}>
                      <Text style={styles.timerValue}>{String(item.value).padStart(2, '0')}</Text>
                      <Text style={styles.timerMeta}>{item.label}</Text>
                      {index < 2 ? <Text style={styles.timerColon}>:</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.prayerTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Prayer</Text>
                <Text style={styles.tableHeaderText}>Adhan</Text>
                <Text style={styles.tableHeaderText}>Iqamah</Text>
              </View>
              {cards.map((card) => (
                <View
                  key={card.key}
                  style={[
                    styles.tableRow,
                    card.isHighlighted ? styles.tableRowActive : undefined,
                  ]}
                >
                  <Text style={[styles.tableCellName, card.isHighlighted ? styles.tableCellActive : undefined]}>
                    {card.label}
                  </Text>
                  <Text style={[styles.tableCellTime, card.isHighlighted ? styles.tableCellActive : undefined]}>
                    {card.adhan}
                  </Text>
                  <Text style={[styles.tableCellTime, card.isHighlighted ? styles.tableCellActive : undefined]}>
                    {card.iqamah}
                  </Text>
                </View>
              ))}
            </View>

            {bundle.isSummerPeriod ? (
              <View style={styles.summerNote}>
                <Text style={styles.summerNoteText}>Summer Schedule: Maghrib & Isha combined (May 15 - August 15)</Text>
              </View>
            ) : null}

            <Pressable accessibilityRole="button" onPress={() => router.push('/prayer-calendar')} style={styles.calendarButton}>
              <Text style={styles.calendarButtonText}>View Full Calendar</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.deepNavy,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    paddingTop: SPACING.md,
  },
  loadingCard: {
    backgroundColor: COLORS.surfaceStrong,
    borderRadius: RADII.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(148, 178, 194, 0.15)',
  },
  loadingText: {
    color: COLORS.steelBlue,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.md,
  },
  errorCard: {
    backgroundColor: 'rgba(180, 35, 24, 0.15)',
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorTitle: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.xs,
  },
  errorText: {
    color: COLORS.steelBlue,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  dateText: {
    color: COLORS.steelBlue,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
  hijriText: {
    color: COLORS.steelBlue,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
  countdownSection: {
    gap: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  countdownLabel: {
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.lg,
  },
  countdownHighlight: {
    fontFamily: FONT_FAMILIES.sansHeavy,
    color: COLORS.white,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  timerChunk: {
    alignItems: 'center',
    minWidth: 82,
    position: 'relative',
  },
  timerValue: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.sansHeavy,
    fontSize: FONT_SIZES.display,
    lineHeight: 56,
  },
  timerMeta: {
    color: COLORS.steelBlue,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  timerColon: {
    position: 'absolute',
    right: -14,
    top: 8,
    color: COLORS.white,
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONT_FAMILIES.sansBold,
  },
  prayerTable: {
    borderRadius: RADII.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(148, 178, 194, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  tableHeaderText: {
    flex: 1,
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(7,23,44,0.08)',
  },
  tableRowActive: {
    backgroundColor: 'rgba(148, 178, 194, 0.15)',
  },
  tableCellName: {
    flex: 1,
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.lg,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tableCellTime: {
    flex: 1,
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
  },
  tableCellActive: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansHeavy,
  },
  summerNote: {
    backgroundColor: 'rgba(148, 178, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(148, 178, 194, 0.2)',
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  summerNoteText: {
    color: COLORS.steelBlue,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  },
  calendarButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(148, 178, 194, 0.15)',
    borderRadius: RADII.pill,
    marginTop: SPACING.sm,
  },
  calendarButtonText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.md,
  },
});