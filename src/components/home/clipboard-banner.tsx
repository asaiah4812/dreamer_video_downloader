import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { Palette } from '@/constants/colors';

type Props = {
  url: string;
  onUse: () => void;
  onDismiss: () => void;
};

export function ClipboardBanner({ url, onUse, onDismiss }: Props) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInUp.springify()} exiting={FadeOutDown} style={styles.outer}>
      <View style={styles.card}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.inner}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>⧉</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t('clipboardDetected')}</Text>
            <Text style={styles.url} numberOfLines={1}>{url}</Text>
          </View>
          <TouchableOpacity onPress={onUse} activeOpacity={0.8} style={styles.useBtn}>
            <Text style={styles.useBtnText}>{t('useLink')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(12, 12, 20, 0.88)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(34,211,238,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.neon,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Palette.neon,
    marginBottom: 2,
  },
  url: {
    fontSize: 13,
    color: '#ffffff',
  },
  useBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Palette.purple,
  },
  useBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.textMuted,
  },
});
