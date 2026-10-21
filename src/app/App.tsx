import { StatusBar } from 'react-native';

import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </AppProviders>
  );
}
