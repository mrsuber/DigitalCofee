import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

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

    this.client.interceptors.request.use(async (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getAllUsers() {
    try {
      const response = await this.client.get('/users');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch users' };
    }
  }

  async getAudioTracks() {
    try {
      const response = await this.client.get('/audio/tracks');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch tracks' };
    }
  }

  async getAdminStats() {
    try {
      const response = await this.client.get('/admin/stats');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch stats' };
    }
  }

  async uploadAudio(file: File, name: string, waveType: string, duration: number) {
    try {
      const formData = new FormData();
      formData.append('audioFile', file);
      formData.append('name', name);
      formData.append('waveType', waveType);
      formData.append('duration', duration.toString());

      const response = await this.client.post('/admin/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to upload audio' };
    }
  }

  async deleteAudioTrack(trackId: string) {
    try {
      const response = await this.client.delete(`/admin/audio/${trackId}`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to delete track' };
    }
  }
}

export const apiService = new ApiService();
