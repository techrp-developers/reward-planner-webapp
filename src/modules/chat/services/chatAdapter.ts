// src/modules/chat/services/chatAdapter.ts
import { ChatConversation, ChatMember, ChatMessage, MessageStatus } from '../chatTypes';
import {
  BackendConversation,
  BackendMessage,
  BackendChatUser,
  getCurrentUserId,
} from './chatApi';

export const formatChatTime = (rawDate?: string | number | Date | null): string => {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return '';
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minsStr = minutes < 10 ? '0' + minutes : String(minutes);
    return `${hours}:${minsStr} ${ampm}`;
  } catch {
    return '';
  }
};

export const adaptBackendMessage = (
  msg: BackendMessage,
  currentUserId = getCurrentUserId(),
  isRecipientOnline = false
): ChatMessage => {
  const isOutgoing = Number(msg.sender_id) === Number(currentUserId);
  const timeStr = formatChatTime(msg.created_at);
  const timestamp = msg.created_at ? new Date(msg.created_at).getTime() : Date.now();

  const isDeleted = Boolean(msg.deleted_at);
  const isImage =
    (msg.message_type === 'image' ||
      (!msg.message_type && Boolean(msg.attachment_url?.match(/\.(webp|jpg|jpeg|png|gif)/i)))) &&
    Boolean(msg.attachment_url);
  const isDocument =
    (msg.message_type === 'document' ||
      msg.message_type === 'file' ||
      (!isImage && Boolean(msg.attachment_url))) &&
    Boolean(msg.attachment_url);

  // WhatsApp standard tick logic:
  // Outgoing messages only turn blue ('read') when a recipient OTHER than the sender has read it.
  // Never use msg.is_read for outgoing messages because is_read represents the sender's own read flag.
  const hasBeenReadByRecipient =
    isOutgoing &&
    Array.isArray(msg.read_by) &&
    msg.read_by.some((r) => Number(r.user_id) !== Number(currentUserId));

  let status: MessageStatus = 'sent';
  if (hasBeenReadByRecipient) {
    status = 'read';
  } else if (isRecipientOnline) {
    status = 'delivered';
  } else {
    status = 'sent';
  }

  return {
    id: String(msg.message_id || msg.client_message_id || `msg-${Date.now()}`),
    senderId: String(msg.sender_id),
    senderName: isOutgoing ? 'You' : msg.sender_name || 'Member',
    senderAvatar: msg.sender_image || undefined,
    senderColor: isOutgoing ? undefined : '#00A884',
    text: isDeleted ? 'This message was deleted' : msg.body || undefined,
    image: !isDeleted && isImage ? msg.attachment_url || undefined : undefined,
    imageCaption: !isDeleted && isImage && msg.body ? msg.body : undefined,
    attachmentUrl: !isDeleted && isDocument ? msg.attachment_url || undefined : undefined,
    attachmentName: msg.attachment_name || (msg.attachment_url ? msg.attachment_url.split('/').pop() : undefined),
    attachmentMimeType: msg.attachment_mime_type || undefined,
    messageType: isDeleted ? 'text' : msg.message_type,
    time: timeStr,
    timestamp,
    isOutgoing,
    status,
  };
};

export const adaptBackendConversation = (
  conv: BackendConversation,
  currentUserId = getCurrentUserId(),
  isOnline = false
): ChatConversation => {
  const isGroup = conv.type === 'group';

  const isCommunityStored = () => {
    try {
      const stored = localStorage.getItem('rp_community_chat_ids');
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids) && ids.includes(String(conv.conversation_id))) return true;
      }
    } catch {}
    return false;
  };

  const isCommunity = Boolean(
    (conv as any).is_community ||
    conv.description?.toLowerCase().startsWith('community') ||
    isCommunityStored()
  );

  // Find the other member for direct chats
  const otherMember = !isGroup
    ? conv.members?.find((m) => Number(m.user_id) !== Number(currentUserId)) ||
      conv.members?.[0]
    : null;

  const chatName = isGroup
    ? conv.name || (isCommunity ? 'Community Group' : 'Group Chat')
    : otherMember?.name || conv.name || 'Direct Chat';

  const avatar = isGroup
    ? conv.image_url || undefined
    : otherMember?.user_image || undefined;

  const members: ChatMember[] = (conv.members || []).map((m) => ({
    id: String(m.user_id),
    userId: m.user_id,
    name: m.name,
    role: m.role === 'admin' ? 'Group Admin' : 'Member',
    avatar: m.user_image || undefined,
  }));

  const lastMessageText =
    conv.last_message_type === 'image'
      ? '📷 Photo'
      : conv.last_message_type === 'document' || conv.last_message_type === 'file'
      ? '📄 Document'
      : conv.last_message || 'Tap to start conversation';

  const lastMessageIsOutgoing =
    conv.last_sender_id != null && Number(conv.last_sender_id) === Number(currentUserId);

  return {
    id: String(conv.conversation_id),
    name: chatName,
    type: isGroup ? 'group' : 'direct',
    avatar,
    avatarBg: isCommunity ? '#059669' : isGroup ? '#381E2B' : undefined,
    avatarIconType: avatar ? 'image' : isCommunity ? 'rp_connect' : isGroup ? 'purple_group' : 'users',
    isGroup,
    isCommunity,
    membersCount: isGroup ? conv.members?.length || 2 : 2,
    members,
    lastMessage: lastMessageText,
    lastMessageTime: formatChatTime(conv.last_message_at || conv.updated_at),
    lastMessageIsOutgoing,
    lastMessageStatus: lastMessageIsOutgoing ? 'sent' : undefined,
    unreadCount: conv.unread_count || 0,
    isOnline: !isGroup && isOnline,
    description: conv.description || (!isGroup ? 'Coworker' : undefined),
    messages: [], // Populated on select or from history
  };
};

export const adaptChatUserToContact = (user: BackendChatUser) => {
  const nameFirst = (user.name || '').trim().charAt(0).toUpperCase();
  const section = /^[A-Z]$/.test(nameFirst) ? nameFirst : '#';
  return {
    id: String(user.user_id),
    userId: user.user_id,
    name: user.name,
    subtitle: user.role || user.department || 'Coworker',
    avatar: user.user_image || undefined,
    department: user.department,
    role: user.role,
    section,
  };
};
