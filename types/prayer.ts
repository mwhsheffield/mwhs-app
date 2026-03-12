export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'jummah' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  date: number;
  fajr: string;
  shurooq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface IqamahTimeRange {
  date_range: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  isha: string;
}

export interface MonthlyPrayerTimes {
  month: string;
  prayer_times: PrayerTime[];
  iqamah_times: IqamahTimeRange[];
  jummah_iqamah: string;
}

export interface DailyPrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface DailyIqamahTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
}

export interface PrayerCountdown {
  prayerName: string;
  eventLabel: 'Adhan' | 'Iqamah' | 'Khutbah';
  time: string;
  hours: number;
  minutes: number;
  seconds: number;
  isJummah: boolean;
  isIqamah: boolean;
}

export interface PrayerCardState {
  key: PrayerName;
  label: string;
  adhan: string;
  iqamah: string;
  isHighlighted: boolean;
}

export interface DSTDateRange {
  year: number;
  start_date: string;
  end_date: string;
}

export interface DSTDatesData {
  uk_dst_dates: DSTDateRange[];
}

export interface RamadanPrayerRow {
  ramadan_day: number;
  gregorian: string;
  fajr: string;
  shurooq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface RamadanData {
  month: string;
  gregorian_start: string;
  gregorian_end: string;
  prayer_times: RamadanPrayerRow[];
  iqamah_times: IqamahTimeRange[];
  jummah_iqamah: string;
  taraweeh?: string;
}

export interface PrayerDayBundle {
  date: Date;
  prayerTimes: DailyPrayerTimes;
  iqamahTimes: DailyIqamahTimes;
  adjustedPrayerTimes: DailyPrayerTimes;
  adjustedIqamahTimes: DailyIqamahTimes;
  hijriDate: string;
  isFriday: boolean;
  isSummerPeriod: boolean;
}

export interface PrayerCalendarDay {
  date: Date;
  displayDate: string;
  prayerTimes: DailyPrayerTimes;
  iqamahTimes: DailyIqamahTimes;
}
