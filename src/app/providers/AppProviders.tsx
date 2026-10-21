import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { cacheStorage } from '@/core/storage/keyValueStorage';

import { CACHE_MAX_AGE_MS, queryClient, subscribeToAppFocus } from './queryClient';

/** Bump when cached data shapes change so stale persisted caches are discarded. */
const CACHE_BUSTER = 'v1';

const persister = createAsyncStoragePersister({ storage: cacheStorage, key: 'react-query' });

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(subscribeToAppFocus, []);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: CACHE_MAX_AGE_MS, buster: CACHE_BUSTER }}
      >
        {children}
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
