import React from 'react';
import { render, screen } from '@testing-library/react-native';

import EventsScreen from '@/app/(tabs)/events';
import { useEventsSubscription } from '@/lib/hooks/useEventsSubscription';

jest.mock('@/lib/hooks/useEventsSubscription', () => ({
  useEventsSubscription: jest.fn(),
}));

const mockedUseEventsSubscription = useEventsSubscription as jest.MockedFunction<typeof useEventsSubscription>;

describe('EventsScreen', () => {
  beforeEach(() => {
    mockedUseEventsSubscription.mockReset();
  });

  it('renders the loading state', () => {
    mockedUseEventsSubscription.mockReturnValue({
      events: [],
      loading: true,
      error: null,
    });

    render(<EventsScreen />);
    expect(screen.getByText('Loading events…')).toBeTruthy();
  });

  it('renders the empty state', () => {
    mockedUseEventsSubscription.mockReturnValue({
      events: [],
      loading: false,
      error: null,
    });

    render(<EventsScreen />);
    expect(screen.getByText('No Events Available')).toBeTruthy();
  });

  it('renders event cards including the poster-missing fallback', () => {
    mockedUseEventsSubscription.mockReturnValue({
      events: [
        {
          id: 'event-1',
          name: 'Back to Basics',
          time: new Date('2026-03-20T18:30:00'),
          location: 'MWHS Main Hall',
          signupEnabled: false,
          createdAt: new Date('2026-03-01T00:00:00'),
        },
      ],
      loading: false,
      error: null,
    });

    render(<EventsScreen />);
    expect(screen.getByText('Back to Basics')).toBeTruthy();
    expect(screen.getAllByText('MWHS').length).toBeGreaterThan(1);
  });
});
