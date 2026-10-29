// src/modules/chat/components/ChatSidebar.tsx
import React, { useState } from 'react';
import {
  Search,
  MoreVertical,
  Plus,
  ArrowLeft,
  VolumeX,
  Users,
  Grid,
  CircleDot,
  Check,
  CheckCheck,
  UserPlus,
  Megaphone
} from 'lucide-react';
import { ChatConversation, ChatFilterTab, RailTab, StatusItem } from '../chatTypes';
import { NEW_CHAT_CONTACTS, STATUS_ITEMS } from '../chatData';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeChatId: string | null;
  activeRailTab: RailTab;
  onSelectChat: (chatId: string) => void;
  onStartDirectChat: (contact: { name: string; avatar?: string; role: string }) => void;
  onCreateGroupChat: (groupName: string, selectedMembers: string[]) => void;
  onBackToDashboard?: () => void;
}

// Purple Group Icon matching Image 1
const PurpleGroupIcon = ({ className = "w-5 h-5 text-[#E879F9]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeChatId,
  activeRailTab,
  onSelectChat,
  onStartDirectChat,
  onCreateGroupChat,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showingNewChatView, setShowingNewChatView] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 1. RENDER STATUS VIEW (Matching Image 3)
  // ─────────────────────────────────────────────────────────────
  if (activeRailTab === 'status') {
    return (
      <aside className="w-full h-full flex flex-col bg-[#111B21] border-r border-[#202C33] select-none text-[#E9EDEF]">
        {/* Header with Back Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#202C33]">
          <div className="flex items-center space-x-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                title="Back"
                aria-label="Back"
                className="p-1.5 -ml-1.5 rounded-full text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33] transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-[#E9EDEF]">Status</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {}}
              title="Add Status"
              className="w-8 h-8 rounded-full border border-gray-600 hover:bg-[#202C33] text-[#00A884] flex items-center justify-center transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#202C33] text-[#8696A0] flex items-center justify-center transition cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status List */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll p-3 space-y-4">
          {/* My Status */}
          <div className="flex items-center space-x-3.5 p-2 rounded-xl hover:bg-[#202C33] cursor-pointer transition">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#B45309] text-amber-200 flex items-center justify-center font-bold text-sm">
                SC
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00A884] text-[#111B21] flex items-center justify-center font-bold text-xs border border-[#111B21]">
                +
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#E9EDEF]">My status</h3>
              <p className="text-xs text-[#8696A0]">Click to add status update</p>
            </div>
          </div>

          {/* Recent Updates */}
          <div>
            <h4 className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider px-2 mb-2">
              Recent
            </h4>
            <div className="space-y-1">
              {STATUS_ITEMS.filter((s) => !s.isViewed).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3.5 p-2 rounded-xl hover:bg-[#202C33] cursor-pointer transition"
                >
                  <div className="relative">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#00A884] p-0.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold text-[#E9EDEF] truncate">{item.name}</h5>
                    <p className="text-xs text-[#8696A0] truncate">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Viewed Updates */}
          <div>
            <h4 className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider px-2 mb-2">
              Viewed
            </h4>
            <div className="space-y-1">
              {STATUS_ITEMS.filter((s) => s.isViewed).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3.5 p-2 rounded-xl hover:bg-[#202C33] cursor-pointer transition"
                >
                  <div className="relative">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-600 p-0.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold text-[#E9EDEF] truncate">{item.name}</h5>
                    <p className="text-xs text-[#8696A0] truncate">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RENDER NEW CHAT VIEW (Matching Image 2)
  // ─────────────────────────────────────────────────────────────
  if (showingNewChatView) {
    const filteredContacts = NEW_CHAT_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(newChatSearch.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(newChatSearch.toLowerCase())
    );

    return (
      <aside className="w-full h-full flex flex-col bg-[#111B21] border-r border-[#202C33] select-none text-[#E9EDEF] animate-fadeIn">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#202C33]">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowingNewChatView(false)}
              className="p-1 rounded-full text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-[#E9EDEF]">New chat</h1>
          </div>
          <button className="text-[#8696A0] hover:text-[#E9EDEF] p-1.5 rounded-full hover:bg-[#202C33]">
            <Grid className="w-5 h-5" />
          </button>
        </div>

        {/* Search input with green outline */}
        <div className="p-3">
          <div className="relative flex items-center bg-[#202C33] rounded-full px-3.5 py-1.5 border border-[#00A884]">
            <Search className="w-4 h-4 text-[#8696A0] mr-2 shrink-0" />
            <input
              type="text"
              value={newChatSearch}
              onChange={(e) => setNewChatSearch(e.target.value)}
              placeholder="Search name, number or @username"
              className="w-full bg-transparent text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Actions & Contacts list */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll px-2 space-y-1">
          {/* Action 1: New Group */}
          <div
            onClick={() => {
              const name = prompt('Enter group name:');
              if (name) onCreateGroupChat(name, ['Rohit Mehta', 'Priya Sharma']);
              setShowingNewChatView(false);
            }}
            className="flex items-center space-x-3.5 p-2.5 rounded-xl hover:bg-[#202C33] cursor-pointer transition"
          >
            <div className="w-10 h-10 rounded-full bg-[#00A884] text-[#111B21] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-[#E9EDEF]">New group</span>
          </div>

          {/* Action 2: New Community */}
          <div className="flex items-center space-x-3.5 p-2.5 rounded-xl hover:bg-[#202C33] cursor-pointer transition">
            <div className="w-10 h-10 rounded-full bg-[#00A884] text-[#111B21] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-[#E9EDEF]">New community</span>
          </div>

          {/* Contacts List grouped with section headers */}
          {filteredContacts.map((contact, idx) => {
            const prev = filteredContacts[idx - 1];
            const showSectionHeader = !prev || prev.section !== contact.section;

            return (
              <React.Fragment key={contact.id}>
                {showSectionHeader && contact.section !== 'self' && (
                  <div className="px-3 pt-3 pb-1 text-xs font-bold text-[#00A884] uppercase tracking-wider">
                    {contact.section}
                  </div>
                )}
                <div
                  onClick={() => {
                    onStartDirectChat({ name: contact.name, avatar: contact.avatar, role: contact.subtitle || 'Contact' });
                    setShowingNewChatView(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#202C33] cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : contact.isSpecial ? (
                      <div className="w-10 h-10 rounded-full bg-[#B45309] text-amber-200 flex items-center justify-center font-bold shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#202C33] text-[#00A884] border border-[#00A884]/40 flex items-center justify-center font-bold text-sm shrink-0">
                        {contact.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#E9EDEF] truncate">{contact.name}</h4>
                      <p className="text-xs text-[#8696A0] truncate">{contact.subtitle}</p>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RENDER DEFAULT CHATS LIST (Matching Image 1)
  // ─────────────────────────────────────────────────────────────
  const filteredConversations = conversations.filter((chat) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!chat.name.toLowerCase().includes(q) && !chat.lastMessage.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (activeFilter === 'unread') return chat.unreadCount > 0;
    if (activeFilter === 'groups') return chat.isGroup;
    return true;
  });

  return (
    <aside className="w-full h-full flex flex-col bg-[#111B21] border-r border-[#202C33] select-none text-[#E9EDEF]">
      {/* 1. Header with Back Button, Chats Title, ⋮ Menu, and Green [ + ] Squircle Button */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#202C33]/60">
        <div className="flex items-center space-x-2">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              title="Back"
              aria-label="Back"
              className="p-1.5 -ml-1.5 rounded-full text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[#E9EDEF]">Chats</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Three dots menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full hover:bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF] flex items-center justify-center transition cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-10 w-48 bg-[#202C33] rounded-xl shadow-2xl border border-gray-700 py-1.5 z-50 animate-fadeIn text-sm text-[#E9EDEF]">
                  <button
                    onClick={() => { setMenuOpen(false); setShowingNewChatView(true); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] cursor-pointer"
                  >
                    New group
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setActiveFilter('unread'); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] cursor-pointer"
                  >
                    Unread chats
                  </button>
                  <div className="h-px bg-gray-700 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] text-gray-400 cursor-pointer"
                  >
                    Settings
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Green Squircle Button with [ + ] Plus Symbol (Exact Match to Image 1) */}
          <button
            onClick={() => setShowingNewChatView(true)}
            title="New chat"
            className="w-7.5 h-7.5 rounded-lg bg-[#00A884] hover:bg-[#009272] text-[#111B21] flex items-center justify-center shadow-md font-bold text-lg active:scale-95 transition cursor-pointer"
            aria-label="New chat"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="px-3 pt-2.5 pb-2">
        <div className="relative flex items-center bg-[#202C33] rounded-full px-3.5 py-1.5">
          <Search className="w-4 h-4 text-[#8696A0] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start a new chat"
            className="w-full bg-transparent text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Filter Tabs (All, Unread 26, Groups 5, +) */}
      <div className="px-3 pb-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar border-b border-[#202C33]/60">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#00A884] text-[#111B21]'
              : 'bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF]'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3.5 py-1 text-xs font-medium rounded-full transition cursor-pointer ${
            activeFilter === 'unread'
              ? 'bg-[#00A884] text-[#111B21] font-semibold'
              : 'bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF]'
          }`}
        >
          Unread 26
        </button>

        <button
          onClick={() => setActiveFilter('groups')}
          className={`px-3.5 py-1 text-xs font-medium rounded-full transition cursor-pointer ${
            activeFilter === 'groups'
              ? 'bg-[#00A884] text-[#111B21] font-semibold'
              : 'bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF]'
          }`}
        >
          Groups 5
        </button>

        <button
          onClick={() => {}}
          className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF] transition cursor-pointer"
        >
          +
        </button>
      </div>

      {/* 4. Chat Items List */}
      <div className="flex-1 overflow-y-auto chat-custom-scroll divide-y divide-[#202C33]/20">
        {filteredConversations.map((chat) => {
          const isActive = chat.id === activeChatId;

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center px-3.5 py-3 cursor-pointer transition relative ${
                isActive
                  ? 'bg-[#202C33]'
                  : 'hover:bg-[#202C33]/60 bg-[#111B21]'
              }`}
            >
              {/* Avatar */}
              <div className="relative mr-3.5 shrink-0">
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : chat.avatarIconType === 'purple_group' ? (
                  <div
                    style={{ backgroundColor: chat.avatarBg || '#381E2B' }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[#E879F9]"
                  >
                    <PurpleGroupIcon className="w-5 h-5 text-[#E879F9]" />
                  </div>
                ) : (
                  <div
                    style={{ backgroundColor: chat.avatarBg || '#0F382E' }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[#00A884]"
                  >
                    <Users className="w-5 h-5" />
                  </div>
                )}

                {/* Online indicator dot */}
                {chat.type === 'direct' && chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00A884] border-2 border-[#111B21] rounded-full" />
                )}
              </div>

              {/* Chat details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-semibold text-[#E9EDEF] truncate">
                    {chat.name}
                  </h3>
                  <span
                    className={`text-[11px] shrink-0 ${
                      chat.unreadCount > 0 ? 'text-[#00A884] font-medium' : 'text-[#8696A0]'
                    }`}
                  >
                    {chat.lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#8696A0] truncate max-w-[210px]">
                    {chat.lastMessage}
                  </p>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {/* Mute Icon */}
                    {chat.isMuted && (
                      <VolumeX className="w-3.5 h-3.5 text-[#8696A0]" />
                    )}

                    {/* Unread Pill */}
                    {chat.unreadCount > 0 && (
                      <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#00A884] text-[#111B21] text-[11px] font-bold flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ChatSidebar;
