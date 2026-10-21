import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import type { MovieSearchParams, MovieSummary, Page } from '../model/types';

import { movieQueries } from './movieQueries';

export type MovieSearchResult = {
  movies: MovieSummary[];
  totalResults: number;
};

/** OMDb occasionally repeats titles across pages; list keys must stay unique. */
export function selectUniqueMovies(data: InfiniteData<Page<MovieSummary>>): MovieSearchResult {
  const seen = new Set<string>();
  const movies: MovieSummary[] = [];
  for (const page of data.pages) {
    for (const movie of page.items) {
      if (!seen.has(movie.id)) {
        seen.add(movie.id);
        movies.push(movie);
      }
    }
  }
  return { movies, totalResults: data.pages[0]?.totalResults ?? 0 };
}

export function useMovieSearch(params: MovieSearchParams, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useInfiniteQuery({
    ...movieQueries.search(params),
    enabled: enabled && params.query.trim().length > 0,
    select: selectUniqueMovies,
  });
}
