/**
 * Digital Coffee - Mind Control Center Design System
 * Inner-space control panel aesthetic with glassmorphism
 */

export const mindControlTheme = {
  colors: {
    // Primary backgrounds - Deep space control center
    background: {
      deep: '#0f172a',        // Deep blue-black
      space: '#1e1b4b',       // Dark indigo
      nebula: '#312e81',      // Dark purple
      cosmos: '#1e293b',      // Slate dark
    },

    // Glassmorphism surfaces
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
      heavy: 'rgba(255, 255, 255, 0.2)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },

    // Mind state colors
    mindStates: {
      // Brainwave frequencies
      delta: {
        primary: '#4c1d95',    // Deep purple (Deep Sleep)
        glow: '#7c3aed',
        gradient: ['#4c1d95', '#5b21b6', '#6d28d9'],
      },
      theta: {
        primary: '#6366f1',    // Indigo (Creative Flow)
        glow: '#818cf8',
        gradient: ['#4f46e5', '#6366f1', '#818cf8'],
      },
      alpha: {
        primary: '#0d9488',    // Teal (Calm Focus)
        glow: '#14b8a6',
        gradient: ['#0f766e', '#0d9488', '#14b8a6'],
      },
      beta: {
        primary: '#2563eb',    // Blue (Peak Focus)
        glow: '#3b82f6',
        gradient: ['#1d4ed8', '#2563eb', '#3b82f6'],
      },
      gamma: {
        primary: '#dc2626',    // Red (High Performance)
        glow: '#ef4444',
        gradient: ['#b91c1c', '#dc2626', '#ef4444'],
      },
    },

    // Accent colors
    accent: {
      gold: '#f59e0b',        // Warm gold for active states
      pink: '#ec4899',        // Soft pink for inspiration
      cyan: '#06b6d4',        // Cyan for clarity
      purple: '#a855f7',      // Purple for deep work
    },

    // Text colors
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      muted: 'rgba(255, 255, 255, 0.3)',
    },

    // Mood colors
    mood: {
      clear: '#10b981',       // Green
      foggy: '#94a3b8',       // Gray
      anxious: '#f59e0b',     // Orange
      inspired: '#a855f7',    // Purple
      tired: '#6366f1',       // Indigo
    },

    // Status
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // Glassmorphism effects
  glass: {
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
      borderWidth: 1,
      backdropFilter: 'blur(10px)',
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1.5,
      backdropFilter: 'blur(20px)',
    },
  },

  // Shadows for depth
  shadows: {
    glow: {
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    inner: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
  },

  // Typography
  typography: {
    fonts: {
      primary: 'SF Pro Display',    // iOS default
      secondary: 'Inter',
      script: 'Dancing Script',     // For inspirational quotes
    },
    sizes: {
      hero: 48,
      display: 36,
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      body: 16,
      bodySmall: 14,
      caption: 12,
      tiny: 10,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      heavy: '800',
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },

  // Animations
  animations: {
    durations: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
      verySlow: 1000,
    },
    easing: {
      default: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Gradient presets
export const gradients = {
  // Background gradients
  deepSpace: ['#0f172a', '#1e1b4b', '#312e81'],
  nebula: ['#1e1b4b', '#312e81', '#4c1d95'],
  cosmos: ['#1e293b', '#334155', '#475569'],

  // Mind state gradients
  focus: ['#2563eb', '#3b82f6', '#60a5fa'],
  calm: ['#0d9488', '#14b8a6', '#2dd4bf'],
  creative: ['#6366f1', '#818cf8', '#a5b4fc'],
  sleep: ['#4c1d95', '#5b21b6', '#7c3aed'],
  energy: ['#dc2626', '#ef4444', '#f87171'],

  // Accent gradients
  gold: ['#f59e0b', '#fbbf24', '#fcd34d'],
  purple: ['#7c3aed', '#a855f7', '#c084fc'],
  pink: ['#ec4899', '#f472b6', '#f9a8d4'],
};

// Glassmorphism helper
export const createGlass = (opacity: number = 0.1, blur: number = 10) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  borderColor: `rgba(255, 255, 255, ${opacity + 0.08})`,
  borderWidth: 1,
  // Note: backdropFilter not available in React Native,
  // will need to use BlurView from expo-blur
});

// Glow helper
export const createGlow = (color: string, intensity: number = 0.5) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: intensity,
  shadowRadius: 20,
  elevation: 10,
});

export default mindControlTheme;
