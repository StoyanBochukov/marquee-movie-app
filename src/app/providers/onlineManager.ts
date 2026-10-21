import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/**
 * Lets TanStack Query pause requests while offline and refetch automatically on reconnect,
 * instead of burning retries (and the daily OMDb quota) on a dead connection.
 */
export function bindOnlineManager() {
  onlineManager.setEventListener(setOnline =>
    // `isConnected` is null while unknown; treat that as online to avoid a false offline flash.
    NetInfo.addEventListener(state => setOnline(state.isConnected !== false)),
  );
}

const getIsOnline = () => onlineManager.isOnline();

export function useIsOnline(): boolean {
  return useSyncExternalStore(onlineManager.subscribe, getIsOnline, getIsOnline);
}
