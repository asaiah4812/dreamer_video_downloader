import * as FileSystem from 'expo-file-system';

import { startServerDownload } from '@/api/media-api';
import { resolveApiPath } from '@/constants/config';
import { useDownloadStore } from '@/store/download-store';
import type { DownloadItem, MediaMetadata, MediaQuality } from '@/types/media';
import { generateId } from '@/utils/url';
import { errorNotification, successNotification } from '@/utils/haptics';
import { getMediaLibrary, getSharing } from '@/utils/native-modules';

type ActiveTask = {
  downloadId: string;
  task?: FileSystem.DownloadTask;
  progressSub?: { remove: () => void };
};

const activeTasks = new Map<string, ActiveTask>();

function getExtension(format: string) {
  return format.replace(/^\./, '') || 'mp4';
}

function buildLocalPath(title: string, ext: string) {
  const safe = title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 48);
  const dir = new FileSystem.Directory(FileSystem.Paths.document, 'DreamerDrop');
  const filename = `${safe}_${Date.now()}.${ext}`;
  const file = new FileSystem.File(dir, filename);
  return { dir, file };
}

function ensureDir(dir: FileSystem.Directory) {
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
}

export async function requestMediaPermissions() {
  try {
    const MediaLibrary = await getMediaLibrary();
    if (!MediaLibrary) return false;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Saves to the device photo library when expo-media-library is available (dev build / recent Expo Go).
 * Otherwise returns false — the file is still saved under app Documents/DreamerDrop.
 */
export async function saveToGallery(
  localUri: string,
  _type: 'video' | 'audio' | 'image',
): Promise<boolean> {
  try {
    const MediaLibrary = await getMediaLibrary();
    if (!MediaLibrary) return false;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await MediaLibrary.createAssetAsync(localUri);
    return true;
  } catch {
    return false;
  }
}

export async function shareFile(localUri: string) {
  const Sharing = await getSharing();
  if (!Sharing) return;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri);
  }
}

/**
 * Orchestrates server-side job resolution + client download with pause/resume via FileSystem.DownloadResumable.
 */
export async function enqueueDownload(
  metadata: MediaMetadata,
  quality: MediaQuality,
  saveToGalleryEnabled: boolean,
) {
  const store = useDownloadStore.getState();
  const displayTitle =
    metadata.title.length > 80 ? `${metadata.title.slice(0, 77)}…` : metadata.title;

  const downloadId = store.addDownload({
    metadataId: metadata.id,
    url: metadata.url,
    title: displayTitle,
    thumbnail: metadata.thumbnail,
    platform: metadata.platform,
    qualityId: quality.id,
    qualityLabel: quality.label,
    format: quality.format,
    type: quality.type,
    fileSize: quality.filesize,
  });

  store.setDownloadStatus(downloadId, 'downloading', 0);

  try {
    useDownloadStore.getState().updateDownload(downloadId, {
      status: 'processing',
      progress: 5,
    });

    const job = await startServerDownload({
      url: metadata.url,
      qualityId: quality.id,
      format: quality.format,
      type: quality.type,
    });

    if (!job.streamUrl) {
      throw new Error('Server did not return a stream URL — restart Flask (python app.py)');
    }
    const sourceUrl = resolveApiPath(job.streamUrl);

    const ext = getExtension(quality.ext || quality.format);
    const { dir, file } = buildLocalPath(metadata.title, ext);
    ensureDir(dir);

    const task = new FileSystem.DownloadTask(sourceUrl, file, {
      onProgress: (p) => {
        const pct = p.totalBytes > 0 ? (p.bytesWritten / p.totalBytes) * 100 : 0;
        useDownloadStore.getState().updateDownload(downloadId, {
          progress: Math.min(99, pct),
          status: 'downloading',
        });
      },
    });

    activeTasks.set(downloadId, { downloadId, task });

    const downloaded = await task.downloadAsync();
    if (!downloaded?.uri) throw new Error('Download failed');

    useDownloadStore.getState().updateDownload(downloadId, {
      localUri: downloaded.uri,
      progress: 100,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    useDownloadStore.getState().setDownloadStatus(downloadId, 'completed', 100);

    // File is already in Documents/DreamerDrop — gallery is best-effort only.
    if (saveToGalleryEnabled) {
      try {
        await saveToGallery(downloaded.uri, quality.type);
      } catch {
        /* Expo Go may lack ExpoMediaLibraryNext — download still succeeded */
      }
    }

    await successNotification();
    activeTasks.delete(downloadId);
    return downloadId;
  } catch (error) {
    let message = error instanceof Error ? error.message : 'Download failed';
    if (/403|502|upstream/i.test(message)) {
      message =
        'Video could not be fetched. Restart Flask, update yt-dlp (pip install -U yt-dlp), then try again.';
    }
    useDownloadStore.getState().updateDownload(downloadId, {
      status: 'failed',
      error: message,
    });
    useDownloadStore.getState().setDownloadStatus(downloadId, 'failed');
    await errorNotification();
    activeTasks.delete(downloadId);
    throw error;
  }
}

export async function pauseActiveDownload(downloadId: string) {
  const task = activeTasks.get(downloadId);
  if (!task?.task) return;
  await task.task.pauseAsync();
  useDownloadStore.getState().pauseDownload(downloadId);
}

export async function resumeActiveDownload(downloadId: string) {
  const task = activeTasks.get(downloadId);
  if (!task?.task) return;
  useDownloadStore.getState().resumeDownload(downloadId);
  const result = await task.task.resumeAsync();
  if (result?.uri) {
    useDownloadStore.getState().updateDownload(downloadId, {
      localUri: result.uri,
      progress: 100,
      status: 'completed',
    });
    useDownloadStore.getState().setDownloadStatus(downloadId, 'completed', 100);
    activeTasks.delete(downloadId);
  }
}

export async function cancelActiveDownload(downloadId: string) {
  const task = activeTasks.get(downloadId);
  task?.task?.cancel();
  activeTasks.delete(downloadId);
  useDownloadStore.getState().setDownloadStatus(downloadId, 'cancelled');
  useDownloadStore.getState().removeDownload(downloadId);
}

export function createOfflineHistoryItem(partial: Partial<DownloadItem>): DownloadItem {
  return {
    id: generateId('hist'),
    metadataId: partial.metadataId ?? generateId('meta'),
    url: partial.url ?? '',
    title: partial.title ?? 'Unknown',
    thumbnail: partial.thumbnail ?? '',
    platform: partial.platform ?? 'unknown',
    qualityId: partial.qualityId ?? 'best',
    qualityLabel: partial.qualityLabel ?? 'Best',
    format: partial.format ?? 'mp4',
    type: partial.type ?? 'video',
    status: partial.status ?? 'completed',
    progress: partial.progress ?? 100,
    localUri: partial.localUri,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    completedAt: partial.completedAt,
  };
}
