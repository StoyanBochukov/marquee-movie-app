import { SearchX } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';

import { getUserMessage, isApiError } from '@/core/api';
import { useDebouncedValue } from '@/core/hooks/useDebouncedValue';
import { colors, spacing } from '@/core/theme';
import { AppText, Chip, ErrorState, PressableScale, Screen, Skeleton } from '@/core/ui';
import { useOpenMovieDetails } from '@/features/movie-details';
import { MovieGrid, useMovieSearch, type MovieSearchParams } from '@/features/movies';

import { FilterChips, type FilterOption } from '../components/FilterChips';
import { SearchBar } from '../components/SearchBar';

type TypeFilter = 'all' | 'movie' | 'series';

const TYPE_FILTERS: readonly FilterOption<TypeFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
];

const SUGGESTIONS = [
  'Inception',
  'Star Wars',
  'Breaking Bad',
  'Pixar',
  'Mission Impossible',
  'Friends',
];

/** OMDb answers "Too many results" for very short queries, so wait for a meaningful term. */
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;

export function SearchScreen() {
  const [text, setText] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const debouncedText = useDebouncedValue(text.trim(), DEBOUNCE_MS);
  const openDetails = useOpenMovieDetails();

  const isSearchable = debouncedText.length >= MIN_QUERY_LENGTH;
  const params = useMemo<MovieSearchParams>(
    () => ({ query: debouncedText, type: typeFilter === 'all' ? undefined : typeFilter }),
    [debouncedText, typeFilter],
  );
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMovieSearch(params, { enabled: isSearchable });

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const movies = data?.movies ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <SearchBar value={text} onChangeText={setText} />
        <FilterChips options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} />
      </View>

      {!isSearchable ? (
        <Suggestions onSelect={setText} />
      ) : isPending ? (
        <GridSkeleton />
      ) : isError && movies.length === 0 ? (
        <SearchError error={error} query={debouncedText} onRetry={() => refetch()} />
      ) : (
        <MovieGrid
          movies={movies}
          onPressMovie={openDetails}
          onEndReached={handleEndReached}
          ListHeaderComponent={
            <AppText variant="label" color="textMuted" style={styles.resultCount}>
              {data?.totalResults ?? 0} results
            </AppText>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.textSecondary} style={styles.footer} />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

function Suggestions({ onSelect }: { onSelect: (query: string) => void }) {
  return (
    <View style={styles.suggestions}>
      <AppText variant="subtitle">Popular searches</AppText>
      <View style={styles.suggestionChips}>
        {SUGGESTIONS.map(suggestion => (
          <PressableScale
            key={suggestion}
            onPress={() => onSelect(suggestion)}
            accessibilityRole="button"
            accessibilityLabel={`Search for ${suggestion}`}
          >
            <Chip label={suggestion} />
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

function SearchError({
  error,
  query,
  onRetry,
}: {
  error: unknown;
  query: string;
  onRetry: () => void;
}) {
  // OMDb reports "no matches" and "too broad" as errors; for search they are empty states.
  if (isApiError(error) && (error.kind === 'notFound' || error.kind === 'tooManyResults')) {
    return (
      <View style={styles.empty}>
        <SearchX color={colors.textMuted} size={44} />
        <AppText variant="subtitle" style={styles.centered}>
          {error.kind === 'notFound' ? `No results for “${query}”` : 'Too many matches'}
        </AppText>
        <AppText color="textSecondary" style={styles.centered}>
          {error.kind === 'notFound'
            ? 'Check the spelling or try a different title.'
            : 'Try a longer, more specific title.'}
        </AppText>
      </View>
    );
  }
  return <ErrorState message={getUserMessage(error)} onRetry={onRetry} />;
}

function GridSkeleton() {
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - spacing.lg * 2 - spacing.sm * 2) / 3);

  return (
    <View style={styles.skeletonGrid} accessibilityLabel="Loading results">
      {Array.from({ length: 9 }, (_, index) => (
        <Skeleton key={index} style={{ width: tileWidth, height: tileWidth * 1.5 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  resultCount: { paddingHorizontal: spacing.xs, paddingBottom: spacing.md },
  footer: { paddingVertical: spacing.lg },
  suggestions: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  suggestionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  centered: { textAlign: 'center' },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
