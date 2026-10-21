import type {
  MediaType,
  MovieDetails,
  MovieRating,
  MovieSummary,
  Page,
  RatingSource,
} from '../model/types';

import type { MovieDetailsDto, SearchItemDto, SearchResponseDto } from './schemas';

export const OMDB_PAGE_SIZE = 10;

/** OMDb uses the literal string "N/A" for missing values. */
export function toNullable(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return !trimmed || trimmed === 'N/A' ? null : trimmed;
}

export function toList(value: string | undefined): string[] {
  const text = toNullable(value);
  if (!text) return [];
  return text
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function toNumber(value: string | undefined): number | null {
  const text = toNullable(value);
  if (!text || !/\d/.test(text)) return null;
  const parsed = Number(text.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function toRuntimeMinutes(value: string | undefined): number | null {
  const match = toNullable(value)?.match(/(\d+)\s*min/i);
  return match?.[1] ? Number(match[1]) : null;
}

export function toMediaType(value: string): MediaType {
  switch (value.toLowerCase()) {
    case 'movie':
    case 'series':
    case 'episode':
    case 'game':
      return value.toLowerCase() as MediaType;
    default:
      return 'other';
  }
}

const RATING_SOURCES: Record<string, { source: RatingSource; label: string }> = {
  'Internet Movie Database': { source: 'imdb', label: 'IMDb' },
  'Rotten Tomatoes': { source: 'rottenTomatoes', label: 'Rotten Tomatoes' },
  Metacritic: { source: 'metacritic', label: 'Metacritic' },
};

/** Normalizes "7.6/10", "85%" and "67/100" onto a 0-100 scale. */
export function toScore(value: string): number | null {
  const percent = value.match(/^(\d+(?:\.\d+)?)%$/);
  if (percent?.[1]) return Number(percent[1]);

  const fraction = value.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (fraction?.[1] && fraction[2]) {
    const max = Number(fraction[2]);
    return max > 0 ? Math.round((Number(fraction[1]) / max) * 100) : null;
  }
  return null;
}

export function mapRating(dto: { Source: string; Value: string }): MovieRating {
  const known = RATING_SOURCES[dto.Source];
  return {
    source: known?.source ?? 'other',
    label: known?.label ?? dto.Source,
    value: dto.Value,
    score: toScore(dto.Value),
  };
}

export function mapSearchItem(dto: SearchItemDto): MovieSummary {
  return {
    id: dto.imdbID,
    title: dto.Title,
    year: dto.Year,
    type: toMediaType(dto.Type),
    posterUrl: toNullable(dto.Poster),
  };
}

export function mapSearchResponse(dto: SearchResponseDto, page: number): Page<MovieSummary> {
  const totalResults = toNumber(dto.totalResults) ?? 0;
  return {
    items: dto.Search.map(mapSearchItem),
    page,
    totalResults,
    hasNextPage: page * OMDB_PAGE_SIZE < totalResults,
  };
}

export function mapMovieDetails(dto: MovieDetailsDto): MovieDetails {
  return {
    id: dto.imdbID,
    title: dto.Title,
    year: dto.Year,
    type: toMediaType(dto.Type),
    posterUrl: toNullable(dto.Poster),
    rated: toNullable(dto.Rated),
    released: toNullable(dto.Released),
    runtimeMinutes: toRuntimeMinutes(dto.Runtime),
    genres: toList(dto.Genre),
    directors: toList(dto.Director),
    writers: toList(dto.Writer),
    actors: toList(dto.Actors),
    plot: toNullable(dto.Plot),
    languages: toList(dto.Language),
    countries: toList(dto.Country),
    awards: toNullable(dto.Awards),
    ratings: (dto.Ratings ?? []).map(mapRating),
    imdbRating: toNumber(dto.imdbRating),
    imdbVotes: toNumber(dto.imdbVotes),
    metascore: toNumber(dto.Metascore),
    boxOffice: toNullable(dto.BoxOffice),
  };
}

/** Builds a details-shaped object from a list item so the details screen can render instantly. */
export function summaryToDetailsPlaceholder(summary: MovieSummary): MovieDetails {
  return {
    ...summary,
    rated: null,
    released: null,
    runtimeMinutes: null,
    genres: [],
    directors: [],
    writers: [],
    actors: [],
    plot: null,
    languages: [],
    countries: [],
    awards: null,
    ratings: [],
    imdbRating: null,
    imdbVotes: null,
    metascore: null,
    boxOffice: null,
  };
}
