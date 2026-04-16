/**
 * Digital Coffee - API Service
 * Handles all backend API communication
 */

import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Track, Session, User, ApiResponse} from '../types';

// Use localhost for iOS Simulator, 10.0.2.2 for Android Emulator
const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'  // Development
  : 'https://digitalcoffee.cafe/api';  // Production

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests and refresh if needed
    this.client.interceptors.request.use(async config => {
      // Try to get a fresh token from Firebase
      const {firebaseService} = await import('./firebase');
      const freshToken = await firebaseService.getIdToken();

      if (freshToken) {
        config.headers.Authorization = `Bearer ${freshToken}`;
      } else {
        // Fallback to stored token
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Add response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If we get a 401 and haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Try to refresh the token
          const {firebaseService} = await import('./firebase');
          const freshToken = await firebaseService.getIdToken();

          if (freshToken) {
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return this.client(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<ApiResponse<{userId: string}>> {
    try {
      console.log('API: Calling /users/register with:', {email, name});
      const response = await this.client.post('/users/register', {
        email,
        password,
        name,
      });
      console.log('API: Registration response:', response.data);
      return {data: response.data};
    } catch (error: any) {
      console.error('API: Registration error:', error.response?.data || error.message);
      return {error: error.response?.data?.error || 'Registration failed'};
    }
  }

  async socialAuthSync(
    email: string,
    name: string,
    provider: string = 'google',
  ): Promise<ApiResponse<{userId: string}>> {
    try {
      const response = await this.client.post('/users/social-auth', {
        email,
        name,
        provider,
      });
      return {data: response.data};
    } catch (error: any) {
      return {error: error.response?.data?.error || 'Social auth sync failed'};
    }
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get('/users/profile');
      return {data: response.data};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to fetch profile',
      };
    }
  }

  // Track endpoints
  async getTracks(): Promise<
    ApiResponse<{alpha: Track[]; beta: Track[]}>
  > {
    try {
      const response = await this.client.get('/audio/tracks');
      return {data: response.data};
    } catch (error: any) {
      return {error: error.response?.data?.error || 'Failed to fetch tracks'};
    }
  }

  // Session endpoints
  async startSession(
    trackId: string,
    waveType: 'alpha' | 'beta',
  ): Promise<ApiResponse<{sessionId: string}>> {
    try {
      const response = await this.client.post('/sessions/start', {
        trackId,
        waveType,
      });
      return {data: response.data};
    } catch (error: any) {
      return {error: error.response?.data?.error || 'Failed to start session'};
    }
  }

  async endSession(
    sessionId: string,
    duration: number,
    completed: boolean,
  ): Promise<ApiResponse<{message: string}>> {
    try {
      const response = await this.client.post(`/sessions/${sessionId}/end`, {
        duration,
        completed,
      });
      return {data: response.data};
    } catch (error: any) {
      return {error: error.response?.data?.error || 'Failed to end session'};
    }
  }

  async getSessions(): Promise<ApiResponse<{sessions: Session[]}>> {
    try {
      const response = await this.client.get('/sessions');
      return {data: response.data};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to fetch sessions',
      };
    }
  }

  // Streak endpoints
  async getCurrentStreak(): Promise<
    ApiResponse<{
      currentStreak: number;
      longestStreak: number;
      lastSessionDate: any;
    }>
  > {
    try {
      const response = await this.client.get('/streaks/current');
      return {data: response.data};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to fetch streak',
      };
    }
  }

  async getStreakHistory(
    startDate?: string,
    endDate?: string,
  ): Promise<
    ApiResponse<{
      history: Array<{
        date: string;
        sessionCount: number;
        totalMinutes: number;
        waveTypes: string[];
      }>;
    }>
  > {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await this.client.get('/streaks/history', {params});
      return {data: response.data};
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to fetch streak history',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{status: string}>> {
    try {
      const response = await this.client.get('/health');
      return {data: response.data};
    } catch (error: any) {
      return {error: 'API health check failed'};
    }
  }
}

export const apiService = new ApiService();
