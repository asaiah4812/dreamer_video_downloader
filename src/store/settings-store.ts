import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/config';
import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings';

type SettingsState = {
  hasSeenWelcome: boolean;
  userEmail: string;
  isSubscribed: boolean;
  trialsLeft: number;
  settings: AppSettings;
  setHasSeenWelcome: (value: boolean) => void;
  setUserEmail: (email: string) => void;
  setIsSubscribed: (subscribed: boolean) => void;
  setTrialsLeft: (count: number) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      userEmail: '',
      isSubscribed: false,
      trialsLeft: 3,
      settings: DEFAULT_SETTINGS,
      setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
      setUserEmail: (userEmail) => set({ userEmail }),
      setIsSubscribed: (isSubscribed) => set({ isSubscribed }),
      setTrialsLeft: (trialsLeft) => set({ trialsLeft }),
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        userEmail: state.userEmail,
        isSubscribed: state.isSubscribed,
        trialsLeft: state.trialsLeft,
        settings: state.settings,
      }),
    },
  ),
);

