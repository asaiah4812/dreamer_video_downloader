/* eslint-disable react-hooks/immutability */
import { type ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SPRING_SNAPPY } from '@/animations/springs';
import { lightImpact } from '@/utils/haptics';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: ReactNode;
  className?: string;
};

export function AnimatedPressable({ children, className, onPress, ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      {...rest}
      className={className}
      // Pressable `style` can be a callback; Reanimated typing is strict here.
      style={[rest.style as any, animatedStyle as any]}
      onPressIn={() => {
        scale.value = withSpring(0.96, SPRING_SNAPPY);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_SNAPPY);
      }}
      onPress={(e) => {
        void lightImpact();
        onPress?.(e);
      }}>
      {children}
    </AnimatedPressableBase>
  );
}
