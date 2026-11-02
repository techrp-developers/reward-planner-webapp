// src/modules/chat/ChatPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChatConversation, ActiveCallState, ChatMessage, RailTab, DisappearingTimer } from './chatTypes';
import { INITIAL_CONVERSATIONS, SIMULATED_RESPONSES } from './chatData';
import ChatNavigationRail from './components/ChatNavigationRail';
import ChatSidebar from './components/ChatSidebar';
import ChatConversationView from './components/ChatConversation';
import ChatCallModal from './components/ChatCallModal';
import ChatGroupInfoModal from './components/ChatGroupInfoModal';
import ChatNewChatModal from './components/ChatNewChatModal';
import ChatDisappearingModal from './components/ChatDisappearingModal';
import ChatWelcomeScreen from './components/ChatWelcomeScreen';
import {
  fetchConversations,
  fetchMessages,
  sendMessageApi,
  createConversationApi,
  markConversationRead,
  deleteMessageApi,
  fetchPresence,
  getCurrentUserId,
  BackendMessage,
} from './services/chatApi';
import {
  adaptBackendConversation,
  adaptBackendMessage,
  formatChatTime,
} from './services/chatAdapter';
import { useChatSocket } from './services/useChatSocket';
import './Chat.css';

const getDisappearingDurationMs = (timer: DisappearingTimer): number => {
  switch (timer) {
    case '24_hours':
      return 24 * 60 * 60 * 1000;
    case '7_days':
      return 7 * 24 * 60 * 60 * 1000;
    case '90_days':
      return 90 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};

const getStoredDisappearingTimer = (convoId: string): DisappearingTimer | undefined => {
  try {
    const val = localStorage.getItem(`rp_chat_disappearing_${convoId}`);
    if (val === '24_hours' || val === '7_days' || val === '90_days' || val === 'off') {
      return val as DisappearingTimer;
    }
  } catch {}
  return undefined;
};

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const [searchParams] = useSearchParams();
  const targetChatId = chatId || searchParams.get('id') || searchParams.get('conversation_id');
  const navigate = useNavigate();

  const [activeRailTab, setActiveRailTab] = useState<RailTab>('chats');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(targetChatId || null);
  const [mobileView, setMobileView] = useState<'sidebar' | 'conversation'>(
    targetChatId ? 'conversation' : 'sidebar'
  );
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Modals state
  const [callState, setCallState] = useState<ActiveCallState | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [newChatTrigger, setNewChatTrigger] = useState(0);
  const [addStatusTrigger, setAddStatusTrigger] = useState(0);

  const activeChatIdRef = useRef<string | null>(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Load conversations from backend
  const loadConversations = useCallback(async () => {
    try {
      const backendConvos = await fetchConversations();
      if (backendConvos && backendConvos.length > 0) {
        const currentUserId = getCurrentUserId();
        const otherUserIds = Array.from(
          new Set(
            backendConvos
              .flatMap((c) => c.members || [])
              .map((m) => Number(m.user_id))
              .filter((id) => id && id !== Number(currentUserId))
          )
        );

        let initialPresence: Record<number, boolean> = {};
        if (otherUserIds.length > 0) {
          try {
            const list = await fetchPresence(otherUserIds);
            list.forEach((p) => {
              initialPresence[Number(p.user_id)] = Boolean(p.online);
            });
          } catch {}
        }

        // Fetch latest message for outgoing conversations to know recipient's seen status for the outside sidebar
        const outgoingConvos = backendConvos.filter(
          (c) => c.last_sender_id != null && Number(c.last_sender_id) === Number(currentUserId)
        );

        const lastStatusMap: Record<number, MessageStatus> = {};
        await Promise.all(
          outgoingConvos.map(async (c) => {
            try {
              const msgs = await fetchMessages(c.conversation_id, undefined, 1);
              if (msgs && msgs.length > 0) {
                const latestMsg = msgs[msgs.length - 1];
                const hasBeenRead =
                  Array.isArray(latestMsg.read_by) &&
                  latestMsg.read_by.some((r) => Number(r.user_id) !== Number(currentUserId));

                const otherMember = c.type !== 'group'
                  ? c.members?.find((m) => Number(m.user_id) !== Number(currentUserId))
                  : null;
                const isRecipientOnline = otherMember ? Boolean(initialPresence[otherMember.user_id]) : false;

                if (hasBeenRead) {
                  lastStatusMap[c.conversation_id] = 'read';
                } else if (isRecipientOnline) {
                  lastStatusMap[c.conversation_id] = 'delivered';
                } else {
                  lastStatusMap[c.conversation_id] = 'sent';
                }
              }
            } catch {}
          })
        );

        setConversations((prev) => {
          return backendConvos.map((b) => {
            const otherMember = b.type !== 'group'
              ? b.members?.find((m) => Number(m.user_id) !== Number(currentUserId))
              : null;
            const isOnline = otherMember ? Boolean(initialPresence[otherMember.user_id]) : false;
            const adapted = adaptBackendConversation(b, currentUserId, isOnline);

            const storedTimer = getStoredDisappearingTimer(String(b.conversation_id));
            if (storedTimer) {
              adapted.disappearingTimer = storedTimer;
            }

            if (lastStatusMap[b.conversation_id]) {
              adapted.lastMessageStatus = lastStatusMap[b.conversation_id];
            }

            const existing = prev.find((p) => p.id === adapted.id);
            if (existing) {
              if (existing.disappearingTimer && !storedTimer) {
                adapted.disappearingTimer = existing.disappearingTimer;
              }
              if (existing.messages.length > 0) {
                adapted.messages = existing.messages;
                const lastMemMsg = existing.messages[existing.messages.length - 1];
                if (lastMemMsg && lastMemMsg.isOutgoing) {
                  adapted.lastMessageStatus = lastMemMsg.status;
                }
              } else if (existing.lastMessageStatus && !lastStatusMap[b.conversation_id]) {
                adapted.lastMessageStatus = existing.lastMessageStatus;
              }
            }
            return adapted;
          });
        });
      } else {
        setConversations((prev) =>
          (prev.length === 0 ? INITIAL_CONVERSATIONS : prev).map((c) => {
            const stored = getStoredDisappearingTimer(c.id);
            return stored ? { ...c, disappearingTimer: stored } : c;
          })
        );
      }
    } catch (err) {
      console.warn('Error loading conversations from backend, using fallback:', err);
      setConversations((prev) =>
        (prev.length === 0 ? INITIAL_CONVERSATIONS : prev).map((c) => {
          const stored = getStoredDisappearingTimer(c.id);
          return stored ? { ...c, disappearingTimer: stored } : c;
        })
      );
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Live polling sync with mobile app (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations();
      if (activeChatIdRef.current) {
        const numId = Number(activeChatIdRef.current);
        if (Number.isSafeInteger(numId) && numId > 0) {
          fetchMessages(numId)
            .then((backendMsgs) => {
              setConversations((prev) => {
                const currentUserId = getCurrentUserId();
                const activeConv = prev.find((c) => c.id === String(numId));
                const isRecipientOnline = activeConv?.isOnline ?? false;
                const adapted = backendMsgs.map((m) =>
                  adaptBackendMessage(m, currentUserId, isRecipientOnline)
                );
                return prev.map((c) => {
                  if (c.id !== String(numId)) return c;
                  const pendingSending = c.messages.filter((m) => m.status === 'sending');
                  const allMsgs = [...adapted, ...pendingSending];
                  const lastMsg = allMsgs[allMsgs.length - 1];
                  return {
                    ...c,
                    messages: allMsgs,
                    lastMessageIsOutgoing: lastMsg ? lastMsg.isOutgoing : c.lastMessageIsOutgoing,
                    lastMessageStatus: lastMsg?.isOutgoing ? lastMsg.status : c.lastMessageStatus,
                  };
                });
              });
            })
            .catch(() => {});
        }
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [loadConversations]);

  // Load messages for a given conversation
  const loadMessagesForChat = useCallback(async (convoId: string) => {
    const numId = Number(convoId);
    if (Number.isSafeInteger(numId) && numId > 0) {
      try {
        setIsLoadingMessages(true);
        const backendMsgs = await fetchMessages(numId);
        const currentUserId = getCurrentUserId();
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === convoId);
          const isRecipientOnline = conv?.isOnline ?? false;
          const adaptedMsgs = backendMsgs.map((m) =>
            adaptBackendMessage(m, currentUserId, isRecipientOnline)
          );
          const lastMsg = adaptedMsgs[adaptedMsgs.length - 1];
          return prev.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  messages: adaptedMsgs,
                  lastMessageIsOutgoing: lastMsg ? lastMsg.isOutgoing : c.lastMessageIsOutgoing,
                  lastMessageStatus: lastMsg?.isOutgoing ? lastMsg.status : c.lastMessageStatus,
                }
              : c
          );
        });
        // Only mark read if there are unread messages received from ANOTHER user
        const myUserId = getCurrentUserId();
        const latestFromOther = [...backendMsgs]
          .reverse()
          .find((m) => Number(m.sender_id) !== Number(myUserId));
        if (latestFromOther) {
          markConversationRead(numId, latestFromOther.message_id).catch(() => {});
        }
      } catch (e) {
        console.warn('Failed to load messages for conversation:', e);
      } finally {
        setIsLoadingMessages(false);
      }
    }
  }, []);

  // WebSocket hook for live updates
  const { isConnected, onlineUserIds, sendWsMessage, sendWsRead, sendWsTyping } =
    useChatSocket({
      onNewMessage: (backendMsg: BackendMessage) => {
        const convoId = String(backendMsg.conversation_id);
        const myUserId = getCurrentUserId();
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === convoId);
          const isRecipientOnline = conv?.isOnline ?? false;
          const adapted = adaptBackendMessage(backendMsg, myUserId, isRecipientOnline);

          const durationMs =
            conv?.disappearingTimer && conv.disappearingTimer !== 'off'
              ? getDisappearingDurationMs(conv.disappearingTimer)
              : 0;
          if (durationMs > 0 && !adapted.expiresAt) {
            adapted.expiresAt = Date.now() + durationMs;
          }
          return prev.map((c) => {
            if (c.id === convoId) {
              const matchIndex = c.messages.findIndex(
                (m) =>
                  m.id === String(backendMsg.message_id) ||
                  (backendMsg.client_message_id && m.id === String(backendMsg.client_message_id))
              );
              let newMessages: ChatMessage[];
              if (matchIndex >= 0) {
                newMessages = [...c.messages];
                newMessages[matchIndex] = adapted;
              } else {
                newMessages = [...c.messages, adapted];
              }
              const lastMsg = newMessages[newMessages.length - 1];
              return {
                ...c,
                messages: newMessages,
                lastMessage: adapted.text || (adapted.image ? '📷 Photo' : 'Message'),
                lastMessageTime: adapted.time,
                lastMessageIsOutgoing: lastMsg ? lastMsg.isOutgoing : c.lastMessageIsOutgoing,
                lastMessageStatus: lastMsg?.isOutgoing ? lastMsg.status : c.lastMessageStatus,
                unreadCount: activeChatIdRef.current === convoId ? 0 : c.unreadCount + 1,
              };
            }
            return c;
          });
        });

        if (
          activeChatIdRef.current === convoId &&
          Number(backendMsg.sender_id) !== Number(getCurrentUserId())
        ) {
          sendWsRead(backendMsg.conversation_id, backendMsg.message_id);
          markConversationRead(backendMsg.conversation_id, backendMsg.message_id).catch(() => {});
        }
      },
      onMessageRead: (data) => {
        const convoId = String(data.conversation_id);
        const readerId = Number(data.user_id);
        const myUserId = Number(getCurrentUserId());

        // WhatsApp rule: Outgoing messages from current user turn blue when ANOTHER member reads them
        if (readerId !== myUserId) {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === convoId) {
                const updatedMessages = c.messages.map((m) =>
                  m.isOutgoing && (!data.message_id || Number(m.id) <= Number(data.message_id))
                    ? { ...m, status: 'read' as const }
                    : m
                );
                return {
                  ...c,
                  messages: updatedMessages,
                  lastMessageStatus: c.lastMessageIsOutgoing ? 'read' : c.lastMessageStatus,
                };
              }
              return c;
            })
          );
        }
      },
      onPresenceChange: ({ user_id, online }) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (!c.isGroup) {
              const hasUser = c.members.some((m) => Number(m.userId || m.id) === Number(user_id));
              if (hasUser) {
                return { ...c, isOnline: online };
              }
            }
            return c;
          })
        );
      },
      onConversationAvailable: () => {
        loadConversations();
      },
    });

  // Sync route param or query param with activeChatId
  useEffect(() => {
    if (targetChatId) {
      setActiveChatId(targetChatId);
      setMobileView('conversation');
      loadMessagesForChat(targetChatId);
    }
  }, [targetChatId, loadMessagesForChat]);

  const activeConversation = activeChatId
    ? conversations.find((c) => c.id === activeChatId) || null
    : null;

  const handleSelectChat = (id: string | null) => {
    if (!id) {
      setActiveChatId(null);
      setMobileView('sidebar');
      return;
    }
    setActiveChatId(id);
    setMobileView('conversation');
    // Clear unread count when opened
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
    loadMessagesForChat(id);
  };

  // Format time (e.g. 10:35 AM)
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minsStr = minutes < 10 ? '0' + minutes : String(minutes);
    return `${hours}:${minsStr} ${ampm}`;
  };

  // Send message handler
  const handleSendMessage = async (
    text: string,
    image?: string,
    attachmentData?: { url: string; name: string; mimeType: string; type: string }
  ) => {
    if (!text && !image && !attachmentData) return;

    const timeStr = getCurrentTimeFormatted();
    const clientMsgId = `client-${Date.now()}`;
    const currentTimer = activeConversation?.disappearingTimer;
    const durationMs =
      currentTimer && currentTimer !== 'off' ? getDisappearingDurationMs(currentTimer) : 0;
    const expiresAt = durationMs > 0 ? Date.now() + durationMs : undefined;

    const newMsg: ChatMessage = {
      id: clientMsgId,
      senderId: String(getCurrentUserId()),
      senderName: 'You',
      text: text || undefined,
      image: image || (attachmentData?.type === 'image' ? attachmentData.url : undefined),
      time: timeStr,
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'sending',
      expiresAt,
    };

    // Optimistic UI update
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeChatId) {
          const updatedMessages = [...conv.messages, newMsg];
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: text || (image ? '📷 Photo' : 'Message'),
            lastMessageTime: timeStr,
            lastMessageIsOutgoing: true,
            lastMessageStatus: 'sending',
          };
        }
        return conv;
      })
    );

    const numId = Number(activeChatId);
    // If it's a backend conversation
    if (Number.isSafeInteger(numId) && numId > 0) {
      try {
        const messageType = attachmentData?.type || (image ? 'image' : 'text');
        const attachmentUrl = attachmentData?.url || image;
        const sent = await sendMessageApi(numId, {
          body: text,
          message_type: messageType,
          attachment_url: attachmentUrl,
          attachment_name: attachmentData?.name,
          attachment_mime_type: attachmentData?.mimeType,
          client_message_id: clientMsgId,
        });

        // Determine status: Recipient has NOT read newly sent message yet!
        // Show delivered (double tick) if recipient is online, or sent (single tick) if offline.
        const isRecipientOnline = activeConversation?.isOnline ?? false;
        const newStatus: MessageStatus = isRecipientOnline ? 'delivered' : 'sent';

        // Update message status to sent/delivered and replace temporary client id with real message_id
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeChatId) {
              return {
                ...conv,
                lastMessageIsOutgoing: true,
                lastMessageStatus: newStatus,
                messages: conv.messages.map((m) =>
                  m.id === clientMsgId
                    ? { ...m, id: String(sent.message_id), status: newStatus }
                    : m
                ),
              };
            }
            return conv;
          })
        );
      } catch (err) {
        console.error('Failed to send message via API:', err);
      }
      return;
    }

    // For mock/demo chats, transition optimistic 'sending' to 'sent' after 300ms
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeChatId) {
            return {
              ...conv,
              lastMessageIsOutgoing: true,
              lastMessageStatus: 'sent',
              messages: conv.messages.map((m) =>
                m.id === clientMsgId ? { ...m, status: 'sent' as const } : m
              ),
            };
          }
          return conv;
        })
      );
    }, 300);

    // If active chat is 'rp-connect' or 'design-team', simulate an instant smart reply after 1.5 seconds!
    if (activeChatId === 'rp-connect' || activeChatId === 'design-team') {
      setTimeout(() => {
        const randomReply =
          SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];

        const replyMsg: ChatMessage = {
          id: 'reply-' + Date.now(),
          senderId: 'sim-' + Date.now(),
          senderName: randomReply.senderName,
          senderColor: randomReply.senderColor,
          senderAvatar: randomReply.senderAvatar,
          text: randomReply.text,
          time: getCurrentTimeFormatted(),
          timestamp: Date.now(),
          isOutgoing: false,
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeChatId) {
              return {
                ...conv,
                messages: [
                  ...conv.messages.map((m) =>
                    m.isOutgoing ? { ...m, status: 'read' as const } : m
                  ),
                  replyMsg,
                ],
                lastMessage: `${randomReply.senderName.split(' ')[0]}: ${randomReply.text}`,
                lastMessageTime: getCurrentTimeFormatted(),
                lastMessageIsOutgoing: false,
                lastMessageStatus: undefined,
              };
            }
            return conv;
          })
        );
      }, 1600);
    }
  };

  // Audio / Video call actions
  const handleStartAudioCall = () => {
    if (!activeConversation) return;
    setCallState({
      type: 'audio',
      status: 'ringing',
      conversationId: activeConversation.id,
      conversationName: activeConversation.name,
      avatar: activeConversation.avatar,
      isGroup: activeConversation.isGroup,
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: true,
      isSpeakerOn: true,
    });
  };

  const handleStartVideoCall = () => {
    if (!activeConversation) return;
    setCallState({
      type: 'video',
      status: 'ringing',
      conversationId: activeConversation.id,
      conversationName: activeConversation.name,
      avatar: activeConversation.avatar,
      isGroup: activeConversation.isGroup,
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
      isSpeakerOn: true,
    });
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatId) return;
    const numChatId = Number(activeChatId);
    const numMsgId = Number(messageId);
    if (Number.isSafeInteger(numChatId) && Number.isSafeInteger(numMsgId)) {
      try {
        await deleteMessageApi(numChatId, numMsgId);
      } catch (err) {
        console.warn('Failed to delete message via backend API:', err);
      }
    }
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    text: 'This message was deleted',
                    image: undefined,
                    attachmentUrl: undefined,
                  }
                : m
            ),
          };
        }
        return c;
      })
    );
  };

  // Disappearing messages configuration handler
  const handleUpdateDisappearingTimer = (timer: DisappearingTimer) => {
    if (!activeChatId) return;
    const currentChatId = activeChatId;

    try {
      localStorage.setItem(`rp_chat_disappearing_${currentChatId}`, timer);
    } catch {}

    const timeStr = getCurrentTimeFormatted();
    const noticeText =
      timer === 'off'
        ? 'You turned off disappearing messages.'
        : `You turned on disappearing messages. All new messages will disappear from this chat ${
            timer === '24_hours' ? '24 hours' : timer === '7_days' ? '7 days' : '90 days'
          } after they're sent.`;

    const systemMessage: ChatMessage = {
      id: `sys-disappear-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      text: noticeText,
      time: timeStr,
      timestamp: Date.now(),
      isOutgoing: false,
      isSystemNotice: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentChatId) {
          return {
            ...c,
            disappearingTimer: timer,
            messages: [...c.messages, systemMessage],
            lastMessage: noticeText,
            lastMessageTime: timeStr,
          };
        }
        return c;
      })
    );
  };

  // Clear messages handler
  const handleClearMessages = () => {
    if (!activeChatId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [], lastMessage: '' } : c))
    );
  };

  // Direct chat creation from contact
  const handleStartDirectChat = async (contact: {
    name: string;
    avatar?: string;
    role: string;
    userId?: number;
  }) => {
    if (contact.userId) {
      // 1. First check if a direct conversation already exists in our loaded conversations
      const existing = conversations.find(
        (c) =>
          !c.isGroup &&
          c.members?.some((m) => Number(m.userId || m.id) === Number(contact.userId))
      );
      if (existing) {
        handleSelectChat(existing.id);
        return;
      }

      // 2. Otherwise create/get direct conversation from backend
      try {
        const res = await createConversationApi({
          type: 'direct',
          member_ids: [contact.userId],
        });
        if (res?.conversation_id) {
          const convIdStr = String(res.conversation_id);
          const backendConvos = await fetchConversations();
          setConversations((prev) => {
            return backendConvos.map((b) => {
              const adapted = adaptBackendConversation(b);
              const prevMatch = prev.find((p) => p.id === adapted.id);
              if (prevMatch && prevMatch.messages.length > 0) {
                adapted.messages = prevMatch.messages;
              }
              return adapted;
            });
          });
          setActiveChatId(convIdStr);
          setMobileView('conversation');
          loadMessagesForChat(convIdStr);
          return;
        }
      } catch (err) {
        console.warn('Backend create conversation failed, falling back to local chat:', err);
      }
    }

    // Local fallback
    const existing = conversations.find(
      (c) => c.name.toLowerCase() === contact.name.toLowerCase() && !c.isGroup
    );

    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newId = 'chat-' + Date.now();
      const newChat: ChatConversation = {
        id: newId,
        name: contact.name,
        type: 'direct',
        avatar: contact.avatar,
        avatarIconType: contact.avatar ? 'image' : 'users',
        isGroup: false,
        lastMessage: 'Tap to start conversation',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        isOnline: Boolean(contact.userId && onlineUserIds.has(contact.userId)),
        description: `${contact.role}`,
        messages: [],
      };

      setConversations((prev) => [newChat, ...prev]);
      setActiveChatId(newId);
    }

    setMobileView('conversation');
  };

  // Group chat creation
  const handleCreateGroupChat = async (
    groupName: string,
    selectedMembers: string[],
    memberUserIds?: number[]
  ) => {
    if (memberUserIds && memberUserIds.length > 0) {
      try {
        const res = await createConversationApi({
          type: 'group',
          name: groupName,
          member_ids: memberUserIds,
        });
        if (res?.conversation_id) {
          const convIdStr = String(res.conversation_id);
          const backendConvos = await fetchConversations();
          setConversations((prev) => {
            return backendConvos.map((b) => {
              const adapted = adaptBackendConversation(b);
              const prevMatch = prev.find((p) => p.id === adapted.id);
              if (prevMatch && prevMatch.messages.length > 0) {
                adapted.messages = prevMatch.messages;
              }
              return adapted;
            });
          });
          setActiveChatId(convIdStr);
          setMobileView('conversation');
          loadMessagesForChat(convIdStr);
          return;
        }
      } catch (err) {
        console.warn('Backend create group failed, falling back to local group:', err);
      }
    }

    // Local fallback
    const newId = 'group-' + Date.now();
    const newGroup: ChatConversation = {
      id: newId,
      name: groupName,
      type: 'group',
      avatarBg: '#381E2B',
      avatarIconType: 'purple_group',
      isGroup: true,
      membersCount: selectedMembers.length + 1,
      lastMessage: 'Group created by you',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      description: `Group created with ${selectedMembers.join(', ')}`,
      messages: [
        {
          id: 'sys-1',
          senderId: 'sys',
          senderName: 'System',
          text: `You created group "${groupName}" with ${selectedMembers.length} participants`,
          time: getCurrentTimeFormatted(),
          timestamp: Date.now(),
          isOutgoing: false,
        },
      ],
    };

    setConversations((prev) => [newGroup, ...prev]);
    setActiveChatId(newId);
    setMobileView('conversation');
  };

  // Community chat creation
  const handleCreateCommunityChat = async (
    communityName: string,
    description: string,
    selectedMembers: string[],
    memberUserIds?: number[]
  ) => {
    const markAsCommunityId = (idStr: string) => {
      try {
        const stored = localStorage.getItem('rp_community_chat_ids');
        const ids = stored ? JSON.parse(stored) : [];
        if (!ids.includes(idStr)) {
          ids.push(idStr);
          localStorage.setItem('rp_community_chat_ids', JSON.stringify(ids));
        }
      } catch {}
    };

    if (memberUserIds && memberUserIds.length > 0) {
      try {
        const res = await createConversationApi({
          type: 'group',
          name: communityName,
          description: description ? `Community: ${description}` : 'Community workspace',
          member_ids: memberUserIds,
        });
        if (res?.conversation_id) {
          const convIdStr = String(res.conversation_id);
          markAsCommunityId(convIdStr);
          const backendConvos = await fetchConversations();
          setConversations((prev) => {
            return backendConvos.map((b) => {
              const adapted = adaptBackendConversation(b);
              if (adapted.id === convIdStr) {
                adapted.isCommunity = true;
                adapted.avatarBg = '#059669';
                adapted.avatarIconType = 'rp_connect';
              }
              const prevMatch = prev.find((p) => p.id === adapted.id);
              if (prevMatch && prevMatch.messages.length > 0) {
                adapted.messages = prevMatch.messages;
              }
              return adapted;
            });
          });
          setActiveChatId(convIdStr);
          setMobileView('conversation');
          loadMessagesForChat(convIdStr);
          return;
        }
      } catch (err) {
        console.warn('Backend create community failed, falling back to local community:', err);
      }
    }

    // Local fallback
    const newId = 'community-' + Date.now();
    markAsCommunityId(newId);
    const newCommunity: ChatConversation = {
      id: newId,
      name: communityName,
      type: 'group',
      avatarBg: '#059669',
      avatarIconType: 'rp_connect',
      isGroup: true,
      isCommunity: true,
      membersCount: selectedMembers.length + 1,
      lastMessage: description || 'Welcome to the community!',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      description: description || `Community created with ${selectedMembers.join(', ')}`,
      messages: [
        {
          id: 'sys-comm-1',
          senderId: 'sys',
          senderName: 'System',
          text: `Welcome to "${communityName}"! Community created with ${selectedMembers.length} members.`,
          time: getCurrentTimeFormatted(),
          timestamp: Date.now(),
          isOutgoing: false,
        },
      ],
    };

    setConversations((prev) => [newCommunity, ...prev]);
    setActiveChatId(newId);
    setMobileView('conversation');
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F1F5F9] text-[#0F172A] font-['Segoe_UI',Helvetica,Arial,sans-serif] select-none">
      {/* 1. Far-Left Navigation Rail (Fixed 56px / w-14) */}
      <ChatNavigationRail
        activeTab={activeRailTab}
        onSelectTab={(tab) => {
          setActiveRailTab(tab);
          if (tab === 'status' || tab === 'profile') {
            setActiveChatId(null);
          }
        }}
        unreadCount={conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
      />

      {/* 2. Left Sidebar (Chats list or Status list or New Chat) */}
      <div
        className={`h-full shrink-0 ${
          mobileView === 'sidebar' ? 'w-full' : 'hidden'
        } md:block md:w-[410px] lg:w-[440px] border-r border-[#CBD5E1]`}
      >
        <ChatSidebar
          conversations={conversations}
          activeChatId={activeChatId}
          activeRailTab={activeRailTab}
          onSelectTab={setActiveRailTab}
          onSelectChat={handleSelectChat}
          onStartDirectChat={handleStartDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
          onCreateCommunityChat={handleCreateCommunityChat}
          onBackToDashboard={() => navigate('/employee-login')}
          openNewChatTrigger={newChatTrigger}
          openAddStatusTrigger={addStatusTrigger}
          onOpenDisappearingForChat={(chat) => {
            setActiveChatId(chat.id);
            setShowDisappearingModal(true);
          }}
        />
      </div>

      {/* 3. Right Pane: Active Conversation or Welcome Screen with Action Buttons */}
      <div
        className={`h-full flex-1 ${
          mobileView === 'conversation' && activeConversation ? 'w-full' : 'hidden'
        } md:flex flex-col bg-[#F1F5F9]`}
      >
        {activeConversation && activeRailTab === 'chats' ? (
          <ChatConversationView
            conversation={activeConversation}
            onBackMobile={() => {
              setActiveChatId(null);
              setMobileView('sidebar');
            }}
            onSendMessage={handleSendMessage}
            onAudioCall={handleStartAudioCall}
            onVideoCall={handleStartVideoCall}
            onOpenInfo={() => setShowGroupInfo(true)}
            onDeleteMessage={handleDeleteMessage}
            onOpenDisappearingModal={() => setShowDisappearingModal(true)}
            onClearMessages={handleClearMessages}
          />
        ) : (
          <ChatWelcomeScreen
            railTab={activeRailTab}
            onOpenNewChat={() => {
              setActiveRailTab('chats');
              setNewChatTrigger((prev) => prev + 1);
            }}
            onAddStatus={() => {
              setAddStatusTrigger((prev) => prev + 1);
            }}
            onSendDocument={() => {
              if (conversations.length > 0) {
                handleSelectChat(conversations[0].id);
              }
            }}
            onAskMetaAi={() => {
              setActiveRailTab('meta_ai');
            }}
            onStartCall={() => {
              if (conversations.length > 0) {
                setActiveChatId(conversations[0].id);
              }
            }}
          />
        )}
      </div>

      {/* Call Modal */}
      {callState && (
        <ChatCallModal
          callState={callState}
          onEndCall={() => setCallState(null)}
          onToggleMute={() =>
            setCallState((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
          }
          onToggleVideo={() =>
            setCallState((prev) => (prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null))
          }
          onToggleSpeaker={() =>
            setCallState((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null))
          }
        />
      )}

      {/* Group Info Modal */}
      {showGroupInfo && activeConversation && (
        <ChatGroupInfoModal
          conversation={activeConversation}
          onClose={() => setShowGroupInfo(false)}
          onAudioCall={() => {
            setShowGroupInfo(false);
            handleStartAudioCall();
          }}
          onVideoCall={() => {
            setShowGroupInfo(false);
            handleStartVideoCall();
          }}
          onSelectMemberChat={(contact) => {
            setShowGroupInfo(false);
            handleStartDirectChat(contact);
          }}
          onRefreshGroup={loadConversations}
          onLeaveGroupSuccess={() => {
            loadConversations();
            setActiveChatId(null);
            setMobileView('sidebar');
          }}
          onOpenDisappearingModal={() => {
            setShowGroupInfo(false);
            setShowDisappearingModal(true);
          }}
        />
      )}

      {/* Disappearing Messages Modal */}
      {showDisappearingModal && activeConversation && (
        <ChatDisappearingModal
          isOpen={showDisappearingModal}
          currentTimer={activeConversation.disappearingTimer || 'off'}
          conversationName={activeConversation.name}
          onClose={() => setShowDisappearingModal(false)}
          onApply={(timer) => handleUpdateDisappearingTimer(timer)}
        />
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <ChatNewChatModal
          onClose={() => setShowNewChatModal(false)}
          onStartDirectChat={handleStartDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
          onCreateCommunityChat={handleCreateCommunityChat}
        />
      )}
    </div>
  );
};

export default ChatPage;
