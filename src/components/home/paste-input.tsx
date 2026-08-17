import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { TextInput, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { detectPlatform } from '@/utils/url';
import { SUPPORTED_PLATFORMS } from '@/constants/platforms';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function PasteInput({ value, onChange }: Props) {
  const { t } = useTranslation();
  const platform = value ? detectPlatform(value) : null;
  const platformInfo = SUPPORTED_PLATFORMS.find((p) => p.id === platform);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) onChange(text.trim());
  };

  return (
    <GlassCard delay={100} className="self-stretch">
      <Animated.View entering={FadeIn}>
        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-dreamer-muted">
          {t('pasteLink')}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={t('pastePlaceholder')}
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          className="min-h-[56px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white"
        />
        <View className="mt-3 flex-row items-center justify-between">
          {platformInfo ? (
            <Text className="text-sm font-medium" style={{ color: platformInfo.color }}>
              {platformInfo.name}
            </Text>
          ) : (
            <Text className="text-sm text-dreamer-muted">DreamerDrop</Text>
          )}
          <AnimatedPressable
            onPress={() => void handlePaste()}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
            <Text className="text-sm font-semibold text-white">{t('pasteLink')}</Text>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </GlassCard>
  );
}
