import { StatusBar } from 'react-native';

import { ErrorBoundary } from '@/core/ui';

import { AppErrorFallback } from './components/AppErrorFallback';
import { OfflineBanner } from './components/OfflineBanner';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import { bindOnlineManager } from './providers/onlineManager';

bindOnlineManager();

export function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" />
      <ErrorBoundary fallback={<AppErrorFallback />}>
        <RootNavigator />
      </ErrorBoundary>
      <OfflineBanner />
    </AppProviders>
  );
}
