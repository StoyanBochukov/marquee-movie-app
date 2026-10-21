import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii } from '@/core/theme';

export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.base, style, pulseStyle]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.skeleton, borderRadius: radii.md },
});
