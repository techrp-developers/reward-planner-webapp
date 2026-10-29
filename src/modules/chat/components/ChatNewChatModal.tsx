// src/modules/chat/components/ChatNewChatModal.tsx
import React, { useState } from 'react';
import { X, Search, Users, User, ArrowRight, MessageSquare, UserPlus, Megaphone, Sparkles } from 'lucide-react';
import rohitAvatar from '../../../assets/chat/avatar_rohit.png';
import priyaAvatar from '../../../assets/chat/avatar_priya.png';
import suhailAvatar from '../../../assets/chat/avatar_suhail.png';
import apsalaAvatar from '../../../assets/chat/avatar_apsala.png';

interface ChatNewChatModalProps {
  onClose: () => void;
  onStartDirectChat: (contact: { name: string; avatar?: string; role: string }) => void;
  onCreateGroupChat: (groupName: string, selectedMembers: string[]) => void;
}

const COMPANY_COLLEAGUES = [
  { id: '1', name: 'Rohit Mehta', role: 'Lead Designer', avatar: rohitAvatar, department: 'Design', status: 'Available' },
  { id: '2', name: 'Priya Sharma', role: 'Senior UI/UX Designer', avatar: priyaAvatar, department: 'Design', status: 'In Figma' },
  { id: '3', name: 'Suhail Fakir', role: 'Motion Designer', avatar: suhailAvatar, department: 'Creative', status: 'Animating...' },
  { id: '4', name: 'Apsala Bhalerao', role: 'Graphic Designer', avatar: apsalaAvatar, department: 'Branding', status: 'Available' },
  { id: '5', name: 'Amit Patel', role: 'Product Manager', department: 'Product', status: 'Planning Q4 sprint' },
  { id: '6', name: 'Neha Verma', role: 'Visual Designer', department: 'Design', status: 'Working remotely' },
  { id: '7', name: 'Rahul Joshi', role: 'Brand Specialist', department: 'Marketing', status: 'Reviewing brand book' },
  { id: '8', name: 'Sneha Deshmukh', role: 'Design Operations', department: 'Operations', status: 'Available' },
  { id: '9', name: 'Vikram Seth', role: 'Design Intern', department: 'Design', status: 'Learning UI kits' },
  { id: '10', name: 'Pooja Nair', role: 'Content Strategist', department: 'Marketing', status: 'Drafting campaign' },
  { id: '11', name: 'Karan Malhotra', role: 'Creative Director', department: 'Creative', status: 'Busy in sync' },
  { id: '12', name: 'Ananya Roy', role: 'Frontend Engineer', department: 'Engineering', status: 'Coding React UI' },
];

export const ChatNewChatModal: React.FC<ChatNewChatModalProps> = ({
  onClose,
  onStartDirectChat,
  onCreateGroupChat,
}) => {
  const [search, setSearch] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = COMPANY_COLLEAGUES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinishGroup = () => {
    if (!groupName.trim()) return;
    const names = COMPANY_COLLEAGUES.filter((c) => selectedIds.includes(c.id)).map((c) => c.name);
    onCreateGroupChat(groupName.trim(), names);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#008069] text-white flex items-center justify-between shadow-xs">
          <div>
            <h2 className="text-lg font-bold">
              {isCreatingGroup ? 'New Group' : 'New Chat'}
            </h2>
            <p className="text-xs text-emerald-100">
              {isCreatingGroup
                ? 'Select colleagues & name your group'
                : 'Select all contacts to invite for chat'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group creation input */}
        {isCreatingGroup && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter Group Name (e.g. Design Sync)..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#008069]"
              autoFocus
            />
            {selectedIds.length > 0 && (
              <p className="text-xs text-[#008069] font-medium mt-2">
                {selectedIds.length} colleagues selected
              </p>
            )}
          </div>
        )}

        {/* Search */}
        <div className="p-3.5 border-b border-gray-100 bg-white">
          <div className="flex items-center bg-[#F0F2F5] rounded-full px-3.5 py-2">
            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts by name, role or team..."
              className="w-full bg-transparent text-sm text-[#111827] focus:outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Quick action buttons (New Group / Broadcast) */}
        {!isCreatingGroup && (
          <div className="p-3 space-y-1 border-b border-gray-100 bg-[#F9FAFB]">
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs text-[#008069] font-semibold text-sm transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#D2F4E6] flex items-center justify-center text-[#008069] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#111827]">New Group</p>
                <p className="text-[11px] text-gray-500 font-normal">Create group with multiple colleagues</p>
              </div>
            </button>
          </div>
        )}

        {/* Section title */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Contacts to Invite & Chat ({filtered.length})
          </span>
          <span className="text-[11px] text-[#008069] font-medium flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Company Directory</span>
          </span>
        </div>

        {/* Colleagues list */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll divide-y divide-gray-50 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No contacts matching &quot;{search}&quot;
            </div>
          ) : (
            filtered.map((c) => {
              const isSelected = selectedIds.includes(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (isCreatingGroup) {
                      toggleSelect(c.id);
                    } else {
                      onStartDirectChat({ name: c.name, avatar: c.avatar, role: c.role });
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                    isSelected ? 'bg-[#E7F7EF]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-11 h-11 rounded-full object-cover border border-gray-100 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-100 text-[#008069] flex items-center justify-center font-bold text-sm shrink-0">
                        {c.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#111827] truncate">{c.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{c.role} • {c.department}</p>
                      <p className="text-[10px] text-emerald-600 truncate">{c.status}</p>
                    </div>
                  </div>

                  {isCreatingGroup ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 accent-[#008069] rounded cursor-pointer shrink-0 ml-2"
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartDirectChat({ name: c.name, avatar: c.avatar, role: c.role });
                      }}
                      className="shrink-0 ml-2 px-3 py-1.5 rounded-full bg-[#E7F7EF] hover:bg-[#008069] text-[#008069] hover:text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Action footer for group creation */}
        {isCreatingGroup && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setIsCreatingGroup(false)}
              className="text-xs font-semibold text-gray-600 hover:underline cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleFinishGroup}
              disabled={!groupName.trim() || selectedIds.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center space-x-1.5 cursor-pointer ${
                groupName.trim() && selectedIds.length > 0
                  ? 'bg-[#008069] hover:bg-[#006e5a] shadow-md'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <span>Create Group</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatNewChatModal;
