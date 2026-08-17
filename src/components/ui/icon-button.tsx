/* eslint-disable react-hooks/immutability */
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '@/constants/colors';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface IconButtonProps {
  onPress: () => void;
  icon: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({ 
  onPress, 
  icon, 
  label, 
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
}: IconButtonProps) {
  const scale = useSharedValue(1);
  
  const sizes = {
    sm: { padding: 8, iconSize: 16, textSize: 12 },
    md: { padding: 12, iconSize: 20, textSize: 14 },
    lg: { padding: 16, iconSize: 24, textSize: 16 },
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          background: (
            <LinearGradient
              colors={Palette.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-xl"
            />
          ),
          textColor: Palette.text,
        };
      case 'secondary':
        return {
          background: null,
          textColor: Palette.neon,
          borderColor: `${Palette.neon}40`,
        };
      default:
        return {
          background: null,
          textColor: Palette.textSecondary,
          borderColor: Palette.whiteTransparent,
        };
    }
  };
  
  const buttonStyle = getButtonStyle();
  
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${
        variant === 'secondary' || variant === 'outline' ? 'border' : ''
      }`}
      style={[
        animatedStyle,
        { padding: sizes[size].padding },
        variant === 'secondary' && { borderColor: buttonStyle.borderColor },
        variant === 'outline' && { borderColor: buttonStyle.borderColor },
      ]}>
      {buttonStyle.background}
      {loading ? (
        <ActivityIndicator color={buttonStyle.textColor} size="small" />
      ) : (
        <Text style={{ fontSize: sizes[size].iconSize, color: buttonStyle.textColor }}>
          {icon}
        </Text>
      )}
      {label && (
        <Text 
          style={{ 
            color: buttonStyle.textColor, 
            fontSize: sizes[size].textSize,
            fontWeight: '600',
          }}>
          {label}
        </Text>
      )}
    </AnimatedTouchable>
  );
}