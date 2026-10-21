import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/core/theme';
import { AppText, PressableScale } from '@/core/ui';

import { BACKDROP_HEIGHT } from './DetailsBackdrop';

type DetailsTopBarProps = {
  title?: string;
  scrollY?: SharedValue<number>;
  onBack: () => void;
  right?: ReactNode;
};

/** Floating back button; a solid bar with the title fades in once the backdrop scrolls away. */
export function DetailsTopBar({ title, scrollY, onBack, right }: DetailsTopBarProps) {
  const insets = useSafeAreaInsets();

  const barStyle = useAnimatedStyle(() => ({
    opacity: scrollY
      ? interpolate(scrollY.value, [BACKDROP_HEIGHT * 0.5, BACKDROP_HEIGHT * 0.8], [0, 1], 'clamp')
      : 0,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="box-none">
      <Animated.View style={[styles.background, barStyle]} pointerEvents="none" />
      <View style={styles.content} pointerEvents="box-none">
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={styles.iconButton}
        >
          <ChevronLeft color={colors.text} size={26} />
        </PressableScale>
        <Animated.View style={[styles.titleContainer, barStyle]} pointerEvents="none">
          {title ? (
            <AppText variant="subtitle" numberOfLines={1}>
              {title}
            </AppText>
          ) : null}
        </Animated.View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0 },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  titleContainer: { flex: 1 },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
