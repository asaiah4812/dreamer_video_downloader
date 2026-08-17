/** DreamerDrop Solid Dark Design Tokens */
export const Palette = {
  primary: '#8B5CF6',          // Solid Violet
  primaryDark: '#6D28D9',
  primaryContainer: '#7C3AED',
  onPrimary: '#FFFFFF',

  secondary: '#38BDF8',        // Cyan Accent
  secondaryContainer: '#0284C7',
  onSecondary: '#FFFFFF',

  tertiary: '#F472B6',
  onTertiary: '#FFFFFF',

  background: '#0D0F17',       // Deep Dark Background
  surface: '#141724',          // Solid Surface
  surfaceDim: '#141724',
  surfaceContainerLow: '#141724',
  surfaceContainer: '#1A1D2B',
  surfaceContainerHigh: '#222738',
  surfaceContainerHighest: '#2A3044',
  surfaceElevated: '#1A1D2B',
  card: '#1A1D2B',
  cardBorder: '#262A3C',
  inputBg: '#181C2B',
  glass: '#1A1D2B',
  glassBorder: '#262A3C',

  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  neon: '#38BDF8',
  neonPink: '#F472B6',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorContainer: '#7F1D1D',

  gold: '#F59E0B',
  goldGradient: ['#F59E0B', '#EF4444'] as const,

  whiteTransparent: 'rgba(255, 255, 255, 0.05)',
  whiteTransparentLight: 'rgba(255, 255, 255, 0.03)',
  blackTransparent: 'rgba(0, 0, 0, 0.65)',

  gradients: {
    primary: ['#8B5CF6', '#6366F1'] as const,       // Main Violet to Indigo gradient
    glowButton: ['#8B5CF6', '#38BDF8'] as const,
    auroraViolet: ['#A855F7', '#38BDF8'] as const,
    fab: ['#8B5CF6', '#6366F1'] as const,
    surface: ['#1A1D2B', '#141724'] as const,
    crown: ['#F59E0B', '#F97316'] as const,
    glow: ['rgba(139, 92, 246, 0.3)', 'rgba(56, 189, 248, 0.2)'] as const,
    card: ['#1A1D2B', '#141724'] as const,
  },
};

export const Gradients = {
  primary: Palette.gradients.primary,
  glowButton: Palette.gradients.glowButton,
  accent: Palette.gradients.auroraViolet,
  fab: Palette.gradients.fab,
  crown: Palette.gradients.crown,
} as const;




