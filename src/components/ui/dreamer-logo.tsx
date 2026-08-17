/**
 * DreamerDrop brand logo.
 * A circular gradient badge with a stylised downward-arrow / drop shape
 * built from SVG primitives — no font or image dependency.
 *
 * Usage:
 *   <DreamerLogo size={96} />          plain mark
 *   <DreamerLogo size={72} withText />  mark + wordmark below
 */
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { Palette } from '@/constants/colors';

type Props = {
  size?: number;
  withText?: boolean;
  textColor?: string;
};

export function DreamerLogo({ size = 80, withText = false, textColor = '#fff' }: Props) {
  const r = size / 2;
  const inner = size * 0.62;
  const ir = inner / 2;

  // Arrow shaft + head geometry, centred inside the circle
  const cx = r;
  const cy = r;
  const shaftW = size * 0.13;
  const shaftTop = cy - r * 0.32;
  const shaftBot = cy + r * 0.1;
  const headW = size * 0.32;
  const tipY = cy + r * 0.38;

  const arrowPath = [
    `M ${cx - shaftW / 2} ${shaftTop}`,
    `L ${cx + shaftW / 2} ${shaftTop}`,
    `L ${cx + shaftW / 2} ${shaftBot}`,
    `L ${cx + headW / 2} ${shaftBot}`,
    `L ${cx} ${tipY}`,
    `L ${cx - headW / 2} ${shaftBot}`,
    `L ${cx - shaftW / 2} ${shaftBot}`,
    'Z',
  ].join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Outer glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: size + 18,
            height: size + 18,
            borderRadius: (size + 18) / 2,
          },
        ]}
      />

      {/* Solid circle background */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: r,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Palette.purple,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.14)',
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: size * 0.12 },
          shadowOpacity: 0.45,
          shadowRadius: size * 0.22,
          elevation: 12,
        }}>
        {/* Dark inner circle for depth */}
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: ir,
            backgroundColor: 'rgba(3, 3, 8, 0.28)',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Defs>
              <RadialGradient id="dropGrad" cx="50%" cy="30%" r="70%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.7" />
              </RadialGradient>
            </Defs>
            {/* Arrow / drop */}
            <Path d={arrowPath} fill="url(#dropGrad)" />
            {/* Two tiny horizontal lines above the arrow = "link" metaphor */}
            <Path
              d={`M ${cx - size * 0.16} ${shaftTop - size * 0.11} L ${cx + size * 0.16} ${shaftTop - size * 0.11}`}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={size * 0.045}
              strokeLinecap="round"
            />
            <Path
              d={`M ${cx - size * 0.1} ${shaftTop - size * 0.22} L ${cx + size * 0.1} ${shaftTop - size * 0.22}`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={size * 0.035}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </View>

      {withText ? (
        <View style={{ marginTop: 14, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: size * 0.38,
              fontWeight: '800',
              letterSpacing: -0.5,
              color: textColor,
            }}>
            Dreamer
            <Text style={{ color: Palette.neon }}>Drop</Text>
          </Text>
          <Text
            style={{
              fontSize: size * 0.15,
              fontWeight: '500',
              letterSpacing: 3,
              color: Palette.textMuted,
              textTransform: 'uppercase',
              marginTop: 3,
            }}>
            Downloader
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.35)',
  },
});
