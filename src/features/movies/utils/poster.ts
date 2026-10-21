/** Amazon's image CDN encodes transforms after `._V1_`; swapping them lets us request the exact width we render. */
const AMAZON_TRANSFORM = /\._V1_[^/]*\.(jpe?g|png|webp)$/i;

export type PosterSize = 'thumb' | 'card' | 'hero';

const POSTER_WIDTHS: Record<PosterSize, number> = {
  thumb: 200,
  card: 400,
  hero: 1000,
};

export function getPosterUri(posterUrl: string | null, size: PosterSize): string | null {
  if (!posterUrl) return null;
  if (!AMAZON_TRANSFORM.test(posterUrl)) return posterUrl;
  return posterUrl.replace(AMAZON_TRANSFORM, `._V1_SX${POSTER_WIDTHS[size]}.$1`);
}
