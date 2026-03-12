import { mapDocToEvent } from '@/lib/events';

jest.mock('firebase/firestore', () => ({}));

describe('events mapping', () => {
  it('maps firestore-style timestamps into app event objects', () => {
    const time = new Date('2026-03-20T18:30:00');
    const mapped = mapDocToEvent({
      id: 'event-1',
      data: () => ({
        name: 'Community Circle',
        time: { toDate: () => time },
        location: 'MWHS Main Hall',
        signupEnabled: true,
        recurrenceType: 'weekly',
        createdAt: { toDate: () => time },
      }),
    });

    expect(mapped).toMatchObject({
      id: 'event-1',
      name: 'Community Circle',
      location: 'MWHS Main Hall',
      signupEnabled: true,
      recurrenceType: 'weekly',
    });
    expect(mapped?.time).toEqual(time);
  });

  it('drops optional urls that are not safe https links', () => {
    const time = new Date('2026-03-20T18:30:00');
    const mapped = mapDocToEvent({
      id: 'event-2',
      data: () => ({
        name: 'Youth Circle',
        time,
        location: 'Community Room',
        poster: 'ftp://example.com/poster.png',
        signupLink: 'javascript:alert(1)',
        createdAt: time,
      }),
    });

    expect(mapped).toMatchObject({
      id: 'event-2',
      name: 'Youth Circle',
      location: 'Community Room',
      signupEnabled: false,
    });
    expect(mapped?.poster).toBeUndefined();
    expect(mapped?.signupLink).toBeUndefined();
  });

  it('returns null when required event fields are invalid', () => {
    const mapped = mapDocToEvent({
      id: 'event-3',
      data: () => ({
        name: '',
        time: 'not-a-date',
        createdAt: new Date('2026-03-01T00:00:00'),
      }),
    });

    expect(mapped).toBeNull();
  });
});
