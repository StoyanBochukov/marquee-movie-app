jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { OMDB_API_KEY: 'test-key', OMDB_BASE_URL: 'https://omdb.test' },
}));

jest.mock('react-native-reanimated', () => require('./test/mocks/reanimated'));

jest.mock(
  'lucide-react-native',
  () =>
    new Proxy(
      { __esModule: true },
      { get: (target, key) => (key in target ? target[key as '__esModule'] : () => null) },
    ),
);

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const store = new Map<string, string>();
    return {
      getString: (key: string) => store.get(key),
      set: (key: string, value: string) => store.set(key, value),
      remove: (key: string) => store.delete(key),
      clearAll: () => store.clear(),
    };
  },
}));
