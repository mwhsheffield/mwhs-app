import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { PrayerWidget } from '@/components/prayer/PrayerWidget';
import { PrayerDayBundle } from '@/types/prayer';

const fridayBundle: PrayerDayBundle = {
  date: new Date('2026-03-13T00:00:00'),
  prayerTimes: {
    date: '2026-03-13',
    fajr: '05:00',
    sunrise: '06:30',
    dhuhr: '12:15',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
  },
  adjustedPrayerTimes: {
    date: '2026-03-13',
    fajr: '05:00',
    sunrise: '06:30',
    dhuhr: '12:15',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
  },
  iqamahTimes: {
    fajr: '05:20',
    dhuhr: '12:45',
    asr: '15:45',
    maghrib: 'sunset',
    isha: '20:00',
    jummah: '13:00',
  },
  adjustedIqamahTimes: {
    fajr: '05:20',
    dhuhr: '12:45',
    asr: '15:45',
    maghrib: 'sunset',
    isha: '20:00',
    jummah: '13:00',
  },
  hijriDate: '23 Ramadan 1447',
  isFriday: true,
  isSummerPeriod: false,
};

describe('PrayerWidget', () => {
  it('renders jummah countdown wording and calendar CTA', () => {
    render(<PrayerWidget bundle={fridayBundle} now={new Date('2026-03-13T12:50:00')} onOpenCalendar={() => {}} />);

    expect(screen.getByText(/The Khutbah of/i)).toBeTruthy();
    expect(screen.getByText('JUMMAH')).toBeTruthy();
    expect(screen.getByText('View Full Calendar')).toBeTruthy();
  });
});
