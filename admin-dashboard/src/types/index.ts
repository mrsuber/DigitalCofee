export interface User {
  userId: string;
  email: string;
  name: string;
  provider: string;
  createdAt: any;
  stats: {
    totalSessions: number;
    totalMinutes: number;
    alphaSessions: number;
    betaSessions: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  waveType: 'alpha' | 'beta';
  file: string;
  category?: string;
  subcategory?: string;
}

export interface AudioCategory {
  id: string;
  name: string;
  description: string;
  waveType: 'alpha' | 'beta';
  subcategories?: AudioSubcategory[];
}

export interface AudioSubcategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
}

export interface Session {
  id: string;
  userId: string;
  trackId: string;
  waveType: 'alpha' | 'beta';
  startTime: any;
  endTime: any;
  duration: number;
  completed: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalAudioFiles: number;
}
