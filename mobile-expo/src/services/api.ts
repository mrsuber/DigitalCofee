/**
 * Digital Coffee - API Service
 * Handles all backend API communication
 */

import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Track, Session, User, ApiResponse} from '../types';

const API_BASE_URL = 'https://digitalcoffee.cafe/api';

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

    // Add token to requests
    this.client.interceptors.request.use(async config => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
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
