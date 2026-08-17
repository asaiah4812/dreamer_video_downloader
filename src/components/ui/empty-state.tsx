import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Palette } from '@/constants/colors';

type Props = {
  symbol?: string;
  iconName?: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
  iconFamily?: 'Ionicons' | 'Feather';
  title: string;
  message?: string;
};

export function EmptyState({ symbol, iconName, iconFamily = 'Ionicons', title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        {iconName ? (
          iconFamily === 'Feather' ? (
            <Feather name={iconName as any} size={28} color={Palette.neon} />
          ) : (
            <Ionicons name={iconName as any} size={28} color={Palette.neon} />
          )
        ) : (
          <Text style={styles.symbol}>{symbol ?? '✨'}</Text>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  symbol: {
    fontSize: 26,
    fontWeight: '900',
    color: Palette.neon,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
});

