import Svg, { Circle } from 'react-native-svg';
import { View, Text } from 'react-native';

import { Palette } from '@/constants/colors';

type Props = {
  progress: number;
  size?: number;
  stroke?: number;
};

export function ProgressRing({ progress, size = 52, stroke = 5 }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Palette.neon}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="absolute text-xs font-semibold text-white">
        {Math.round(progress)}%
      </Text>
    </View>
  );
}
