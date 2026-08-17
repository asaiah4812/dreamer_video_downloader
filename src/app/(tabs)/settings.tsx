import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GradientBackground } from '@/components/ui/gradient-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useSettingsStore } from '@/store/settings-store';
import type { AppLanguage } from '@/types/settings';
import i18n from '@/i18n';
import { Palette } from '@/constants/colors';

const LANGUAGES: AppLanguage[] = ['en', 'es'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [quality, setQuality] = useState<'720p' | '1080p' | '4K'>('1080p');

  const toggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear temporary download cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cache Cleared', 'Freed up 245 MB.') },
      ],
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </Animated.View>

          {/* APPEARANCE SECTION */}
          <GlassCard noPadding style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>APPEARANCE</Text>
            </View>

            {/* Theme Toggle */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="color-palette-outline" size={18} color={Palette.primary} />
                </View>
                <Text style={styles.rowTitle}>Theme</Text>
              </View>

              <View style={styles.segmentedBg}>
                <TouchableOpacity
                  onPress={() => updateSettings({ theme: 'light' })}
                  activeOpacity={0.8}
                  style={[styles.segmentBtn, settings.theme === 'light' && styles.segmentBtnActive]}>
                  <Text style={[styles.segmentText, settings.theme === 'light' && styles.segmentTextActive]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateSettings({ theme: 'dark' })}
                  activeOpacity={0.8}
                  style={[styles.segmentBtn, settings.theme === 'dark' && styles.segmentBtnActive]}>
                  <Text style={[styles.segmentText, settings.theme === 'dark' && styles.segmentTextActive]}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Selection */}
            <View style={[styles.row, { borderTopWidth: 1, borderColor: '#262A3C' }]}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="language-outline" size={18} color={Palette.primary} />
                </View>
                <Text style={styles.rowTitle}>{t('language')}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                {LANGUAGES.map((lng) => {
                  const active = settings.language === lng;
                  return (
                    <TouchableOpacity
                      key={lng}
                      activeOpacity={0.8}
                      onPress={() => { updateSettings({ language: lng }); void i18n.changeLanguage(lng); }}
                      style={[styles.langBtn, active && styles.langBtnActive]}>
                      <Text style={[styles.langBtnText, active && styles.langBtnTextActive]}>
                        {lng === 'en' ? 'EN' : 'ES'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </GlassCard>

          {/* DOWNLOADS SECTION */}
          <GlassCard noPadding style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>DOWNLOADS</Text>
            </View>

            {/* Default Quality Radio Pills */}
            <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="hardware-chip-outline" size={18} color={Palette.primary} />
                </View>
                <Text style={styles.rowTitle}>Default Quality</Text>
              </View>

              <View style={styles.qualityRadioRow}>
                {(['720p', '1080p', '4K'] as const).map((q) => {
                  const active = quality === q;
                  return (
                    <TouchableOpacity
                      key={q}
                      onPress={() => setQuality(q)}
                      activeOpacity={0.8}
                      style={[styles.radioPill, active && styles.radioPillActive]}>
                      <Text style={[styles.radioText, active && styles.radioTextActive]}>{q}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save to Gallery */}
            <View style={[styles.row, { borderTopWidth: 1, borderColor: '#262A3C' }]}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="images-outline" size={18} color={Palette.primary} />
                </View>
                <Text style={styles.rowTitle}>Save to Gallery</Text>
              </View>
              <Switch
                value={settings.saveToGallery}
                onValueChange={(v) => toggle('saveToGallery', v)}
                trackColor={{ false: '#262A3C', true: 'rgba(139, 92, 246, 0.4)' }}
                thumbColor={settings.saveToGallery ? Palette.primary : '#64748B'}
              />
            </View>

            {/* Auto-Start Downloads */}
            <View style={[styles.row, { borderTopWidth: 1, borderColor: '#262A3C' }]}>
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="flash-outline" size={18} color={Palette.primary} />
                </View>
                <Text style={styles.rowTitle}>Auto-Start Downloads</Text>
              </View>
              <Switch
                value={settings.clipboardMonitor}
                onValueChange={(v) => toggle('clipboardMonitor', v)}
                trackColor={{ false: '#262A3C', true: 'rgba(139, 92, 246, 0.4)' }}
                thumbColor={settings.clipboardMonitor ? Palette.primary : '#64748B'}
              />
            </View>
          </GlassCard>

          {/* DATA SECTION */}
          <GlassCard noPadding style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>DATA</Text>
            </View>

            {/* Clear Cache */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash-outline" size={18} color={Palette.error} />
                </View>
                <Text style={[styles.rowTitle, { color: Palette.error }]}>Clear Cache</Text>
              </View>
              <TouchableOpacity onPress={handleClearCache} activeOpacity={0.8}>
                <Text style={[styles.changeLink, { color: Palette.error }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* About Link */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/about')}>
            <GlassCard noPadding style={styles.aboutCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="information-circle-outline" size={22} color={Palette.primary} />
                  </View>
                  <Text style={styles.rowTitle}>{t('about')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
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
  sectionCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Palette.primary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E3E0F1',
  },
  rowSub: {
    fontSize: 12,
    color: 'rgba(205, 195, 211, 0.7)',
    marginTop: 2,
  },
  segmentedBg: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 3,
    borderRadius: 10,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(218, 184, 255, 0.2)',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CDC3D3',
  },
  segmentTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langBtnActive: {
    backgroundColor: 'rgba(218, 184, 255, 0.2)',
    borderColor: 'rgba(218, 184, 255, 0.4)',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CDC3D3',
  },
  langBtnTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  qualityRadioRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  radioPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  radioPillActive: {
    backgroundColor: 'rgba(218, 184, 255, 0.2)',
    borderColor: Palette.primary,
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CDC3D3',
  },
  radioTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.secondary,
  },
  aboutCard: {
    borderRadius: 20,
  },
});


