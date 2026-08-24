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

  // Push Notifications
  async sendPushNotification(payload: any) {
    try {
      const response = await this.client.post('/admin/notifications/send', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to send notification' };
    }
  }

  async getNotificationHistory() {
    try {
      const response = await this.client.get('/admin/notifications');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch notification history' };
    }
  }

  // Promo Codes
  async getPromoCodes() {
    try {
      const response = await this.client.get('/admin/promo-codes');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch promo codes' };
    }
  }

  async createPromoCode(payload: any) {
    try {
      const response = await this.client.post('/admin/promo-codes', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to create promo code' };
    }
  }

  async deletePromoCode(codeId: string) {
    try {
      const response = await this.client.delete(`/admin/promo-codes/${codeId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to delete promo code' };
    }
  }

  async togglePromoCodeStatus(codeId: string, active: boolean) {
    try {
      const response = await this.client.patch(`/admin/promo-codes/${codeId}`, { active });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to update promo code' };
    }
  }

  // Content Management
  async getAppContent(type?: string) {
    try {
      const url = type && type !== 'all' ? `/admin/content?type=${type}` : '/admin/content';
      const response = await this.client.get(url);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch content' };
    }
  }

  async createAppContent(payload: any) {
    try {
      const response = await this.client.post('/admin/content', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to create content' };
    }
  }

  async updateAppContent(contentId: string, payload: any) {
    try {
      const response = await this.client.put(`/admin/content/${contentId}`, payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to update content' };
    }
  }

  async deleteAppContent(contentId: string) {
    try {
      const response = await this.client.delete(`/admin/content/${contentId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to delete content' };
    }
  }

  async toggleContentStatus(contentId: string, active: boolean) {
    try {
      const response = await this.client.patch(`/admin/content/${contentId}`, { active });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to update content' };
    }
  }

  // Activity Logs
  async getActivityLogs(params?: any) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined) {
            queryParams.append(key, params[key]);
          }
        });
      }
      const url = `/admin/activity-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.client.get(url);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch activity logs' };
    }
  }

  async exportActivityLogs(params?: any) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined) {
            queryParams.append(key, params[key]);
          }
        });
      }
      const url = `/admin/activity-logs/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.client.get(url, { responseType: 'blob' });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to export activity logs' };
    }
  }

  // Audio Tracks Management
  async getTracks() {
    try {
      const response = await this.client.get('/admin/tracks');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch tracks');
    }
  }

  async createTrack(payload: any) {
    try {
      const response = await this.client.post('/admin/tracks', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create track');
    }
  }

  async updateTrack(trackId: string, payload: any) {
    try {
      const response = await this.client.put(`/admin/tracks/${trackId}`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update track');
    }
  }

  async deleteTrack(trackId: string) {
    try {
      const response = await this.client.delete(`/admin/tracks/${trackId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete track');
    }
  }

  async toggleTrackStatus(trackId: string, active: boolean) {
    try {
      const response = await this.client.patch(`/admin/tracks/${trackId}`, { active });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update track status');
    }
  }

  // App Settings
  async getAppSettings() {
    try {
      const response = await this.client.get('/admin/settings');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch settings');
    }
  }

  async updateAppSettings(settings: any) {
    try {
      const response = await this.client.put('/admin/settings', settings);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update settings');
    }
  }

  // User Sessions
  async getSessions() {
    try {
      const response = await this.client.get('/admin/sessions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
    }
  }

  // Users (for revenue analytics)
  async getUsers() {
    try {
      const response = await this.client.get('/admin/users');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  }

  // Feedback
  async getFeedback() {
    try {
      const response = await this.client.get('/admin/feedback');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch feedback');
    }
  }

  // Notifications
  async getNotifications() {
    try {
      const response = await this.client.get('/admin/notifications');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }

  // Content
  async getContent() {
    try {
      const response = await this.client.get('/admin/content');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch content');
    }
  }


  // Email Campaigns
  async getEmailCampaigns() {
    try {
      const response = await this.client.get('/admin/email-campaigns');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch campaigns');
    }
  }

  async createEmailCampaign(campaignData: any) {
    try {
      const response = await this.client.post('/admin/email-campaigns', campaignData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create campaign');
    }
  }

  async updateEmailCampaign(campaignId: string, data: any) {
    try {
      const response = await this.client.put(`/admin/email-campaigns/${campaignId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update campaign');
    }
  }

  async sendEmailCampaign(campaignId: string) {
    try {
      const response = await this.client.post(`/admin/email-campaigns/${campaignId}/send`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send campaign');
    }
  }

  async deleteEmailCampaign(campaignId: string) {
    try {
      const response = await this.client.delete(`/admin/email-campaigns/${campaignId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete campaign');
    }
  }

  // System Health
  async getSystemMetrics() {
    try {
      const response = await this.client.get('/admin/system/metrics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch metrics');
    }
  }

  // User Engagement
  async getEngagementMetrics(timeRange: string) {
    try {
      const response = await this.client.get(`/admin/engagement/metrics?timeRange=${timeRange}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch engagement metrics');
    }
  }

  // Bulk Operations
  async bulkGrantPremium(emails: string[]) {
    try {
      const response = await this.client.post('/admin/bulk/grant-premium', { emails });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to grant premium');
    }
  }

  async bulkRevokePremium(emails: string[]) {
    try {
      const response = await this.client.post('/admin/bulk/revoke-premium', { emails });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to revoke premium');
    }
  }

  async bulkSendEmail(emails: string[], subject: string, content: string) {
    try {
      const response = await this.client.post('/admin/bulk/send-email', { emails, subject, content });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send emails');
    }
  }

  async bulkApplyPromo(emails: string[], promoCode: string) {
    try {
      const response = await this.client.post('/admin/bulk/apply-promo', { emails, promoCode });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to apply promo');
    }
  }

  async bulkBanUsers(emails: string[]) {
    try {
      const response = await this.client.post('/admin/bulk/ban-users', { emails });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to ban users');
    }
  }

  async bulkUnbanUsers(emails: string[]) {
    try {
      const response = await this.client.post('/admin/bulk/unban-users', { emails });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to unban users');
    }
  }

  async bulkDeleteUsers(emails: string[]) {
    try {
      const response = await this.client.post('/admin/bulk/delete-users', { emails });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete users');
    }
  }

  async bulkExportUsers(emails: string[]) {
    try {
      const response = await this.client.post('/admin/bulk/export-users', { emails });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to export users');
    }
  }
}

export const apiService = new ApiService();
