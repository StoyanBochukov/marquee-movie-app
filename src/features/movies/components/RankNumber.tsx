import { memo } from 'react';
import Svg, { Text as SvgText } from 'react-native-svg';

import { colors } from '@/core/theme';

type RankNumberProps = { rank: number; width: number; height: number };

/** Outlined numerals like a "Top 10" shelf; RN Text cannot stroke glyphs, so this uses SVG. */
function RankNumberBase({ rank, width, height }: RankNumberProps) {
  const isTwoDigit = rank >= 10;
  const fontSize = isTwoDigit ? height * 0.62 : height * 0.82;

  return (
    <Svg width={width} height={height} accessible={false}>
      <SvgText
        x={width}
        y={height - 4}
        textAnchor="end"
        fontSize={fontSize}
        fontWeight="900"
        letterSpacing={isTwoDigit ? -8 : 0}
        fill={colors.background}
        stroke={colors.textSecondary}
        strokeWidth={3}
      >
        {rank}
      </SvgText>
    </Svg>
  );
}

export const RankNumber = memo(RankNumberBase);
