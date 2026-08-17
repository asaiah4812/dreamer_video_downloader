import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Palette } from '@/constants/colors';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: ViewStyle;
  noPadding?: boolean;
};

export function GlassCard({ children, className = '', delay = 0, style, noPadding }: Props) {
  const inner = (
    <View
      className={`overflow-hidden rounded-2xl border border-[#262A3C] ${className}`}
      style={[styles.container, style]}>
      <View
        className={noPadding ? '' : 'p-4'}
        style={{ backgroundColor: Palette.card }}>
        {children}
      </View>
    </View>
  );

  if (delay > 0) {
    return (
      <Animated.View entering={FadeInDown.delay(delay).springify()}>{inner}</Animated.View>
    );
  }
  return inner;
}

/** @deprecated Use GlassCard */
export function NeumorphicCard({
  children,
  gradient,
  noPadding,
  className,
  style,
}: {
  children: ReactNode;
  gradient?: boolean;
  noPadding?: boolean;
  className?: string;
  style?: ViewStyle;
}) {
  return (
    <GlassCard className={className} style={style} noPadding={noPadding}>
      {children}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1D2B',
    borderColor: '#262A3C',
    borderWidth: 1,
    elevation: 3,
  },
});


