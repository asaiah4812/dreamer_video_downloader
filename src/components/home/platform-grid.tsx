import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { SUPPORTED_PLATFORMS } from '@/constants/platforms';
import { GlassCard } from '@/components/ui/glass-card';

export function PlatformGrid() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUPPORTED_PLATFORMS;
    return SUPPORTED_PLATFORMS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <GlassCard delay={200} className="self-stretch">
      <Text className="mb-2 text-lg font-bold text-white">{t('supportedPlatforms')}</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('searchPlatforms')}
        placeholderTextColor="#64748b"
        className="mb-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {filtered.map((platform) => (
          <View
            key={platform.id}
            className="mr-2 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            style={{ minWidth: 88 }}>
            <View
              className="mb-2 h-10 w-10 rounded-full"
              style={{ backgroundColor: `${platform.color}33` }}
            />
            <Text className="text-center text-xs font-semibold text-white">{platform.name}</Text>
          </View>
        ))}
      </ScrollView>
    </GlassCard>
  );
}
