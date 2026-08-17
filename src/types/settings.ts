export type ThemeMode = 'dark' | 'light' | 'system';
export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ar';

export type AppSettings = {
  theme: ThemeMode;
  language: AppLanguage;
  hapticsEnabled: boolean;
  clipboardMonitor: boolean;
  notificationsEnabled: boolean;
  saveToGallery: boolean;
  wifiOnly: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  hapticsEnabled: true,
  clipboardMonitor: true,
  notificationsEnabled: true,
  saveToGallery: false,
  wifiOnly: false,
};
