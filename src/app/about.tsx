import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/ui/gradient-background';
import { GlassCard } from '@/components/ui/glass-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Palette } from '@/constants/colors';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 px-5">
        <AnimatedPressable
          onPress={() => router.back()}
          className="mb-2 flex-row items-center gap-1 self-start py-2">
          <Text style={{ color: Palette.neon, fontSize: 20, fontWeight: '900' }}>←</Text>
          <Text className="text-dreamer-neon">Back</Text>
        </AnimatedPressable>

        <ScreenHeader eyebrow="DreamerDrop" title="About" />

        <GlassCard>
          <Text className="text-lg font-semibold text-white">DreamerDrop Downloader</Text>
          <Text className="mt-3 text-[15px] leading-6 text-dreamer-subtle">
            {t('aboutDescription')}
          </Text>
          <View className="mt-6 gap-3">
            {['Social link downloads via yt-dlp', 'Premium dark interface', 'Save to device & gallery'].map(
              (line) => (
                <View key={line} className="flex-row items-center gap-2">
                  <Text style={{ color: Palette.neon, fontSize: 12, fontWeight: '900' }}>✦</Text>
                  <Text className="text-sm text-white">{line}</Text>
                </View>
              ),
            )}
          </View>
          <Text className="mt-6 text-xs text-dreamer-muted">v1.0.0 · Expo SDK 56</Text>
        </GlassCard>
      </SafeAreaView>
    </GradientBackground>
  );
}
