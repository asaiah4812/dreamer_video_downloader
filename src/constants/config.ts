import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

/** Android emulator → host machine fallback */
function getDevApiHost() {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

/** Extract Metro dev server IP address from NativeModules or Constants */
function getMetroHostIp(): string | null {
  // Method 1: NativeModules.SourceCode.scriptURL (e.g., http://192.168.41.76:8081/index.bundle...)
  const scriptURL = (NativeModules as any).SourceCode?.scriptURL;
  if (scriptURL) {
    const match = String(scriptURL).match(/^https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }

  // Method 2: Constants.expoConfig?.hostUri or Constants.expoGoConfig?.debuggerHost
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.developer?.tool;

  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  return null;
}

/**
 * Resolve API base URL for the current device.
 * Automatically resolves LAN IP (e.g., 192.168.x.x) for physical phones on Wi-Fi.
 */
export function getApiBaseUrl(): string {
  const metroIp = getMetroHostIp();

  // If running on physical mobile device/Expo Go and we detected Metro's LAN IP, use it!
  if (metroIp && Platform.OS !== 'web') {
    return `http://${metroIp}:4000/api/v1`;
  }

  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;

  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (fromExtra) return fromExtra;

  return `http://${getDevApiHost()}:4000/api/v1`;
}

export const API_CONFIG = {
  get baseURL() {
    return getApiBaseUrl();
  },
  timeout: 300_000,
  maxRetries: 1,
};


/** Origin without `/api/v1` — for proxied media streams */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

export function resolveApiPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const origin = getApiOrigin();
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export const STORAGE_KEYS = {
  welcomeSeen: '@dreamerdrop/welcome_seen',
  downloads: '@dreamerdrop/downloads',
  history: '@dreamerdrop/history',
  settings: '@dreamerdrop/settings',
  trending: '@dreamerdrop/trending',
} as const;
