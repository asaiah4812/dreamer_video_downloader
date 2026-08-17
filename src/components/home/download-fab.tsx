import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { Palette } from '@/constants/colors';
import { lightImpact } from '@/utils/haptics';

type Props = {
  busy: boolean;
  onPress: () => void;
  label?: string;
};

export function DownloadFab({ busy, onPress, label }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (busy) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [busy, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayLabel = label && label !== 'Tap Download' ? label : 'Download';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={displayLabel}
        disabled={busy}
        onPress={() => {
          void lightImpact();
          onPress();
        }}
        style={({ pressed }) => [styles.button, pressed && !busy && styles.pressed]}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}>
          {busy ? (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="download-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.labelText} numberOfLines={1}>
            {displayLabel}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  labelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});




