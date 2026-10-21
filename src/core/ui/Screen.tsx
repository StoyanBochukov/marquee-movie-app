import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/core/theme';

type ScreenProps = PropsWithChildren<{
  edges?: Edge[];
  style?: ViewStyle;
}>;

export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const insetStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
  };

  return (
    <View style={[styles.container, insetStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
