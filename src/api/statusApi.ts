// src/api/statusApi.ts
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export interface StatusUser {
  id: number;
  name: string;
  image_url?: string | null;
  user_image?: string | null;
}

export interface StatusItem {
  id: number;
  user: StatusUser;
  type: 'image' | 'video' | 'text';
  text?: string | null;
  background_color?: string | null;
  font_style?: string | null;
  media_url?: string | null;
  media_mime_type?: string | null;
  duration_seconds?: number | null;
  visibility?: 'same_company' | 'all_companies' | 'all_except_companies' | 'custom_people';
  viewed: boolean;
  liked: boolean;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  created_at: string;
  expires_at: string;
}

export interface StatusFeedGroup {
  user: StatusUser;
  has_unviewed: boolean;
  statuses: StatusItem[];
}

export interface StatusComment {
  id: number;
  status_id: number;
  user: StatusUser;
  text: string;
  created_at: string;
  updated_at?: string;
}

export interface StatusViewer {
  user_id: number;
  name: string;
  image_url?: string | null;
  viewed_at: string;
}

export interface CreateStatusPayload {
  media?: File | Blob | null;
  type?: 'image' | 'video' | 'text';
  text?: string;
  background_color?: string;
  font_style?: string;
  visibility?: 'same_company' | 'all_companies' | 'all_except_companies' | 'custom_people';
  excluded_company_ids?: number[];
  allowed_user_ids?: number[];
}

export interface StatusApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  view_count?: number;
  like_count?: number;
}

export const statusApi = {
  /**
   * Fetch grouped status feed of colleagues
   */
  async getFeed(userIds?: number[]): Promise<StatusFeedGroup[]> {
    try {
      const params: Record<string, string> = {};
      if (userIds && userIds.length > 0) {
        params.user_ids = userIds.join(',');
      }
      const res = await api.get<StatusApiResponse<StatusFeedGroup[]>>(ENDPOINTS.status.feed, { params });
      return res.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch status feed:', error);
      return [];
    }
  },

  /**
   * Fetch current user's own active statuses
   */
  async getMine(): Promise<StatusItem[]> {
    try {
      const res = await api.get<StatusApiResponse<StatusItem[]>>(ENDPOINTS.status.mine);
      return res.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch user statuses:', error);
      return [];
    }
  },

  /**
   * Create a new status (photo, video, or text)
   */
  async createStatus(payload: CreateStatusPayload | FormData): Promise<StatusApiResponse<StatusItem>> {
    let body: FormData;
    if (payload instanceof FormData) {
      body = payload;
    } else {
      body = new FormData();
      if (payload.media) {
        body.append('media', payload.media);
      }
      if (payload.type) {
        body.append('type', payload.type);
      }
      if (payload.text) {
        body.append('text', payload.text);
      }
      if (payload.background_color) {
        body.append('background_color', payload.background_color);
      }
      if (payload.font_style) {
        body.append('font_style', payload.font_style);
      }
      if (payload.visibility) {
        body.append('visibility', payload.visibility);
      }
      if (payload.excluded_company_ids?.length) {
        body.append('excluded_company_ids', JSON.stringify(payload.excluded_company_ids));
      }
      if (payload.allowed_user_ids?.length) {
        body.append('allowed_user_ids', JSON.stringify(payload.allowed_user_ids));
      }
    }

    const res = await api.post<StatusApiResponse<StatusItem>>(ENDPOINTS.status.create, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Mark a status as viewed by current user
   */
  async markViewed(statusId: number | string): Promise<{ viewed: boolean; view_count?: number } | null> {
    try {
      const res = await api.post<StatusApiResponse<{ id: number; viewed: boolean; view_count: number }>>(
        ENDPOINTS.status.view(statusId)
      );
      return res.data?.data || null;
    } catch (error) {
      console.warn(`Failed to mark status ${statusId} viewed:`, error);
      return null;
    }
  },

  /**
   * Get list of viewers who viewed a status
   */
  async getViewers(statusId: number | string): Promise<StatusViewer[]> {
    try {
      const res = await api.get<StatusApiResponse<StatusViewer[]>>(ENDPOINTS.status.views(statusId));
      return res.data?.data || [];
    } catch (error) {
      console.warn(`Failed to get status ${statusId} viewers:`, error);
      return [];
    }
  },

  /**
   * Toggle like on a status
   */
  async toggleLike(statusId: number | string): Promise<{ liked: boolean; like_count: number } | null> {
    try {
      const res = await api.post<StatusApiResponse<{ liked: boolean; like_count: number }>>(
        ENDPOINTS.status.like(statusId)
      );
      return res.data?.data || null;
    } catch (error) {
      console.warn(`Failed to toggle like on status ${statusId}:`, error);
      return null;
    }
  },

  /**
   * Get likes and users who liked a status
   */
  async getLikes(statusId: number | string): Promise<{ like_count: number; users: { id: number; name: string; image_url?: string | null; liked_at: string }[] }> {
    try {
      const res = await api.get<StatusApiResponse<any[]>>(ENDPOINTS.status.likes(statusId));
      const rawData = res.data?.data || [];
      const count = typeof res.data?.like_count === 'number' ? res.data.like_count : rawData.length;
      const users = rawData.map((item: any) => ({
        id: item.user?.id || item.user_id || item.id,
        name: item.user?.name || item.name || 'Colleague',
        image_url: item.user?.image_url || item.image_url,
        liked_at: item.liked_at || item.created_at || '',
      }));
      return { like_count: count, users };
    } catch (error) {
      console.warn(`Failed to get status ${statusId} likes:`, error);
      return { like_count: 0, users: [] };
    }
  },

  /**
   * Post a comment or reply to a status
   */
  async createComment(statusId: number | string, text: string): Promise<StatusComment | null> {
    try {
      const res = await api.post<StatusApiResponse<StatusComment>>(
        ENDPOINTS.status.comments(statusId),
        { text }
      );
      return res.data?.data || null;
    } catch (error) {
      console.warn(`Failed to create comment on status ${statusId}:`, error);
      return null;
    }
  },

  /**
   * Get comments for a status
   */
  async getComments(statusId: number | string, limit = 50, beforeId?: number): Promise<StatusComment[]> {
    try {
      const params: Record<string, string | number> = { limit };
      if (beforeId) params.before_id = beforeId;
      const res = await api.get<StatusApiResponse<StatusComment[]>>(
        ENDPOINTS.status.comments(statusId),
        { params }
      );
      return res.data?.data || [];
    } catch (error) {
      console.warn(`Failed to fetch comments for status ${statusId}:`, error);
      return [];
    }
  },

  /**
   * Delete user's own status
   */
  async deleteStatus(statusId: number | string): Promise<boolean> {
    try {
      const res = await api.delete<StatusApiResponse>(ENDPOINTS.status.delete(statusId));
      return Boolean(res.data?.success);
    } catch (error) {
      console.warn(`Failed to delete status ${statusId}:`, error);
      return false;
    }
  },

  /**
   * Fetch audience options for visibility settings
   */
  async getAudienceOptions(query?: string) {
    try {
      const params: Record<string, string> = {};
      if (query) params.q = query;
      const res = await api.get(ENDPOINTS.status.audienceOptions, { params });
      return res.data?.data || { companies: [], people: [] };
    } catch (error) {
      console.warn('Failed to fetch status audience options:', error);
      return { companies: [], people: [] };
    }
  },
};
