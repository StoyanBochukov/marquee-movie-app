import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import type { MovieSummary } from '@/features/movies';

/**
 * The details feature owns its entry point. Uses a push action so details-from-details stacks,
 * and dispatch so the action bubbles up from nested tab screens to the root stack.
 */
export function useOpenMovieDetails() {
  const navigation = useNavigation();

  return useCallback(
    (movie: MovieSummary) =>
      navigation.dispatch(
        StackActions.push('MovieDetails', {
          movieId: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
        }),
      ),
    [navigation],
  );
}
