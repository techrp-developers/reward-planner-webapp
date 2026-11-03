// src/modules/chat/components/ChatNavigationRail.tsx
import React, { useState, useEffect } from 'react';
import {
  MessageCircleMore,
  Aperture,
} from 'lucide-react';
import { RailTab } from '../chatTypes';
import { getCurrentUserProfile, UserProfileData } from '../services/chatApi';

interface ChatNavigationRailProps {
  activeTab: RailTab;
  onSelectTab: (tab: RailTab) => void;
  unreadCount?: number;
  userProfile?: UserProfileData;
}

export const ChatNavigationRail: React.FC<ChatNavigationRailProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
  userProfile: propProfile,
}) => {
  const [profile, setProfile] = useState<UserProfileData>(() => propProfile || getCurrentUserProfile());

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
    } else {
      setProfile(getCurrentUserProfile());
    }
  }, [propProfile]);

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SC';

  return (
    <nav className="chat-rail w-14 h-full border-r border-[#CBD5E1] flex flex-col items-center justify-between py-3 select-none shrink-0 z-30 font-['Segoe_UI',Helvetica,Arial,sans-serif]">
      
      {/* Top Icons: Only Chats and Status */}
      <div className="flex flex-col items-center space-y-3 w-full pt-2">
        {/* 1. Chats Tab */}
        <div className="relative">
          <button
            onClick={() => onSelectTab('chats')}
            title="Chats"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'chats'
                ? 'bg-white/25 text-white'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <MessageCircleMore className="w-[22px] h-[22px] stroke-[1.75]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[16px] px-1 rounded-full bg-[#4F46E5] text-white font-bold text-[9px] flex items-center justify-center shadow-xs leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 2. Status Tab */}
        <div className="relative">
          <button
            onClick={() => onSelectTab(activeTab === 'status' ? 'chats' : 'status')}
            title="Status"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer relative ${
              activeTab === 'status'
                ? 'bg-white/25 text-white'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Aperture className="w-[22px] h-[22px] stroke-[1.75]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#25D366] border border-white" />
          </button>
        </div>
      </div>

      {/* Bottom Profile Icon: Dynamic Profile */}
      <div className="flex flex-col items-center space-y-2 w-full pb-2">
        <button
          onClick={() => onSelectTab(activeTab === 'profile' ? 'chats' : 'profile')}
          title={profile.name ? `${profile.name} (Profile)` : 'Profile'}
          className={`relative w-10 h-10 rounded-full bg-white shadow-sm transition cursor-pointer flex items-center justify-center ${
            activeTab === 'profile'
              ? 'ring-2 ring-[#B63EEE]'
              : 'ring-2 ring-white hover:opacity-90'
          }`}
        >
          {profile.userImage ? (
            <img
              src={profile.userImage}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <span>{initials}</span>
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-white" />
        </button>
      </div>

    </nav>
  );
};

export default ChatNavigationRail;
