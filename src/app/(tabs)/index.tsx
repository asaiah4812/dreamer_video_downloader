import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { checkHealth, resolveMediaForDownload } from '@/api/media-api';
import { ClipboardBanner } from '@/components/home/clipboard-banner';
import { DownloadFab } from '@/components/home/download-fab';
import { HomePasteField } from '@/components/home/home-paste-field';
import { PlatformStrip } from '@/components/home/platform-strip';
import { PremiumModal } from '@/components/home/premium-modal';
import { GradientBackground } from '@/components/ui/gradient-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useClipboardMonitor } from '@/hooks/use-clipboard-monitor';
import { enqueueDownload, shareFile } from '@/services/download-manager';
import { useDownloadStore } from '@/store/download-store';
import { useSettingsStore } from '@/store/settings-store';
import { isValidHttpUrl, formatFileSize } from '@/utils/url';
import { Palette } from '@/constants/colors';

export default function HomeScreen() {
  const { t } = useTranslation();
  const inputUrl = useDownloadStore((s) => s.inputUrl);
  const setInputUrl = useDownloadStore((s) => s.setInputUrl);
  const activeDownloads = useDownloadStore((s) => s.activeDownloads);
  const history = useDownloadStore((s) => s.history);
  const settings = useSettingsStore((s) => s.settings);

  const [downloading, setDownloading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [premiumVisible, setPremiumVisible] = useState(false);

  const onClipboard = useCallback(
    (url: string) => setInputUrl(url),
    [setInputUrl],
  );

  const { suggestedUrl, dismiss, accept } = useClipboardMonitor(onClipboard);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return (
      activeDownloads.find((d) => d.id === activeId) ??
      history.find((d) => d.id === activeId) ??
      null
    );
  }, [activeDownloads, activeId, history]);

  const statusLabel = useMemo(() => {
    if (!activeItem) return downloading ? t('fetching') : 'Download Now';
    const pct = Math.round(activeItem.progress ?? 0);
    const base =
      activeItem.status === 'processing'
        ? t('processing')
        : activeItem.status === 'downloading' || activeItem.status === 'queued'
          ? t('downloading')
          : activeItem.status === 'completed'
            ? t('saved')
            : 'Download Now';
    if (base === t('saved')) return base;
    return `${base} · ${pct}%`;
  }, [activeItem, downloading, t]);

  const fabBusy =
    downloading ||
    activeItem?.status === 'queued' ||
    activeItem?.status === 'downloading' ||
    activeItem?.status === 'processing';

  const handleDownload = async () => {
    if (!isValidHttpUrl(inputUrl)) {
      Alert.alert(t('invalidUrlTitle'), t('invalidUrlMessage'));
      return;
    }
    setDownloading(true);
    try {
      const health = await checkHealth();
      if (!health.ok) {
        Alert.alert(
          t('backendOfflineTitle'),
          `${t('backendOfflineMessage')}\n\nURL: ${health.url}\n${health.message ?? ''}`,
        );
        return;
      }
      const { metadata, quality } = await resolveMediaForDownload(inputUrl);
      const id = await enqueueDownload(metadata, quality, settings.saveToGallery);
      setActiveId(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      if (msg.includes('Trial limit reached') || msg.includes('402')) {
        setPremiumVisible(true);
      } else {
        Alert.alert(t('downloadFailedTitle'), msg);
      }
    } finally {
      setDownloading(false);
    }
  };


  const recentItems = useMemo(() => {
    return [...activeDownloads, ...history].slice(0, 4);
  }, [activeDownloads, history]);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Stitch Header */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
              <View style={styles.brandGroup}>
                <Ionicons name="cloud-download" size={24} color={Palette.primary} />
                <Text style={styles.appTitle}>DreamerDrop</Text>
              </View>

              <TouchableOpacity
                onPress={() => setPremiumVisible(true)}
                activeOpacity={0.8}
                style={styles.crownBtn}>
                <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.crownGrad}>
                  <FontAwesome6 name="crown" size={13} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Input & Download Action Box */}
            <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.inputContainer}>
              <HomePasteField value={inputUrl} onChange={setInputUrl} />
              <View style={{ marginTop: 12 }}>
                <DownloadFab
                  busy={fabBusy}
                  onPress={() => void handleDownload()}
                  label={statusLabel}
                />
              </View>
            </Animated.View>

            {/* Platform Strip */}
            <PlatformStrip />

            {/* Recent Downloads Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Downloads</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/downloads')} activeOpacity={0.7}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentItems.length === 0 ? (
              <GlassCard style={styles.emptyRecent}>
                <Ionicons name="cloud-download-outline" size={32} color={Palette.primary} />
                <Text style={styles.emptyRecentTitle}>No downloads yet</Text>
              </GlassCard>
            ) : (
              <View style={{ gap: 10 }}>
                {recentItems.map((item) => (
                  <RecentDropCard key={item.id} item={item} />
                ))}
              </View>
            )}

            {/* Quick Actions Grid */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickGrid}>
                <QuickActionItem
                  icon={<Ionicons name="cloud-download-outline" size={20} color="#38BDF8" />}
                  label="Downloads"
                  onPress={() => router.push('/(tabs)/downloads')}
                />
                <QuickActionItem
                  icon={<Ionicons name="time-outline" size={20} color="#8B5CF6" />}
                  label="History"
                  onPress={() => router.push('/(tabs)/history')}
                />
                <QuickActionItem
                  icon={<Ionicons name="help-circle-outline" size={20} color="#F472B6" />}
                  label="How To"
                  onPress={() => router.push('/welcome')}
                />
                <QuickActionItem
                  icon={<FontAwesome6 name="crown" size={16} color="#F59E0B" />}
                  label="Premium"
                  onPress={() => setPremiumVisible(true)}
                />
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {suggestedUrl ? (
          <ClipboardBanner
            url={suggestedUrl}
            onUse={() => { accept(); setInputUrl(suggestedUrl); }}
            onDismiss={dismiss}
          />
        ) : null}

        <PremiumModal visible={premiumVisible} onClose={() => setPremiumVisible(false)} />
      </SafeAreaView>
    </GradientBackground>
  );
}

