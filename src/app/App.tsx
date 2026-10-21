import { StatusBar } from 'react-native';

import { OfflineBanner } from './components/OfflineBanner';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import { bindOnlineManager } from './providers/onlineManager';

bindOnlineManager();

export function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
      <OfflineBanner />
    </AppProviders>
  );
}
