import { StyleSheet } from 'react-native';

import { colors } from '@/core/theme';

import { AppText } from './AppText';

export const APP_NAME = 'Marquee';

export function Wordmark() {
  return (
    <AppText
      variant="title"
      style={styles.wordmark}
      accessibilityRole="header"
      accessibilityLabel={APP_NAME}
    >
      {APP_NAME.toUpperCase()}
    </AppText>
  );
}

const styles = StyleSheet.create({
  wordmark: { color: colors.primary, fontWeight: '900', letterSpacing: 2 },
});
