import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, type TextLayoutEvent } from 'react-native';

import { AppText, type AppTextProps } from './AppText';

type ExpandableTextProps = Omit<AppTextProps, 'children' | 'numberOfLines'> & {
  children: string;
  collapsedLines?: number;
};

/** Collapses long copy and only shows the toggle when the text actually overflows. */
export function ExpandableText({
  children,
  collapsedLines = 4,
  ...textProps
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const handleTextLayout = useCallback(
    (event: TextLayoutEvent) => {
      if (!overflows && event.nativeEvent.lines.length > collapsedLines) setOverflows(true);
    },
    [collapsedLines, overflows],
  );

  return (
    <Pressable
      onPress={overflows ? () => setExpanded(value => !value) : undefined}
      disabled={!overflows}
      accessibilityRole={overflows ? 'button' : 'text'}
      accessibilityState={overflows ? { expanded } : undefined}
      accessibilityHint={
        overflows ? (expanded ? 'Collapses the text' : 'Shows the full text') : undefined
      }
    >
      {/* Unclamped, invisible copy measures the real line count. */}
      {!overflows ? (
        <AppText
          {...textProps}
          style={[textProps.style, styles.measure]}
          onTextLayout={handleTextLayout}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {children}
        </AppText>
      ) : null}
      <AppText {...textProps} numberOfLines={expanded ? undefined : collapsedLines}>
        {children}
      </AppText>
      {overflows ? (
        <AppText variant="label" style={styles.toggle}>
          {expanded ? 'Show less' : 'Read more'}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  measure: { position: 'absolute', left: 0, right: 0, opacity: 0 },
  toggle: { marginTop: 6 },
});
