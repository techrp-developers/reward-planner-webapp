// src/api/notificationApi.ts
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export interface AppNotification {
  id?: string | number;
  notification_id?: string | number;
  user_id?: number;
  title: string;
  message: string;
  type?: string;
  module?: string;
  category?: string;
  icon?: string | any;
  action_url?: string;
  reference_type?: string;
  reference_id?: string;
  priority?: string;
  metadata?: any;
  read?: boolean | number;
  is_read?: boolean | number;
  created_at?: string;
  to?: string;
}

export interface NotificationBadgeResponse {
  success: boolean;
  count: number;
}

export interface NotificationsListResponse {
  success: boolean;
  data: AppNotification[];
}

export const notificationApi = {
  async getNotifications(limit?: number): Promise<AppNotification[]> {
    try {
      const response = await api.get<NotificationsListResponse>(
        ENDPOINTS.notification.myNotifications,
        { params: limit ? { limit } : undefined }
      );
      return response.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch notifications from API:', error);
      return [];
    }
  },

  async getUnreadBadge(): Promise<number> {
    try {
      const response = await api.get<NotificationBadgeResponse>(ENDPOINTS.notification.badge);
      return Number(response.data?.count || 0);
    } catch (error) {
      console.warn('Failed to fetch notification badge count:', error);
      return 0;
    }
  },

  async markAsRead(notificationId: string | number): Promise<boolean> {
    try {
      const response = await api.put(ENDPOINTS.notification.markRead(notificationId));
      return Boolean(response.data?.success);
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await api.put(ENDPOINTS.notification.markAllRead);
      return Boolean(response.data?.success);
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
      return false;
    }
  },

  async deleteNotification(notificationId: string | number): Promise<boolean> {
    try {
      const response = await api.delete(ENDPOINTS.notification.delete(notificationId));
      return Boolean(response.data?.success);
    } catch (error) {
      console.warn('Failed to delete notification:', error);
      return false;
    }
  },
};
