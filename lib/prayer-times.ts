import moment from 'moment-hijri';

import { APP_CONFIG } from '@/constants';
import { getSheffieldNow, isSameSheffieldDay, isValidDate, parseTimeToDate } from '@/lib/time';
import {
  DailyIqamahTimes,
  DailyPrayerTimes,
  DSTDateRange,
  DSTDatesData,
  IqamahTimeRange,
  MonthlyPrayerTimes,
  PrayerCalendarDay,
  PrayerCardState,
  PrayerCountdown,
  PrayerDayBundle,
  PrayerName,
  RamadanData,
  RamadanPrayerRow,
} from '@/types/prayer';

import januaryData from '@/assets/data/prayer/january.json';
import februaryData from '@/assets/data/prayer/february.json';
import marchData from '@/assets/data/prayer/march.json';
import aprilData from '@/assets/data/prayer/april.json';
import mayData from '@/assets/data/prayer/may.json';
import juneData from '@/assets/data/prayer/june.json';
import julyData from '@/assets/data/prayer/july.json';
import augustData from '@/assets/data/prayer/august.json';
import septemberData from '@/assets/data/prayer/september.json';
import octoberData from '@/assets/data/prayer/october.json';
import novemberData from '@/assets/data/prayer/november.json';
import decemberData from '@/assets/data/prayer/december.json';
import ramadanDataFallback from '@/assets/data/prayer/ramadan.json';
import dstDatesFallback from '@/assets/data/docs/dst-start-end.json';

const dayNames: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tues',
  Wednesday: 'Wed',
  Thursday: 'Thurs',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const monthlyFallbacks: Record<number, MonthlyPrayerTimes> = {
  1: januaryData as MonthlyPrayerTimes,
  2: februaryData as MonthlyPrayerTimes,
  3: marchData as MonthlyPrayerTimes,
  4: aprilData as MonthlyPrayerTimes,
  5: mayData as MonthlyPrayerTimes,
  6: juneData as MonthlyPrayerTimes,
  7: julyData as MonthlyPrayerTimes,
  8: augustData as MonthlyPrayerTimes,
  9: septemberData as MonthlyPrayerTimes,
  10: octoberData as MonthlyPrayerTimes,
  11: novemberData as MonthlyPrayerTimes,
  12: decemberData as MonthlyPrayerTimes,
};

const monthlyCache = new Map<number, MonthlyPrayerTimes>();
let ramadanCache: RamadanData | null = null;
let dstCache: DSTDatesData | null = null;

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseRamadanRange(data: RamadanData) {
  const start = new Date(data.gregorian_start);
  const end = new Date(data.gregorian_end);
  return {
    start: toDateOnly(start),
    end: toDateOnly(end),
  };
}

function isDateWithinRamadan(date: Date, data: RamadanData): boolean {
  const range = parseRamadanRange(data);
  const normalized = toDateOnly(date);
  return normalized >= range.start && normalized <= range.end;
}

