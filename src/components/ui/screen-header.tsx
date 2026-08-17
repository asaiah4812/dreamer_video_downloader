import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Palette } from '@/constants/colors';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function ScreenHeader({ eyebrow, title, subtitle, trailing }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        {eyebrow ? (
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {trailing}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Palette.neon,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.textSecondary,
  },
});
