import { RotateCw, TriangleAlert } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/core/theme';

import { AppText } from './AppText';
import { Button } from './Button';

export type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  /** Inline variant for list rows; the default fills its container. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ErrorState({ message, onRetry, compact = false, style }: ErrorStateProps) {
  return (
    <View
      style={[compact ? styles.compact : styles.full, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <TriangleAlert color={colors.textMuted} size={compact ? 20 : 36} />
      <AppText
        variant={compact ? 'caption' : 'body'}
        color="textSecondary"
        style={compact ? styles.compactText : styles.fullText}
      >
        {message}
      </AppText>
      {onRetry ? (
        <Button label="Retry" icon={RotateCw} variant="secondary" onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  fullText: { textAlign: 'center' },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  compactText: { flex: 1 },
});
