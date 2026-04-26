export const Colors = {
  // Backgrounds
  bg0: '#0A0C0F',
  bg1: '#10141A',
  bg2: '#161C24',
  bg3: '#1E2733',
  bg4: '#253040',

  // Accent - electric teal
  accent: '#00E5CC',
  accentDim: '#00B8A3',
  accentGlow: 'rgba(0, 229, 204, 0.15)',

  // Semantic
  profit: '#00D97E',
  profitDim: 'rgba(0, 217, 126, 0.15)',
  loss: '#FF4B6E',
  lossDim: 'rgba(255, 75, 110, 0.15)',
  warning: '#FFB800',
  warningDim: 'rgba(255, 184, 0, 0.15)',

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: '#8899AA',
  textMuted: '#4A5A6A',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderActive: 'rgba(0, 229, 204, 0.3)',

  // Buy/Sell
  buy: '#00D97E',
  sell: '#FF4B6E',
};

export const Typography = {
  // Font families (loaded via expo-font or system)
  display: 'System',
  body: 'System',

  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadows = {
  accent: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};
