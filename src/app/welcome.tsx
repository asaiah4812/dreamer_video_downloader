import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Palette } from '@/constants/colors';
import { useSettingsStore } from '@/store/settings-store';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const setHasSeenWelcome = useSettingsStore((s) => s.setHasSeenWelcome);

  const continueToApp = () => {
    setHasSeenWelcome(true);
    router.replace('/(tabs)');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.topHeader}>
          <View style={styles.brandRow}>
            <Ionicons name="cloud-download" size={24} color={Palette.primary} />
            <Text style={styles.brandTitle}>DreamerDrop</Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Illustration Container */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.illustrationContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRsvO8Nvg2_D-dcNtcJSGZUE2tuGsphmRgp2xOvXNW3ub95qzkfZX12aVTWvzHPUudHhjACBGAY6Pf4evMcUTIDJ3h-j6Y7kQX-R3eJ4vhVA9J7E-iVr5BZUuWcRPE5goub1-8obE1LR4qahRkIZ5t6Y72m-1GOV8gGSDaB5y6CCBp5cHHedPHXFHC-lbpiNQlLGhiI1pCjuxxhV0gbhveS_1Ove3-5HDyB-yJ7jOrJH9yoLkUszZxZg',
              }}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Content Box */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ width: '100%' }}>
            <GlassCard noPadding style={styles.card}>
              <View style={styles.cardInner}>
                <Text style={styles.headline}>Save Any Video</Text>
                <Text style={styles.subtext}>
                  Download high-quality videos and audio instantly from your favorite platforms.
                </Text>

                <AnimatedPressable onPress={continueToApp} style={styles.btnWrap}>
                  <LinearGradient
                    colors={['#8B5CF6', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}>
                    <Text style={styles.btnText}>{t('getStarted')}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </LinearGradient>
                </AnimatedPressable>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#1A1D2B',
    borderColor: '#262A3C',
    borderWidth: 1,
  },
  cardInner: {
    padding: 20,
    gap: 14,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  btnWrap: {
    width: '100%',
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});



