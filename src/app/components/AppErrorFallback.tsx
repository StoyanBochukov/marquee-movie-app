import { RotateCw, TriangleAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/core/theme';
import { AppText, Button, useErrorBoundary, Wordmark } from '@/core/ui';

/** Last-resort screen for render crashes outside any feature-level boundary. */
export function AppErrorFallback() {
  const { error, reset } = useErrorBoundary();

  // A crash before navigation mounts would otherwise leave the launch screen up forever.
  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Wordmark />
      <View style={styles.body} accessibilityRole="alert">
        <TriangleAlert color={colors.textMuted} size={44} />
        <AppText variant="title" style={styles.centered}>
          Something went wrong
        </AppText>
        <AppText color="textSecondary" style={styles.centered}>
          An unexpected error occurred. Try again, and if it keeps happening, restart the app.
        </AppText>
        {__DEV__ ? (
          <AppText variant="caption" color="textMuted" style={styles.centered} selectable>
            {error.message}
          </AppText>
        ) : null}
        <Button label="Try again" icon={RotateCw} onPress={reset} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  centered: { textAlign: 'center' },
});
