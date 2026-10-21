import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TabScreenProps } from '@/app/navigation/types';
import { colors, spacing } from '@/core/theme';
import { useOpenMovieDetails } from '@/features/movie-details';
import { movieKeys, MovieRow } from '@/features/movies';

import { HeroBanner } from '../components/HeroBanner';
import { HEADER_CONTENT_HEIGHT, HomeHeader } from '../components/HomeHeader';
import { homeFeed, pickFeaturedId, type FeedRowConfig } from '../config/feed';

type FeedItem = { kind: 'hero'; movieId: string } | { kind: 'row'; row: FeedRowConfig };

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<FeedItem>);

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const openDetails = useOpenMovieDetails();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const items = useMemo<FeedItem[]>(
    () => [
      { kind: 'hero', movieId: pickFeaturedId(homeFeed.featuredIds) },
      ...homeFeed.rows.map(row => ({ kind: 'row' as const, row })),
    ],
    [],
  );

  const renderItem = useCallback<ListRenderItem<FeedItem>>(
    ({ item }) =>
      item.kind === 'hero' ? (
        <HeroBanner movieId={item.movieId} onPressDetails={openDetails} />
      ) : (
        <MovieRow
          title={item.row.title}
          query={item.row.query}
          variant={item.row.variant}
          onPressMovie={openDetails}
        />
      ),
    [openDetails],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: movieKeys.all, type: 'active' });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={styles.container}>
      <AnimatedFlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={feedKeyExtractor}
        // Each shelf is its own type so cells are never recycled into a different shelf,
        // which would carry over its horizontal scroll offset.
        getItemType={feedKeyExtractor}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text}
            progressViewOffset={insets.top + HEADER_CONTENT_HEIGHT}
          />
        }
      />
      <HomeHeader scrollY={scrollY} onPressSearch={() => navigation.navigate('Search')} />
    </View>
  );
}

const feedKeyExtractor = (item: FeedItem) => (item.kind === 'hero' ? 'hero' : item.row.id);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
});
