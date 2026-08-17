import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ProgressRing } from '@/components/ui/progress-ring';
import { Palette } from '@/constants/colors';
import type { DownloadItem } from '@/types/media';
import { formatFileSize } from '@/utils/url';

type Props = {
  item: DownloadItem;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onShare?: () => void;
  onPreview?: () => void;
};

function statusDot(status: DownloadItem['status']) {
  switch (status) {
    case 'completed': return Palette.success;
    case 'failed': return Palette.error;
    case 'downloading':
    case 'processing': return Palette.neon;
    default: return Palette.textMuted;
  }
}

export function DownloadListItem({ item, onPause, onResume, onCancel, onShare, onPreview }: Props) {
  const { t } = useTranslation();
  const isActive =
    item.status === 'downloading' || item.status === 'queued' || item.status === 'processing';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumb}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="play-circle-outline" size={28} color={Palette.textMuted} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: statusDot(item.status) }]} />
            <Text style={styles.meta}>
              {item.qualityLabel} · {formatFileSize(item.fileSize)}
            </Text>
          </View>

          {item.error ? (
            <Text style={styles.errorText} numberOfLines={2}>{item.error}</Text>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            {isActive && item.status === 'downloading' ? (
              <Chip label={t('pause')} icon="pause-outline" onPress={onPause} />
            ) : null}
            {item.status === 'paused' ? (
              <Chip label={t('resume')} icon="play-outline" onPress={onResume} />
            ) : null}
            {isActive ? (
              <Chip label={t('cancel')} icon="close-outline" onPress={onCancel} />
            ) : null}
            {item.status === 'completed' && item.localUri ? (
              <>
                <Chip label={t('preview')} icon="eye-outline" onPress={onPreview} />
                <Chip label={t('share')} icon="share-outline" onPress={onShare} />
              </>
            ) : null}
          </View>
        </View>

        {isActive ? <ProgressRing progress={item.progress} /> : null}
      </View>

      {/* Progress bar */}
      {isActive && item.progress > 0 ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, item.progress)}%` as any,
                backgroundColor: Palette.neon,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

function Chip({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  if (!onPress) return null;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.chip}>
      {icon ? <Ionicons name={icon} size={12} color={Palette.neon} /> : null}
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  thumbWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  thumbFallback: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  meta: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: Palette.error,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  progressFill: {
    height: 3,
  },
});

