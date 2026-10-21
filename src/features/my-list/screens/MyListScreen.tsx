import { Bookmark } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { TabScreenProps } from '@/app/navigation/types';
import { colors, spacing } from '@/core/theme';
import { AppText, Button, Screen } from '@/core/ui';
import { useOpenMovieDetails } from '@/features/movie-details';
import { MovieGrid } from '@/features/movies';

import { useMyListStore } from '../store/myListStore';

export function MyListScreen({ navigation }: TabScreenProps<'MyList'>) {
  const items = useMyListStore(state => state.items);
  const openDetails = useOpenMovieDetails();

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          My List
        </AppText>
        {items.length > 0 ? (
          <AppText variant="label" color="textMuted">
            {items.length} {items.length === 1 ? 'title' : 'titles'}
          </AppText>
        ) : null}
      </View>

      <MovieGrid
        movies={items}
        onPressMovie={openDetails}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bookmark color={colors.textMuted} size={48} />
            <AppText variant="subtitle">Your list is empty</AppText>
            <AppText color="textSecondary" style={styles.emptyText}>
              Tap “My List” on any title to save it here for later.
            </AppText>
            <Button label="Browse titles" onPress={() => navigation.navigate('Home')} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyText: { textAlign: 'center' },
});
