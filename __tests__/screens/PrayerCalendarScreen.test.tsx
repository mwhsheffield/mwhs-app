import React from 'react';
import { render, screen } from '@testing-library/react-native';

import PrayerCalendarScreen from '@/app/prayer-calendar';
import { buildPrayerCalendarForMonth } from '@/lib/prayer-times';

jest.mock('@/lib/prayer-times', () => ({
  buildPrayerCalendarForMonth: jest.fn(),
  getIqamahTime: jest.fn(() => '--:--'),
}));

const mockedBuildPrayerCalendarForMonth = buildPrayerCalendarForMonth as jest.MockedFunction<typeof buildPrayerCalendarForMonth>;

describe('PrayerCalendarScreen', () => {
  beforeEach(() => {
    mockedBuildPrayerCalendarForMonth.mockResolvedValue([]);
  });

  it('renders accessible month navigation controls', async () => {
    render(<PrayerCalendarScreen />);

    expect(await screen.findByLabelText('Previous month')).toBeTruthy();
    expect(screen.getByLabelText('Next month')).toBeTruthy();
  });
});
