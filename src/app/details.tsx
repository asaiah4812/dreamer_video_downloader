import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { LocalMediaPreview } from '@/components/media/local-media-preview';
import { GradientBackground } from '@/components/ui/gradient-background';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { shareFile } from '@/services/download-manager';
import { useDownloadStore } from '@/store/download-store';
import { Palette } from '@/constants/colors';

export default function DetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const activeDownloads = useDownloadStore((s) => s.activeDownloads);
  const history = useDownloadStore((s) => s.history);
  const item = activeDownloads.find((d) => d.id === id) ?? history.find((d) => d.id === id);

  if (!item) {
    return (
      <GradientBackground>
        <SafeAreaView className="flex-1 items-center justify-center p-6">
          <Text className="text-white">Download not found</Text>
          <AnimatedPressable onPress={() => router.back()} className="mt-4">
            <Text style={{ color: Palette.neon, fontWeight: '700' }}>Go back</Text>
          </AnimatedPressable>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 px-5">
        <AnimatedPressable
          onPress={() => router.back()}
          className="mb-4 flex-row items-center gap-2 self-start py-2">
          <Ionicons name="arrow-back" size={20} color={Palette.neon} />
          <Text style={{ color: Palette.neon, fontWeight: '700' }}>Back</Text>
        </AnimatedPressable>

        <ScrollView contentContainerClassName="gap-4 pb-10" showsVerticalScrollIndicator={false}>
          <Text className="text-2xl font-bold tracking-tight text-white">{item.title}</Text>
          <Text className="text-sm text-dreamer-muted">
            {item.qualityLabel} · {item.format.toUpperCase()}
          </Text>

          {item.localUri ? (
            <GlassCard noPadding className="overflow-hidden">
              <LocalMediaPreview uri={item.localUri} type={item.type} />
            </GlassCard>
          ) : null}

          {item.localUri ? (
            <AnimatedPressable onPress={() => void shareFile(item.localUri!)} className="overflow-hidden rounded-2xl">
              <View
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: Palette.primary,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.14)',
                }}>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="share-social-outline" size={20} color="#ffffff" />
                  <Text className="font-bold text-white">{t('share')}</Text>
                </View>
              </View>
            </AnimatedPressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

