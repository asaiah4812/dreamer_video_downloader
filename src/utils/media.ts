import type { MediaMetadata, MediaQuality } from '@/types/media';

function heightFromLabel(label: string): number {
  const m = label.match(/(\d+)p/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Best video quality (highest resolution label), else best audio. */
export function pickBestQuality(metadata: MediaMetadata): MediaQuality | null {
  const videos = [...(metadata.qualities ?? [])].sort(
    (a, b) => heightFromLabel(b.label) - heightFromLabel(a.label),
  );
  if (videos.length > 0) return videos[0];
  const audio = metadata.audioFormats ?? [];
  return audio[0] ?? null;
}
