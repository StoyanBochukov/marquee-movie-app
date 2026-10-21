import { Film } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, spacing } from '@/core/theme';

import { AppText } from './AppText';

export type PosterImageProps = {
  uri: string | null;
  /** Shown on the fallback tile when there is no image. */
  title?: string;
  style?: StyleProp<ViewStyle>;
  blurRadius?: number;
};

function PosterImageContent({ uri, title, style, blurRadius }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const opacity = useSharedValue(0);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!uri || failed) {
    return (
      <View style={[styles.container, styles.fallback, style]}>
        <Film color={colors.textMuted} size={28} />
        {title ? (
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={3}
            style={styles.fallbackText}
          >
            {title}
          </AppText>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.Image
        source={{ uri }}
        resizeMode="cover"
        blurRadius={blurRadius}
        style={[StyleSheet.absoluteFill, fadeStyle]}
        onLoad={() => {
          opacity.value = withTiming(1, { duration: 250 });
        }}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

/**
 * Poster with fade-in and a titled fallback. Keyed by URI so recycled list cells never show
 * the previous item's image or error state.
 */
export function PosterImage(props: PosterImageProps) {
  return <PosterImageContent key={props.uri ?? 'missing'} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  fallbackText: { textAlign: 'center' },
});
