import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, FONT_SIZES, RADII, SPACING } from '@/constants';
import { formatSheffieldTime } from '@/lib/time';
import { buildPrayerCards, formatDateForDisplay, getNextPrayerCountdown } from '@/lib/prayer-times';
import { PrayerDayBundle } from '@/types/prayer';

interface PrayerWidgetProps {
  bundle: PrayerDayBundle;
  now: Date;
  onOpenCalendar: () => void;
}

export function PrayerWidget({ bundle, now, onOpenCalendar }: PrayerWidgetProps) {
  const cards = buildPrayerCards(bundle, now);
  const countdown = getNextPrayerCountdown(bundle, now);

  return (
    <LinearGradient colors={['#07172c', '#07172c', '#94b2c2']} style={styles.gradientCard}>
      <View style={styles.headerRow}>
        <View style={styles.headerCell}>
          <Text style={styles.headerMuted}>{formatDateForDisplay(now)}</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerTime}>{formatSheffieldTime(now)}</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={[styles.headerMuted, styles.headerRight]}>{bundle.hijriDate}</Text>
        </View>
      </View>

      {countdown ? (
        <View style={styles.countdownSection}>
          <Text style={styles.countdownLabel}>
            The {countdown.eventLabel} of <Text style={styles.countdownHighlight}>{countdown.prayerName.toUpperCase()}</Text> is in
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

      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.key} style={[styles.prayerCard, card.isHighlighted ? styles.prayerCardActive : styles.prayerCardDefault]}>
            <Text style={[styles.prayerName, card.isHighlighted ? styles.prayerNameActive : undefined]}>{card.label}</Text>
            <Text style={[styles.prayerTime, card.isHighlighted ? styles.prayerTimeActive : undefined]}>{card.adhan}</Text>
            <View style={[styles.separator, card.isHighlighted ? styles.separatorActive : undefined]} />
            <View style={styles.iqamahRow}>
              <Text style={[styles.iqamahLabel, card.isHighlighted ? styles.iqamahLabelActive : undefined]}>
                {card.key === 'sunrise' ? '' : 'Iqamah'}
              </Text>
              <Text style={[styles.iqamahValue, card.isHighlighted ? styles.iqamahValueActive : undefined]}>{card.iqamah}</Text>
            </View>
          </View>
        ))}
      </View>

      {bundle.isSummerPeriod ? <Text style={styles.summerNote}>Summer Schedule: Maghrib & Isha combined (May 15 - August 15)</Text> : null}

      <Pressable accessibilityRole="button" onPress={onOpenCalendar} style={styles.calendarButton}>
        <Text style={styles.calendarButtonText}>View Full Calendar</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    gap: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCell: {
    flex: 1,
  },
  headerMuted: {
    color: COLORS.steelBlue,
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.sm,
  },
  headerRight: {
    textAlign: 'right',
  },
  headerTime: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  countdownSection: {
    gap: SPACING.md,
  },
  countdownLabel: {
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.lg,
  },
  countdownHighlight: {
    fontFamily: FONT_FAMILIES.sansHeavy,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  prayerCard: {
    width: '31%',
    minWidth: 100,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  prayerCardDefault: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  prayerCardActive: {
    backgroundColor: COLORS.deepNavy,
    borderWidth: 2,
    borderColor: COLORS.highlightRing,
  },
  prayerName: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  prayerNameActive: {
    color: 'rgba(255,255,255,0.92)',
  },
  prayerTime: {
    color: COLORS.deepNavy,
    fontFamily: FONT_FAMILIES.sansHeavy,
    fontSize: 32,
    textAlign: 'center',
  },
  prayerTimeActive: {
    color: COLORS.white,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(7,23,44,0.1)',
  },
  separatorActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  iqamahRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iqamahLabel: {
    color: 'rgba(7,23,44,0.6)',
    fontFamily: FONT_FAMILIES.sans,
    fontSize: FONT_SIZES.xs,
  },
  iqamahLabelActive: {
    color: COLORS.textMuted,
  },
  iqamahValue: {
    color: 'rgba(7,23,44,0.85)',
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.sm,
  },
  iqamahValueActive: {
    color: COLORS.white,
  },
  summerNote: {
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.serif,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
  },
  calendarButton: {
    alignSelf: 'flex-end',
  },
  calendarButtonText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.sansBold,
    fontSize: FONT_SIZES.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.white,
    paddingBottom: 2,
  },
});
