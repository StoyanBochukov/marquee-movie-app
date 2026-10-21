import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { isApiError } from '@/core/api/ApiError';

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Movie metadata barely changes and the free OMDb tier allows ~1,000 requests/day.
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 24,
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
