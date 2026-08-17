import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DownloadListItem } from '@/components/download/download-list-item';
import { GradientBackground } from '@/components/ui/gradient-background';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/empty-state';
import { shareFile } from '@/services/download-manager';
import { useDownloadStore } from '@/store/download-store';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const history = useDownloadStore((s) => s.history);
  const clearHistory = useDownloadStore((s) => s.clearHistory);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScreenHeader
          eyebrow="Library"
          title={t('history')}
          subtitle="Everything you've saved"
          trailing={
            history.length > 0 ? (
              <TouchableOpacity onPress={clearHistory} activeOpacity={0.8} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={14} color="#fca5a5" />
                <Text style={styles.clearText}>{t('clearHistory')}</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {history.length === 0 ? (
            <EmptyState
              iconName="time-outline"
              title={t('noHistory')}
              message="Completed downloads appear here"
            />
          ) : (
            history.map((item) => (
              <DownloadListItem
                key={item.id}
                item={item}
                onShare={() => item.localUri && void shareFile(item.localUri)}
                onPreview={() => router.push({ pathname: '/details', params: { id: item.id } })}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fca5a5',
  },
});

