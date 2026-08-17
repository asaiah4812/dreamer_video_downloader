import { ReduceMotion } from 'react-native-reanimated';

export const SPRING_SNAPPY = {
  damping: 18,
  stiffness: 220,
  mass: 0.8,
  reduceMotion: ReduceMotion.System,
} as const;

export const SPRING_SMOOTH = {
  damping: 22,
  stiffness: 160,
  mass: 1,
  reduceMotion: ReduceMotion.System,
} as const;

export const SPRING_BOUNCY = {
  damping: 12,
  stiffness: 180,
  mass: 0.9,
  reduceMotion: ReduceMotion.System,
} as const;
