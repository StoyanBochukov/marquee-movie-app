import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/core/theme';
import { AppText, PosterImage, PressableScale } from '@/core/ui';

import type { MovieSummary } from '../model/types';
import { getPosterUri } from '../utils/poster';

import { CARD_LAYOUT, type CardVariant } from './cardLayout';
import { RankNumber } from './RankNumber';

export type MovieCardProps = {
  movie: MovieSummary;
  variant?: CardVariant;
  rank?: number;
  onPress: (movie: MovieSummary) => void;
  onPressIn?: (movie: MovieSummary) => void;
};

function MovieCardBase({ movie, variant = 'poster', rank, onPress, onPressIn }: MovieCardProps) {
  const label = rank
    ? `Number ${rank}, ${movie.title}, ${movie.year}`
    : `${movie.title}, ${movie.year}`;

  return (
    <PressableScale
      onPress={() => onPress(movie)}
      onPressIn={() => onPressIn?.(movie)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens movie details"
      style={styles[variant]}
    >
      {variant === 'wide' ? <WideContent movie={movie} /> : null}
      {variant === 'poster' ? (
        <PosterImage
          uri={getPosterUri(movie.posterUrl, 'card')}
          title={movie.title}
          style={styles.posterImage}
        />
      ) : null}
      {variant === 'ranked' ? (
        <>
          <RankNumber
            rank={rank ?? 0}
            width={CARD_LAYOUT.ranked.rankWidth}
            height={CARD_LAYOUT.ranked.height}
          />
          <PosterImage
            uri={getPosterUri(movie.posterUrl, 'card')}
            title={movie.title}
            style={styles.rankedPoster}
          />
        </>
      ) : null}
    </PressableScale>
  );
}

function WideContent({ movie }: { movie: MovieSummary }) {
  return (
    <>
      <PosterImage
        uri={getPosterUri(movie.posterUrl, 'card')}
        title={movie.title}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.wideScrim} />
      <View style={styles.wideCaption}>
        <AppText variant="label" numberOfLines={1}>
          {movie.title}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {movie.year}
        </AppText>
      </View>
    </>
  );
}

export const MovieCard = memo(MovieCardBase);

const styles = StyleSheet.create({
  poster: {
    ...CARD_LAYOUT.poster,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  posterImage: { flex: 1 },
  wide: {
    ...CARD_LAYOUT.wide,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  wideScrim: {
    ...StyleSheet.absoluteFill,
    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
  },
  wideCaption: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.sm,
  },
  ranked: {
    width: CARD_LAYOUT.ranked.width,
    height: CARD_LAYOUT.ranked.height,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rankedPoster: {
    width: CARD_LAYOUT.ranked.posterWidth,
    height: CARD_LAYOUT.ranked.height,
    marginLeft: -12,
    borderRadius: radii.md,
  },
});
