import { StyleSheet, View } from 'react-native';

import { spacing } from '@/core/theme';
import { Skeleton } from '@/core/ui';

/** Placeholder for the sections that only exist in the full record. */
export function DetailsBodySkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading movie details">
      <Skeleton style={styles.meta} />
      <View style={styles.chips}>
        <Skeleton style={styles.chip} />
        <Skeleton style={styles.chip} />
        <Skeleton style={styles.chip} />
      </View>
      <Skeleton style={styles.line} />
      <Skeleton style={styles.line} />
      <Skeleton style={[styles.line, styles.shortLine]} />
      <View style={styles.tiles}>
        <Skeleton style={styles.tile} />
        <Skeleton style={styles.tile} />
        <Skeleton style={styles.tile} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, alignItems: 'stretch' },
  meta: { alignSelf: 'center', width: 180, height: 18 },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  chip: { width: 72, height: 24 },
  line: { height: 14 },
  shortLine: { width: '60%' },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tile: { flex: 1, height: 64 },
});
