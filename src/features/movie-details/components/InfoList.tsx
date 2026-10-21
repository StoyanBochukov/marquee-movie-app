import { StyleSheet, View } from 'react-native';

import { spacing } from '@/core/theme';
import { AppText } from '@/core/ui';

export type InfoItem = { label: string; value: string | null | undefined };

/** Label/value pairs; rows without a value are skipped so sparse OMDb records stay tidy. */
export function InfoList({ title, items }: { title: string; items: InfoItem[] }) {
  const visible = items.filter((item): item is { label: string; value: string } =>
    Boolean(item.value),
  );
  if (visible.length === 0) return null;

  return (
    <View style={styles.section}>
      <AppText variant="subtitle" accessibilityRole="header">
        {title}
      </AppText>
      {visible.map(item => (
        <View key={item.label} style={styles.row}>
          <AppText variant="label" color="textMuted" style={styles.label}>
            {item.label}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.value}>
            {item.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  label: { width: 92, paddingTop: 2 },
  value: { flex: 1 },
});
