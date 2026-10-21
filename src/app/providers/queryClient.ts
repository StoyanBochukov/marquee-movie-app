import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { isApiError } from '@/core/api/ApiError';

const MAX_RETRIES = 2;

/** Persisted entries older than this are dropped; gcTime must be at least as long. */
export const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Movie metadata barely changes and the free OMDb tier allows ~1,000 requests/day.
      staleTime: 1000 * 60 * 60,
      gcTime: CACHE_MAX_AGE_MS,
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && (!isApiError(error) || error.isRetryable),
    },
  },
});

/** React Native has no window focus events; map app foregrounding onto TanStack's focus manager. */
export function subscribeToAppFocus() {
  const subscription = AppState.addEventListener('change', status => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}
