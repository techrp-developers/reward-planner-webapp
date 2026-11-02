// src/modules/chat/services/chatApi.ts
import { api } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const DEV_FALLBACK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

export interface BackendChatUser {
  user_id: number;
  name: string;
  user_image: string | null;
  department: string | null;
  role: string | null;
}

export interface BackendPresence {
  user_id: number;
  online: boolean;
  last_seen_at: string | null;
}

export interface BackendConversationMember {
  user_id: number;
  name: string;
  user_image: string | null;
  role: 'admin' | 'member';
}

export interface BackendConversation {
  conversation_id: number;
  type: 'direct' | 'group';
  name: string | null;
  description: string | null;
  image_url: string | null;
  theme_key?: string;
  updated_at: string;
  role: 'admin' | 'member';
  last_message_id: number | null;
  last_message: string | null;
  last_message_type: 'text' | 'image' | 'document' | 'poll' | 'file' | null;
  last_message_at: string | null;
  last_sender_id: number | null;
  unread_count: number;
  members: BackendConversationMember[];
}

export interface BackendMessage {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_image: string | null;
  client_message_id: string | null;
  message_type: 'text' | 'image' | 'document' | 'poll' | 'file';
  body: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_mime_type: string | null;
  reply_to_message_id: number | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  read_by?: Array<{ user_id: number; name: string }>;
  is_read?: boolean;
  poll?: any;
}

export const getAuthToken = (): string => {
  try {
    const token =
      sessionStorage.getItem('rp_access_token') ||
      localStorage.getItem('rp_access_token');
    return token || DEV_FALLBACK_TOKEN;
  } catch {
    return DEV_FALLBACK_TOKEN;
  }
};

export const getCurrentUserId = (): number => {
  try {
    const token = getAuthToken();
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload?.user_id) return Number(payload.user_id);
      }
    }
    const cachedProfile = sessionStorage.getItem('rp_user_profile');
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      if (parsed?.userId || parsed?.user_id) return Number(parsed.userId || parsed.user_id);
    }
  } catch {}
  return 37;
};

export interface UserProfileData {
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  userImage?: string | null;
  role?: string;
  department?: string;
  companyName?: string;
  thought?: string;
  rewardPoints?: number;
}

export const getCurrentUserProfile = (): UserProfileData => {
  try {
    const cached = sessionStorage.getItem('rp_user_profile') || localStorage.getItem('rp_user_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        userId: Number(parsed.userId || parsed.id || parsed.user_id || 37),
        name: parsed.name || 'Sakshi Chavan',
        email: parsed.email || 'chavansakshi685@gmail.com',
        phone: parsed.phone || '9370499816',
        userImage: parsed.userImage || parsed.user_image || 'https://cdn.rewardplanners.com/public/customers/37/profile-1791802604240-zbp5el.png?v=1793335442000',
        role: parsed.employeeInfo?.role || parsed.role || 'Software Engineer',
        department: parsed.employeeInfo?.department || parsed.department || 'IT',
        companyName: parsed.company?.name || parsed.company_name || 'MPS Global',
        thought: parsed.thought || 'Growth begins outside your comfort zone.',
        rewardPoints: parsed.rewardPoints || parsed.reward_points || 2714,
      };
    }
  } catch {}
  return {
    userId: 37,
    name: 'Sakshi Chavan',
    email: 'chavansakshi685@gmail.com',
    phone: '9370499816',
    userImage: 'https://cdn.rewardplanners.com/public/customers/37/profile-1791802604240-zbp5el.png?v=1793335442000',
    role: 'Software Engineer',
    department: 'IT',
    companyName: 'MPS Global',
    thought: 'Growth begins outside your comfort zone.',
    rewardPoints: 2714,
  };
};

export const fetchCurrentUserProfile = async (): Promise<UserProfileData> => {
  try {
    const res = await api.get(ENDPOINTS.auth.userInfo, getRequestConfig());
    if (res.data?.data) {
      const parsed = res.data.data;
      const data: UserProfileData = {
        userId: Number(parsed.userId || parsed.id || parsed.user_id || 37),
        name: parsed.name || 'Sakshi Chavan',
        email: parsed.email || 'chavansakshi685@gmail.com',
        phone: parsed.phone || '9370499816',
        userImage: parsed.userImage || parsed.user_image || null,
        role: parsed.employeeInfo?.role || parsed.role || 'Software Engineer',
        department: parsed.employeeInfo?.department || parsed.department || 'IT',
        companyName: parsed.company?.name || parsed.company_name || 'MPS Global',
        thought: parsed.thought || 'Growth begins outside your comfort zone.',
        rewardPoints: parsed.rewardPoints || parsed.reward_points || 2714,
      };
      sessionStorage.setItem('rp_user_profile', JSON.stringify(parsed));
      return data;
    }
  } catch {}
  return getCurrentUserProfile();
};

