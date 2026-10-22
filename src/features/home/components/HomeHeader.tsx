import { Search } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/core/theme';
import { PressableScale, Wordmark } from '@/core/ui';

export const HEADER_CONTENT_HEIGHT = 52;
const FADE_DISTANCE = 160;

type HomeHeaderProps = {
  scrollY: SharedValue<number>;
  onPressSearch: () => void;
};

/** Transparent over the hero, fading to solid as the feed scrolls (driven on the UI thread). */
export function HomeHeader({ scrollY, onPressSearch }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, FADE_DISTANCE], [0, 1], 'clamp'),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={styles.scrim} pointerEvents="none" />
      <Animated.View style={[styles.background, backgroundStyle]} pointerEvents="none" />
      <View style={styles.content} pointerEvents="box-none">
        <Wordmark />
        <PressableScale
          onPress={onPressSearch}
          accessibilityRole="button"
          accessibilityLabel="Search movies"
          hitSlop={12}
        >
          <Search color={colors.text} size={24} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0 },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
  },
  background: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
  content: {
    height: HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
});
