import { z } from 'zod';

/** OMDb signals failures with HTTP 200 (or 401) and this body shape. */
export const omdbErrorDtoSchema = z.object({
  Response: z.literal('False'),
  Error: z.string(),
});

export const searchItemDtoSchema = z.object({
  Title: z.string(),
  Year: z.string(),
  imdbID: z.string(),
  Type: z.string(),
  Poster: z.string().optional(),
});

export const searchResponseDtoSchema = z.object({
  Response: z.literal('True'),
  Search: z.array(searchItemDtoSchema),
  totalResults: z.string(),
});

const ratingDtoSchema = z.object({
  Source: z.string(),
  Value: z.string(),
});

const optionalText = z.string().optional();

export const movieDetailsDtoSchema = z.object({
  Response: z.literal('True'),
  imdbID: z.string(),
  Title: z.string(),
  Year: z.string(),
  Type: z.string(),
  Poster: optionalText,
  Rated: optionalText,
  Released: optionalText,
  Runtime: optionalText,
  Genre: optionalText,
  Director: optionalText,
  Writer: optionalText,
  Actors: optionalText,
  Plot: optionalText,
  Language: optionalText,
  Country: optionalText,
  Awards: optionalText,
  Ratings: z.array(ratingDtoSchema).optional(),
  Metascore: optionalText,
  imdbRating: optionalText,
  imdbVotes: optionalText,
  BoxOffice: optionalText,
});

export type OmdbErrorDto = z.infer<typeof omdbErrorDtoSchema>;
export type SearchItemDto = z.infer<typeof searchItemDtoSchema>;
export type SearchResponseDto = z.infer<typeof searchResponseDtoSchema>;
export type MovieDetailsDto = z.infer<typeof movieDetailsDtoSchema>;
