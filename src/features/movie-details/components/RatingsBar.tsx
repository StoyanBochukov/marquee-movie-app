import { Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/core/theme';
import { AppText } from '@/core/ui';
import type { MovieRating } from '@/features/movies';

import { formatCompactNumber } from '../utils/format';

type RatingsBarProps = {
  ratings: MovieRating[];
  imdbVotes: number | null;
};

const scoreColor = (score: number | null) => {
  if (score === null) return colors.textSecondary;
  if (score >= 75) return colors.success;
  if (score >= 50) return colors.imdb;
  return colors.primary;
};

export function RatingsBar({ ratings, imdbVotes }: RatingsBarProps) {
  if (ratings.length === 0) return null;
  const votes = formatCompactNumber(imdbVotes);

  return (
    <View style={styles.row}>
      {ratings.map(rating => {
        const isImdb = rating.source === 'imdb';
        const caption = isImdb && votes ? `IMDb · ${votes}` : rating.label;
        return (
          <View
            key={rating.source + rating.label}
            style={styles.tile}
            accessible
            accessibilityLabel={
              isImdb && votes
                ? `${rating.label} rating ${rating.value} from ${votes} votes`
                : `${rating.label} rating ${rating.value}`
            }
          >
            <View style={styles.valueRow}>
              {isImdb ? <Star color={colors.imdb} fill={colors.imdb} size={16} /> : null}
              <AppText
                variant="subtitle"
                style={{ color: isImdb ? colors.text : scoreColor(rating.score) }}
              >
                {rating.value}
              </AppText>
            </View>
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {caption}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