export const getChatWsUrl = (): string => {
  const token = getAuthToken();
  const encodedToken = encodeURIComponent(token);
  return `wss://rewardplanners.com/ws/chat?token=${encodedToken}`;
};

const getRequestConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchChatUsers = async (search = ''): Promise<BackendChatUser[]> => {
  const res = await api.get(ENDPOINTS.chat.users(search), getRequestConfig());
  return res.data?.data || [];
};

export const fetchPresence = async (userIds: number[]): Promise<BackendPresence[]> => {
  if (!userIds.length) return [];
  const res = await api.get(ENDPOINTS.chat.presence(userIds), getRequestConfig());
  return res.data?.data || [];
};

export const fetchConversations = async (): Promise<BackendConversation[]> => {
  const res = await api.get(ENDPOINTS.chat.conversations, getRequestConfig());
  return res.data?.data || [];
};

export const createConversationApi = async (data: {
  type: 'direct' | 'group';
  member_ids: number[];
  name?: string;
  description?: string;
}): Promise<{ conversation_id: number }> => {
  const res = await api.post(ENDPOINTS.chat.conversations, data, getRequestConfig());
  return res.data?.data;
};

export const fetchMessages = async (
  conversationId: string | number,
  beforeId?: number,
  limit = 50
): Promise<BackendMessage[]> => {
  const res = await api.get(
    ENDPOINTS.chat.messages(conversationId, beforeId, limit),
    getRequestConfig()
  );
  return res.data?.data || [];
};

export const sendMessageApi = async (
  conversationId: string | number,
  payload: {
    body?: string;
    message_type?: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_mime_type?: string;
    client_message_id?: string;
    reply_to_message_id?: number;
  }
): Promise<BackendMessage> => {
  const res = await api.post(
    ENDPOINTS.chat.sendMessage(conversationId),
    {
      message_type: payload.message_type || 'text',
      body: payload.body || '',
      attachment_url: payload.attachment_url,
      attachment_name: payload.attachment_name,
      attachment_mime_type: payload.attachment_mime_type,
      client_message_id: payload.client_message_id,
      reply_to_message_id: payload.reply_to_message_id,
    },
    getRequestConfig()
  );
  return res.data?.data;
};

export const markConversationRead = async (
  conversationId: string | number,
  messageId: number
): Promise<void> => {
  await api.post(
    ENDPOINTS.chat.markRead(conversationId),
    { message_id: messageId },
    getRequestConfig()
  );
};

export const deleteMessageApi = async (
  conversationId: string | number,
  messageId: number
): Promise<{ message_id: number; conversation_id: number; deleted_at: string }> => {
  const res = await api.delete(
    ENDPOINTS.chat.deleteMessage(conversationId, messageId),
    getRequestConfig()
  );
  return res.data?.data;
};

export const uploadChatImage = async (
  file: File
): Promise<{
  attachment_url: string;
  attachment_name: string;
  attachment_mime_type: string;
  size: number;
}> => {
  const formData = new FormData();
  formData.append('image', file);
  const config = getRequestConfig();
  const res = await api.post(ENDPOINTS.chat.uploadImage, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data?.data;
};

export const uploadChatDocument = async (
  file: File
): Promise<{
  attachment_url: string;
  attachment_name: string;
  attachment_mime_type: string;
  size: number;
}> => {
  const formData = new FormData();
  formData.append('document', file);
  const config = getRequestConfig();
  const res = await api.post(ENDPOINTS.chat.uploadDocument, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data?.data;
};

export const addGroupMembersApi = async (
  conversationId: string | number,
  memberIds: number[]
): Promise<void> => {
  await api.post(
    ENDPOINTS.chat.groupMembers(conversationId),
    { member_ids: memberIds },
    getRequestConfig()
  );
};

export const removeGroupMemberApi = async (
  conversationId: string | number,
  userId: number
): Promise<void> => {
  await api.delete(
    ENDPOINTS.chat.removeGroupMember(conversationId, userId),
    getRequestConfig()
  );
};

export const leaveGroupApi = async (
  conversationId: string | number
): Promise<void> => {
  await api.post(
    ENDPOINTS.chat.leaveGroup(conversationId),
    {},
    getRequestConfig()
  );
};

export const updateGroupApi = async (
  conversationId: string | number,
  data: { name?: string; description?: string }
): Promise<void> => {
  await api.patch(
    ENDPOINTS.chat.conversationById(conversationId),
    data,
    getRequestConfig()
  );
};

export const uploadGroupImageApi = async (
  conversationId: string | number,
  file: File
): Promise<{ conversation_id: number; image_url: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  const config = getRequestConfig();
  const res = await api.post(ENDPOINTS.chat.groupImage(conversationId), formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data?.data;
};
