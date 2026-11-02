// src/modules/chat/components/ChatGroupInfoModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Phone,
  Video,
  Shield,
  UserPlus,
  LogOut,
  Search,
  Check,
  Loader2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ChatConversation } from '../chatTypes';
import {
  fetchChatUsers,
  addGroupMembersApi,
  leaveGroupApi,
  BackendChatUser,
  getCurrentUserId
} from '../services/chatApi';

interface ChatGroupInfoModalProps {
  conversation: ChatConversation;
  onClose: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onSelectMemberChat: (contact: { name: string; avatar?: string; role: string; userId?: number }) => void;
  onRefreshGroup?: () => void;
  onLeaveGroupSuccess?: () => void;
  onOpenDisappearingModal?: () => void;
}

export const ChatGroupInfoModal: React.FC<ChatGroupInfoModalProps> = ({
  conversation,
  onClose,
  onAudioCall,
  onVideoCall,
  onSelectMemberChat,
  onRefreshGroup,
  onLeaveGroupSuccess,
  onOpenDisappearingModal,
}) => {
  const currentUserId = getCurrentUserId();
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<BackendChatUser[]>([]);
  const [addSearch, setAddSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (showAddMember) {
      fetchChatUsers()
        .then((users) => {
          // Filter out users already in the group
          const existingIds = new Set(
            (conversation.members || []).map((m) => m.userId || Number(m.id))
          );
          setAvailableUsers(users.filter((u) => !existingIds.has(u.user_id)));
        })
        .catch((err) => console.warn('Failed to load users to add:', err));
    }
  }, [showAddMember, conversation.members]);

  const handleAddMember = async (userId: number) => {
    try {
      setIsAdding(true);
      const convId = Number(conversation.id);
      if (Number.isSafeInteger(convId)) {
        await addGroupMembersApi(convId, [userId]);
        setShowAddMember(false);
        onRefreshGroup?.();
      }
    } catch (err) {
      console.error('Failed to add group member:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm(`Are you sure you want to leave "${conversation.name}"?`)) return;
    try {
      setIsLeaving(true);
      const convId = Number(conversation.id);
      if (Number.isSafeInteger(convId)) {
        await leaveGroupApi(convId);
        onLeaveGroupSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
    } finally {
      setIsLeaving(false);
    }
  };

  const filteredAvailable = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(addSearch.toLowerCase()) ||
      u.department?.toLowerCase().includes(addSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(addSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-md h-full bg-[#F1F5F9] flex flex-col shadow-2xl overflow-hidden border-l border-[#CBD5E1] text-[#0F172A]">
        
        {/* Header */}
        <div className="h-16 px-4 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-[#0F172A]">
              {conversation.isGroup ? 'Group Info' : 'Contact Info'}
            </h2>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll divide-y divide-[#E2E8F0]">
          
          {/* Main profile card */}
          <div className="bg-white p-6 flex flex-col items-center text-center shadow-xs">
            <div className="relative mb-3">
              {conversation.avatarIconType === 'image' && conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-gray-200"
                />
              ) : (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#EEF2FF' }}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-[#4F46E5] shadow-sm"
                >
                  <Users className="w-12 h-12 stroke-[1.8]" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-[#0F172A]">{conversation.name}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {conversation.isGroup
                ? `Group • ${conversation.membersCount || conversation.members?.length || 0} members`
                : 'Direct Message'}
            </p>

            {/* Call action buttons */}
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={onAudioCall}
                className="flex flex-col items-center justify-center p-2.5 w-20 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4F46E5] transition cursor-pointer border border-[#E2E8F0]"
              >
                <Phone className="w-4.5 h-4.5 mb-1" />
                <span className="text-xs font-semibold">Audio</span>
              </button>

              <button
                onClick={onVideoCall}
                className="flex flex-col items-center justify-center p-2.5 w-20 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4F46E5] transition cursor-pointer border border-[#E2E8F0]"
              >
                <Video className="w-4.5 h-4.5 mb-1" />
                <span className="text-xs font-semibold">Video</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {conversation.description && (
            <div className="bg-white p-4 shadow-xs mt-2">
              <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">About</h4>
              <p className="text-sm text-[#0F172A]">{conversation.description}</p>
            </div>
          )}

          {/* Privacy & Settings (Disappearing Messages) */}
          <div className="bg-white p-4 shadow-xs mt-2">
            <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Settings & Privacy
            </h4>
            <div
              onClick={onOpenDisappearingModal}
              className="flex items-center justify-between p-2.5 -mx-1 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
              title="Configure disappearing messages"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00A884] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Disappearing messages</p>
                  <p className="text-xs text-[#64748B]">
                    {conversation.disappearingTimer && conversation.disappearingTimer !== 'off'
                      ? conversation.disappearingTimer === '24_hours'
                        ? '24 hours'
                        : conversation.disappearingTimer === '7_days'
                        ? '7 days'
                        : '90 days'
                      : 'Off'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {conversation.disappearingTimer && conversation.disappearingTimer !== 'off' && (
                  <span className="text-[11px] font-semibold text-[#00A884] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Active
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Group members list */}
          {conversation.isGroup && (
            <div className="bg-white p-4 shadow-xs mt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  {conversation.members?.length || conversation.membersCount || 0} Members
                </h4>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="text-xs text-[#4F46E5] font-medium flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              {/* Add member inline modal/flyout */}
              {showAddMember && (
                <div className="mb-4 p-3 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0F172A]">Add Coworker to Group</span>
                    <button
                      onClick={() => setShowAddMember(false)}
                      className="text-[#64748B] hover:text-[#0F172A] text-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center bg-white rounded-full px-3 py-1 mb-2 border border-[#CBD5E1]">
                    <Search className="w-3.5 h-3.5 text-[#64748B] mr-2" />
                    <input
                      type="text"
                      value={addSearch}
                      onChange={(e) => setAddSearch(e.target.value)}
                      placeholder="Search colleagues..."
                      className="w-full bg-transparent text-xs text-[#0F172A] placeholder-[#64748B] focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto chat-custom-scroll divide-y divide-[#E2E8F0]">
                    {filteredAvailable.length === 0 ? (
                      <p className="text-[11px] text-[#64748B] py-3 text-center">No matching colleagues found</p>
                    ) : (
                      filteredAvailable.slice(0, 15).map((user) => (
                        <div
                          key={user.user_id}
                          onClick={() => handleAddMember(user.user_id)}
                          className="flex items-center justify-between py-2 px-1 hover:bg-[#E2E8F0] rounded-lg cursor-pointer"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            {user.user_image ? (
                              <img src={user.user_image} alt={user.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#4F46E5]/15 text-[#4F46E5] flex items-center justify-center font-bold text-xs shrink-0">
                                {user.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#0F172A] truncate">{user.name}</p>
                              <p className="text-[10px] text-[#64748B] truncate">{user.role || user.department}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#4F46E5] font-bold shrink-0">Add</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="divide-y divide-[#E2E8F0]">
                {(conversation.members || []).map((member) => {
                  const isMe = Number(member.userId || member.id) === Number(currentUserId);
                  const isAdmin = member.role.toLowerCase().includes('admin');

                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        if (!isMe) {
                          onSelectMemberChat({
                            name: member.name,
                            avatar: member.avatar,
                            role: member.role,
                            userId: member.userId ? Number(member.userId) : Number(member.id),
                          });
                        }
                      }}
                      className="flex items-center justify-between py-2.5 hover:bg-[#F1F5F9] px-2 rounded-lg cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              style={{ backgroundColor: (member.color || '#4F46E5') + '20', color: member.color || '#4F46E5' }}
                              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                            >
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <p className="text-sm font-semibold text-[#0F172A]">
                              {member.name} {isMe ? '(You)' : ''}
                            </p>
                            {isAdmin && (
                              <span className="px-1.5 py-0.2 bg-[#4F46E5]/15 text-[#4F46E5] text-[10px] font-bold rounded">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B]">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group Leave Action */}
          {conversation.isGroup && (
            <div className="bg-white p-4 mt-2">
              <button
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLeaving ? 'Leaving Group...' : 'Exit Group'}</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ChatGroupInfoModal;
