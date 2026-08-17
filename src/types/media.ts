export type SupportedPlatform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'threads'
  | 'snapchat'
  | 'vimeo'
  | 'dailymotion'
  | 'unknown';

export type MediaFormat = 'mp4' | 'webm' | 'mp3' | 'm4a' | 'jpg' | 'png';

export type MediaQuality = {
  id: string;
  label: string;
  format: MediaFormat;
  ext: string;
  resolution?: string;
  fps?: number;
  filesize?: number;
  filesizeApprox?: string;
  vcodec?: string;
  acodec?: string;
  type: 'video' | 'audio' | 'image';
};

export type MediaMetadata = {
  id: string;
  url: string;
  platform: SupportedPlatform;
  title: string;
  thumbnail: string;
  duration: number;
  author: string;
  description?: string;
  qualities: MediaQuality[];
  audioFormats: MediaQuality[];
  cachedAt?: string;
};

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'paused'
  | 'failed'
  | 'cancelled';

export type DownloadItem = {
  id: string;
  metadataId: string;
  url: string;
  title: string;
  thumbnail: string;
  platform: SupportedPlatform;
  qualityId: string;
  qualityLabel: string;
  format: MediaFormat;
  type: 'video' | 'audio' | 'image';
  status: DownloadStatus;
  progress: number;
  fileSize?: number;
  localUri?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
};

export type TrendingItem = {
  id: string;
  title: string;
  platform: SupportedPlatform;
  thumbnail?: string;
  views?: string;
};
