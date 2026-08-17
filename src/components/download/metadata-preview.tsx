import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { GlassCard } from '@/components/ui/glass-card';
import type { MediaMetadata } from '@/types/media';
import { formatDuration } from '@/utils/url';

type Props = { metadata: MediaMetadata; onOpenSheet: () => void };

export function MetadataPreview({ metadata, onOpenSheet }: Props) {
  const { t } = useTranslation();

  return (
    <GlassCard className="self-stretch">
      <Image
        source={{ uri: metadata.thumbnail }}
        className="mb-3 h-44 w-full rounded-2xl bg-white/5"
        contentFit="cover"
      />
      <Text className="text-lg font-bold text-white" numberOfLines={2}>
        {metadata.title}
      </Text>
      <Text className="mt-1 text-sm text-dreamer-muted">
        {metadata.author} · {formatDuration(metadata.duration)}
      </Text>
      <Text
        className="mt-3 text-center text-sm font-semibold text-dreamer-neon"
        onPress={onOpenSheet}>
        {t('videoQuality')} →
      </Text>
    </GlassCard>
  );
}
