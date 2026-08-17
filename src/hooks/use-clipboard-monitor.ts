import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useSettingsStore } from '@/store/settings-store';
import { extractUrls, isValidHttpUrl } from '@/utils/url';

export function useClipboardMonitor(onDetect: (url: string) => void) {
  const enabled = useSettingsStore((s) => s.settings.clipboardMonitor);
  const [suggestedUrl, setSuggestedUrl] = useState<string | null>(null);
  const lastSeen = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      try {
        const text = await Clipboard.getStringAsync();
        if (!text || text === lastSeen.current) return;
        const urls = extractUrls(text);
        const url = urls.find(isValidHttpUrl);
        if (url && url !== lastSeen.current) {
          lastSeen.current = text;
          setSuggestedUrl(url);
          onDetect(url);
        }
      } catch {
        /* clipboard unavailable */
      }
    };

    void check();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check();
    });
    const interval = setInterval(check, 4000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [enabled, onDetect]);

  const dismiss = () => setSuggestedUrl(null);

  const accept = () => {
    if (suggestedUrl) {
      onDetect(suggestedUrl);
      dismiss();
    }
  };

  return { suggestedUrl, dismiss, accept };
}
