// src/modules/chat/ChatPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatConversation, ActiveCallState, ChatMessage, RailTab } from './chatTypes';
import { INITIAL_CONVERSATIONS, SIMULATED_RESPONSES } from './chatData';
import ChatNavigationRail from './components/ChatNavigationRail';
import ChatSidebar from './components/ChatSidebar';
import ChatConversationView from './components/ChatConversation';
import ChatCallModal from './components/ChatCallModal';
import ChatGroupInfoModal from './components/ChatGroupInfoModal';
import ChatNewChatModal from './components/ChatNewChatModal';
import ChatWelcomeScreen from './components/ChatWelcomeScreen';
import './Chat.css';

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const [activeRailTab, setActiveRailTab] = useState<RailTab>('chats');
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
  const [mobileView, setMobileView] = useState<'sidebar' | 'conversation'>(
    chatId ? 'conversation' : 'sidebar'
  );
  
  // Modals state
  const [callState, setCallState] = useState<ActiveCallState | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Sync route param with activeChatId
  useEffect(() => {
    if (chatId && conversations.some(c => c.id === chatId)) {
      setActiveChatId(chatId);
      setMobileView('conversation');
    }
  }, [chatId, conversations]);

  const activeConversation = activeChatId
    ? conversations.find((c) => c.id === activeChatId) || null
    : null;

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileView('conversation');
    // Clear unread count when opened
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Format time (e.g. 10:35 AM)
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minsStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minsStr} ${ampm}`;
  };

  // Send message handler
  const handleSendMessage = (text: string, image?: string) => {
    if (!text && !image) return;

    const timeStr = getCurrentTimeFormatted();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: 'user',
      senderName: 'You',
      text: text || undefined,
      image: image || undefined,
      time: timeStr,
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'read'
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeChatId) {
          const updatedMessages = [...conv.messages, newMsg];
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: text || (image ? 'You: Shared an image' : 'Message'),
            lastMessageTime: timeStr
          };
        }
        return conv;
      })
    );

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
          isOutgoing: false
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeChatId) {
              return {
                ...conv,
                messages: [...conv.messages, replyMsg],
                lastMessage: `${randomReply.senderName.split(' ')[0]}: ${randomReply.text}`,
                lastMessageTime: getCurrentTimeFormatted()
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
      isSpeakerOn: true
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
      isSpeakerOn: true
    });
  };

  // Direct chat creation from contact
  const handleStartDirectChat = (contact: { name: string; avatar?: string; role: string }) => {
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
        isOnline: true,
        description: `${contact.role}`,
        messages: []
      };

      setConversations((prev) => [newChat, ...prev]);
      setActiveChatId(newId);
    }

    setMobileView('conversation');
  };

  // Group chat creation
  const handleCreateGroupChat = (groupName: string, selectedMembers: string[]) => {
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
          isOutgoing: false
        }
      ]
    };

    setConversations((prev) => [newGroup, ...prev]);
    setActiveChatId(newId);
    setMobileView('conversation');
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#111B21] text-[#E9EDEF] font-['Segoe_UI',Helvetica,Arial,sans-serif] select-none">
      
      {/* 1. Far-Left Navigation Rail (Fixed 56px / w-14) */}
      <ChatNavigationRail
        activeTab={activeRailTab}
        onSelectTab={(tab) => {
          setActiveRailTab(tab);
          if (tab === 'status') {
            setActiveChatId(null);
          }
        }}
        unreadCount={25}
      />

      {/* 2. Left Sidebar (Chats list or Status list or New Chat) */}
      <div
        className={`h-full shrink-0 ${
          mobileView === 'sidebar' ? 'w-full' : 'hidden'
        } md:block md:w-[410px] lg:w-[440px]`}
      >
        <ChatSidebar
          conversations={conversations}
          activeChatId={activeChatId}
          activeRailTab={activeRailTab}
          onSelectChat={handleSelectChat}
          onStartDirectChat={handleStartDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
          onBackToDashboard={() => navigate('/employee-login')}
        />
      </div>

      {/* 3. Right Pane: Active Conversation or Welcome Screen with 4 Action Buttons */}
      <div
        className={`h-full flex-1 ${
          mobileView === 'conversation' && activeConversation ? 'w-full' : 'hidden'
        } md:flex flex-col bg-[#111B21]`}
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
          />
        ) : (
          <ChatWelcomeScreen
            railTab={activeRailTab}
            onOpenNewChat={() => {
              setActiveRailTab('chats');
            }}
            onSendDocument={() => {
              if (conversations.length > 0) {
                handleSelectChat(conversations[0].id);
              }
            }}
            onAskMetaAi={() => {
              setActiveRailTab('meta_ai');
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
          onSelectMemberChat={(name) => {
            setShowGroupInfo(false);
            handleStartDirectChat({ name, role: 'Team Member' });
          }}
        />
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <ChatNewChatModal
          onClose={() => setShowNewChatModal(false)}
          onStartDirectChat={handleStartDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
        />
      )}

    </div>
  );
};

export default ChatPage;
