import { ApiError, type ApiErrorKind } from './ApiError';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export type RequestOptions = {
  params?: QueryParams;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type HttpClient = {
  get(path: string, options?: RequestOptions): Promise<unknown>;
};

export type HttpClientConfig = {
  baseUrl: string;
  defaultParams?: QueryParams;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 10_000;

export function buildUrl(baseUrl: string, path: string, params: QueryParams = {}): string {
  const base = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const query = Object.entries(params)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `${base}${normalizedPath}?${query}` : `${base}${normalizedPath}`;
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'server';
  return 'unknown';
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError('invalidResponse', undefined, { status: response.status, cause });
  }
}

export function createHttpClient({
  baseUrl,
  defaultParams,
  timeoutMs: defaultTimeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
}: HttpClientConfig): HttpClient {
  return {
    async get(path, { params, signal, timeoutMs = defaultTimeoutMs } = {}) {
      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
      const forwardAbort = () => controller.abort();
      signal?.addEventListener('abort', forwardAbort);

      try {
        const response = await fetchImpl(buildUrl(baseUrl, path, { ...defaultParams, ...params }), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        const body = await readJson(response);

        if (!response.ok) {
          throw new ApiError(kindFromStatus(response.status), undefined, {
            status: response.status,
            body,
          });
        }
        return body;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (timedOut) throw new ApiError('timeout', undefined, { cause: error });
        // Caller-initiated cancellation (e.g. TanStack Query unmount) must propagate untouched.
        if (signal?.aborted) throw error;
        throw new ApiError('network', undefined, { cause: error });
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', forwardAbort);
      }
    },
  };
}
