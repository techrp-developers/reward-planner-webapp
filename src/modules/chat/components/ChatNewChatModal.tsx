// src/modules/chat/components/ChatNewChatModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, Users, UserPlus, Check, Loader2, Sparkles, ArrowRight, ArrowLeft, Camera, Pencil } from 'lucide-react';
import { fetchChatUsers } from '../services/chatApi';
import { adaptChatUserToContact } from '../services/chatAdapter';
import { SidebarContact } from '../chatTypes';

interface ChatNewChatModalProps {
  onClose: () => void;
  onStartDirectChat: (contact: { name: string; avatar?: string; role: string; userId?: number }) => void;
  onCreateGroupChat: (groupName: string, selectedMembers: string[], memberUserIds?: number[]) => void;
  onCreateCommunityChat?: (communityName: string, description: string, selectedMembers: string[], memberUserIds?: number[]) => void;
}

export const ChatNewChatModal: React.FC<ChatNewChatModalProps> = ({
  onClose,
  onStartDirectChat,
  onCreateGroupChat,
  onCreateCommunityChat,
}) => {
  const [search, setSearch] = useState('');
  const [creationMode, setCreationMode] = useState<'none' | 'group' | 'community'>('none');
  const [modalStep, setModalStep] = useState<'members' | 'details'>('members');
  const isCreatingGroup = creationMode === 'group';
  const isCreatingCommunity = creationMode === 'community';

  const [groupName, setGroupName] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communityDesc, setCommunityDesc] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [coworkers, setCoworkers] = useState<SidebarContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchChatUsers()
      .then((users) => {
        if (mounted) {
          setCoworkers(users.map(adaptChatUserToContact));
        }
      })
      .catch((err) => {
        console.warn('Failed to load chat users in modal:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = coworkers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContacts = coworkers.filter((c) =>
    c.userId ? selectedUserIds.includes(c.userId) : false
  );

  const toggleSelect = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFinishGroup = () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    const names = selectedContacts.map((c) => c.name);
    onCreateGroupChat(groupName.trim(), names, selectedUserIds);
    onClose();
  };

  const handleFinishCommunity = () => {
    const name = communityName.trim();
    if (!name || selectedUserIds.length === 0) return;
    const names = selectedContacts.map((c) => c.name);
    if (onCreateCommunityChat) {
      onCreateCommunityChat(name, communityDesc.trim(), names, selectedUserIds);
    } else {
      onCreateGroupChat(name, names, selectedUserIds);
    }
    onClose();
  };

  const handleBack = () => {
    if (modalStep === 'details') {
      setModalStep('members');
    } else if (creationMode !== 'none') {
      setCreationMode('none');
      setModalStep('members');
      setSelectedUserIds([]);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-[#E2E8F0] text-[#0F172A]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#0F172A] flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {creationMode !== 'none' && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-slate-200 text-[#475569] transition cursor-pointer shrink-0"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#0F172A] truncate">
                  {isCreatingCommunity
                    ? modalStep === 'details'
                      ? 'New Community'
                      : 'Add Community Members'
                    : isCreatingGroup
                    ? modalStep === 'details'
                      ? 'New Group'
                      : 'Add Group Members'
                    : 'New Chat'}
                </h2>
                {isCreatingCommunity && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Team
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] truncate">
                {isCreatingCommunity
                  ? modalStep === 'details'
                    ? 'Name community & set guidelines'
                    : `${selectedUserIds.length} colleagues invited`
                  : isCreatingGroup
                  ? modalStep === 'details'
                    ? 'Provide a group subject'
                    : `${selectedUserIds.length} of ${coworkers.length} selected`
                  : 'Select coworker to start chatting'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E2E8F0] text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── STAGE 2: DETAILS SCREEN IN MODAL ── */}
        {creationMode !== 'none' && modalStep === 'details' ? (
          <div className="p-4 space-y-4 overflow-y-auto chat-custom-scroll max-h-[60vh]">
            {isCreatingGroup ? (
              <>
                <div className="flex flex-col items-center justify-center pt-1 pb-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white shadow-sm">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs text-[#64748B] mt-1.5">Group icon (optional)</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
                    Group Subject / Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && groupName.trim()) handleFinishGroup();
                    }}
                    placeholder="Provide a group name (e.g. Design Sync)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] focus:bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    autoFocus
                    maxLength={60}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center pt-1 pb-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center text-white shadow-sm">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs text-[#059669] font-medium mt-1.5">Community Workspace</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="Provide community name (e.g. Engineering & Tech)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAFC] focus:bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] border border-[#A7F3D0] focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    autoFocus
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
                    Description & Guidelines
                  </label>
                  <textarea
                    value={communityDesc}
                    onChange={(e) => setCommunityDesc(e.target.value)}
                    placeholder="Community description or guidelines (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] focus:bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] border border-[#A7F3D0] focus:outline-none focus:ring-2 focus:ring-[#059669] resize-none"
                    maxLength={200}
                  />
                </div>
              </>
            )}

            {/* Participants Summary */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Participants ({selectedContacts.length})
                </span>
                <button
                  type="button"
                  onClick={() => setModalStep('members')}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                >
                  Edit members
                </button>
              </div>
              <div className="max-h-[160px] overflow-y-auto chat-custom-scroll p-2 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] space-y-1">
                {selectedContacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#E2E8F0]/70">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-[10px]">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-[#0F172A] truncate">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{c.subtitle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── STAGE 1: MEMBER SELECTION SCREEN IN MODAL ── */
          <>
            {/* Selected Chips */}
            {selectedContacts.length > 0 && creationMode !== 'none' && (
              <div className="px-3.5 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {selectedContacts.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                      isCreatingCommunity
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${isCreatingCommunity ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <span className="truncate max-w-[75px]">{c.name.split(' ')[0]}</span>
                    <button
                      type="button"
                      onClick={() => c.userId && toggleSelect(c.userId)}
                      className="p-0.5 hover:bg-black/10 rounded-full cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="p-3 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-center bg-[#F1F5F9] rounded-full px-3.5 py-1.5 border border-[#E2E8F0] focus-within:border-[#4F46E5]">
                <Search className="w-4 h-4 text-[#475569] mr-2 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search coworkers by name, role or team..."
                  className="w-full bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick actions: New Group and New Community */}
            {creationMode === 'none' && (
              <div className="p-2 border-b border-[#E2E8F0] bg-white space-y-1">
                {/* Quick Action 1: New Group */}
                <button
                  onClick={() => {
                    setCreationMode('group');
                    setModalStep('members');
                    setSelectedUserIds([]);
                    setGroupName('');
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] text-[#4F46E5] font-semibold text-sm transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">New Group</p>
                    <p className="text-xs text-[#64748B] font-normal truncate">Create group with multiple colleagues</p>
                  </div>
                </button>

                {/* Quick Action 2: New Community */}
                <button
                  onClick={() => {
                    setCreationMode('community');
                    setModalStep('members');
                    setSelectedUserIds([]);
                    setCommunityName('');
                    setCommunityDesc('');
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] text-[#059669] font-semibold text-sm transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#059669] to-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Users className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-[#0F172A]">New Community</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Team</span>
                    </div>
                    <p className="text-xs text-[#64748B] font-normal truncate">Organize departments, channels & announcements</p>
                  </div>
                </button>
              </div>
            )}

            {/* List */}
            <div className="overflow-y-auto max-h-[380px] p-2 space-y-1">
              {isLoading ? (
                <div className="p-8 text-center text-[#64748B] flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
                  <span className="text-xs">Loading company colleagues...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-[#64748B] text-sm">
                  No coworkers match &quot;{search}&quot;
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.userId ? selectedUserIds.includes(c.userId) : false;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (creationMode !== 'none') {
                          if (c.userId) toggleSelect(c.userId);
                        } else {
                          onStartDirectChat({
                            name: c.name,
                            avatar: c.avatar,
                            role: c.subtitle || 'Colleague',
                            userId: c.userId,
                          });
                          onClose();
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                        isSelected
                          ? isCreatingCommunity
                            ? 'bg-[#ECFDF5] ring-1 ring-[#059669]'
                            : 'bg-[#EEF2FF] ring-1 ring-[#4F46E5]'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#4F46E5] border border-[#4F46E5]/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A] truncate">{c.name}</p>
                          <p className="text-xs text-[#64748B] truncate">{c.subtitle}</p>
                        </div>
                      </div>

                      {creationMode !== 'none' && (
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ml-2 ${
                            isSelected
                              ? isCreatingCommunity
                                ? 'bg-[#059669] border-[#059669] text-white'
                                : 'bg-[#4F46E5] border-[#4F46E5] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Action footer for group or community creation */}
        {creationMode !== 'none' && (
          <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <button
              onClick={() => {
                if (modalStep === 'details') {
                  setModalStep('members');
                } else {
                  setCreationMode('none');
                  setSelectedUserIds([]);
                }
              }}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              {modalStep === 'details' ? 'Back to Members' : 'Cancel'}
            </button>

            {modalStep === 'members' ? (
              <button
                onClick={() => setModalStep('details')}
                disabled={selectedUserIds.length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  selectedUserIds.length > 0
                    ? isCreatingCommunity
                      ? 'bg-[#059669] text-white hover:bg-[#047857]'
                      : 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next ({selectedUserIds.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : isCreatingGroup ? (
              <button
                onClick={handleFinishGroup}
                disabled={!groupName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  groupName.trim()
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Create Group</span>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={handleFinishCommunity}
                disabled={!communityName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  communityName.trim()
                    ? 'bg-[#059669] text-white hover:bg-[#047857]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Create Community</span>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatNewChatModal;
