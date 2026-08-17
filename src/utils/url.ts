import { SUPPORTED_PLATFORMS } from '@/constants/platforms';
import type { SupportedPlatform } from '@/types/media';

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

export function extractUrls(text: string): string[] {
  return [...text.matchAll(URL_REGEX)].map((m) => m[0]);
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function detectPlatform(url: string): SupportedPlatform {
  const normalized = url.trim();
  for (const platform of SUPPORTED_PLATFORMS) {
    if (platform.pattern.test(normalized)) {
      return platform.id;
    }
  }
  return 'unknown';
}

const DIRECT_MEDIA_EXT =
  /\.(mp4|webm|mkv|mov|m4v|3gp|mp3|m4a|aac|wav|ogg|flac|jpg|jpeg|png|gif|webp|bmp)(\?|#|$)/i;

/** True when the URL likely points at a file, not a social media page. */
export function isDirectMediaUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url.trim());
    return DIRECT_MEDIA_EXT.test(pathname);
  } catch {
    return false;
  }
}

/** YouTube, TikTok, etc. — need a server extractor; this app is direct-link only. */
export function isSocialPageUrl(url: string): boolean {
  return detectPlatform(url) !== 'unknown';
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function generateId(prefix = 'dd'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
