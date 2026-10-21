import {
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { summaryToDetailsPlaceholder } from '../api/mappers';
import type { MovieSummary, Page } from '../model/types';

import { movieKeys, movieQueries } from './movieQueries';

export function findCachedSummary(queryClient: QueryClient, id: string): MovieSummary | undefined {
  const searches = queryClient.getQueriesData<InfiniteData<Page<MovieSummary>>>({
    queryKey: movieKeys.searches(),
  });
  for (const [, data] of searches) {
    for (const page of data?.pages ?? []) {
      const match = page.items.find(movie => movie.id === id);
      if (match) return match;
    }
  }
  return undefined;
}

/**
 * Details for one title. While the full record loads, it falls back to the summary already
 * cached by any list (or the navigation hint), so the header renders instantly.
 */
export function useMovieDetails(id: string, hint?: MovieSummary) {
  const queryClient = useQueryClient();

  return useQuery({
    ...movieQueries.detail(id),
    placeholderData: () => {
      const summary = findCachedSummary(queryClient, id) ?? hint;
      return summary ? summaryToDetailsPlaceholder(summary) : undefined;
    },
  });
}

/** Starts fetching details on press-in, gaining the ~100ms before navigation commits. */
export function usePrefetchMovieDetails() {
  const queryClient = useQueryClient();
  return useCallback(
    (id: string) => queryClient.prefetchQuery(movieQueries.detail(id)),
    [queryClient],
  );
}
