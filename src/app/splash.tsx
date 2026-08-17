import { router } from 'expo-router';
import { useCallback } from 'react';

import { LogoIntro } from '@/components/splash/logo-intro';
import { useSettingsStore } from '@/store/settings-store';

export default function SplashScreen() {
  const hasSeenWelcome = useSettingsStore((s) => s.hasSeenWelcome);

  const handleFinish = useCallback(() => {
    if (!hasSeenWelcome) {
      router.replace('/welcome');
      return;
    }
    router.replace('/(tabs)');
  }, [hasSeenWelcome]);

  return <LogoIntro onFinish={handleFinish} />;
}
