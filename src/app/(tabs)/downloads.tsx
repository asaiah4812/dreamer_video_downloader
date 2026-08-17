import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GradientBackground } from '@/components/ui/gradient-background';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';
import { shareFile } from '@/services/download-manager';
import { useDownloadStore } from '@/store/download-store';
import { Palette } from '@/constants/colors';
import { formatFileSize } from '@/utils/url';

type FilterType = 'all' | 'active' | 'completed';

export default function DownloadsScreen() {
  const { t } = useTranslation();
  const activeDownloads = useDownloadStore((s) => s.activeDownloads);
  const history = useDownloadStore((s) => s.history);
  const [filter, setFilter] = useState<FilterType>('all');

  const activeItems = useMemo(() => {
    return activeDownloads.filter((i) => i.status !== 'completed' && i.status !== 'failed');
  }, [activeDownloads]);

  const completedItems = useMemo(() => {
    return history.filter((i) => i.status === 'completed');
  }, [history]);

  const displayedActive = filter === 'completed' ? [] : activeItems;
  const displayedCompleted = filter === 'active' ? [] : completedItems;
  const isEmpty = displayedActive.length === 0 && displayedCompleted.length === 0;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>Downloads</Text>
          </Animated.View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            <FilterPill label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <FilterPill label="Active" active={filter === 'active'} onPress={() => setFilter('active')} />
            <FilterPill label="Completed" active={filter === 'completed'} onPress={() => setFilter('completed')} />
          </View>

          {isEmpty ? (
            <GlassCard style={styles.emptyCard}>
              <EmptyState
                iconName="cloud-download-outline"
                title={t('noDownloads')}
                message="Start a download from the home screen"
              />
            </GlassCard>
          ) : (
            <View style={{ gap: 20 }}>

              {/* Active Downloads List */}
              {displayedActive.length > 0 ? (
                <View style={{ gap: 12 }}>
                  <Text style={styles.sectionHeaderTitle}>Active</Text>
                  {displayedActive.map((item) => (
                    <ActiveDownloadCard key={item.id} item={item} />
                  ))}
                </View>
              ) : null}

              {/* Completed Downloads List */}
              {displayedCompleted.length > 0 ? (
                <View style={{ gap: 12 }}>
                  <View style={styles.completedHeaderRow}>
                    <Ionicons name="checkmark-circle" size={18} color="rgba(205, 195, 211, 0.6)" />
                    <Text style={styles.sectionHeaderTitle}>Completed</Text>
                  </View>
                  {displayedCompleted.map((item) => (
                    <CompletedDownloadCard key={item.id} item={item} />
                  ))}
                </View>
              ) : null}

            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.filterPill, active && styles.filterPillActive]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActiveDownloadCard({ item }: { item: any }) {
  const removeDownload = useDownloadStore((s) => s.removeDownload);
  const pct = Math.round(item.progress ?? 0);

  return (
    <GlassCard noPadding style={styles.card}>
      <View style={styles.cardInner}>
        {/* Thumbnail + Spec Badge */}
        <View style={styles.thumbWrap}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="videocam" size={22} color={Palette.primary} />
            </View>
          )}
          <View style={styles.badgePill}>
            <Ionicons name="videocam" size={10} color="#ffffff" />
            <Text style={styles.badgeText}>{item.format || '1080p'}</Text>
          </View>
        </View>

        {/* Info & Progress */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.platformBadge}>
              <Ionicons name="film-outline" size={12} color="rgba(205, 195, 211, 0.8)" />
            </View>
          </View>

          <Text style={styles.statsText}>
            {formatFileSize(item.fileSize)} • {pct}% • {item.status === 'processing' ? 'Processing...' : 'Downloading...'}
          </Text>

          {/* Shimmering Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionColumn}>
          <TouchableOpacity
            onPress={() => removeDownload(item.id)}
            activeOpacity={0.8}
            style={styles.cancelBtn}>
            <Ionicons name="close" size={16} color={Palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
}

function CompletedDownloadCard({ item }: { item: any }) {
  return (
    <GlassCard noPadding style={styles.cardCompleted}>
      <View style={styles.cardInner}>
        {/* Thumbnail + Play Badge */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            item.localUri
              ? void shareFile(item.localUri)
              : router.push({ pathname: '/details', params: { id: item.id } })
          }
          style={styles.thumbWrap}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="play" size={22} color={Palette.primary} />
            </View>
          )}
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* Details */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.statsText}>
            {formatFileSize(item.fileSize)} • {item.format || 'mp4'}
          </Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          onPress={() =>
            item.localUri
              ? void shareFile(item.localUri)
              : router.push({ pathname: '/details', params: { id: item.id } })
          }
          activeOpacity={0.8}
          style={styles.shareBtn}>
          <Ionicons name="share-outline" size={14} color="#E3E0F1" />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E3E0F1',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#CDC3D3',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(218, 184, 255, 0.2)',
    borderColor: 'rgba(218, 184, 255, 0.4)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CDC3D3',
  },
  filterTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  emptyCard: {
    paddingVertical: 40,
    borderRadius: 20,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CDC3D3',
  },
  completedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  card: {
    borderRadius: 20,
  },
  cardCompleted: {
    borderRadius: 20,
    opacity: 0.9,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  thumbWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1F1E2A',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    backgroundColor: 'rgba(218, 184, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(18, 18, 29, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#E3E0F1',
    marginRight: 6,
  },
  platformBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(205, 195, 211, 0.7)',
    marginBottom: 6,
  },
  progressTrack: {
    height: 6,
    width: '100%',
    backgroundColor: '#343440',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.secondaryContainer,
    borderRadius: 3,
  },
  actionColumn: {
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 180, 171, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E3E0F1',
  },
});


