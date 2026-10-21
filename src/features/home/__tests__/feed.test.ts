import { homeFeed, pickFeaturedId } from '../config/feed';

describe('homeFeed config', () => {
  it('uses unique row ids, which double as list keys and recycling types', () => {
    const ids = homeFeed.rows.map(row => row.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('pickFeaturedId', () => {
  const ids = ['a', 'b', 'c'] as const;

  it('is stable within a day', () => {
    const morning = new Date('2026-10-21T06:00:00Z');
    const evening = new Date('2026-10-21T22:00:00Z');
    expect(pickFeaturedId(ids, morning)).toBe(pickFeaturedId(ids, evening));
  });

  it('rotates through every featured title', () => {
    const start = new Date('2026-10-21T12:00:00Z').getTime();
    const picks = [0, 1, 2].map(day => pickFeaturedId(ids, new Date(start + day * 86_400_000)));
    expect(new Set(picks)).toEqual(new Set(ids));
  });
});
