import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/core/theme';

import { AppText } from './AppText';

export function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
