jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { OMDB_API_KEY: 'test-key', OMDB_BASE_URL: 'https://omdb.test' },
}));
