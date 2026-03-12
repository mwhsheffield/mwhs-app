import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';

import EventDetailsScreen from '@/app/events/[id]';
import { getEventById } from '@/lib/events';

jest.mock('@/lib/events', () => {
  const actual = jest.requireActual('@/lib/events');

  return {
    ...actual,
    getEventById: jest.fn(),
  };
});

const mockedGetEventById = getEventById as jest.MockedFunction<typeof getEventById>;

describe('EventDetailsScreen', () => {
  beforeEach(() => {
    mockedGetEventById.mockReset();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders an accessible signup button for safe https links', async () => {
    mockedGetEventById.mockResolvedValue({
      id: 'event-1',
      name: 'Community Circle',
      time: new Date('2026-03-20T18:30:00'),
      location: 'MWHS Main Hall',
      signupLink: 'https://example.com/signup',
      signupEnabled: true,
      createdAt: new Date('2026-03-01T00:00:00'),
    });

    render(<EventDetailsScreen />);

    const button = await screen.findByLabelText('Open signup link');
    fireEvent.press(button);

    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/signup');
  });

  it('does not render the signup button for unsafe links', async () => {
    mockedGetEventById.mockResolvedValue({
      id: 'event-2',
      name: 'Community Circle',
      time: new Date('2026-03-20T18:30:00'),
      location: 'MWHS Main Hall',
      signupLink: 'javascript:alert(1)',
      signupEnabled: true,
      createdAt: new Date('2026-03-01T00:00:00'),
    });

    render(<EventDetailsScreen />);

    await waitFor(() => expect(screen.queryByLabelText('Open signup link')).toBeNull());
  });
});
