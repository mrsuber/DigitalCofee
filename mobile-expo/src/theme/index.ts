/**
 * Digital Coffee - Theme Index
 * Main theme export combining all design tokens
 */

import {colors} from './colors';
import {spacing} from './spacing';
import {typography} from './typography';
import {shadows} from './shadows';
import {borderRadius} from './borderRadius';

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
    wave: 1000,
  },
};

export type Theme = typeof theme;

// Re-export individual theme modules
export {colors} from './colors';
export {spacing} from './spacing';
export {typography} from './typography';
export {shadows} from './shadows';
export {borderRadius} from './borderRadius';
