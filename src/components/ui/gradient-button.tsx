import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Text, View } from 'react-native';

import { Gradients } from '@/constants/colors';
import { AnimatedPressable } from '@/components/ui/animated-pressable';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function GradientButton({
  label,
  onPress,
  loading,
  disabled,
  className = '',
}: Props) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`overflow-hidden rounded-2xl ${className} ${disabled ? 'opacity-50' : ''}`}>
      <LinearGradient
        colors={[...Gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center justify-center px-6 py-4">
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-bold text-white">{label}</Text>
        )}
      </LinearGradient>
      <View className="absolute inset-0 rounded-2xl bg-white/10 opacity-0" />
    </AnimatedPressable>
  );
}
