import Constants from 'expo-constants';
import { Platform } from 'react-native';

type MediaLibraryModule = typeof import('expo-media-library');

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

/** `undefined` = not probed yet, `null` = unavailable (Expo Go / web). */
let mediaLibraryCache: MediaLibraryModule | null | undefined;

/** Lazy-load native modules so the app can boot when they are unavailable. */
export async function getMediaLibrary(): Promise<MediaLibraryModule | null> {
  if (Platform.OS === 'web') return null;
  // SDK 56 media-library native module is not in standard Expo Go yet.
  if (isExpoGo()) {
    mediaLibraryCache = null;
    return null;
  }
  if (mediaLibraryCache === null) return null;
  if (mediaLibraryCache) return mediaLibraryCache;

  try {
    const mod = await import('expo-media-library');
    mediaLibraryCache = mod;
    return mod;
  } catch {
    mediaLibraryCache = null;
    return null;
  }
}

let sharingCache: typeof import('expo-sharing') | null | undefined;

export async function getSharing() {
  if (Platform.OS === 'web') return null;
  if (sharingCache === null) return null;
  if (sharingCache) return sharingCache;
  try {
    sharingCache = await import('expo-sharing');
    return sharingCache;
  } catch {
    sharingCache = null;
    return null;
  }
}

let avCache: typeof import('expo-av') | null | undefined;

export async function getExpoAv() {
  if (Platform.OS === 'web') return null;
  if (isExpoGo()) {
    avCache = null;
    return null;
  }
  if (avCache === null) return null;
  if (avCache) return avCache;
  try {
    avCache = await import('expo-av');
    return avCache;
  } catch {
    avCache = null;
    return null;
  }
}

export function isNativeModuleError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Cannot find native module') ||
    message.includes('ExponentAV') ||
    message.includes('ExpoMediaLibraryNext')
  );
}
