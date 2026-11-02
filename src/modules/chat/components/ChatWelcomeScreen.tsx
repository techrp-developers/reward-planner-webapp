// src/modules/chat/components/ChatWelcomeScreen.tsx
import React, { useState } from 'react';
import {
  FileText,
  Mail,
  CircleDot,
  PenTool,
  Camera,
  Lock,
  Check,
  User,
} from 'lucide-react';
import { RailTab } from '../chatTypes';

interface ChatWelcomeScreenProps {
  railTab?: RailTab;
  onOpenNewChat: () => void;
  onSendDocument?: () => void;
  onAskMetaAi?: () => void;
  onStartCall?: () => void;
  onInviteFriend?: () => void;
  onAddStatus?: () => void;
}

export const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({
  railTab = 'chats',
  onOpenNewChat,
  onSendDocument,
  onInviteFriend,
  onAddStatus,
}) => {
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleInvite = () => {
    if (onInviteFriend) {
      onInviteFriend();
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/employee-login/chat');
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  // If user is on "Status" tab
  if (railTab === 'status') {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#F1F5F9] text-[#0F172A] p-8 select-none font-['Segoe_UI',Helvetica,Arial,sans-serif]">
        <div className="flex flex-col items-center max-w-md text-center animate-fadeIn">
          {/* Segmented status rings graphic */}
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#4F46E5]/40 flex items-center justify-center mb-6 bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full border-2 border-[#4F46E5] flex items-center justify-center bg-[#EEF2FF]/30">
              <CircleDot className="w-6 h-6 text-[#4F46E5]" />
            </div>
          </div>

          <h2 className="text-2xl font-normal text-[#0F172A] mb-2">
            Share statuses
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed mb-6 max-w-sm">
            Share photos, videos and text that disappear after 24 hours.
          </p>

          {/* Two action buttons */}
          <div className="flex items-center space-x-8">
            <button
              onClick={onAddStatus || onOpenNewChat}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white group-hover:bg-[#F1F5F9] text-[#4F46E5] flex items-center justify-center transition shadow-sm border border-[#E2E8F0] group-hover:scale-105 active:scale-95 mb-2">
                <PenTool className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-xs text-[#475569] group-hover:text-[#0F172A] transition">
                Text status
              </span>
            </button>

            <button
              onClick={onAddStatus || onSendDocument}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white group-hover:bg-[#F1F5F9] text-[#4F46E5] flex items-center justify-center transition shadow-sm border border-[#E2E8F0] group-hover:scale-105 active:scale-95 mb-2">
                <Camera className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-xs text-[#475569] group-hover:text-[#0F172A] transition">
                Photo and video
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is on "Profile" tab
  if (railTab === 'profile') {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#F1F5F9] text-[#0F172A] p-8 select-none font-['Segoe_UI',Helvetica,Arial,sans-serif]">
        <div className="flex flex-col items-center max-w-md text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center mb-6 shadow-sm">
            <User className="w-10 h-10 text-[#4F46E5]" />
          </div>
          <h2 className="text-2xl font-normal text-[#0F172A] mb-2">
            Employee Profile
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed max-w-sm mb-6">
            View your registered corporate details, department, about status, and contact information.
          </p>
          <div className="text-xs text-[#94A3B8] flex items-center space-x-1.5 bg-white/70 px-4 py-2 rounded-full border border-[#E2E8F0]">
            <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Profile details are synced with your Reward Planners corporate account</span>
          </div>
        </div>
      </div>
    );
  }

  // Chats Welcome Screen: Calling announcement card removed,
  // Add contact, New call, and Ask Meta AI removed.
  // Cleanly displays Send document and Invite a friend with WhatsApp encryption watermark.
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#F1F5F9] text-[#0F172A] p-8 select-none relative font-['Segoe_UI',Helvetica,Arial,sans-serif]">
      <div className="flex flex-col items-center justify-center animate-fadeIn w-full max-w-lg">
        
        {/* Quick Actions: Send document & Invite a friend */}
        <div className="flex items-center justify-center space-x-10 sm:space-x-12">
          
          {/* 1. Send Document */}
          <button
            onClick={onSendDocument}
            className="flex flex-col items-center group cursor-pointer transition transform active:scale-95"
            title="Send document"
          >
            <div className="w-14 h-14 rounded-full bg-white group-hover:bg-[#F8FAFC] text-[#475569] group-hover:text-[#4F46E5] flex items-center justify-center transition shadow-sm border border-[#E2E8F0] group-hover:scale-105 mb-2.5">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="text-xs text-[#475569] group-hover:text-[#0F172A] transition font-medium whitespace-nowrap">
              Send document
            </span>
          </button>

          {/* 2. Invite a friend */}
          <button
            onClick={handleInvite}
            className="flex flex-col items-center group cursor-pointer transition transform active:scale-95 relative"
            title="Invite a friend"
          >
            <div className="w-14 h-14 rounded-full bg-white group-hover:bg-[#F8FAFC] text-[#475569] group-hover:text-[#4F46E5] flex items-center justify-center transition shadow-sm border border-[#E2E8F0] group-hover:scale-105 mb-2.5">
              {copiedInvite ? (
                <Check className="w-6 h-6 stroke-[2.2] text-[#4F46E5]" />
              ) : (
                <Mail className="w-6 h-6 stroke-[1.8]" />
              )}
            </div>
            <span className="text-xs text-[#475569] group-hover:text-[#0F172A] transition font-medium whitespace-nowrap">
              {copiedInvite ? 'Link copied!' : 'Invite a friend'}
            </span>
          </button>

        </div>

        {/* WhatsApp Web End-to-end Encrypted footer note */}
        <div className="mt-14 flex items-center space-x-2 text-xs text-[#94A3B8]">
          <Lock className="w-3.5 h-3.5 stroke-[2]" />
          <span>Your personal messages are end-to-end encrypted</span>
        </div>

      </div>
    </div>
  );
};

export default ChatWelcomeScreen;
