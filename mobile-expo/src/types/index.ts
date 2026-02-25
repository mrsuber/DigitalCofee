/**
 * Digital Coffee - Type Definitions
 */

export type WaveType = 'alpha' | 'beta';

export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
  stats: UserStats;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  alphaSessions: number;
  betaSessions: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Track {
  id: string;
  name: string;
  duration: number;
  waveType: WaveType;
  file: string;
}

export interface Session {
  id: string;
  userId: string;
  trackId: string;
  waveType: WaveType;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  name: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
