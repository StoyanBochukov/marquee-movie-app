import { memo } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/core/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

/** Honors system font scaling, capped so fixed-size cards and rows keep their layout. */
const MAX_FONT_SCALE = 1.4;

function AppTextBase({
  variant = 'body',
  color = 'text',
  style,
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[styles.base, typography[variant], { color: colors[color] }, style]}
    />
  );
}

export const AppText = memo(AppTextBase);

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
