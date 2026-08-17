import * as Clipboard from 'expo-clipboard';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Palette } from '@/constants/colors';
import { detectPlatform } from '@/utils/url';
import { SUPPORTED_PLATFORMS } from '@/constants/platforms';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function HomePasteField({ value, onChange }: Props) {
  const platform = value ? detectPlatform(value) : null;
  const platformInfo = SUPPORTED_PLATFORMS.find((p) => p.id === platform);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) onChange(text.trim());
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Ionicons name="link-outline" size={18} color="#64748B" style={styles.linkIcon} />
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Paste URL here..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          {value ? (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={() => void handlePaste()} activeOpacity={0.8} style={styles.pasteBtn}>
            <Ionicons name="clipboard-outline" size={14} color="#8B5CF6" />
            <Text style={styles.pasteText}>Paste</Text>
          </TouchableOpacity>
        </View>

        {platformInfo ? (
          <View style={styles.chipRow}>
            <View style={[styles.chip, { borderColor: `${platformInfo.color}40`, backgroundColor: `${platformInfo.color}15` }]}>
              <Ionicons name={(platformInfo.iconName as any) || 'link'} size={12} color={platformInfo.color} />
              <Text style={[styles.chipText, { color: platformInfo.color }]}>{platformInfo.name}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C2B',
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#262A3C',
  },
  linkIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
    color: '#FFFFFF',
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  pasteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});




