export type CardVariant = 'poster' | 'wide' | 'ranked';

/** Fixed card sizes keep horizontal rows layout-stable and cheap to virtualize. */
export const CARD_LAYOUT = {
  poster: { width: 112, height: 168 },
  wide: { width: 240, height: 135 },
  ranked: { width: 160, height: 168, posterWidth: 112, rankWidth: 60 },
} as const satisfies Record<CardVariant, { width: number; height: number; [key: string]: number }>;

export const CARD_GAP = 8;
