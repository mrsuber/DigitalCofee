/**
 * Mode Configuration
 * Maps technical wave types to user-friendly mode names and descriptions
 */

export type WaveType = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export interface Mode {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  waveType: WaveType;
  frequency: string;
  icon: string;
  benefits: string[];
  bestFor: string[];
  gradient: {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  color: string;
}

export const MODES: Record<WaveType, Mode> = {
  delta: {
    id: 'deep-sleep',
    name: 'Deep Sleep',
    subtitle: 'Restorative Rest',
    description: 'Enter the deepest level of sleep for complete physical and mental restoration',
    waveType: 'delta',
    frequency: '0.5-4 Hz',
    icon: '😴',
    benefits: [
      'Deep, restorative sleep',
      'Physical healing and recovery',
      'Immune system boost',
      'Complete relaxation'
    ],
    bestFor: [
      'Bedtime routine',
      'Recovery from illness',
      'Deep relaxation',
      'Physical restoration'
    ],
    gradient: {
      colors: ['#1e3a8a', '#312e81'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    color: '#1e3a8a'
  },

  theta: {
    id: 'creative-flow',
    name: 'Creative Flow',
    subtitle: 'Deep Meditation',
    description: 'Unlock your creative potential and access deep meditative states',
    waveType: 'theta',
    frequency: '4-8 Hz',
    icon: '🎨',
    benefits: [
      'Enhanced creativity',
      'Deep meditation',
      'Improved intuition',
      'Emotional healing'
    ],
    bestFor: [
      'Creative work',
      'Meditation practice',
      'Problem solving',
      'Artistic pursuits'
    ],
    gradient: {
      colors: ['#7c3aed', '#6366f1'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    color: '#7c3aed'
  },

  alpha: {
    id: 'calm-focus',
    name: 'Calm Focus',
    subtitle: 'Relaxed Awareness',
    description: 'Achieve a state of relaxed focus perfect for learning and stress relief',
    waveType: 'alpha',
    frequency: '8-12 Hz',
    icon: '🧘',
    benefits: [
      'Reduced stress and anxiety',
      'Enhanced learning',
      'Improved mood',
      'Mental clarity'
    ],
    bestFor: [
      'Studying',
      'Reading',
      'Stress relief',
      'Light meditation'
    ],
    gradient: {
      colors: ['#8b5cf6', '#a78bfa'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    color: '#8b5cf6'
  },

  beta: {
    id: 'peak-focus',
    name: 'Peak Focus',
    subtitle: 'Active Concentration',
    description: 'Maximize your concentration and productivity for demanding tasks',
    waveType: 'beta',
    frequency: '12-30 Hz',
    icon: '🎯',
    benefits: [
      'Heightened alertness',
      'Improved concentration',
      'Enhanced problem-solving',
      'Peak performance'
    ],
    bestFor: [
      'Work tasks',
      'Complex problem solving',
      'Active learning',
      'Important meetings'
    ],
    gradient: {
      colors: ['#3b82f6', '#60a5fa'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    color: '#3b82f6'
  },

  gamma: {
    id: 'high-performance',
    name: 'High Performance',
    subtitle: 'Peak Mental State',
    description: 'Achieve the highest level of cognitive function and information processing',
    waveType: 'gamma',
    frequency: '30-100 Hz',
    icon: '⚡',
    benefits: [
      'Maximum cognitive performance',
      'Enhanced memory',
      'Peak information processing',
      'Heightened perception'
    ],
    bestFor: [
      'Complex tasks',
      'Learning new skills',
      'High-stakes situations',
      'Peak performance needs'
    ],
    gradient: {
      colors: ['#f59e0b', '#f97316'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 }
    },
    color: '#f59e0b'
  }
};

/**
 * Get mode configuration by wave type
 */
export const getModeByWaveType = (waveType: WaveType): Mode => {
  return MODES[waveType];
};

/**
 * Get all available modes
 */
export const getAllModes = (): Mode[] => {
  return Object.values(MODES);
};

/**
 * Get mode by ID
 */
export const getModeById = (id: string): Mode | undefined => {
  return Object.values(MODES).find(mode => mode.id === id);
};
