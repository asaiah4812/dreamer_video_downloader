import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type Props = {
  uri: string;
  type: 'video' | 'audio' | 'image';
};

/** Preview without expo-av — works in Expo Go. */
export function LocalMediaPreview({ uri, type }: Props) {
  const { t } = useTranslation();

  if (type === 'image') {
    return (
      <Image
        source={{ uri }}
        style={{ width: '100%', height: 220, borderRadius: 16, backgroundColor: '#000' }}
        contentFit="contain"
      />
    );
  }

  const icon = type === 'video' ? '🎬' : '🎵';

  return (
    <View className="min-h-[180px] items-center justify-center rounded-2xl border border-white/10 bg-black/50 px-4 py-6">
      <Text className="text-4xl">{icon}</Text>
      <Text className="mt-3 text-center text-base font-semibold text-white">
        {t('savedToApp')}
      </Text>
      <Text className="mt-2 text-center text-xs text-dreamer-muted" numberOfLines={3}>
        {uri}
      </Text>
      <Text className="mt-3 text-center text-xs text-dreamer-neon">{t('useShareToOpen')}</Text>
    </View>
  );
}
