import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii } from '@/core/theme';
import { PosterImage } from '@/core/ui';
import { getPosterUri, type MovieSummary } from '@/features/movies';

export const BACKDROP_HEIGHT = 420;
const POSTER_WIDTH = 168;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

type DetailsBackdropProps = {
  movie: Pick<MovieSummary, 'title' | 'posterUrl'>;
  scrollY: SharedValue<number>;
};

/** Blurred poster backdrop with parallax; the blur uses the smallest poster since detail is lost anyway. */
export function DetailsBackdrop({ movie, scrollY }: DetailsBackdropProps) {
  const insets = useSafeAreaInsets();

  const backdropStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-200, 0, BACKDROP_HEIGHT],
          [-100, 0, BACKDROP_HEIGHT * 0.4],
          'clamp',
        ),
      },
      { scale: interpolate(scrollY.value, [-200, 0], [1.4, 1], 'clamp') },
    ],
  }));

  const posterStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, BACKDROP_HEIGHT * 0.6], [1, 0], 'clamp'),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, BACKDROP_HEIGHT],
          [0, BACKDROP_HEIGHT * 0.25],
          'clamp',
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <PosterImage
          uri={getPosterUri(movie.posterUrl, 'thumb')}
          blurRadius={24}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.scrim} />
      </Animated.View>

      <Animated.View style={[styles.posterWrapper, { paddingTop: insets.top + 56 }, posterStyle]}>
        <PosterImage
          uri={getPosterUri(movie.posterUrl, 'card')}
          title={movie.title}
          style={styles.poster}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: BACKDROP_HEIGHT, overflow: 'visible' },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundImage: `linear-gradient(180deg, rgba(10,10,15,0.2) 0%, rgba(10,10,15,0.45) 55%, ${colors.background} 100%)`,
  },
  posterWrapper: { alignItems: 'center' },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: radii.lg,
    boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.6)',
  },
});