function getRamadanDay(date: Date, data: RamadanData): number {
  const { start } = parseRamadanRange(data);
  const diffMs = toDateOnly(date).getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

function findRamadanDayData(prayerTimes: RamadanPrayerRow[], ramadanDay: number): RamadanPrayerRow | undefined {
  let closestPrevious: RamadanPrayerRow | undefined;

  for (const row of prayerTimes) {
    if (row.ramadan_day === ramadanDay) {
      return row;
    }
    if (row.ramadan_day <= ramadanDay && (!closestPrevious || row.ramadan_day > closestPrevious.ramadan_day)) {
      closestPrevious = row;
    }
  }

  return closestPrevious ?? prayerTimes[0];
}

function buildDailyPrayerTimes(date: Date, prayerRow: RamadanPrayerRow | { fajr: string; shurooq: string; dhuhr: string; asr: string; maghrib: string; isha: string }): DailyPrayerTimes {
  return {
    date: date.toISOString().split('T')[0] ?? '',
    fajr: prayerRow.fajr,
    sunrise: prayerRow.shurooq,
    dhuhr: prayerRow.dhuhr,
    asr: prayerRow.asr,
    maghrib: prayerRow.maghrib,
    isha: prayerRow.isha,
  };
}

function getIqamahTimesForDate(dayNumber: number, iqamahRanges: IqamahTimeRange[], jummah: string): DailyIqamahTimes {
  const range = iqamahRanges.find((item) => {
    const [start, end = start] = item.date_range.split('-').map(Number);
    return dayNumber >= start && dayNumber <= end;
  });

  if (!range) {
    throw new Error(`No iqamah times found for day ${dayNumber}`);
  }

  return {
    fajr: range.fajr,
    dhuhr: range.dhuhr,
    asr: range.asr,
    maghrib: 'sunset',
    isha: range.isha,
    jummah,
  };
}

function resolveIqamahFromAdhan(value: string, adhanTime: string): string {
  const match = value.match(/^(\d+)\s*mins?\s*after\s*adhan$/i);
  if (!match) {
    return value;
  }

  const minutesAfter = Number.parseInt(match[1] ?? '0', 10);
  const [hours, minutes] = adhanTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesAfter;
  const resolvedHours = Math.floor(totalMinutes / 60) % 24;
  const resolvedMinutes = totalMinutes % 60;

  return `${String(resolvedHours).padStart(2, '0')}:${String(resolvedMinutes).padStart(2, '0')}`;
}

export function getIqamahTime(prayer: PrayerName, adhanTime: string, iqamahTimes: DailyIqamahTimes, isSummerPeriod = false): string {
  if (prayer === 'sunrise') return '--:--';
  if (prayer === 'maghrib') return adhanTime;
  if (prayer === 'isha' && isSummerPeriod) return 'After Maghrib';
  if (prayer === 'jummah') return iqamahTimes.jummah;

  const rawValue = iqamahTimes[prayer === 'dhuhr' ? 'dhuhr' : prayer];
  if (prayer === 'isha' && rawValue === 'Entry Time') {
    return adhanTime;
  }

  return resolveIqamahFromAdhan(rawValue, adhanTime);
}

export function formatDateForDisplay(date: Date): string {
  const longDay = date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: APP_CONFIG.timezone });
  const shortDay = dayNames[longDay] ?? longDay;
  const rest = date.toLocaleDateString('en-GB', {
    timeZone: APP_CONFIG.timezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${shortDay} ${rest}`;
}

export function getHijriDate(date: Date): string {
  const hijriMoment = moment(date);
  const monthNames = [
    'Muharram',
    'Safar',
    "Rabi' al-awwal",
    "Rabi' al-thani",
    'Jumada al-awwal',
    'Jumada al-thani',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    "Dhu al-Qi'dah",
    'Dhu al-Hijjah',
  ];

  return `${hijriMoment.iDate()} ${monthNames[hijriMoment.iMonth()] ?? ''} ${hijriMoment.iYear()}`;
}

export async function loadMonthlyPrayerTimes(month: number): Promise<MonthlyPrayerTimes> {
  const cached = monthlyCache.get(month);
  if (cached) {
    return cached;
  }

  const monthlyData = monthlyFallbacks[month];
  if (!monthlyData) {
    throw new Error(`Invalid month ${month}`);
  }

  monthlyCache.set(month, monthlyData);
  return monthlyData;
}

async function loadRamadanData(): Promise<RamadanData> {
  if (ramadanCache) {
    return ramadanCache;
  }

  ramadanCache = ramadanDataFallback as RamadanData;
  return ramadanCache;
}

export async function loadDSTDates(): Promise<DSTDateRange[]> {
  if (dstCache) {
    return dstCache.uk_dst_dates;
  }

  dstCache = dstDatesFallback as DSTDatesData;
  return dstCache.uk_dst_dates;
}

export function addOneHour(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const nextHours = (hours + 1) % 24;
  return `${String(nextHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function subtractOneHour(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const nextHours = (hours + 23) % 24;
  return `${String(nextHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function getDSTTransitionType(date: Date): Promise<'start' | 'end' | null> {
  const ranges = await loadDSTDates();
  const range = ranges.find((item) => item.year === date.getFullYear());
  if (!range) {
    return null;
  }

  const startDate = new Date(range.start_date);
  const endDate = new Date(range.end_date);

  if (toDateOnly(date).getTime() === toDateOnly(startDate).getTime()) {
    return 'start';
  }
  if (toDateOnly(date).getTime() === toDateOnly(endDate).getTime()) {
    return 'end';
  }

  return null;
}

export async function isInDSTAdjustmentPeriod(date: Date): Promise<boolean> {
  const ranges = await loadDSTDates();
  const range = ranges.find((item) => item.year === date.getFullYear());
  if (!range) {
    return false;
  }

  const month = date.getMonth() + 1;
  const startDate = new Date(range.start_date);
  const endDate = new Date(range.end_date);

  if (month === 3) {
    return toDateOnly(date) >= toDateOnly(startDate);
  }
  if (month === 10) {
    return toDateOnly(date) >= toDateOnly(endDate);
  }

  return false;
}

export async function adjustPrayerTimeForDST(timeString: string, date: Date): Promise<string> {
  const transitionType = await getDSTTransitionType(date);
  if (transitionType === 'start') {
    return addOneHour(timeString);
  }
  if (transitionType === 'end') {
    return subtractOneHour(timeString);
  }
  return timeString;
}

export async function getDSTAdjustmentIqamahDate(date: Date): Promise<{ month: number; date: number } | null> {
  if (!(await isInDSTAdjustmentPeriod(date))) {
    return null;
  }

  const ranges = await loadDSTDates();
  const range = ranges.find((item) => item.year === date.getFullYear());
  if (!range) {
    return null;
  }

  if (date.getMonth() + 1 === 10) {
    const endDate = new Date(range.end_date).getDate();
    const dayOffset = date.getDate() - endDate;
    if (dayOffset >= 0 && dayOffset <= 5) {
      return { month: 11, date: dayOffset + 1 };
    }
  }

  if (date.getMonth() + 1 === 3) {
    const startDate = new Date(range.start_date).getDate();
    const dayOffset = date.getDate() - startDate;
    if (dayOffset >= 0 && dayOffset <= 1) {
      return { month: 4, date: dayOffset + 1 };
    }
  }

  return null;
}

export function isSummerPeriod(date: Date): boolean {
  const year = date.getFullYear();
  const may15 = new Date(year, 4, 15);
  const august15 = new Date(year, 7, 15);
  return date >= may15 && date <= august15;
}

export async function getPrayerTimesForDate(date: Date): Promise<DailyPrayerTimes> {
  const ramadanData = await loadRamadanData();
  if (isDateWithinRamadan(date, ramadanData)) {
    const dayData = findRamadanDayData(ramadanData.prayer_times, getRamadanDay(date, ramadanData));
    if (dayData) {
      return buildDailyPrayerTimes(date, dayData);
    }
  }

  const monthlyData = await loadMonthlyPrayerTimes(date.getMonth() + 1);
  const dayData = monthlyData.prayer_times.find((item) => item.date === date.getDate());
  if (!dayData) {
    throw new Error(`Prayer times not found for ${date.toDateString()}`);
  }

  return buildDailyPrayerTimes(date, dayData);
}

export async function getIqamahTimesForSpecificDate(date: Date): Promise<DailyIqamahTimes> {
  const ramadanData = await loadRamadanData();
  if (isDateWithinRamadan(date, ramadanData)) {
    return getIqamahTimesForDate(getRamadanDay(date, ramadanData), ramadanData.iqamah_times, ramadanData.jummah_iqamah);
  }

  const monthlyData = await loadMonthlyPrayerTimes(date.getMonth() + 1);
  return getIqamahTimesForDate(date.getDate(), monthlyData.iqamah_times, monthlyData.jummah_iqamah);
}

function getHighlightKey(cards: PrayerCardState[], iqamahTimes: DailyIqamahTimes, date: Date, isFriday: boolean, now: Date): PrayerName | null {
  const majorIndices = [0, 2, 3, 4, 5];
  const iqamahDates = cards.map((card) => {
    const name = card.key === 'jummah' ? 'dhuhr' : card.key;
    if (name === 'sunrise') return null;
    const iqamah = name === 'dhuhr' && isFriday ? iqamahTimes.jummah : card.iqamah;
    return parseTimeToDate(date, iqamah);
  });

  for (let index = 0; index < majorIndices.length; index += 1) {
    const currentIndex = majorIndices[index]!;
    const previousIndex = majorIndices[index === 0 ? majorIndices.length - 1 : index - 1]!;
    const currentIqamah = iqamahDates[currentIndex];
    const previousIqamah = iqamahDates[previousIndex];

    if (!currentIqamah || !previousIqamah) {
      continue;
    }

    const windowStart = new Date(previousIqamah);
    if (index === 0) {
      windowStart.setDate(windowStart.getDate() - 1);
    }
    windowStart.setMinutes(windowStart.getMinutes() + 10);

    if (now >= windowStart && now < currentIqamah) {
      return cards[currentIndex]?.key ?? null;
    }
  }

  return null;
}

export function buildPrayerCards(bundle: PrayerDayBundle, now: Date = getSheffieldNow()): PrayerCardState[] {
  const displayDhuhrKey = bundle.isFriday ? 'jummah' : 'dhuhr';
  const cards: PrayerCardState[] = [
    {
      key: 'fajr',
      label: 'Fajr',
      adhan: bundle.adjustedPrayerTimes.fajr,
      iqamah: getIqamahTime('fajr', bundle.adjustedPrayerTimes.fajr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isHighlighted: false,
    },
    {
      key: 'sunrise',
      label: 'Sunrise',
      adhan: bundle.adjustedPrayerTimes.sunrise,
      iqamah: '--:--',
      isHighlighted: false,
    },
    {
      key: displayDhuhrKey,
      label: bundle.isFriday ? 'Jummah' : 'Dhuhr',
      adhan: bundle.adjustedPrayerTimes.dhuhr,
      iqamah: bundle.isFriday
        ? getIqamahTime('jummah', bundle.adjustedPrayerTimes.dhuhr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod)
        : getIqamahTime('dhuhr', bundle.adjustedPrayerTimes.dhuhr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isHighlighted: false,
    },
    {
      key: 'asr',
      label: 'Asr',
      adhan: bundle.adjustedPrayerTimes.asr,
      iqamah: getIqamahTime('asr', bundle.adjustedPrayerTimes.asr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isHighlighted: false,
    },
    {
      key: 'maghrib',
      label: 'Maghrib',
      adhan: bundle.adjustedPrayerTimes.maghrib,
      iqamah: getIqamahTime('maghrib', bundle.adjustedPrayerTimes.maghrib, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isHighlighted: false,
    },
    {
      key: 'isha',
      label: 'Isha',
      adhan: bundle.adjustedPrayerTimes.isha,
      iqamah: getIqamahTime('isha', bundle.adjustedPrayerTimes.isha, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isHighlighted: false,
    },
  ];

  if (!isSameSheffieldDay(bundle.date, now)) {
    return cards;
  }

  const highlightedKey = getHighlightKey(cards, bundle.adjustedIqamahTimes, bundle.date, bundle.isFriday, now);
  return cards.map((card) => ({
    ...card,
    isHighlighted: card.key === highlightedKey,
  }));
}

export function getNextPrayerCountdown(bundle: PrayerDayBundle, now: Date = getSheffieldNow()): PrayerCountdown | null {
  const prayers = [
    {
      label: 'Fajr',
      adhan: bundle.adjustedPrayerTimes.fajr,
      iqamah: getIqamahTime('fajr', bundle.adjustedPrayerTimes.fajr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isJummah: false,
    },
    {
      label: bundle.isFriday ? 'Jummah' : 'Dhuhr',
      adhan: bundle.adjustedPrayerTimes.dhuhr,
      iqamah: bundle.isFriday
        ? getIqamahTime('jummah', bundle.adjustedPrayerTimes.dhuhr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod)
        : getIqamahTime('dhuhr', bundle.adjustedPrayerTimes.dhuhr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isJummah: bundle.isFriday,
    },
    {
      label: 'Asr',
      adhan: bundle.adjustedPrayerTimes.asr,
      iqamah: getIqamahTime('asr', bundle.adjustedPrayerTimes.asr, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isJummah: false,
    },
    {
      label: 'Maghrib',
      adhan: bundle.adjustedPrayerTimes.maghrib,
      iqamah: getIqamahTime('maghrib', bundle.adjustedPrayerTimes.maghrib, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isJummah: false,
    },
    {
      label: 'Isha',
      adhan: bundle.adjustedPrayerTimes.isha,
      iqamah: getIqamahTime('isha', bundle.adjustedPrayerTimes.isha, bundle.adjustedIqamahTimes, bundle.isSummerPeriod),
      isJummah: false,
    },
  ];

  for (const prayer of prayers) {
    if (!prayer.isJummah) {
      const adhanDate = parseTimeToDate(now, prayer.adhan);
      if (adhanDate && adhanDate > now) {
        const diffMs = adhanDate.getTime() - now.getTime();
        return {
          prayerName: prayer.label,
          eventLabel: 'Adhan',
          time: prayer.adhan,
          hours: Math.floor(diffMs / (1000 * 60 * 60)),
          minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
          isJummah: false,
          isIqamah: false,
        };
      }
    }

    const iqamahDate = parseTimeToDate(now, prayer.iqamah);
    if (iqamahDate && iqamahDate > now) {
      const diffMs = iqamahDate.getTime() - now.getTime();
      return {
        prayerName: prayer.label,
        eventLabel: prayer.isJummah ? 'Khutbah' : 'Iqamah',
        time: prayer.iqamah,
        hours: Math.floor(diffMs / (1000 * 60 * 60)),
        minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
        isJummah: prayer.isJummah,
        isIqamah: !prayer.isJummah,
      };
    }
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextFajr = parseTimeToDate(tomorrow, bundle.adjustedPrayerTimes.fajr);
  if (!nextFajr) {
    return null;
  }

  const diffMs = nextFajr.getTime() - now.getTime();
  return {
    prayerName: 'Fajr',
    eventLabel: 'Adhan',
    time: bundle.adjustedPrayerTimes.fajr,
    hours: Math.floor(diffMs / (1000 * 60 * 60)),
    minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
    isJummah: false,
    isIqamah: false,
  };
}

export async function buildPrayerDayBundle(date: Date): Promise<PrayerDayBundle> {
  if (!isValidDate(date)) {
    throw new Error('Invalid date for prayer times.');
  }

  const [prayerTimes, iqamahTimes] = await Promise.all([getPrayerTimesForDate(date), getIqamahTimesForSpecificDate(date)]);

  const dstIqamahDate = await getDSTAdjustmentIqamahDate(date);
  let adjustedIqamahTimes = iqamahTimes;
  if (dstIqamahDate) {
    adjustedIqamahTimes = await getIqamahTimesForSpecificDate(new Date(date.getFullYear(), dstIqamahDate.month - 1, dstIqamahDate.date));
  }

  let adjustedPrayerTimes = prayerTimes;
  if (await isInDSTAdjustmentPeriod(date)) {
    adjustedPrayerTimes = {
      ...prayerTimes,
      dhuhr: await adjustPrayerTimeForDST(prayerTimes.dhuhr, date),
      maghrib: await adjustPrayerTimeForDST(prayerTimes.maghrib, date),
    };
  }

  return {
    date,
    prayerTimes,
    iqamahTimes,
    adjustedPrayerTimes,
    adjustedIqamahTimes,
    hijriDate: getHijriDate(date),
    isFriday: date.getDay() === 5,
    isSummerPeriod: isSummerPeriod(date),
  };
}

export async function buildPrayerCalendarForMonth(monthDate: Date): Promise<PrayerCalendarDay[]> {
  if (!isValidDate(monthDate)) {
    throw new Error('Invalid month for prayer calendar.');
  }

  const monthly = await loadMonthlyPrayerTimes(monthDate.getMonth() + 1);
  const rows = await Promise.all(
    monthly.prayer_times.map(async (row) => {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), row.date);
      const bundle = await buildPrayerDayBundle(date);
      return {
        date,
        displayDate: formatDateForDisplay(date),
        prayerTimes: bundle.adjustedPrayerTimes,
        iqamahTimes: bundle.adjustedIqamahTimes,
      };
    })
  );

  return rows;
}
