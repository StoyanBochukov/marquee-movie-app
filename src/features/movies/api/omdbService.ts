import type { z } from 'zod';

import {
  ApiError,
  createHttpClient,
  isApiError,
  type HttpClient,
  type QueryParams,
} from '@/core/api';
import { env } from '@/core/config/env';

import type { MovieDetails, MovieSearchParams, MovieSummary, Page } from '../model/types';

import { mapMovieDetails, mapSearchResponse } from './mappers';
import { movieDetailsDtoSchema, omdbErrorDtoSchema, searchResponseDtoSchema } from './schemas';

/** Maps OMDb's free-text error messages onto typed error kinds. */
export function toOmdbError(body: unknown, status?: number): ApiError | null {
  const parsed = omdbErrorDtoSchema.safeParse(body);
  if (!parsed.success) return null;

  const message = parsed.data.Error.toLowerCase();
  const options = { status, body };
  // "Error getting data." is returned for unknown IDs and invalid filter combinations; retrying never helps.
  if (
    ['not found', 'incorrect imdb id', 'error getting data'].some(text => message.includes(text))
  ) {
    return new ApiError('notFound', parsed.data.Error, options);
  }
  if (message.includes('too many results'))
    return new ApiError('tooManyResults', parsed.data.Error, options);
  if (message.includes('limit reached'))
    return new ApiError('rateLimited', parsed.data.Error, options);
  if (message.includes('api key')) return new ApiError('unauthorized', parsed.data.Error, options);
  return new ApiError('unknown', parsed.data.Error, options);
}

export type OmdbService = {
  searchMovies(
    params: MovieSearchParams & { page: number },
    signal?: AbortSignal,
  ): Promise<Page<MovieSummary>>;
  getMovieById(id: string, signal?: AbortSignal): Promise<MovieDetails>;
};

export function createOmdbService(http: HttpClient): OmdbService {
  async function request<Schema extends z.ZodType>(
    params: QueryParams,
    schema: Schema,
    signal?: AbortSignal,
  ): Promise<z.infer<Schema>> {
    let body: unknown;
    try {
      body = await http.get('/', { params, signal });
    } catch (error) {
      throw (isApiError(error) && toOmdbError(error.body, error.status)) || error;
    }

    const omdbError = toOmdbError(body);
    if (omdbError) throw omdbError;

    const result = schema.safeParse(body);
    if (!result.success) throw new ApiError('invalidResponse', undefined, { cause: result.error });
    return result.data;
  }

  return {
    async searchMovies({ query, type, page }, signal) {
      const dto = await request({ s: query.trim(), type, page }, searchResponseDtoSchema, signal);
      return mapSearchResponse(dto, page);
    },

    async getMovieById(id, signal) {
      const dto = await request({ i: id, plot: 'full' }, movieDetailsDtoSchema, signal);
      return mapMovieDetails(dto);
    },
  };
}

export const omdbService = createOmdbService(
  createHttpClient({ baseUrl: env.OMDB_BASE_URL, defaultParams: { apikey: env.OMDB_API_KEY } }),
);
