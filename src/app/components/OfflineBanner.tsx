import { WifiOff } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@/core/theme';
import { AppText } from '@/core/ui';

import { useIsOnline } from '../providers/onlineManager';

export function OfflineBanner() {
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(18)}
      exiting={FadeOutUp}
      style={[styles.banner, { top: insets.top + spacing.sm }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      pointerEvents="none"
    >
      <WifiOff color={colors.text} size={18} />
      <AppText variant="label">You're offline. Content will refresh when you reconnect.</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.5)',
  },
});
