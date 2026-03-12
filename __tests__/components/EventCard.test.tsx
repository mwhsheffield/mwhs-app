import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { EventCard } from '@/components/events/EventCard';
import { formatEventDate, formatEventTime } from '@/lib/events';

describe('EventCard', () => {
  it('exposes a descriptive accessibility label and handles presses', () => {
    const onPress = jest.fn();
    const event = {
      id: 'event-1',
      name: 'Back to Basics',
      time: new Date('2026-03-20T18:30:00'),
      location: 'MWHS Main Hall',
      signupEnabled: false,
      createdAt: new Date('2026-03-01T00:00:00'),
    };

    render(
      <EventCard event={event} onPress={onPress} />
    );

    const button = screen.getByLabelText(
      `${event.name}, ${formatEventDate(event.time)} at ${formatEventTime(event.time)}, ${event.location}`
    );
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
