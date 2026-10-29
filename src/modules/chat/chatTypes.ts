// src/modules/chat/chatTypes.ts

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string; // e.g. '#00A884' for Rohit, '#E91E63' for Priya
  senderAvatar?: string;
  text?: string;
  image?: string;
  imageCaption?: string;
  time: string;
  timestamp: number;
  isOutgoing: boolean;
  status?: MessageStatus;
  isVoiceNote?: boolean;
  voiceDuration?: string;
}

export interface ChatMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
  phone?: string;
  color?: string;
}

export type ConversationType = 'group' | 'direct' | 'announcement';

export interface ChatConversation {
  id: string;
  name: string;
  type: ConversationType;
  avatar?: string;
  avatarBg?: string; // background color for vector icon avatars
  avatarIconType?: 'users' | 'megaphone' | 'image' | 'purple_group' | 'rp_connect';
  isGroup: boolean;
  isAnnouncement?: boolean;
  isMuted?: boolean;
  membersCount?: number;
  members?: ChatMember[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  messages: ChatMessage[];
  hasMentions?: boolean;
  description?: string;
}

export type ChatFilterTab = 'all' | 'unread' | 'groups' | 'direct' | 'mentions';

export type RailTab = 'chats' | 'calls' | 'status' | 'communities' | 'channels' | 'meta_ai';

export type CallType = 'audio' | 'video' | null;

export type CallStatus = 'ringing' | 'connected' | 'ended';

export interface ActiveCallState {
  type: CallType;
  status: CallStatus;
  conversationId: string;
  conversationName: string;
  avatar?: string;
  isGroup: boolean;
  durationSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
}

export interface StatusItem {
  id: string;
  name: string;
  time: string;
  avatar: string;
  isViewed: boolean;
  storiesCount: number;
  imageUrl?: string;
  caption?: string;
}
