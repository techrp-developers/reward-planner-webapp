// src/modules/chat/components/ChatWelcomeScreen.tsx
import React from 'react';
import {
  FileText,
  UserPlus,
  Mail,
  CircleDot,
  PenTool,
  Camera,
  Share2
} from 'lucide-react';
import { RailTab } from '../chatTypes';

interface ChatWelcomeScreenProps {
  railTab?: RailTab;
  onOpenNewChat: () => void;
  onSendDocument?: () => void;
  onAskMetaAi?: () => void;
}

// Meta AI Custom Purple/Gradient Spiral Flower Icon
const MetaAiIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="metaAiGradWelcome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="50%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#7E22CE" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#metaAiGradWelcome)" strokeWidth="2.5" strokeDasharray="3 3" />
    <circle cx="12" cy="12" r="5" stroke="url(#metaAiGradWelcome)" strokeWidth="2" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="2" fill="url(#metaAiGradWelcome)" />
  </svg>
);

export const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({
  railTab = 'chats',
  onOpenNewChat,
  onSendDocument,
  onAskMetaAi,
}) => {
  // If user is on "Status" tab (Image 3)
  if (railTab === 'status') {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#111B21] text-[#E9EDEF] p-8 select-none">
        <div className="flex flex-col items-center max-w-md text-center animate-fadeIn">
          {/* Segmented status rings graphic */}
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#8696A0]/40 flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full border-2 border-[#8696A0]/60 flex items-center justify-center">
              <CircleDot className="w-6 h-6 text-[#8696A0]" />
            </div>
          </div>

          <h2 className="text-3xl font-light tracking-tight text-[#E9EDEF] mb-3">
            Share statuses
          </h2>
          <p className="text-sm text-[#8696A0] leading-relaxed mb-8 max-w-sm">
            Share photos, videos and text that disappear after 24 hours.
          </p>

          {/* Two action buttons */}
          <div className="flex items-center space-x-8">
            <button
              onClick={onOpenNewChat}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#202C33] group-hover:bg-[#2A3942] text-[#E9EDEF] flex items-center justify-center transition shadow-md group-hover:scale-105 active:scale-95 mb-2">
                <PenTool className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-xs text-[#8696A0] group-hover:text-[#E9EDEF] transition">
                Text status
              </span>
            </button>

            <button
              onClick={onSendDocument}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#202C33] group-hover:bg-[#2A3942] text-[#E9EDEF] flex items-center justify-center transition shadow-md group-hover:scale-105 active:scale-95 mb-2">
                <Camera className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-xs text-[#8696A0] group-hover:text-[#E9EDEF] transition">
                Photo and video
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Chats Welcome Screen (Matching Image 1 & 2 exactly)
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#111B21] text-[#E9EDEF] p-8 select-none">
      <div className="flex items-center justify-center space-x-6 sm:space-x-8 animate-fadeIn">
        
        {/* 1. Send Document */}
        <button
          onClick={onSendDocument}
          className="flex flex-col items-center group cursor-pointer transition transform active:scale-95"
        >
          <div className="w-14 h-14 rounded-full bg-[#202C33] group-hover:bg-[#2A3942] text-[#E9EDEF] flex items-center justify-center transition shadow-md group-hover:scale-105 mb-2.5">
            <FileText className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-xs text-[#8696A0] group-hover:text-[#E9EDEF] transition font-normal whitespace-nowrap">
            Send document
          </span>
        </button>

        {/* 2. Add Contact */}
        <button
          onClick={onOpenNewChat}
          className="flex flex-col items-center group cursor-pointer transition transform active:scale-95"
        >
          <div className="w-14 h-14 rounded-full bg-[#202C33] group-hover:bg-[#2A3942] text-[#E9EDEF] flex items-center justify-center transition shadow-md group-hover:scale-105 mb-2.5">
            <UserPlus className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-xs text-[#8696A0] group-hover:text-[#E9EDEF] transition font-normal whitespace-nowrap">
            Add contact
          </span>
        </button>

        {/* 3. Invite a friend */}
        <button
          onClick={onOpenNewChat}
          className="flex flex-col items-center group cursor-pointer transition transform active:scale-95"
        >
          <div className="w-14 h-14 rounded-full bg-[#202C33] group-hover:bg-[#2A3942] text-[#E9EDEF] flex items-center justify-center transition shadow-md group-hover:scale-105 mb-2.5">
            <Mail className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-xs text-[#8696A0] group-hover:text-[#E9EDEF] transition font-normal whitespace-nowrap">
            Invite a friend
          </span>
        </button>

        {/* 4. Ask Meta AI */}
        <button
          onClick={onAskMetaAi}
          className="flex flex-col items-center group cursor-pointer transition transform active:scale-95"
        >
          <div className="w-14 h-14 rounded-full bg-[#202C33] group-hover:bg-[#2A3942] text-purple-400 flex items-center justify-center transition shadow-md group-hover:scale-105 mb-2.5">
            <MetaAiIcon className="w-6 h-6" />
          </div>
          <span className="text-xs text-[#8696A0] group-hover:text-purple-300 transition font-normal whitespace-nowrap">
            Ask Meta AI
          </span>
        </button>

      </div>
    </div>
  );
};

export default ChatWelcomeScreen;
