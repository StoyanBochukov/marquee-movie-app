import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/core/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const foreground = variant === 'primary' ? colors.background : colors.text;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={8}
      style={[styles.base, styles[variant], style]}
    >
      {Icon ? <Icon color={foreground} size={20} strokeWidth={2.25} /> : null}
      <AppText variant="label" style={{ color: foreground }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
  },
  primary: { backgroundColor: colors.text },
  secondary: { backgroundColor: 'rgba(109, 109, 110, 0.7)' },
  ghost: { backgroundColor: colors.transparent },
});
