import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { spacing } from '@/core/theme';

import { usePrefetchMovieDetails } from '../hooks/useMovieDetails';
import type { MovieSummary } from '../model/types';

import { CARD_GAP } from './cardLayout';
import { MovieCard } from './MovieCard';

const COLUMNS = 3;
const EDGE_PADDING = spacing.lg - CARD_GAP / 2;

export type MovieGridProps = {
  movies: MovieSummary[];
  onPressMovie: (movie: MovieSummary) => void;
  onEndReached?: () => void;
  ListHeaderComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
  contentPaddingBottom?: number;
};

/** Responsive three-column poster grid shared by Search and My List. */
export function MovieGrid({
  movies,
  onPressMovie,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  contentPaddingBottom = spacing.xl,
}: MovieGridProps) {
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - EDGE_PADDING * 2) / COLUMNS - CARD_GAP);
  const prefetchDetails = usePrefetchMovieDetails();

  const handlePressIn = useCallback(
    (movie: MovieSummary) => {
      prefetchDetails(movie.id);
    },
    [prefetchDetails],
  );

  const renderItem = useCallback<ListRenderItem<MovieSummary>>(
    ({ item }) => (
      <View style={styles.cell}>
        <MovieCard
          movie={item}
          width={tileWidth}
          onPress={onPressMovie}
          onPressIn={handlePressIn}
        />
      </View>
    ),
    [tileWidth, onPressMovie, handlePressIn],
  );

  return (
    <FlashList
      data={movies}
      numColumns={COLUMNS}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: EDGE_PADDING,
        paddingBottom: contentPaddingBottom,
      }}
    />
  );
}

const keyExtractor = (movie: MovieSummary) => movie.id;

const styles = StyleSheet.create({
  cell: { alignItems: 'center', paddingBottom: CARD_GAP },
});
