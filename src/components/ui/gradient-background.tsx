import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/colors';

type Props = {
  children: ReactNode;
};

export function GradientBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Palette.background }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0F17',
  },
  content: {
    flex: 1,
  },
});


