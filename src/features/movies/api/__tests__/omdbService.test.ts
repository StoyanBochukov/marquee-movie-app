import { ApiError, type HttpClient } from '@/core/api';

import { movieDetailsFixture, searchResponseFixture } from '../__fixtures__/omdb';
import { createOmdbService, toOmdbError } from '../omdbService';

const httpReturning = (body: unknown): HttpClient => ({ get: jest.fn().mockResolvedValue(body) });

describe('toOmdbError', () => {
  it.each([
    ['Movie not found!', 'notFound'],
    ['Error getting data.', 'notFound'],
    ['Too many results.', 'tooManyResults'],
    ['Invalid API key!', 'unauthorized'],
    ['Request limit reached!', 'rateLimited'],
    ['Something odd', 'unknown'],
  ])('maps "%s" to %s', (message, kind) => {
    expect(toOmdbError({ Response: 'False', Error: message })?.kind).toBe(kind);
  });

  it('ignores successful bodies', () => {
    expect(toOmdbError(searchResponseFixture)).toBeNull();
  });
});

describe('createOmdbService', () => {
  it('searches with trimmed query and page params', async () => {
    const http = httpReturning(searchResponseFixture);
    const page = await createOmdbService(http).searchMovies({
      query: ' batman ',
      type: 'movie',
      page: 2,
    });

    expect(http.get).toHaveBeenCalledWith('/', {
      params: { s: 'batman', type: 'movie', page: 2 },
      signal: undefined,
    });
    expect(page.page).toBe(2);
    expect(page.items).toHaveLength(2);
  });

  it('fetches full-plot details by id', async () => {
    const http = httpReturning(movieDetailsFixture);
    const details = await createOmdbService(http).getMovieById('tt3896198');

    expect(http.get).toHaveBeenCalledWith('/', {
      params: { i: 'tt3896198', plot: 'full' },
      signal: undefined,
    });
    expect(details.title).toBe('Guardians of the Galaxy: Vol. 2');
  });

  it('turns HTTP 200 OMDb errors into typed ApiErrors', async () => {
    const service = createOmdbService(
      httpReturning({ Response: 'False', Error: 'Movie not found!' }),
    );
    await expect(service.searchMovies({ query: 'zzz', page: 1 })).rejects.toMatchObject({
      kind: 'notFound',
      isRetryable: false,
    });
  });

  it('refines error-status bodies from the http layer', async () => {
    const http: HttpClient = {
      get: jest.fn().mockRejectedValue(
        new ApiError('unauthorized', undefined, {
          status: 401,
          body: { Response: 'False', Error: 'Request limit reached!' },
        }),
      ),
    };
    await expect(createOmdbService(http).getMovieById('tt1')).rejects.toMatchObject({
      kind: 'rateLimited',
    });
  });

  it('rejects payloads that do not match the schema', async () => {
    const service = createOmdbService(httpReturning({ Response: 'True', Search: 'nope' }));
    await expect(service.searchMovies({ query: 'batman', page: 1 })).rejects.toMatchObject({
      kind: 'invalidResponse',
    });
  });
});
