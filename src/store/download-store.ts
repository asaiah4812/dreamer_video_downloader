import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/config';
import type { DownloadItem, DownloadStatus, MediaMetadata } from '@/types/media';
import { generateId } from '@/utils/url';

type DownloadState = {
  activeDownloads: DownloadItem[];
  history: DownloadItem[];
  currentMetadata: MediaMetadata | null;
  inputUrl: string;
  setInputUrl: (url: string) => void;
  setCurrentMetadata: (metadata: MediaMetadata | null) => void;
  addDownload: (item: Omit<DownloadItem, 'id' | 'createdAt' | 'status' | 'progress'>) => string;
  updateDownload: (id: string, patch: Partial<DownloadItem>) => void;
  setDownloadStatus: (id: string, status: DownloadStatus, progress?: number) => void;
  removeDownload: (id: string) => void;
  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  clearHistory: () => void;
};

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      activeDownloads: [],
      history: [],
      currentMetadata: null,
      inputUrl: '',
      setInputUrl: (url) => set({ inputUrl: url }),
      setCurrentMetadata: (metadata) => set({ currentMetadata: metadata }),
      addDownload: (item) => {
        const id = generateId('dl');
        const download: DownloadItem = {
          ...item,
          id,
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          activeDownloads: [download, ...state.activeDownloads],
        }));
        return id;
      },
      updateDownload: (id, patch) =>
        set((state) => ({
          activeDownloads: state.activeDownloads.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
          history: state.history.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      setDownloadStatus: (id, status, progress) => {
        const patch: Partial<DownloadItem> = { status };
        if (progress !== undefined) patch.progress = progress;
        if (status === 'completed') {
          patch.completedAt = new Date().toISOString();
          patch.progress = 100;
        }
        const download =
          get().activeDownloads.find((d) => d.id === id) ??
          get().history.find((d) => d.id === id);
        if (!download) return;

        set((state) => {
          const updated = { ...download, ...patch };
          const activeDownloads = state.activeDownloads.filter((d) => d.id !== id);
          const history =
            status === 'completed' || status === 'failed' || status === 'cancelled'
              ? [
                  updated,
                  ...state.history.filter((h) => h.id !== id),
                ]
              : state.history;
          const nextActive =
            status === 'completed' || status === 'failed' || status === 'cancelled'
              ? activeDownloads
              : state.activeDownloads.map((d) => (d.id === id ? updated : d));
          return { activeDownloads: nextActive, history };
        });
      },
      removeDownload: (id) =>
        set((state) => ({
          activeDownloads: state.activeDownloads.filter((d) => d.id !== id),
        })),
      pauseDownload: (id) => get().setDownloadStatus(id, 'paused'),
      resumeDownload: (id) => get().setDownloadStatus(id, 'downloading'),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: STORAGE_KEYS.downloads,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeDownloads: state.activeDownloads,
        history: state.history,
      }),
    },
  ),
);
