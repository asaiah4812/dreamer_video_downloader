import type { SupportedPlatform } from '@/types/media';

export type PlatformInfo = {
  id: SupportedPlatform;
  name: string;
  color: string;
  pattern: RegExp;
  iconName: string;
  iconFamily: 'Ionicons' | 'FontAwesome6' | 'Feather' | 'MaterialCommunityIcons';
};

export const SUPPORTED_PLATFORMS: PlatformInfo[] = [
  { id: 'youtube', name: 'YouTube', color: '#FF0000', pattern: /(?:youtube\.com|youtu\.be)/i, iconName: 'logo-youtube', iconFamily: 'Ionicons' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2FE', pattern: /tiktok\.com/i, iconName: 'logo-tiktok', iconFamily: 'Ionicons' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', pattern: /instagram\.com/i, iconName: 'logo-instagram', iconFamily: 'Ionicons' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', pattern: /facebook\.com|fb\.watch/i, iconName: 'logo-facebook', iconFamily: 'Ionicons' },
  { id: 'twitter', name: 'X / Twitter', color: '#38BDF8', pattern: /(?:twitter|x)\.com/i, iconName: 'logo-twitter', iconFamily: 'Ionicons' },
  { id: 'threads', name: 'Threads', color: '#A855F7', pattern: /threads\.net/i, iconName: 'at-sign', iconFamily: 'Feather' },
  { id: 'snapchat', name: 'Snapchat', color: '#FACC15', pattern: /snapchat\.com/i, iconName: 'ghost', iconFamily: 'MaterialCommunityIcons' },
  { id: 'vimeo', name: 'Vimeo', color: '#1AB7EA', pattern: /vimeo\.com/i, iconName: 'vimeo', iconFamily: 'FontAwesome6' },
  { id: 'dailymotion', name: 'Dailymotion', color: '#0066DC', pattern: /dailymotion\.com/i, iconName: 'play-circle', iconFamily: 'Feather' },
];

export const TRENDING_SAMPLES = [
  { title: 'Lo-fi beats to code', platform: 'youtube' as const, views: '2.4M' },
  { title: 'Street dance reel', platform: 'tiktok' as const, views: '890K' },
  { title: 'Travel vlog highlights', platform: 'instagram' as const, views: '1.1M' },
];

