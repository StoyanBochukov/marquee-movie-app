import { memo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/core/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

function AppTextBase({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[styles.base, typography[variant], { color: colors[color] }, style]} />;
}

export const AppText = memo(AppTextBase);

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
