import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/core/theme';
import { AppText } from '@/core/ui';
import type { MovieDetails } from '@/features/movies';

import { formatRuntime } from '../utils/format';

const TYPE_LABELS: Partial<Record<MovieDetails['type'], string>> = {
  series: 'Series',
  episode: 'Episode',
  game: 'Game',
};

export function MetaLine({ movie }: { movie: MovieDetails }) {
  const runtime = formatRuntime(movie.runtimeMinutes);
  const typeLabel = TYPE_LABELS[movie.type];

  return (
    <View style={styles.row}>
      {movie.year ? (
        <AppText variant="label" color="textSecondary">
          {movie.year}
        </AppText>
      ) : null}
      {movie.rated ? (
        <View style={styles.badge} accessibilityLabel={`Rated ${movie.rated}`}>
          <AppText variant="caption" color="textSecondary">
            {movie.rated}
          </AppText>
        </View>
      ) : null}
      {runtime ? (
        <AppText variant="label" color="textSecondary">
          {runtime}
        </AppText>
      ) : null}
      {typeLabel ? (
        <AppText variant="label" color="textSecondary">
          {typeLabel}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: radii.sm,
  },
});
