// src/modules/chat/components/ChatGroupInfoModal.tsx
import React from 'react';
import { X, Users, Phone, Video, Shield, UserPlus, Image as ImageIcon, Bell, Search } from 'lucide-react';
import { ChatConversation } from '../chatTypes';

interface ChatGroupInfoModalProps {
  conversation: ChatConversation;
  onClose: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onSelectMemberChat: (memberName: string) => void;
}

export const ChatGroupInfoModal: React.FC<ChatGroupInfoModalProps> = ({
  conversation,
  onClose,
  onAudioCall,
  onVideoCall,
  onSelectMemberChat,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-md h-full bg-[#111B21] flex flex-col shadow-2xl overflow-hidden border-l border-[#202C33] text-[#E9EDEF]">
        
        {/* Header */}
        <div className="h-16 px-4 bg-[#202C33] border-b border-[#202C33] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-[#E9EDEF]">
              {conversation.isGroup ? 'Group Info' : 'Contact Info'}
            </h2>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll divide-y divide-[#202C33]">
          
          {/* Main profile card */}
          <div className="bg-[#111B21] p-6 flex flex-col items-center text-center">
            <div className="relative mb-3">
              {conversation.avatarIconType === 'image' && conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-28 h-28 rounded-full object-cover shadow-sm border-2 border-gray-700"
                />
              ) : (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#0F382E' }}
                  className="w-28 h-28 rounded-full flex items-center justify-center text-[#00A884] shadow-sm"
                >
                  <Users className="w-14 h-14 stroke-[1.8]" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-[#E9EDEF]">{conversation.name}</h3>
            <p className="text-xs text-[#8696A0] mt-0.5">
              {conversation.isGroup
                ? `Group • ${conversation.membersCount || conversation.members?.length || 0} members`
                : 'Direct Message'}
            </p>

            {/* Call action buttons */}
            <div className="flex items-center space-x-4 mt-5">
              <button
                onClick={onAudioCall}
                className="flex flex-col items-center justify-center p-3 w-20 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-[#00A884] transition cursor-pointer"
              >
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Audio</span>
              </button>

              <button
                onClick={onVideoCall}
                className="flex flex-col items-center justify-center p-3 w-20 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-[#00A884] transition cursor-pointer"
              >
                <Video className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Video</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {conversation.description && (
            <div className="bg-[#111B21] p-4">
              <h4 className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider mb-1">About</h4>
              <p className="text-sm text-[#E9EDEF]">{conversation.description}</p>
            </div>
          )}

          {/* Media, links and docs */}
          <div className="bg-[#111B21] p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider">
                Media, Links and Docs
              </h4>
              <span className="text-xs text-[#00A884] font-medium cursor-pointer hover:underline">
                12 items
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-video bg-[#381E2B] rounded-lg overflow-hidden flex items-center justify-center text-[#E879F9] text-[10px] font-bold p-1 text-center shadow-xs">
                Festive Banner
              </div>
              <div className="aspect-video bg-[#202C33] rounded-lg flex items-center justify-center text-[#00A884] text-[10px] font-semibold p-1 text-center">
                Design Hand-off
              </div>
              <div className="aspect-video bg-[#202C33] rounded-lg flex items-center justify-center text-[#53BDEB] text-[10px] font-semibold p-1 text-center">
                Report.pdf
              </div>
            </div>
          </div>

          {/* Group members list */}
          {conversation.isGroup && conversation.members && (
            <div className="bg-[#111B21] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[#8696A0] uppercase tracking-wider">
                  {conversation.members.length} Members
                </h4>
                <button className="text-xs text-[#00A884] font-medium flex items-center space-x-1 hover:underline cursor-pointer">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="divide-y divide-[#202C33]">
                {conversation.members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => onSelectMemberChat(member.name)}
                    className="flex items-center justify-between py-2.5 hover:bg-[#202C33] px-2 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            style={{ backgroundColor: (member.color || '#00A884') + '20', color: member.color || '#00A884' }}
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          >
                            {member.name.charAt(0)}
                          </div>
                        )}
                        {member.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00A884] border-2 border-[#111B21] rounded-full" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="text-sm font-semibold text-[#E9EDEF]">{member.name}</p>
                          {member.role.toLowerCase().includes('lead') && (
                            <span className="px-1.5 py-0.2 bg-[#00A884]/20 text-[#00A884] text-[10px] font-bold rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8696A0]">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ChatGroupInfoModal;
