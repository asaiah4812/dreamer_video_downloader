import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { GradientButton } from '@/components/ui/gradient-button';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import type { MediaMetadata, MediaQuality } from '@/types/media';
import { formatFileSize } from '@/utils/url';
import { Palette } from '@/constants/colors';

type Props = {
  metadata: MediaMetadata | null;
  visible: boolean;
  onClose: () => void;
  onDownload: (quality: MediaQuality) => void;
  downloading?: boolean;
};

export function DownloadBottomSheet({
  metadata,
  visible,
  onClose,
  onDownload,
  downloading,
}: Props) {
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%', '85%'], []);
  const [tab, setTab] = useState<'video' | 'audio'>('video');

  const qualities =
    tab === 'video'
      ? metadata?.qualities ?? []
      : metadata?.audioFormats ?? [];

  const [selected, setSelected] = useState<MediaQuality | null>(null);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose();
  }, [onClose]);

  if (!visible || !metadata) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backgroundStyle={{ backgroundColor: Palette.surfaceElevated }}
      handleIndicatorStyle={{ backgroundColor: Palette.textMuted }}>
      <BottomSheetScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Text className="text-xl font-bold text-white">{metadata.title}</Text>
        <View className="flex-row gap-2">
          {(['video', 'audio'] as const).map((key) => (
            <AnimatedPressable
              key={key}
              onPress={() => {
                setTab(key);
                setSelected(null);
              }}
              className={`rounded-full px-4 py-2 ${
                tab === key ? 'bg-dreamer-purple' : 'bg-white/10'
              }`}>
              <Text className="text-sm font-semibold text-white">
                {key === 'video' ? t('videoQuality') : t('audioOnly')}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
        {qualities.map((q) => (
          <AnimatedPressable
            key={q.id}
            onPress={() => setSelected(q)}
            className={`rounded-2xl border px-4 py-3 ${
              selected?.id === q.id
                ? 'border-dreamer-neon bg-dreamer-neon/10'
                : 'border-white/10 bg-white/5'
            }`}>
            <Text className="font-semibold text-white">{q.label}</Text>
            <Text className="text-xs text-dreamer-muted">
              {q.format.toUpperCase()} · {t('estimatedSize')}:{' '}
              {q.filesizeApprox ?? formatFileSize(q.filesize)}
            </Text>
          </AnimatedPressable>
        ))}
        <GradientButton
          label={t('startDownload')}
          loading={downloading}
          disabled={!selected}
          onPress={() => selected && onDownload(selected)}
          className="mt-4"
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
