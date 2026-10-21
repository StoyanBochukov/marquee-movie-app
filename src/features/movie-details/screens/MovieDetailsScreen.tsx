import { Trophy } from 'lucide-react-native';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation/types';
import { getUserMessage } from '@/core/api';
import { colors, radii, spacing } from '@/core/theme';
import { AppText, Chip, ErrorState, ExpandableText } from '@/core/ui';
import {
  MovieRow,
  useMovieDetails,
  type MovieDetails,
  type MovieSearchParams,
  type MovieSummary,
} from '@/features/movies';

import { DetailsBackdrop } from '../components/DetailsBackdrop';
import { DetailsBodySkeleton } from '../components/DetailsSkeleton';
import { DetailsTopBar } from '../components/DetailsTopBar';
import { InfoList } from '../components/InfoList';
import { MetaLine } from '../components/MetaLine';
import { RatingsBar } from '../components/RatingsBar';
import { useOpenMovieDetails } from '../hooks/useOpenMovieDetails';
import { getSimilarQuery } from '../utils/format';

type MovieDetailsScreenProps = RootStackScreenProps<'MovieDetails'> & {
  /** Slot for actions owned by other features (e.g. My List), injected by the app layer. */
  renderActions?: (movie: MovieDetails) => ReactNode;
};

export function MovieDetailsScreen({ route, navigation, renderActions }: MovieDetailsScreenProps) {
  const { movieId, title, posterUrl } = route.params;
  const insets = useSafeAreaInsets();
  const openDetails = useOpenMovieDetails();

  const hint = useMemo<MovieSummary | undefined>(
    () =>
      title
        ? { id: movieId, title, year: '', type: 'movie', posterUrl: posterUrl ?? null }
        : undefined,
    [movieId, title, posterUrl],
  );
  const {
    data: movie,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useMovieDetails(movieId, hint);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const similarQuery = useMemo<MovieSearchParams | null>(() => {
    const keyword = movie ? getSimilarQuery(movie.title) : null;
    if (!movie || !keyword) return null;
    return { query: keyword, type: movie.type === 'series' ? 'series' : 'movie' };
  }, [movie]);
  const excludeIds = useMemo(() => [movieId], [movieId]);

  if (!movie) {
    return (
      <View style={styles.container}>
        {isError ? (
          <ErrorState message={getUserMessage(error)} onRetry={() => refetch()} />
        ) : (
          <View style={[styles.body, { paddingTop: insets.top + 120 }]}>
            <DetailsBodySkeleton />
          </View>
        )}
        <DetailsTopBar onBack={navigation.goBack} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        <DetailsBackdrop movie={movie} scrollY={scrollY} />

        <View style={styles.body}>
          <AppText variant="display" style={styles.title} accessibilityRole="header">
            {movie.title}
          </AppText>

          {isPlaceholderData ? (
            <DetailsBodySkeleton />
          ) : (
            <>
              <MetaLine movie={movie} />

              {movie.genres.length > 0 ? (
                <View style={styles.chips}>
                  {movie.genres.map(genre => (
                    <Chip key={genre} label={genre} />
                  ))}
                </View>
              ) : null}

              {renderActions ? <View style={styles.actions}>{renderActions(movie)}</View> : null}

              {movie.plot ? (
                <ExpandableText color="textSecondary" collapsedLines={4}>
                  {movie.plot}
                </ExpandableText>
              ) : null}

              <RatingsBar ratings={movie.ratings} imdbVotes={movie.imdbVotes} />

              {movie.awards ? (
                <View style={styles.awards}>
                  <Trophy color={colors.imdb} size={18} />
                  <AppText variant="label" color="textSecondary" style={styles.awardsText}>
                    {movie.awards}
                  </AppText>
                </View>
              ) : null}

              <InfoList
                title="Cast & Crew"
                items={[
                  {
                    label: movie.directors.length > 1 ? 'Directors' : 'Director',
                    value: movie.directors.join(', '),
                  },
                  { label: 'Writers', value: movie.writers.join(', ') },
                  { label: 'Starring', value: movie.actors.join(', ') },
                ]}
              />

              <InfoList
                title="Details"
                items={[
                  { label: 'Released', value: movie.released },
                  { label: 'Language', value: movie.languages.join(', ') },
                  { label: 'Country', value: movie.countries.join(', ') },
                  { label: 'Box office', value: movie.boxOffice },
                ]}
              />
            </>
          )}
        </View>

        {similarQuery ? (
          <MovieRow
            title="More like this"
            query={similarQuery}
            excludeIds={excludeIds}
            hidePosterless
            onPressMovie={openDetails}
          />
        ) : null}
      </Animated.ScrollView>

      <DetailsTopBar title={movie.title} scrollY={scrollY} onBack={navigation.goBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.xl,
  },
  title: { textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  awards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  awardsText: { flex: 1 },
});
