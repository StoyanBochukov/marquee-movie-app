import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { omdbService } from '../api/omdbService';
import type { MovieSearchParams } from '../model/types';

/** Single source of truth for cache keys, so invalidation and cache reads never drift. */
export const movieKeys = {
  all: ['movies'] as const,
  searches: () => [...movieKeys.all, 'search'] as const,
  search: (params: MovieSearchParams) =>
    [
      ...movieKeys.searches(),
      { query: params.query.trim().toLowerCase(), type: params.type },
    ] as const,
  details: () => [...movieKeys.all, 'details'] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
};

export const movieQueries = {
  search: (params: MovieSearchParams) =>
    infiniteQueryOptions({
      queryKey: movieKeys.search(params),
      queryFn: ({ pageParam, signal }) =>
        omdbService.searchMovies({ ...params, page: pageParam }, signal),
      initialPageParam: 1,
      getNextPageParam: lastPage => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: movieKeys.detail(id),
      queryFn: ({ signal }) => omdbService.getMovieById(id, signal),
    }),
};
