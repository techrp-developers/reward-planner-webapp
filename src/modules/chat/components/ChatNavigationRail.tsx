// src/modules/chat/components/ChatNavigationRail.tsx
import React from 'react';
import {
  MessageSquare,
  Phone,
  CircleDot,
  Users,
  Compass,
  Star,
  Settings,
  Sparkles
} from 'lucide-react';
import { RailTab } from '../chatTypes';

interface ChatNavigationRailProps {
  activeTab: RailTab;
  onSelectTab: (tab: RailTab) => void;
  unreadCount?: number;
}



export const ChatNavigationRail: React.FC<ChatNavigationRailProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 25,
}) => {
  return (
    <nav className="w-14 h-full bg-[#111B21] border-r border-[#202C33] flex flex-col items-center justify-between py-3 select-none shrink-0 z-30">
      
      {/* Top Icons: Only Chats Icon and Status Icon */}
      <div className="flex flex-col items-center space-y-3 w-full pt-1">
        {/* 1. Chats Tab with Green Notification Badge */}
        <div className="relative">
          <button
            onClick={() => onSelectTab('chats')}
            title="Chats"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'chats'
                ? 'bg-[#202C33] text-[#00A884]'
                : 'text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33]'
            }`}
          >
            <MessageSquare className="w-5 h-5 stroke-[1.8]" />
            {/* 25 Unread Badge matching screenshot */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#25D366] text-[#111B21] font-bold text-[10px] flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 2. Status Tab */}
        <button
          onClick={() => onSelectTab('status')}
          title="Status"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
            activeTab === 'status'
              ? 'bg-[#202C33] text-[#00A884]'
              : 'text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33]'
          }`}
        >
          <CircleDot className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center space-y-2 w-full">
        {/* Starred Messages */}
        <button
          title="Starred messages"
          className="w-10 h-10 rounded-xl text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#202C33] flex items-center justify-center transition cursor-pointer"
        >
          <Star className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Profile / Settings */}
        <div
          title="Profile & Settings"
          className="w-8 h-8 rounded-full bg-[#202C33] border border-gray-600 flex items-center justify-center text-[#00A884] font-bold text-xs cursor-pointer hover:ring-2 hover:ring-[#00A884] transition"
        >
          SC
        </div>
      </div>

    </nav>
  );
};

export default ChatNavigationRail;
