import { ApiError } from '../ApiError';
import { buildUrl, createHttpClient } from '../httpClient';

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);

describe('buildUrl', () => {
  it('encodes params and skips undefined values', () => {
    expect(buildUrl('https://api.test/', '/', { s: 'star wars', page: 2, type: undefined })).toBe(
      'https://api.test/?s=star%20wars&page=2',
    );
  });
});

describe('createHttpClient', () => {
  it('merges default params and returns parsed JSON', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createHttpClient({
      baseUrl: 'https://api.test',
      defaultParams: { apikey: 'k' },
      fetchImpl,
    });

    await expect(client.get('/', { params: { s: 'a' } })).resolves.toEqual({ ok: true });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.test/?apikey=k&s=a');
  });

  it('maps error statuses and keeps the body for refinement', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({ Error: 'Invalid API key!' }, 401));
    const client = createHttpClient({ baseUrl: 'https://api.test', fetchImpl });

    const error = await client.get('/').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: 'unauthorized',
      status: 401,
      body: { Error: 'Invalid API key!' },
    });
  });

  it('marks 5xx responses as retryable server errors', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse({}, 503));
    const client = createHttpClient({ baseUrl: 'https://api.test', fetchImpl });

    await expect(client.get('/')).rejects.toMatchObject({ kind: 'server', isRetryable: true });
  });

  it('wraps transport failures as network errors', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const client = createHttpClient({ baseUrl: 'https://api.test', fetchImpl });

    await expect(client.get('/')).rejects.toMatchObject({ kind: 'network' });
  });

  it('reports a timeout when the request exceeds its budget', async () => {
    jest.useFakeTimers();
    const fetchImpl = jest.fn(
      (_url: RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        }),
    );
    const client = createHttpClient({ baseUrl: 'https://api.test', fetchImpl, timeoutMs: 50 });

    const pending = client.get('/');
    jest.advanceTimersByTime(50);
    await expect(pending).rejects.toMatchObject({ kind: 'timeout' });
    jest.useRealTimers();
  });

  it('lets caller cancellation propagate untouched', async () => {
    const abortError = new Error('Aborted');
    const fetchImpl = jest.fn(
      (_url: RequestInfo, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(abortError));
        }),
    );
    const client = createHttpClient({ baseUrl: 'https://api.test', fetchImpl });
    const controller = new AbortController();

    const pending = client.get('/', { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toBe(abortError);
  });
});
