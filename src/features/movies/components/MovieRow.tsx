import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { getUserMessage } from '@/core/api';
import { colors, spacing } from '@/core/theme';
import { AppText, ErrorBoundary, ErrorState, Skeleton, useErrorBoundary } from '@/core/ui';

import { usePrefetchMovieDetails } from '../hooks/useMovieDetails';
import { useMovieSearch } from '../hooks/useMovieSearch';
import type { MovieSearchParams, MovieSummary } from '../model/types';

import { CARD_GAP, CARD_LAYOUT, type CardVariant } from './cardLayout';
import { MovieCard } from './MovieCard';

const SKELETON_COUNT = 5;
const RANKED_LIMIT = 10;

export type MovieRowProps = {
  title: string;
  query: MovieSearchParams;
  variant?: CardVariant;
  onPressMovie: (movie: MovieSummary) => void;
  /** Titles to leave out, e.g. the movie currently on screen. */
  excludeIds?: readonly string[];
  /** Drops entries without artwork; OMDb keyword matches are often posterless extras. */
  hidePosterless?: boolean;
};

/**
 * A self-contained horizontal shelf: it owns its query, loading, error and pagination state,
 * and its own error boundary, so one failing row never affects the rest of the screen.
 */
function MovieRowBase(props: MovieRowProps) {
  return (
    <ErrorBoundary fallback={<RowErrorFallback title={props.title} />}>
      <MovieRowContent {...props} />
    </ErrorBoundary>
  );
}

function RowErrorFallback({ title }: { title: string }) {
  const { reset } = useErrorBoundary();
  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      <ErrorState compact message="This row couldn't be displayed." onRetry={reset} />
    </View>
  );
}

function MovieRowContent({
  title,
  query,
  variant = 'poster',
  onPressMovie,
  excludeIds,
  hidePosterless = false,
}: MovieRowProps) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMovieSearch(query);
  const prefetchDetails = usePrefetchMovieDetails();
  const isRanked = variant === 'ranked';

  const movies = useMemo(() => {
    const visible = (data?.movies ?? []).filter(
      movie => !excludeIds?.includes(movie.id) && (!hidePosterless || movie.posterUrl !== null),
    );
    return isRanked ? visible.slice(0, RANKED_LIMIT) : visible;
  }, [data?.movies, excludeIds, hidePosterless, isRanked]);

  const handlePressIn = useCallback(
    (movie: MovieSummary) => {
      prefetchDetails(movie.id);
    },
    [prefetchDetails],
  );

  const renderItem = useCallback<ListRenderItem<MovieSummary>>(
    ({ item, index }) => (
      <MovieCard
        movie={item}
        variant={variant}
        rank={isRanked ? index + 1 : undefined}
        onPress={onPressMovie}
        onPressIn={handlePressIn}
      />
    ),
    [variant, isRanked, onPressMovie, handlePressIn],
  );

  const handleEndReached = useCallback(() => {
    if (!isRanked && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [isRanked, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const height = CARD_LAYOUT[variant].height;

  if (!isPending && !isError && movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <AppText variant="subtitle" style={styles.title} accessibilityRole="header">
        {title}
      </AppText>

      {isPending ? (
        <View style={styles.skeletonRow}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} style={{ width: CARD_LAYOUT[variant].width, height }} />
          ))}
        </View>
      ) : isError && movies.length === 0 ? (
        <ErrorState compact message={getUserMessage(error)} onRetry={() => refetch()} />
      ) : (
        <View style={{ height }}>
          <FlashList
            horizontal
            data={movies}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.6}
            ListFooterComponent={isFetchingNextPage ? <LoadingMore height={height} /> : null}
          />
        </View>
      )}
    </View>
  );
}

const keyExtractor = (movie: MovieSummary) => movie.id;

function Separator() {
  return <View style={styles.separator} />;
}

function LoadingMore({ height }: { height: number }) {
  return (
    <View style={[styles.loadingMore, { height }]}>
      <ActivityIndicator color={colors.textSecondary} />
    </View>
  );
}

export const MovieRow = memo(MovieRowBase);

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginBottom: spacing.xl },
  title: { paddingHorizontal: spacing.lg },
  listContent: { paddingHorizontal: spacing.lg },
  separator: { width: CARD_GAP },
  skeletonRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  loadingMore: { width: 64, alignItems: 'center', justifyContent: 'center' },
});
