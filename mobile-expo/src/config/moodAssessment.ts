/**
 * Mood Assessment Configuration
 * Determines which audio modes to recommend based on user's current state and goals
 */

import { WaveType } from './modes';

export interface AssessmentQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: 'single' | 'multiple';
  options: AssessmentOption[];
}

export interface AssessmentOption {
  id: string;
  label: string;
  description?: string;
  icon: string;
  modesMapping: WaveType[];
  weight: number;
}

export interface AssessmentResult {
  recommendedModes: WaveType[];
  primaryGoal: string;
  userState: string;
}

/**
 * Mood Assessment Questions
 * These questions help us understand the user's current state and goals
 */
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'current-feeling',
    question: 'How are you feeling right now?',
    subtitle: 'Choose what best describes your current state',
    type: 'single',
    options: [
      {
        id: 'stressed',
        label: 'Stressed & Anxious',
        description: 'Feeling overwhelmed or tense',
        icon: '😰',
        modesMapping: ['alpha', 'theta'],
        weight: 1.5
      },
      {
        id: 'tired',
        label: 'Tired & Fatigued',
        description: 'Low energy, need rest',
        icon: '😴',
        modesMapping: ['delta', 'alpha'],
        weight: 1.5
      },
      {
        id: 'distracted',
        label: 'Distracted & Unfocused',
        description: 'Hard to concentrate',
        icon: '😵',
        modesMapping: ['beta', 'alpha'],
        weight: 1.5
      },
      {
        id: 'energized',
        label: 'Energized & Alert',
        description: 'Feeling good and ready',
        icon: '😊',
        modesMapping: ['beta', 'gamma'],
        weight: 1.2
      },
      {
        id: 'calm',
        label: 'Calm & Relaxed',
        description: 'Peaceful state of mind',
        icon: '😌',
        modesMapping: ['alpha', 'theta'],
        weight: 1.0
      }
    ]
  },

  {
    id: 'primary-goal',
    question: 'What do you want to achieve?',
    subtitle: 'Select your main goal for this session',
    type: 'single',
    options: [
      {
        id: 'focus-work',
        label: 'Focus on Work',
        description: 'Deep concentration for tasks',
        icon: '💼',
        modesMapping: ['beta', 'gamma'],
        weight: 2.0
      },
      {
        id: 'creative',
        label: 'Be Creative',
        description: 'Unlock creative thinking',
        icon: '🎨',
        modesMapping: ['theta', 'alpha'],
        weight: 2.0
      },
      {
        id: 'relax',
        label: 'Relax & Unwind',
        description: 'Reduce stress and tension',
        icon: '🧘',
        modesMapping: ['alpha', 'theta'],
        weight: 2.0
      },
      {
        id: 'sleep',
        label: 'Prepare for Sleep',
        description: 'Deep restful sleep',
        icon: '🌙',
        modesMapping: ['delta', 'theta'],
        weight: 2.0
      },
      {
        id: 'learn',
        label: 'Study & Learn',
        description: 'Enhance learning ability',
        icon: '📚',
        modesMapping: ['alpha', 'beta'],
        weight: 2.0
      },
      {
        id: 'meditate',
        label: 'Meditate Deeply',
        description: 'Deep meditation practice',
        icon: '🕉️',
        modesMapping: ['theta', 'delta'],
        weight: 2.0
      }
    ]
  },

  {
    id: 'time-available',
    question: 'How much time do you have?',
    subtitle: 'This helps us create your personalized queue',
    type: 'single',
    options: [
      {
        id: 'short',
        label: '5-10 minutes',
        description: 'Quick session',
        icon: '⏱️',
        modesMapping: [],
        weight: 0.5
      },
      {
        id: 'medium',
        label: '15-30 minutes',
        description: 'Standard session',
        icon: '⏰',
        modesMapping: [],
        weight: 1.0
      },
      {
        id: 'long',
        label: '45-60 minutes',
        description: 'Extended session',
        icon: '⏳',
        modesMapping: [],
        weight: 1.5
      },
      {
        id: 'flexible',
        label: 'I have time',
        description: 'No rush',
        icon: '🕰️',
        modesMapping: [],
        weight: 2.0
      }
    ]
  },

  {
    id: 'experience-level',
    question: 'Experience with brainwave audio?',
    subtitle: 'Help us tailor your experience',
    type: 'single',
    options: [
      {
        id: 'beginner',
        label: 'First Time',
        description: 'New to this',
        icon: '🌱',
        modesMapping: ['alpha', 'beta'],
        weight: 1.0
      },
      {
        id: 'some',
        label: 'Tried Before',
        description: 'Some experience',
        icon: '🌿',
        modesMapping: [],
        weight: 1.2
      },
      {
        id: 'experienced',
        label: 'Regular User',
        description: 'Familiar with practices',
        icon: '🌳',
        modesMapping: ['theta', 'delta', 'gamma'],
        weight: 1.5
      }
    ]
  }
];

/**
 * Calculate recommended modes based on assessment answers
 */
export const calculateRecommendedModes = (
  answers: Record<string, string>
): AssessmentResult => {
  const modeScores: Record<WaveType, number> = {
    delta: 0,
    theta: 0,
    alpha: 0,
    beta: 0,
    gamma: 0
  };

  // Calculate scores based on answers
  ASSESSMENT_QUESTIONS.forEach(question => {
    const answerId = answers[question.id];
    if (!answerId) return;

    const selectedOption = question.options.find(opt => opt.id === answerId);
    if (!selectedOption) return;

    selectedOption.modesMapping.forEach(waveType => {
      modeScores[waveType] += selectedOption.weight;
    });
  });

  // Sort modes by score
  const sortedModes = (Object.entries(modeScores) as [WaveType, number][])
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([waveType]) => waveType);

  // Get top 3-4 modes with non-zero scores
  const recommendedModes = sortedModes
    .filter(waveType => modeScores[waveType] > 0)
    .slice(0, 4);

  // If no modes recommended, default to beginner-friendly modes
  if (recommendedModes.length === 0) {
    return {
      recommendedModes: ['alpha', 'beta'],
      primaryGoal: 'General wellness',
      userState: 'Getting started'
    };
  }

  // Get primary goal from answers
  const primaryGoalAnswer = ASSESSMENT_QUESTIONS
    .find(q => q.id === 'primary-goal')
    ?.options.find(opt => opt.id === answers['primary-goal']);

  const currentFeelingAnswer = ASSESSMENT_QUESTIONS
    .find(q => q.id === 'current-feeling')
    ?.options.find(opt => opt.id === answers['current-feeling']);

  return {
    recommendedModes,
    primaryGoal: primaryGoalAnswer?.label || 'Wellness',
    userState: currentFeelingAnswer?.label || 'Ready to begin'
  };
};

/**
 * Check if user needs reassessment
 * Returns true if user has completed their recommended queue
 */
export const needsReassessment = (
  completedModes: WaveType[],
  recommendedModes: WaveType[]
): boolean => {
  // Check if user has listened to all recommended modes at least once
  const allModesCompleted = recommendedModes.every(mode =>
    completedModes.includes(mode)
  );

  return allModesCompleted;
};
