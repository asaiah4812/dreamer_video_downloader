import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DreamerLogo } from '@/components/ui/dreamer-logo';
import { SPRING_BOUNCY } from '@/animations/springs';
import { Palette } from '@/constants/colors';

type Props = { onFinish: () => void };

export function LogoIntro({ onFinish }: Props) {
  const scale = useSharedValue(0.55);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withSpring(1, SPRING_BOUNCY);
    const timer = setTimeout(onFinish, 2600);
    return () => clearTimeout(timer);
  }, [onFinish, opacity, scale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: withDelay(380, withTiming(1, { duration: 520 })),
    transform: [
      { translateY: withDelay(380, withSpring(0, { damping: 18, stiffness: 160 })) },
    ],
  }));

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background }}>
      {/* ambient glow behind logo */}
      <View
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(139,92,246,0.18)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          top: '42%',
          right: '10%',
          backgroundColor: 'rgba(34,211,238,0.08)',
        }}
      />

      <Animated.View style={logoStyle}>
        <Animated.View style={textStyle}>
          <DreamerLogo size={96} withText />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
