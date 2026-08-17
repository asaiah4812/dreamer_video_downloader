import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';

import { Palette } from '@/constants/colors';
import { useSettingsStore } from '@/store/settings-store';
import { checkSubscriptionStatus } from '@/api/media-api';
import { getApiOrigin } from '@/constants/config';

type Props = {
  visible: boolean;
  onClose: () => void;
};


export function PremiumModal({ visible, onClose }: Props) {
  const userEmail = useSettingsStore((s) => s.userEmail);
  const setUserEmail = useSettingsStore((s) => s.setUserEmail);
  const isSubscribed = useSettingsStore((s) => s.isSubscribed);
  const setIsSubscribed = useSettingsStore((s) => s.setIsSubscribed);
  const trialsLeft = useSettingsStore((s) => s.trialsLeft);

  const [inputEmail, setInputEmail] = useState(userEmail);
  const [checking, setChecking] = useState(false);

  const handlePaystackPay = async () => {
    if (!inputEmail || !inputEmail.includes('@')) {
      Alert.alert('Email Required', 'Please enter a valid email address for your Paystack subscription.');
      return;
    }
    setUserEmail(inputEmail.trim());

    // Open Web Paystack Checkout
    const origin = getApiOrigin();
    await WebBrowser.openBrowserAsync(origin);
  };

  const handleVerifySubscription = async () => {
    if (!inputEmail || !inputEmail.includes('@')) {
      Alert.alert('Email Required', 'Please enter the email address used for your payment.');
      return;
    }
    setChecking(true);
    const { subscribed } = await checkSubscriptionStatus(inputEmail.trim());
    setChecking(false);

    if (subscribed) {
      setUserEmail(inputEmail.trim());
      setIsSubscribed(true);
      Alert.alert('Subscription Active!', 'Your Paystack PRO subscription is active. Enjoy unlimited downloads!');
      onClose();
    } else {
      Alert.alert('No Subscription Found', 'No active Paystack subscription was found for this email address.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={styles.card}>
          {/* Close button */}
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Palette.textSecondary} />
          </TouchableOpacity>

          {/* Crown Icon */}
          <View style={styles.rocketCircle}>
            <LinearGradient colors={['#312E81', '#1E1B4B']} style={styles.rocketGrad}>
              <FontAwesome6 name="crown" size={26} color="#F59E0B" />
            </LinearGradient>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Unlock Unlimited Downloads</Text>
          <Text style={styles.subtitle}>
            {isSubscribed
              ? 'Your ₦600/mo PRO subscription is active!'
              : `Free Trial: ${trialsLeft > 0 ? `${trialsLeft} / 3 downloads left` : '3 / 3 downloads used'}`}
          </Text>

          {/* Feature List */}
          <View style={styles.featureList}>
            <FeatureRow
              icon={<MaterialCommunityIcons name="shield-off-outline" size={20} color="#818CF8" />}
              title="Unlimited Video Downloads"
              desc="No free trial limits or restrictions"
            />
            <FeatureRow
              icon={<Ionicons name="flash-outline" size={20} color="#818CF8" />}
              title="Super Fast Direct Downloads"
              desc="Files saved directly to your phone"
            />
            <FeatureRow
              icon={<MaterialCommunityIcons name="video-4k-box" size={20} color="#818CF8" />}
              title="4K Resolution & Pristine Quality"
              desc="Full HD & 4K video supported"
            />
          </View>

          {/* Paystack Plan Card */}
          <View style={styles.planCard}>
            <LinearGradient
              colors={['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.1)']}
              style={styles.planGrad}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>PRO MONTHLY PLAN</Text>
              </View>
              <View style={styles.planRow}>
                <View>
                  <Text style={styles.planName}>Paystack Subscription</Text>
                  <Text style={styles.planPrice}>
                    ₦600 <Text style={styles.planSub}>/ month</Text>
                  </Text>
                </View>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Email Input */}
          <View style={styles.emailBox}>
            <Text style={styles.emailLabel}>Subscriber Email Address:</Text>
            <TextInput
              value={inputEmail}
              onChangeText={setInputEmail}
              placeholder="name@example.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.emailInput}
            />
          </View>

          {/* Continue / Pay CTA */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => void handlePaystackPay()} style={styles.ctaBtn}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.ctaGrad}>
              <Text style={styles.ctaText}>Pay ₦600 via Paystack →</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Already Paid / Verify Link */}
          <TouchableOpacity activeOpacity={0.7} onPress={() => void handleVerifySubscription()} disabled={checking}>
            <Text style={styles.verifyLink}>
              {checking ? 'Checking Status...' : 'Already Paid? Check Subscription Status'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
      <View style={styles.greenCheck}>
        <Ionicons name="checkmark" size={12} color="#ffffff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#161928',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rocketCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 14,
    overflow: 'hidden',
  },
  rocketGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureList: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  featureDesc: {
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 1,
  },
  greenCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Palette.primary,
    marginBottom: 16,
  },
  planGrad: {
    padding: 16,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  planSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.success,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ctaGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  emailBox: {
    width: '100%',
    marginBottom: 14,
  },
  emailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  emailInput: {
    width: '100%',
    backgroundColor: '#0D0F17',
    borderWidth: 1,
    borderColor: '#262A3C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#ffffff',
  },
  verifyLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary,
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  footerNote: {
    fontSize: 11,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
});

