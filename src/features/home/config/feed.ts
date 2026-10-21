import type { CardVariant, MovieSearchParams } from '@/features/movies';

export type FeedRowConfig = {
  id: string;
  title: string;
  query: MovieSearchParams;
  variant: CardVariant;
};

export type HomeFeedConfig = {
  /** IMDb IDs rotated daily in the hero slot. */
  featuredIds: readonly [string, ...string[]];
  rows: readonly FeedRowConfig[];
};

/**
 * OMDb has no trending or genre endpoints, so shelves are curated searches. The shape is
 * deliberately serializable so it could be served by a backend or live-ops tool later.
 */
export const homeFeed: HomeFeedConfig = {
  featuredIds: [
    'tt1375666', // Inception
    'tt0816692', // Interstellar
    'tt0468569', // The Dark Knight
    'tt15398776', // Oppenheimer
    'tt1160419', // Dune
    'tt15239678', // Dune: Part Two
    'tt1856101', // Blade Runner 2049
  ],
  rows: [
    {
      id: 'star-wars',
      title: 'Top 10: A Galaxy Far, Far Away',
      query: { query: 'star wars', type: 'movie' },
      variant: 'ranked',
    },
    {
      id: 'batman',
      title: 'Dark Knights',
      query: { query: 'batman', type: 'movie' },
      variant: 'poster',
    },
    {
      id: 'avengers',
      title: "Earth's Mightiest Heroes",
      query: { query: 'avengers', type: 'movie' },
      variant: 'wide',
    },
    {
      id: 'harry-potter',
      title: 'The Wizarding World',
      query: { query: 'harry potter', type: 'movie' },
      variant: 'poster',
    },
    {
      id: 'spider-man',
      title: 'Your Friendly Neighborhood',
      query: { query: 'spider-man', type: 'movie' },
      variant: 'poster',
    },
    {
      id: 'jurassic',
      title: 'Life Finds a Way',
      query: { query: 'jurassic', type: 'movie' },
      variant: 'wide',
    },
    {
      id: 'lord-of-the-rings',
      title: 'Journey to Middle-earth',
      query: { query: 'lord of the rings', type: 'movie' },
      variant: 'ranked',
    },
    {
      id: 'star-trek',
      title: 'To Boldly Go',
      query: { query: 'star trek', type: 'movie' },
      variant: 'poster',
    },
    {
      id: 'matrix',
      title: 'Enter the Matrix',
      query: { query: 'matrix', type: 'movie' },
      variant: 'poster',
    },
    {
      id: 'the-office',
      title: 'Comfort Series',
      query: { query: 'the office', type: 'series' },
      variant: 'wide',
    },
    {
      id: 'toy-story',
      title: 'To Infinity and Beyond',
      query: { query: 'toy story', type: 'movie' },
      variant: 'poster',
    },
  ],
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deterministic daily rotation, so the hero is stable within a day and cache-friendly. */
export function pickFeaturedId(ids: HomeFeedConfig['featuredIds'], now = new Date()): string {
  const dayIndex = Math.floor(now.getTime() / DAY_MS);
  return ids[dayIndex % ids.length] ?? ids[0];
}
