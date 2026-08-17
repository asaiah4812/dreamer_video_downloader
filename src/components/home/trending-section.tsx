import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import { SUPPORTED_PLATFORMS, TRENDING_SAMPLES } from '@/constants/platforms';
import { GlassCard } from '@/components/ui/glass-card';

export function TrendingSection() {
  const { t } = useTranslation();

  return (
    <GlassCard delay={300} className="self-stretch">
      <Text className="mb-3 text-lg font-bold text-white">{t('trending')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TRENDING_SAMPLES.map((item, index) => {
          const platform = SUPPORTED_PLATFORMS.find((p) => p.id === item.platform);
          return (
            <View
              key={item.title}
              className="mr-3 w-44 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
              <View
                className="mb-2 h-24 rounded-xl"
                style={{ backgroundColor: `${platform?.color ?? '#8b5cf6'}44` }}
              />
              <Text className="text-sm font-semibold text-white" numberOfLines={2}>
                {item.title}
              </Text>
              <Text className="mt-1 text-xs text-dreamer-muted">
                {platform?.name} · {item.views}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </GlassCard>
  );
}
