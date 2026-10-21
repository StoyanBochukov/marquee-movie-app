export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'server'
  | 'notFound'
  | 'tooManyResults'
  | 'unauthorized'
  | 'rateLimited'
  | 'invalidResponse'
  | 'unknown';

const RETRYABLE_KINDS: ReadonlySet<ApiErrorKind> = new Set(['network', 'timeout', 'server']);

const USER_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'You appear to be offline. Check your connection and try again.',
  timeout: 'The request took too long. Please try again.',
  server: 'The movie service is having trouble right now.',
  notFound: 'We could not find what you were looking for.',
  tooManyResults: 'Too many matches. Try a more specific search.',
  unauthorized: 'The movie service rejected our credentials.',
  rateLimited: 'Daily request limit reached. Please try again later.',
  invalidResponse: 'We received unexpected data from the movie service.',
  unknown: 'Something went wrong. Please try again.',
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  override readonly cause?: unknown;

  constructor(kind: ApiErrorKind, message?: string, options?: { status?: number; cause?: unknown }) {
    super(message ?? USER_MESSAGES[kind]);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status;
    this.cause = options?.cause;
  }

  get isRetryable(): boolean {
    return RETRYABLE_KINDS.has(this.kind);
  }

  get userMessage(): string {
    return USER_MESSAGES[this.kind];
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export const getUserMessage = (error: unknown): string =>
  isApiError(error) ? error.userMessage : USER_MESSAGES.unknown;
