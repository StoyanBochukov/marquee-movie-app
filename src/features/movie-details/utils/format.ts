export function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatCompactNumber(value: number | null): string | null {
  if (value === null) return null;
  if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trimDecimal(value / 1_000)}K`;
  return String(value);
}

const trimDecimal = (value: number) =>
  value >= 100 ? Math.round(value) : Number(value.toFixed(1));

/**
 * OMDb has no "similar titles" endpoint, so we search by the franchise part of the title:
 * subtitles after ":" or " - " and trailing sequel numbers are dropped.
 */
export function getSimilarQuery(title: string): string | null {
  const base = title
    .split(/:| - /)[0]!
    .replace(/\b(part|vol\.?|volume|chapter|episode)\s*[\divx]+\b/gi, '')
    .replace(/\s+(\d+|[ivx]+)$/i, '')
    .replace(/^(the|a|an)\s+/i, '')
    .trim();

  return base.length >= 3 ? base : null;
}
