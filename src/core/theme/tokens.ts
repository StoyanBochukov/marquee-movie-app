import type { TextStyle } from 'react-native';

export const colors = {
  background: '#0A0A0F',
  surface: '#15151C',
  surfaceElevated: '#1F1F28',
  border: '#2A2A35',
  primary: '#E50914',
  primaryPressed: '#B20710',
  text: '#FFFFFF',
  textSecondary: '#B3B3BF',
  textMuted: '#7A7A88',
  imdb: '#F5C518',
  success: '#46D369',
  overlay: 'rgba(0, 0, 0, 0.55)',
  skeleton: '#22222B',
  transparent: 'transparent',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  subtitle: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

export type ColorToken = keyof typeof colors;
export type TypographyVariant = keyof typeof typography;
