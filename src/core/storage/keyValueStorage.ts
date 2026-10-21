import { createMMKV, type MMKV } from 'react-native-mmkv';

/** Web-Storage-shaped facade so Zustand and TanStack persisters can share one MMKV-backed type. */
export type KeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function createKeyValueStorage(mmkv: MMKV): KeyValueStorage {
  return {
    getItem: key => mmkv.getString(key) ?? null,
    setItem: (key, value) => mmkv.set(key, value),
    removeItem: key => {
      mmkv.remove(key);
    },
  };
}

/** User data (e.g. My List). Kept apart from caches so clearing a cache never loses user state. */
export const userStorage = createKeyValueStorage(createMMKV({ id: 'user-data' }));

/** Disposable server-state cache. */
export const cacheStorage = createKeyValueStorage(createMMKV({ id: 'query-cache' }));
