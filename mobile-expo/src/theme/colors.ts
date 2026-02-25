/**
 * Digital Coffee - Color System
 * Based on the design system documentation
 */

export const colors = {
  // Coffee Brand Colors
  coffee: {
    espresso: '#2C1810',
    brown: '#6F4E37',
    cappuccino: '#9B6B4E',
    latte: '#C19A6B',
  },

  // Alpha Wave Colors (Creativity)
  alpha: {
    primary: '#6B46C1',
    light: '#9F7AEA',
    glow: '#D6BCFA',
  },

  // Beta Wave Colors (Focus)
  beta: {
    primary: '#2B6CB0',
    light: '#4299E1',
    glow: '#BEE3F8',
  },

  // Neutral Colors
  background: {
    dark: '#0F0E0D',
    primary: '#1A1816',
    surface: '#2D2823',
    elevated: '#3D3732',
  },

  text: {
    primary: '#F7FAFC',
    secondary: '#E2E8F0',
    muted: '#A0AEC0',
    disabled: '#718096',
  },

  border: {
    default: '#3D3732',
    light: '#4A4742',
    dark: '#2D2823',
  },

  // Semantic Colors
  semantic: {
    success: '#38A169',
    warning: '#DD6B20',
    error: '#E53E3E',
    info: '#3182CE',
  },

  // Special overlays
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
};

export type Colors = typeof colors;
