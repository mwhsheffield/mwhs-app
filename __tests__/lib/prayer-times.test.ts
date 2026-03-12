import {
  addOneHour,
  adjustPrayerTimeForDST,
  buildPrayerCards,
  getNextPrayerCountdown,
  isInDSTAdjustmentPeriod,
  subtractOneHour,
} from '@/lib/prayer-times';
import { PrayerDayBundle } from '@/types/prayer';

const baseBundle: PrayerDayBundle = {
  date: new Date('2026-03-11T00:00:00'),
  prayerTimes: {
    date: '2026-03-11',
    fajr: '05:00',
    sunrise: '06:30',
    dhuhr: '12:15',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
  },
  adjustedPrayerTimes: {
    date: '2026-03-11',
    fajr: '05:00',
    sunrise: '06:30',
    dhuhr: '12:15',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
  },
  iqamahTimes: {
    fajr: '20 mins after adhan',
    dhuhr: '12:45',
    asr: '15 mins after adhan',
    maghrib: 'sunset',
    isha: '20:00',
    jummah: '13:00',
  },
  adjustedIqamahTimes: {
    fajr: '20 mins after adhan',
    dhuhr: '12:45',
    asr: '15 mins after adhan',
    maghrib: 'sunset',
    isha: '20:00',
    jummah: '13:00',
  },
  hijriDate: '11 Ramadan 1447',
  isFriday: false,
  isSummerPeriod: false,
};

describe('prayer-times', () => {
  it('returns the next adhan before fajr', () => {
    const countdown = getNextPrayerCountdown(baseBundle, new Date('2026-03-11T04:00:00'));
    expect(countdown).toMatchObject({
      prayerName: 'Fajr',
      eventLabel: 'Adhan',
      time: '05:00',
    });
  });

  it('returns the next iqamah after adhan has passed', () => {
    const countdown = getNextPrayerCountdown(baseBundle, new Date('2026-03-11T05:10:00'));
    expect(countdown).toMatchObject({
      prayerName: 'Fajr',
      eventLabel: 'Iqamah',
      time: '05:20',
      isIqamah: true,
    });
  });

  it('rolls over to tomorrow fajr after isha', () => {
    const countdown = getNextPrayerCountdown(baseBundle, new Date('2026-03-11T23:30:00'));
    expect(countdown).toMatchObject({
      prayerName: 'Fajr',
      eventLabel: 'Adhan',
      time: '05:00',
    });
  });

  it('shows summer isha as after maghrib', () => {
    const cards = buildPrayerCards(
      {
        ...baseBundle,
        isSummerPeriod: true,
      },
      new Date('2026-06-20T10:00:00')
    );

    expect(cards.find((card) => card.key === 'isha')?.iqamah).toBe('After Maghrib');
  });

  it('uses jummah khutbah wording on friday', () => {
    const countdown = getNextPrayerCountdown(
      {
        ...baseBundle,
        date: new Date('2026-03-13T00:00:00'),
        isFriday: true,
      },
      new Date('2026-03-13T12:50:00')
    );

    expect(countdown).toMatchObject({
      prayerName: 'Jummah',
      eventLabel: 'Khutbah',
      time: '13:00',
      isJummah: true,
    });
  });

  it('detects march and october DST adjustment windows from the JSON data', async () => {
    await expect(isInDSTAdjustmentPeriod(new Date('2026-03-29T12:00:00'))).resolves.toBe(true);
    await expect(isInDSTAdjustmentPeriod(new Date('2026-10-25T12:00:00'))).resolves.toBe(true);
    await expect(isInDSTAdjustmentPeriod(new Date('2026-04-01T12:00:00'))).resolves.toBe(false);
  });

  it('adjusts transition-day prayer times correctly', async () => {
    await expect(adjustPrayerTimeForDST('12:15', new Date('2026-03-29T12:00:00'))).resolves.toBe(addOneHour('12:15'));
    await expect(adjustPrayerTimeForDST('18:00', new Date('2026-10-25T12:00:00'))).resolves.toBe(subtractOneHour('18:00'));
  });
});
