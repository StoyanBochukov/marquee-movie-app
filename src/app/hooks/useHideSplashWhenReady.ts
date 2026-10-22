import { useIsRestoring } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';

/**
 * Keeps the native launch screen up until navigation is mounted and the persisted query cache
 * has been restored, so the first visible frame is the cached feed rather than skeletons.
 * Returns the callback for NavigationContainer's onReady.
 */
export function useHideSplashWhenReady() {
  const isRestoring = useIsRestoring();
  const [isNavigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    if (isNavigationReady && !isRestoring) {
      BootSplash.hide({ fade: true });
    }
  }, [isNavigationReady, isRestoring]);

  return () => setNavigationReady(true);
}
