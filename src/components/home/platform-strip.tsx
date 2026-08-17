import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { SUPPORTED_PLATFORMS, type PlatformInfo } from '@/constants/platforms';
import { Palette } from '@/constants/colors';

function PlatformIcon({ platform }: { platform: PlatformInfo }) {
  const size = 14;
  const color = platform.color;
  switch (platform.iconFamily) {
    case 'Feather':
      return <Feather name={platform.iconName as any} size={size} color={color} />;
    case 'FontAwesome6':
      return <FontAwesome6 name={platform.iconName as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={platform.iconName as any} size={size} color={color} />;
    case 'Ionicons':
    default:
      return <Ionicons name={platform.iconName as any} size={size} color={color} />;
  }
}

export function PlatformStrip() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supported Platforms</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {SUPPORTED_PLATFORMS.map((p) => (
          <View key={p.id} style={[styles.chip, { borderColor: `${p.color}35`, backgroundColor: `${p.color}0D` }]}>
            <PlatformIcon platform={p} />
            <Text style={styles.chipText}>{p.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Palette.textMuted,
    marginLeft: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
});

