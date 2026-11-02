// src/modules/chat/chatTypes.ts

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type DisappearingTimer = 'off' | '24_hours' | '7_days' | '90_days';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: string; // e.g. '#00A884' for Rohit, '#E91E63' for Priya
  senderAvatar?: string;
  text?: string;
  image?: string;
  imageCaption?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  messageType?: 'text' | 'image' | 'document' | 'poll' | 'file';
  time: string;
  timestamp: number;
  isOutgoing: boolean;
  status?: MessageStatus;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  isSystemNotice?: boolean;
  expiresAt?: number;
}

export interface ChatMember {
  id: string;
  userId?: number;
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
  isCommunity?: boolean;
  isAnnouncement?: boolean;
  isMuted?: boolean;
  membersCount?: number;
  members?: ChatMember[];
  lastMessage: string;
  lastMessageTime: string;
  lastMessageIsOutgoing?: boolean;
  lastMessageStatus?: MessageStatus;
  unreadCount: number;
  isOnline?: boolean;
  messages: ChatMessage[];
  hasMentions?: boolean;
  description?: string;
  disappearingTimer?: DisappearingTimer;
}

export type ChatFilterTab = 'all' | 'unread' | 'groups' | 'direct' | 'mentions';

export type RailTab = 'chats' | 'calls' | 'status' | 'communities' | 'channels' | 'meta_ai' | 'profile';

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

export interface SidebarContact {
  id: string;
  userId?: number;
  name: string;
  subtitle?: string;
  avatar?: string;
  section: string;
  isSpecial?: boolean;
}
