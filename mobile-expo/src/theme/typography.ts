/**
 * Digital Coffee - Typography System
 */

export const typography = {
  // Font families
  fonts: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    extraBold: 'Inter-ExtraBold',
    mono: 'JetBrainsMono-Regular',
  },

  // Font sizes
  fontSize: {
    display: 32,
    h1: 28,
    h2: 24,
    h3: 20,
    bodyLarge: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },

  // Line heights
  lineHeight: {
    display: 40,
    h1: 36,
    h2: 32,
    h3: 28,
    bodyLarge: 28,
    body: 24,
    bodySmall: 20,
    caption: 16,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

export type Typography = typeof typography;
