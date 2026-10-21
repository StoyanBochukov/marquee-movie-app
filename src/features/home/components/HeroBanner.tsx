import { Info } from 'lucide-react-native';
import { memo, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { getUserMessage } from '@/core/api';
import { colors, spacing } from '@/core/theme';
import { AppText, Button, ErrorState, PosterImage, Skeleton } from '@/core/ui';
import { getPosterUri, useMovieDetails, type MovieSummary } from '@/features/movies';

type HeroBannerProps = {
  movieId: string;
  onPressDetails: (movie: MovieSummary) => void;
  /** Extra actions (e.g. My List) injected by the screen so the hero stays feature-agnostic. */
  renderActions?: (movie: MovieSummary) => ReactNode;
};

const MAX_HEIGHT = 640;

function HeroBannerBase({ movieId, onPressDetails, renderActions }: HeroBannerProps) {
  const { width } = useWindowDimensions();
  const height = Math.min(width * 1.45, MAX_HEIGHT);
  const { data: movie, isPending, isError, error, refetch } = useMovieDetails(movieId);

  if (isPending) return <Skeleton style={[styles.skeleton, { width, height }]} />;

  if (isError || !movie) {
    return (
      <View style={[styles.errorContainer, { height: height * 0.6 }]}>
        <ErrorState message={getUserMessage(error)} onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={{ width, height }} accessibilityLabel={`Featured: ${movie.title}`}>
      <PosterImage
        uri={getPosterUri(movie.posterUrl, 'hero')}
        title={movie.title}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.content}>
        <AppText variant="display" numberOfLines={2} style={styles.centered}>
          {movie.title}
        </AppText>
        {movie.genres.length > 0 ? (
          <View style={styles.genres}>
            {movie.genres.map((genre, index) => (
              <View key={genre} style={styles.genre}>
                {index > 0 ? <View style={styles.dot} /> : null}
                <AppText variant="label" color="textSecondary">
                  {genre}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.actions}>
          {renderActions?.(movie)}
          <Button
            label="Details"
            icon={Info}
            onPress={() => onPressDetails(movie)}
            style={styles.action}
          />
        </View>
      </View>
    </View>
  );
}

export const HeroBanner = memo(HeroBannerBase);

const styles = StyleSheet.create({
  skeleton: { borderRadius: 0, marginBottom: spacing.xl },
  errorContainer: { justifyContent: 'center' },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundImage:
      'linear-gradient(180deg, rgba(10,10,15,0.35) 0%, rgba(10,10,15,0) 25%, rgba(10,10,15,0) 45%, rgba(10,10,15,0.85) 80%, rgba(10,10,15,1) 100%)',
  },
  content: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  centered: { textAlign: 'center' },
  genres: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  genre: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.primary,
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  action: { minWidth: 130 },
});
