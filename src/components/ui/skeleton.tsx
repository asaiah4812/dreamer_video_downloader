import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { className?: string; height?: number };

export function Skeleton({ className = '', height = 16 }: Props) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 900 }), -1, true);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <View
        className={`rounded-xl bg-white/10 ${className}`}
        style={{ height }}
      />
    </Animated.View>
  );
}

export function MetadataSkeleton() {
  return (
    <View className="gap-3">
      <Skeleton height={180} className="w-full rounded-3xl" />
      <Skeleton height={22} className="w-4/5" />
      <Skeleton height={16} className="w-1/2" />
      <View className="mt-2 flex-row gap-2">
        <Skeleton height={36} className="flex-1" />
        <Skeleton height={36} className="flex-1" />
        <Skeleton height={36} className="flex-1" />
      </View>
    </View>
  );
}
