import 'react-native-config';

declare module 'react-native-config' {
  interface NativeConfig {
    OMDB_API_KEY?: string;
    OMDB_BASE_URL?: string;
  }
}
