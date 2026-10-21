import { QueryClient } from '@tanstack/react-query';

import { findCachedSummary } from '../hooks/useMovieDetails';
import { movieKeys } from '../hooks/movieQueries';
import { selectUniqueMovies } from '../hooks/useMovieSearch';
import type { MovieSummary, Page } from '../model/types';
import { getPosterUri } from '../utils/poster';

const movie = (id: string): MovieSummary => ({
  id,
  title: id,
  year: '2020',
  type: 'movie',
  posterUrl: null,
});
const page = (n: number, ids: string[]): Page<MovieSummary> => ({
  items: ids.map(movie),
  page: n,
  totalResults: 25,
  hasNextPage: n < 3,
});

describe('selectUniqueMovies', () => {
  it('flattens pages and drops duplicates returned by OMDb', () => {
    const result = selectUniqueMovies({
      pages: [page(1, ['a', 'b']), page(2, ['b', 'c'])],
      pageParams: [1, 2],
    });
    expect(result.movies.map(m => m.id)).toEqual(['a', 'b', 'c']);
    expect(result.totalResults).toBe(25);
  });
});

describe('findCachedSummary', () => {
  it('finds a title in any cached search', () => {
    const client = new QueryClient();
    client.setQueryData(movieKeys.search({ query: 'batman' }), {
      pages: [page(1, ['tt1', 'tt2'])],
      pageParams: [1],
    });

    expect(findCachedSummary(client, 'tt2')?.id).toBe('tt2');
    expect(findCachedSummary(client, 'missing')).toBeUndefined();
    client.clear();
  });
});

describe('getPosterUri', () => {
  const url = 'https://m.media-amazon.com/images/M/abc@._V1_QL75_UX380_CR0,0,380,562_.jpg';

  it('requests the width each surface renders', () => {
    expect(getPosterUri(url, 'card')).toBe(
      'https://m.media-amazon.com/images/M/abc@._V1_SX400.jpg',
    );
    expect(getPosterUri(url, 'hero')).toBe(
      'https://m.media-amazon.com/images/M/abc@._V1_SX1000.jpg',
    );
  });

  it('passes through unknown URLs and missing posters', () => {
    expect(getPosterUri('https://example.com/p.jpg', 'card')).toBe('https://example.com/p.jpg');
    expect(getPosterUri(null, 'card')).toBeNull();
  });
});