function RecentDropCard({ item }: { item: any }) {
  const isDownloading = item.status === 'downloading' || item.status === 'processing';
  const pct = Math.round(item.progress ?? 0);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}>
      <GlassCard noPadding style={styles.recentCard}>
        <View style={styles.recentRow}>
          {/* Thumbnail */}
          <View style={styles.thumbWrapper}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.recentThumb} contentFit="cover" />
            ) : (
              <View style={[styles.recentThumb, styles.recentThumbFallback]}>
                <Ionicons name="play" size={20} color={Palette.primary} />
              </View>
            )}
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={14} color="#ffffff" style={{ marginLeft: 2 }} />
            </View>
          </View>

          {/* Details */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.recentTitle} numberOfLines={1}>
              {item.title}
            </Text>

            {isDownloading ? (
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.progressPct}>{pct}%</Text>
              </View>
            ) : (
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{item.platform || 'Media'} • {formatFileSize(item.fileSize)}</Text>
                <Ionicons name="checkmark-circle" size={14} color={Palette.success} />
              </View>
            )}
          </View>

          {/* Action button */}
          <TouchableOpacity
            onPress={() =>
              item.localUri
                ? void shareFile(item.localUri)
                : router.push({ pathname: '/details', params: { id: item.id } })
            }
            activeOpacity={0.8}
            style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color="rgba(205, 195, 211, 0.7)" />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

function QuickActionItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.quickItem}>
      <View style={styles.quickCircle}>{icon}</View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.primary,
    letterSpacing: -0.5,
  },
  crownBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  crownGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#E3E0F1',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtext: {
    fontSize: 15,
    color: '#CDC3D3',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E3E0F1',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.primary,
  },
  emptyRecent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 20,
  },
  emptyRecentTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#E3E0F1',
  },
  emptyRecentSub: {
    marginTop: 4,
    fontSize: 13,
    color: Palette.textMuted,
  },
  recentCard: {
    borderRadius: 18,
    padding: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumbWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1F1E2A',
  },
  recentThumb: {
    width: '100%',
    height: '100%',
  },
  recentThumbFallback: {
    backgroundColor: 'rgba(218, 184, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E3E0F1',
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.secondaryContainer,
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
});



