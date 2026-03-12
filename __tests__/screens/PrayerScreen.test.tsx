import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

import PrayerScreen from '@/app/(tabs)/index';
import { buildPrayerDayBundle } from '@/lib/prayer-times';

jest.mock('@/lib/prayer-times', () => {
  const actual = jest.requireActual('@/lib/prayer-times');
  return {
    ...actual,
    buildPrayerDayBundle: jest.fn(),
  };
});

const mockedBuildPrayerDayBundle = buildPrayerDayBundle as jest.MockedFunction<typeof buildPrayerDayBundle>;

describe('PrayerScreen', () => {
  beforeEach(() => {
    mockedBuildPrayerDayBundle.mockReset();
  });

  it('shows a loading state before prayer data resolves', () => {
    mockedBuildPrayerDayBundle.mockReturnValue(new Promise(() => undefined));
    render(<PrayerScreen />);
    expect(screen.getByText('Loading prayer times…')).toBeTruthy();
  });

  it('renders the prayer widget when data loads', async () => {
    mockedBuildPrayerDayBundle.mockResolvedValue({
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
      hijriDate: '11 Ramadan 1447',
      isFriday: false,
      isSummerPeriod: false,
    });

    render(<PrayerScreen />);

    await waitFor(() => expect(screen.getByText('View Full Calendar')).toBeTruthy());
    expect(screen.getByText('Prayer Times')).toBeTruthy();
  });

  it('renders the fallback error state when loading fails', async () => {
    mockedBuildPrayerDayBundle.mockRejectedValue(new Error('Boom'));
    render(<PrayerScreen />);

    await waitFor(() => expect(screen.getByText('Prayer Times Unavailable')).toBeTruthy());
    expect(screen.getByText('Boom')).toBeTruthy();
  });
});
