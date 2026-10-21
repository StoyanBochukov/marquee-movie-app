export type MediaType = 'movie' | 'series' | 'episode' | 'game' | 'other';

export interface MovieSummary {
  id: string;
  title: string;
  /** Kept as text because series use ranges such as "2011–2019". */
  year: string;
  type: MediaType;
  posterUrl: string | null;
}

export type RatingSource = 'imdb' | 'rottenTomatoes' | 'metacritic' | 'other';

export interface MovieRating {
  source: RatingSource;
  label: string;
  /** Display value as provided, e.g. "7.6/10" or "85%". */
  value: string;
  /** Normalized to 0-100 so ratings from different sources can be compared. */
  score: number | null;
}

export interface MovieDetails extends MovieSummary {
  rated: string | null;
  released: string | null;
  runtimeMinutes: number | null;
  genres: string[];
  directors: string[];
  writers: string[];
  actors: string[];
  plot: string | null;
  languages: string[];
  countries: string[];
  awards: string | null;
  ratings: MovieRating[];
  imdbRating: number | null;
  imdbVotes: number | null;
  metascore: number | null;
  boxOffice: string | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  totalResults: number;
  hasNextPage: boolean;
}

export interface MovieSearchParams {
  query: string;
  type?: Extract<MediaType, 'movie' | 'series' | 'episode'>;
}
