// src/modules/chat/components/ChatSidebar.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  MoreVertical,
  Plus,
  ArrowLeft,
  ArrowRight,
  VolumeX,
  Users,
  Grid,
  CircleDot,
  Check,
  UserPlus,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Camera,
  Pencil,
  Play,
  Pause,
  User,
  Mail,
  Phone,
  Building2,
  Award,
  Sparkles,
  X,
  Trash2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Star,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { ChatConversation, RailTab, SidebarContact } from '../chatTypes';
import { NEW_CHAT_CONTACTS } from '../chatData';
import {
  fetchChatUsers,
  BackendChatUser,
  getCurrentUserProfile,
  fetchCurrentUserProfile,
  UserProfileData,
} from '../services/chatApi';
import { adaptChatUserToContact } from '../services/chatAdapter';
import { MessageStatusIcon } from './MessageStatusIcon';
import {
  statusApi,
  StatusFeedGroup,
  StatusItem,
  CreateStatusPayload,
} from '../../../api/statusApi';
import { resolveAvatarUrl } from '../../../api/client';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeChatId: string | null;
  activeRailTab: RailTab;
  onSelectTab?: (tab: RailTab) => void;
  onSelectChat: (chatId: string) => void;
  onStartDirectChat: (contact: { name: string; avatar?: string; role: string; userId?: number }) => void;
  onCreateGroupChat: (groupName: string, selectedMembers: string[], memberUserIds?: number[]) => void;
  onCreateCommunityChat?: (communityName: string, description: string, selectedMembers: string[], memberUserIds?: number[]) => void;
  onBackToDashboard?: () => void;
  openNewChatTrigger?: number;
  openAddStatusTrigger?: number;
  onOpenDisappearingForChat?: (chat: ChatConversation) => void;
}

// WhatsApp icon SVG
const WhatsAppBrandIcon = ({ className = "w-5 h-5 fill-current" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
  </svg>
);

// Purple Group Icon
const PurpleGroupIcon = ({ className = "w-5 h-5 text-[#9333ea]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeChatId,
  activeRailTab,
  onSelectTab,
  onSelectChat,
  onStartDirectChat,
  onCreateGroupChat,
  onCreateCommunityChat,
  onBackToDashboard,
  openNewChatTrigger,
  openAddStatusTrigger,
  onOpenDisappearingForChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'favourites' | 'groups'>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openRowMenuChatId, setOpenRowMenuChatId] = useState<string | null>(null);
  const [showingNewChatView, setShowingNewChatView] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [liveUsers, setLiveUsers] = useState<BackendChatUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupStep, setGroupStep] = useState<'members' | 'details'>('members');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [communityStep, setCommunityStep] = useState<'members' | 'details'>('members');
  const [communityNameInput, setCommunityNameInput] = useState('');
  const [communityDescInput, setCommunityDescInput] = useState('');
  const [selectedGroupUserIds, setSelectedGroupUserIds] = useState<number[]>([]);

  useEffect(() => {
    if (openNewChatTrigger && openNewChatTrigger > 0) {
      setIsCreatingGroup(false);
      setIsCreatingCommunity(false);
      setGroupStep('members');
      setCommunityStep('members');
      setShowingNewChatView(true);
    }
  }, [openNewChatTrigger]);

  // Load company colleagues whenever the New Chat view opens
  useEffect(() => {
    if (!showingNewChatView) return;
    let mounted = true;
    setIsLoadingUsers(true);
    fetchChatUsers()
      .then((users) => {
        if (mounted) setLiveUsers(users);
      })
      .catch((err) => {
        console.warn('Failed to load chat users:', err);
      })
      .finally(() => {
        if (mounted) setIsLoadingUsers(false);
      });
    return () => {
      mounted = false;
    };
  }, [showingNewChatView]);

  // 1. Dynamic User Profile State
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => getCurrentUserProfile());
  useEffect(() => {
    fetchCurrentUserProfile().then((p) => {
      if (p) setUserProfile(p);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (openAddStatusTrigger && openAddStatusTrigger > 0) {
      setShowAddStatusModal(true);
    }
  }, [openAddStatusTrigger]);

  // Favourites state (persisted in localStorage)
  const [favouriteChatIds, setFavouriteChatIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rp_chat_favourites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavourite = (chatId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setFavouriteChatIds((prev) => {
      const next = prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId];
      try {
        localStorage.setItem('rp_chat_favourites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filterScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollFilters = () => {
    if (filterScrollRef.current) {
      const isAtEnd =
        filterScrollRef.current.scrollLeft + filterScrollRef.current.clientWidth >=
        filterScrollRef.current.scrollWidth - 10;
      if (isAtEnd) {
        filterScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        filterScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
      }
    }
  };

  const userInitials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SC';

  // 2. Real Dynamic Status State (backed by statusApi: /v1/status/feed & /v1/status/mine)
  const [myBackendStatuses, setMyBackendStatuses] = useState<StatusItem[]>([]);
  const [coworkerFeed, setCoworkerFeed] = useState<StatusFeedGroup[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const [activeStoryViewer, setActiveStoryViewer] = useState<{
    userName: string;
    userAvatar?: string;
    isMyStatus?: boolean;
    statuses: StatusItem[];
  } | null>(null);

  const [activeStorySegment, setActiveStorySegment] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [showAddStatusModal, setShowAddStatusModal] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusBgIndex, setNewStatusBgIndex] = useState(0);
  const [selectedStatusFile, setSelectedStatusFile] = useState<File | null>(null);
  const [statusFilePreview, setStatusFilePreview] = useState<string | null>(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const statusFileInputRef = useRef<HTMLInputElement>(null);

  const STATUS_GRADIENTS = [
    'from-emerald-600 to-teal-800',
    'from-blue-600 to-indigo-800',
    'from-purple-600 to-pink-700',
    'from-amber-600 to-orange-700',
    'from-rose-600 to-red-800',
    'from-slate-700 to-zinc-900',
  ];

  const STATUS_HEX_COLORS = [
    '#008069',
    '#2563eb',
    '#9333ea',
    '#d97706',
    '#e11d48',
    '#334155',
  ];

  const formatStatusTime = (dateStr?: string): string => {
    if (!dateStr) return 'Just now';
    const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const time = new Date(isoStr).getTime();
    if (isNaN(time)) return dateStr;
    const diffMs = Date.now() - time;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      const d = new Date(isoStr);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minsStr = minutes < 10 ? '0' + minutes : String(minutes);
      return `Today at ${hours}:${minsStr} ${ampm}`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      const d = new Date(isoStr);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minsStr = minutes < 10 ? '0' + minutes : String(minutes);
      return `Yesterday at ${hours}:${minsStr} ${ampm}`;
    }
    return `${diffDays}d ago`;
  };

  // Back button helper
  const handleBackToChats = () => {
    if (onSelectTab) {
      onSelectTab('chats');
    } else if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  const getStatusBgStyle = (color?: string | null) => {
    if (!color) {
      return { className: 'bg-gradient-to-br from-emerald-600 to-teal-800', style: {} };
    }
    if (color.startsWith('#') || color.startsWith('rgb')) {
      return { className: '', style: { backgroundColor: color } };
    }
    if (color.startsWith('from-')) {
      return { className: `bg-gradient-to-br ${color}`, style: {} };
    }
    return { className: '', style: { backgroundColor: color } };
  };

  const loadChatStatuses = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const currentUserId = userProfile.userId ? Number(userProfile.userId) : 37;
      const [feed, mine] = await Promise.all([
        statusApi.getFeed(),
        statusApi.getMine(),
      ]);

      const validMine = Array.isArray(mine) ? mine : [];
      setMyBackendStatuses(validMine);

      const validFeed = Array.isArray(feed) ? feed : [];
      const coworkerGroups = validFeed.filter(
        (g) => Number(g.user?.id) !== Number(currentUserId) && g.statuses && g.statuses.length > 0
      );
      setCoworkerFeed(coworkerGroups);
    } catch (err) {
      console.warn('Failed to load chat status feed:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [userProfile.userId]);

  useEffect(() => {
    if (activeRailTab === 'status') {
      loadChatStatuses();
    }
  }, [activeRailTab, loadChatStatuses]);

  // Story auto-progress timer
  useEffect(() => {
    if (!activeStoryViewer || isStoryPaused) return;
    const totalSegments = activeStoryViewer.statuses.length;
    if (totalSegments === 0) return;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (activeStorySegment < totalSegments - 1) {
            setActiveStorySegment((s) => s + 1);
            return 0;
          }
          setActiveStoryViewer(null);
          setActiveStorySegment(0);
          return 0;
        }
        return prev + 2; // ~5s duration
      });
    }, 100);

    return () => clearInterval(timer);
  }, [activeStoryViewer, activeStorySegment, isStoryPaused]);

  // Mark viewed when viewing a coworker slide
  useEffect(() => {
    if (activeStoryViewer && !activeStoryViewer.isMyStatus) {
      const current = activeStoryViewer.statuses[activeStorySegment];
      if (current && current.id) {
        statusApi.markViewed(current.id).catch(() => {});
      }
    }
  }, [activeStoryViewer, activeStorySegment]);

  const handleOpenViewer = (viewer: {
    userName: string;
    userAvatar?: string;
    isMyStatus?: boolean;
    statuses: StatusItem[];
  }) => {
    setActiveStoryViewer(viewer);
    setActiveStorySegment(0);
    setStoryProgress(0);
    setIsStoryPaused(false);
  };

  const handleStatusFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedStatusFile(file);
      const url = URL.createObjectURL(file);
      setStatusFilePreview(url);
    }
  };

  const handlePostStatus = async () => {
    if (!newStatusText.trim() && !selectedStatusFile) return;
    setIsSubmittingStatus(true);
    try {
      const payload: CreateStatusPayload = {
        type: selectedStatusFile ? 'image' : 'text',
        text: newStatusText.trim(),
        background_color: STATUS_HEX_COLORS[newStatusBgIndex],
        visibility: 'same_company',
      };
      if (selectedStatusFile) {
        payload.media = selectedStatusFile;
      }
      const res = await statusApi.createStatus(payload);
      if (res?.success) {
        setNewStatusText('');
        setSelectedStatusFile(null);
        setStatusFilePreview(null);
        setShowAddStatusModal(false);
        await loadChatStatuses();
      }
    } catch (err) {
      console.error('Failed to post status:', err);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleDeleteCurrentStatus = async (statusId: number) => {
    if (!window.confirm('Are you sure you want to delete this status update?')) return;
    try {
      await statusApi.deleteStatus(statusId);
      await loadChatStatuses();
      if (activeStoryViewer && activeStoryViewer.statuses.length > 1) {
        const remaining = activeStoryViewer.statuses.filter((s) => s.id !== statusId);
        setActiveStoryViewer({
          ...activeStoryViewer,
          statuses: remaining,
        });
        setActiveStorySegment((prev) => Math.max(0, Math.min(prev, remaining.length - 1)));
        setStoryProgress(0);
      } else {
        setActiveStoryViewer(null);
        setActiveStorySegment(0);
      }
    } catch (err) {
      console.error('Failed to delete status:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. RENDER DYNAMIC PROFILE VIEW
  // ─────────────────────────────────────────────────────────────
  if (activeRailTab === 'profile') {
    return (
      <aside className="w-full h-full flex flex-col bg-white border-r border-[#E2E8F0] select-none text-[#0F172A] font-['Segoe_UI',Helvetica,Arial,sans-serif] animate-fadeIn">
        {/* Header */}
        <div className="h-16 px-4 flex items-center space-x-4 border-b border-[#E2E8F0] bg-white shrink-0">
          <button
            onClick={handleBackToChats}
            title="Back to chats"
            className="p-1 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Profile</h1>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll p-6 space-y-6 bg-white">
          {/* Centered Circular Avatar (160px) */}
          <div className="flex flex-col items-center">
            <div className="relative group w-36 h-36 sm:w-40 sm:h-40 rounded-full shadow-md overflow-hidden bg-gradient-to-tr from-[#4F46E5] to-indigo-700 flex items-center justify-center cursor-pointer border-4 border-white">
              {userProfile.userImage ? (
                <img
                  src={userProfile.userImage}
                  alt={userProfile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <span className="text-white font-bold text-4xl sm:text-5xl tracking-wide">
                  {userInitials}
                </span>
              )}
              {/* Camera Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-center p-2">
                <Camera className="w-7 h-7 mb-1" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Change Photo
                </span>
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0F172A]">{userProfile.name}</h2>
            <p className="text-xs text-[#64748B] font-medium">{userProfile.role} • {userProfile.department}</p>
          </div>

          {/* Section: Your Name */}
          <div className="bg-[#F1F5F9]/60 hover:bg-[#F1F5F9] transition rounded-2xl p-4 border border-[#E2E8F0]/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">
                Your name
              </span>
              <button
                onClick={() => alert('Name is synced with your official corporate directory profile.')}
                title="Edit name"
                className="text-[#475569] hover:text-[#4F46E5] p-1 rounded-full transition cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[15px] font-medium text-[#0F172A]">{userProfile.name}</p>
            <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
              This is not your username or pin. This name will be visible to your corporate contacts.
            </p>
          </div>

          {/* Section: About */}
          <div className="bg-[#F1F5F9]/60 hover:bg-[#F1F5F9] transition rounded-2xl p-4 border border-[#E2E8F0]/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">
                About
              </span>
              <button
                onClick={() => alert('About status is linked to your employee thought note.')}
                title="Edit about"
                className="text-[#475569] hover:text-[#4F46E5] p-1 rounded-full transition cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[15px] text-[#0F172A] italic">"{userProfile.thought || 'Available'}"</p>
          </div>

          {/* Section: Corporate Info */}
          <div className="bg-[#F1F5F9]/60 hover:bg-[#F1F5F9] transition rounded-2xl p-4 border border-[#E2E8F0]/80 space-y-3">
            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider block">
              Organization & Role
            </span>
            <div className="flex items-center space-x-3 text-sm text-[#0F172A]">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B]">Company</p>
                <p className="font-medium truncate">{userProfile.companyName || 'Reward Planners'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm text-[#0F172A]">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B]">Department & Designation</p>
                <p className="font-medium truncate">{userProfile.role} • {userProfile.department}</p>
              </div>
            </div>
          </div>

          {/* Section: Contact Info */}
          <div className="bg-[#F1F5F9]/60 hover:bg-[#F1F5F9] transition rounded-2xl p-4 border border-[#E2E8F0]/80 space-y-3">
            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider block">
              Contact Details
            </span>
            <div className="flex items-center space-x-3 text-sm text-[#0F172A]">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#64748B]">Email</p>
                <p className="font-medium truncate">{userProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm text-[#0F172A]">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#64748B]">Phone</p>
                <p className="font-medium truncate">{userProfile.phone}</p>
              </div>
            </div>
            {userProfile.rewardPoints != null && (
              <div className="flex items-center space-x-3 text-sm text-[#0F172A]">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#64748B]">Reward Points Balance</p>
                  <p className="font-bold text-[#4F46E5]">{userProfile.rewardPoints.toLocaleString()} RP</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RENDER DYNAMIC STATUS VIEW
  // ─────────────────────────────────────────────────────────────
  if (activeRailTab === 'status') {
    const hasMyStatus = myBackendStatuses.length > 0;
    const latestMyStatus = hasMyStatus ? myBackendStatuses[0] : null;

    return (
      <aside className="w-full h-full flex flex-col bg-white border-r border-[#E2E8F0] select-none text-[#0F172A] font-['Segoe_UI',Helvetica,Arial,sans-serif] animate-fadeIn">
        {/* Header with Back Button & Add Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToChats}
              title="Back to chats"
              className="p-1 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Status</h1>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={loadChatStatuses}
              title="Refresh status feed"
              className="p-2 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin text-[#4F46E5]' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddStatusModal(true)}
              title="Add new status update"
              className="w-9 h-9 rounded-full bg-[#B63EEE] hover:bg-[#A02FD8] text-white flex items-center justify-center transition shadow-xs cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Status Scroll Container */}
        <div className="flex-1 overflow-y-auto chat-custom-scroll bg-white">
          {/* My Status Row */}
          <div
            onClick={() => {
              if (hasMyStatus) {
                handleOpenViewer({
                  userName: 'My status',
                  userAvatar: resolveAvatarUrl(userProfile.userImage),
                  isMyStatus: true,
                  statuses: myBackendStatuses,
                });
              } else {
                setShowAddStatusModal(true);
              }
            }}
            className="p-3.5 border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={`w-12 h-12 rounded-full p-[2px] ${
                    hasMyStatus
                      ? 'border-2 border-[#4F46E5]'
                      : 'border-2 border-transparent'
                  }`}
                >
                  {resolveAvatarUrl(userProfile.userImage) ? (
                    <img
                      src={resolveAvatarUrl(userProfile.userImage)}
                      alt="My Status"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm">
                      {userInitials}
                    </div>
                  )}
                </div>
                {!hasMyStatus && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-xs">
                    +
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-semibold text-[#0F172A] truncate">My status</h4>
                <p className="text-xs text-[#64748B] truncate">
                  {hasMyStatus ? formatStatusTime(latestMyStatus?.created_at) : 'Tap to add status update'}
                </p>
              </div>
            </div>
            {hasMyStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddStatusModal(true);
                }}
                title="Add another status"
                className="p-2 rounded-full hover:bg-[#E2E8F0] text-[#4F46E5] transition cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Loading Indicator */}
          {isLoadingStatus && (
            <div className="py-6 flex justify-center items-center text-[#4F46E5]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {/* Recent Coworker Updates */}
          {!isLoadingStatus && (
            <>
              <div className="px-4 pt-3.5 pb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">
                  Recent updates ({coworkerFeed.length})
                </span>
              </div>

              {coworkerFeed.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center select-none">
                  <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
                    <CircleDot className="w-7 h-7 text-[#4F46E5]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] mb-1">No recent updates</p>
                  <p className="text-xs text-[#64748B] max-w-[240px] leading-relaxed mb-4">
                    No status updates from your colleagues right now.
                  </p>
                  <button
                    onClick={() => setShowAddStatusModal(true)}
                    className="px-4 py-1.5 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Share a status</span>
                  </button>
                </div>
              ) : (
                coworkerFeed.map((group) => {
                  const coworkerAvatar = resolveAvatarUrl(group.user.image_url || group.user.user_image);
                  const latestStatus = group.statuses[0];
                  return (
                    <div
                      key={group.user.id}
                      onClick={() => {
                        handleOpenViewer({
                          userName: group.user.name,
                          userAvatar: coworkerAvatar,
                          isMyStatus: false,
                          statuses: group.statuses,
                        });
                      }}
                      className="flex items-center px-3.5 py-2.5 hover:bg-[#F8FAFC] cursor-pointer transition"
                    >
                      <div className="relative mr-3.5 shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full p-[2.5px] ${
                            group.has_unviewed ? 'border-2 border-[#4F46E5]' : 'border-2 border-[#CBD5E1]'
                          }`}
                        >
                          {coworkerAvatar ? (
                            <img
                              src={coworkerAvatar}
                              alt={group.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm">
                              {group.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-semibold text-[#0F172A] truncate">{group.user.name}</h4>
                        <p className="text-xs text-[#64748B] truncate">
                          {formatStatusTime(latestStatus?.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Status Story Viewer Modal */}
        {activeStoryViewer && activeStoryViewer.statuses.length > 0 && (() => {
          const currentStatus = activeStoryViewer.statuses[activeStorySegment] || activeStoryViewer.statuses[0];
          const totalCount = activeStoryViewer.statuses.length;
          const bg = getStatusBgStyle(currentStatus.background_color);

          return (
            <div className="fixed inset-0 z-50 bg-[#0c1317]/95 flex flex-col items-center justify-between p-4 md:p-6 animate-fadeIn text-white font-['Segoe_UI',Helvetica,Arial,sans-serif]">
              {/* Top Multi-Segment Progress Bars */}
              <div className="w-full max-w-md flex items-center space-x-1.5 pt-2">
                {Array.from({ length: totalCount }).map((_, idx) => {
                  const isPast = idx < activeStorySegment;
                  const isCurrent = idx === activeStorySegment;
                  const fillPercent = isPast ? 100 : isCurrent ? storyProgress : 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        style={{ width: `${fillPercent}%` }}
                        className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Header: User Info & Controls */}
              <div className="w-full max-w-md flex items-center justify-between pt-3 pb-2 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full border border-white/50 overflow-hidden bg-white/20 flex items-center justify-center font-bold">
                    {activeStoryViewer.userAvatar ? (
                      <img
                        src={activeStoryViewer.userAvatar}
                        alt={activeStoryViewer.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{activeStoryViewer.userName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{activeStoryViewer.userName}</h3>
                    <span className="text-xs text-white/70">{formatStatusTime(currentStatus.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {activeStoryViewer.isMyStatus && (
                    <>
                      <div className="flex items-center space-x-1 text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{currentStatus.view_count || 0}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCurrentStatus(currentStatus.id)}
                        title="Delete this status"
                        className="p-2 rounded-full hover:bg-red-500/20 text-white/80 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsStoryPaused(!isStoryPaused)}
                    title={isStoryPaused ? 'Resume' : 'Pause'}
                    className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  >
                    {isStoryPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                  </button>
                  <button
                    onClick={() => {
                      setActiveStoryViewer(null);
                      setActiveStorySegment(0);
                    }}
                    title="Close status"
                    className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-6 h-6 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Main Story Content Card */}
              <div className="relative w-full max-w-md flex-1 my-2 flex items-center justify-center">
                {/* Navigation click zones: Left half & Right half */}
                <div
                  onClick={() => {
                    if (activeStorySegment > 0) {
                      setActiveStorySegment((s) => s - 1);
                      setStoryProgress(0);
                    }
                  }}
                  className="absolute left-0 inset-y-0 w-1/3 cursor-pointer z-20"
                  title="Previous"
                />
                <div
                  onClick={() => {
                    if (activeStorySegment < totalCount - 1) {
                      setActiveStorySegment((s) => s + 1);
                      setStoryProgress(0);
                    } else {
                      setActiveStoryViewer(null);
                      setActiveStorySegment(0);
                    }
                  }}
                  className="absolute right-0 inset-y-0 w-1/3 cursor-pointer z-20"
                  title="Next"
                />

                {/* Display Card */}
                {currentStatus.type === 'image' && currentStatus.media_url ? (
                  <div className="w-full h-[520px] max-h-[75vh] rounded-2xl bg-black shadow-2xl flex flex-col items-center justify-between p-4 text-center text-white border border-white/10 select-none relative overflow-hidden">
                    <img
                      src={resolveAvatarUrl(currentStatus.media_url)}
                      alt="Status media"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    {currentStatus.text && (
                      <div className="absolute bottom-4 inset-x-4 bg-black/60 backdrop-blur-md p-3 rounded-xl text-sm font-medium">
                        {currentStatus.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-full h-[520px] max-h-[75vh] rounded-2xl ${bg.className} shadow-2xl flex flex-col items-center justify-center p-8 text-center text-white border border-white/10 select-none relative overflow-hidden`}
                    style={bg.style}
                  >
                    <div className="text-4xl mb-4 animate-bounce">
                      {activeStoryViewer.isMyStatus ? '✨' : '💼'}
                    </div>
                    <p className="text-xl md:text-2xl font-semibold leading-relaxed drop-shadow-md">
                      {currentStatus.text || 'Status update'}
                    </p>
                    <span className="mt-8 text-xs text-white/70 font-medium tracking-wider uppercase">
                      Reward Planners Status
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Indicator */}
              <div className="text-xs text-white/50 pb-2 flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Tap left or right to navigate</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })()}

        {/* Add Status Modal */}
        {showAddStatusModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-[#E2E8F0] animate-scaleUp">
              {/* Modal Header */}
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="font-bold text-[#0F172A] text-lg">New Status Update</h3>
                <button
                  onClick={() => {
                    setShowAddStatusModal(false);
                    setSelectedStatusFile(null);
                    setStatusFilePreview(null);
                    setNewStatusText('');
                  }}
                  className="p-1 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Preview Card */}
              <div className="p-6">
                {statusFilePreview ? (
                  <div className="relative w-full h-48 rounded-2xl bg-black overflow-hidden mb-4 shadow-inner flex items-center justify-center">
                    <img
                      src={statusFilePreview}
                      alt="Selected upload"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => {
                        setSelectedStatusFile(null);
                        setStatusFilePreview(null);
                      }}
                      title="Remove image"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-full h-44 rounded-2xl bg-gradient-to-br ${STATUS_GRADIENTS[newStatusBgIndex]} flex flex-col items-center justify-center p-4 text-center text-white shadow-inner mb-4 transition-all duration-300`}
                  >
                    <p className="text-lg font-semibold leading-snug">
                      {newStatusText.trim() || 'Type your status update here...'}
                    </p>
                    <span className="text-[10px] text-white/70 mt-2">
                      {userProfile.name} • Just now
                    </span>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder={statusFilePreview ? 'Add a caption...' : "What's happening at work?"}
                  className="w-full h-24 p-3 text-sm rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none text-[#0F172A] placeholder-[#94A3B8]"
                  maxLength={160}
                  autoFocus
                />
                <div className="flex justify-between items-center text-xs text-[#94A3B8] mt-1 mb-4">
                  <span>{!statusFilePreview ? 'Color Theme:' : 'Caption length:'}</span>
                  <span>{newStatusText.length}/160</span>
                </div>

                {/* Controls: Color Theme or Photo upload */}
                <div className="flex items-center justify-between mb-6">
                  {!statusFilePreview ? (
                    <div className="flex items-center space-x-2">
                      {STATUS_GRADIENTS.map((gradient, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNewStatusBgIndex(idx)}
                          className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} transition transform hover:scale-110 cursor-pointer ${
                            newStatusBgIndex === idx ? 'ring-2 ring-offset-2 ring-[#4F46E5] scale-110' : ''
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#475569] flex items-center space-x-1">
                      <ImageIcon className="w-4 h-4 text-[#4F46E5]" />
                      <span>Photo selected</span>
                    </div>
                  )}

                  {/* Photo upload trigger */}
                  <input
                    type="file"
                    ref={statusFileInputRef}
                    accept="image/*"
                    onChange={handleStatusFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => statusFileInputRef.current?.click()}
                    title="Upload a photo"
                    className="p-2 rounded-full hover:bg-[#F1F5F9] text-[#475569] hover:text-[#4F46E5] transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddStatusModal(false);
                      setSelectedStatusFile(null);
                      setStatusFilePreview(null);
                      setNewStatusText('');
                    }}
                    className="px-4 py-2 text-sm text-[#475569] hover:bg-[#F1F5F9] rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostStatus}
                    disabled={isSubmittingStatus || (!newStatusText.trim() && !selectedStatusFile)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-sm cursor-pointer flex items-center space-x-2"
                  >
                    {isSubmittingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmittingStatus ? 'Posting...' : 'Post Status'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. RENDER NEW CHAT VIEW
  // ─────────────────────────────────────────────────────────────
  if (showingNewChatView) {
    const contactsPool: SidebarContact[] =
      liveUsers.length > 0
        ? liveUsers.map(adaptChatUserToContact).sort((a, b) => a.name.localeCompare(b.name))
        : isLoadingUsers
        ? []
        : (NEW_CHAT_CONTACTS as SidebarContact[]);

    const filteredContacts = contactsPool.filter(
      (c) =>
        c.name.toLowerCase().includes(newChatSearch.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(newChatSearch.toLowerCase())
    );

    const selectedContacts = contactsPool.filter((c) =>
      c.userId ? selectedGroupUserIds.includes(c.userId) : false
    );

    const handleConfirmCreateGroup = () => {
      const name = groupNameInput.trim();
      if (!name) return;
      const memberNames = selectedContacts.map((c) => c.name);
      onCreateGroupChat(name, memberNames, selectedGroupUserIds);
      setShowingNewChatView(false);
      setIsCreatingGroup(false);
      setGroupStep('members');
      setGroupNameInput('');
      setSelectedGroupUserIds([]);
    };

    const handleConfirmCreateCommunity = () => {
      const name = communityNameInput.trim();
      if (!name) return;
      const desc = communityDescInput.trim();
      const memberNames = selectedContacts.map((c) => c.name);
      if (onCreateCommunityChat) {
        onCreateCommunityChat(name, desc, memberNames, selectedGroupUserIds);
      } else {
        onCreateGroupChat(name, memberNames, selectedGroupUserIds);
      }
      setShowingNewChatView(false);
      setIsCreatingCommunity(false);
      setCommunityStep('members');
      setIsCreatingGroup(false);
      setCommunityNameInput('');
      setCommunityDescInput('');
      setSelectedGroupUserIds([]);
    };

    const handleBackNavigation = () => {
      if (isCreatingCommunity) {
        if (communityStep === 'details') {
          setCommunityStep('members');
        } else {
          setIsCreatingCommunity(false);
          setCommunityStep('members');
          setSelectedGroupUserIds([]);
        }
      } else if (isCreatingGroup) {
        if (groupStep === 'details') {
          setGroupStep('members');
        } else {
          setIsCreatingGroup(false);
          setGroupStep('members');
          setSelectedGroupUserIds([]);
        }
      } else {
        setShowingNewChatView(false);
      }
    };

    return (
      <aside className="w-full h-full flex flex-col bg-white border-r border-[#E2E8F0] select-none text-[#0F172A] font-['Segoe_UI',Helvetica,Arial,sans-serif] animate-fadeIn relative">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] bg-white shrink-0">
          <div className="flex items-center space-x-3.5 min-w-0">
            <button
              onClick={handleBackNavigation}
              className="p-1.5 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-[#0F172A] truncate">
                  {isCreatingCommunity
                    ? communityStep === 'details'
                      ? 'New community'
                      : 'Add community members'
                    : isCreatingGroup
                    ? groupStep === 'details'
                      ? 'New group'
                      : 'Add group members'
                    : 'New chat'}
                </h1>
                {isCreatingCommunity && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    Team
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748B] truncate">
                {isCreatingCommunity
                  ? communityStep === 'details'
                    ? 'Add description & guidelines'
                    : `${selectedGroupUserIds.length} members invited`
                  : isCreatingGroup
                  ? groupStep === 'details'
                    ? 'Provide group subject'
                    : `${selectedGroupUserIds.length} of ${contactsPool.length} selected`
                  : `${contactsPool.length} colleagues`}
              </p>
            </div>
          </div>

          {/* Header Action Button */}
          {isCreatingGroup ? (
            groupStep === 'members' ? (
              selectedGroupUserIds.length > 0 ? (
                <button
                  onClick={() => setGroupStep('details')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center space-x-1.5 font-semibold text-xs transition cursor-pointer shadow-xs animate-fadeIn"
                  title="Next: Group details"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button className="text-[#475569] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-[#F1F5F9]">
                  <Grid className="w-5 h-5" />
                </button>
              )
            ) : (
              <button
                onClick={handleConfirmCreateGroup}
                disabled={!groupNameInput.trim()}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                  groupNameInput.trim()
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-[#4F46E5]/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Create group"
              >
                <Check className="w-4 h-4 stroke-[2.8]" />
                <span>Create</span>
              </button>
            )
          ) : isCreatingCommunity ? (
            communityStep === 'members' ? (
              selectedGroupUserIds.length > 0 ? (
                <button
                  onClick={() => setCommunityStep('details')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white flex items-center space-x-1.5 font-semibold text-xs transition cursor-pointer shadow-xs animate-fadeIn"
                  title="Next: Community details"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button className="text-[#475569] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-[#F1F5F9]">
                  <Grid className="w-5 h-5" />
                </button>
              )
            ) : (
              <button
                onClick={handleConfirmCreateCommunity}
                disabled={!communityNameInput.trim()}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                  communityNameInput.trim()
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-[#059669]/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Create community"
              >
                <Check className="w-4 h-4 stroke-[2.8]" />
                <span>Create</span>
              </button>
            )
          ) : (
            <button className="text-[#475569] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-[#F1F5F9]">
              <Grid className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── STAGE 2: GROUP DETAILS SCREEN ── */}
        {isCreatingGroup && groupStep === 'details' ? (
          <div className="flex-1 overflow-y-auto chat-custom-scroll p-4 space-y-4 animate-fadeIn">
            {/* Group Icon Card */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white shadow-md group-hover:opacity-90 transition">
                  <Camera className="w-8 h-8 text-white/90" />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center border-2 border-white shadow-xs">
                  <Pencil className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-2">Group icon (optional)</p>
            </div>

            {/* Group Name Input */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Group Subject / Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && groupNameInput.trim()) {
                      handleConfirmCreateGroup();
                    }
                  }}
                  placeholder="Provide a group name (e.g. Core Product Squad)..."
                  className="w-full bg-[#F8FAFC] focus:bg-white text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition"
                  autoFocus
                  maxLength={60}
                />
                <span className="absolute right-3 top-3.5 text-[11px] text-[#94A3B8]">
                  {60 - groupNameInput.length}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Provide a subject and optional group icon
              </p>
            </div>

            {/* Selected Participants List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Participants ({selectedContacts.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setGroupStep('members')}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Change</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[240px] overflow-y-auto chat-custom-scroll pr-1 border border-[#E2E8F0] rounded-xl p-2 bg-[#F8FAFC]">
                {selectedContacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0]/70">
                    <div className="flex items-center space-x-3 min-w-0">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A] truncate">{c.name}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{c.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      Member
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating confirmation button */}
            <div className="pt-4 pb-12 flex justify-end">
              <button
                onClick={handleConfirmCreateGroup}
                disabled={!groupNameInput.trim()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-sm shadow-xl transition-all cursor-pointer ${
                  groupNameInput.trim()
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-[#4F46E5]/30 hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
                title="Create group"
              >
                <Check className="w-5 h-5 stroke-[2.8]" />
                <span>Create group</span>
              </button>
            </div>
          </div>
        ) : isCreatingCommunity && communityStep === 'details' ? (
          /* ── STAGE 2: COMMUNITY DETAILS SCREEN ── */
          <div className="flex-1 overflow-y-auto chat-custom-scroll p-4 space-y-4 animate-fadeIn">
            {/* Community Avatar Card */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center text-white shadow-md">
                <Users className="w-10 h-10 text-white" />
              </div>
              <p className="text-xs text-[#059669] font-semibold mt-2">Community Workspace</p>
            </div>

            {/* Community Name Input */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Community Name *
              </label>
              <input
                type="text"
                value={communityNameInput}
                onChange={(e) => setCommunityNameInput(e.target.value)}
                placeholder="Provide community name (e.g. Engineering & Design Guild)..."
                className="w-full bg-[#F8FAFC] focus:bg-white text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] px-4 py-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition"
                autoFocus
                maxLength={60}
              />
            </div>

            {/* Community Description Input */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Community Description & Guidelines
              </label>
              <textarea
                value={communityDescInput}
                onChange={(e) => setCommunityDescInput(e.target.value)}
                placeholder="What is this community about? Share guidelines, key topics, or channels..."
                rows={3}
                className="w-full bg-[#F8FAFC] focus:bg-white text-xs font-normal text-[#0F172A] placeholder-[#94A3B8] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition resize-none"
                maxLength={240}
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                Visible to all invited members when joining
              </p>
            </div>

            {/* Invited Participants List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Invited Members ({selectedContacts.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setCommunityStep('members')}
                  className="text-xs font-semibold text-[#059669] hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Change</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[200px] overflow-y-auto chat-custom-scroll pr-1 border border-[#E2E8F0] rounded-xl p-2 bg-[#F8FAFC]">
                {selectedContacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0]/70">
                    <div className="flex items-center space-x-3 min-w-0">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A] truncate">{c.name}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{c.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-200">
                      Invited
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating confirmation button */}
            <div className="pt-4 pb-12 flex justify-end">
              <button
                onClick={handleConfirmCreateCommunity}
                disabled={!communityNameInput.trim()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-sm shadow-xl transition-all cursor-pointer ${
                  communityNameInput.trim()
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-[#059669]/30 hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
                title="Create community"
              >
                <Check className="w-5 h-5 stroke-[2.8]" />
                <span>Create community</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── STAGE 1: MEMBER SELECTION & SEARCH SCREEN ── */
          <>
            {/* Selected Members Chips Bar */}
            {selectedContacts.length > 0 && (isCreatingGroup || isCreatingCommunity) && (
              <div className="px-3 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 animate-fadeIn">
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
                      <img src={c.avatar} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          isCreatingCommunity ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                      >
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <span className="truncate max-w-[85px]">{c.name.split(' ')[0]}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (c.userId) {
                          setSelectedGroupUserIds((prev) => prev.filter((id) => id !== c.userId));
                        }
                      }}
                      className="p-0.5 hover:bg-black/10 rounded-full cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="p-3 shrink-0">
              <div className="relative flex items-center bg-[#F1F5F9] rounded-lg px-3.5 py-1.5 border border-transparent focus-within:border-[#4F46E5]">
                <Search className="w-4 h-4 text-[#475569] mr-2 shrink-0" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Search name, role or department"
                  className="w-full bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Actions & Contacts list */}
            <div className="flex-1 overflow-y-auto chat-custom-scroll px-2 pb-24 space-y-1">
              {!isCreatingGroup && !isCreatingCommunity && (
                <>
                  {/* Action 1: New Group */}
                  <div
                    onClick={() => {
                      setIsCreatingGroup(true);
                      setGroupStep('members');
                      setIsCreatingCommunity(false);
                      setSelectedGroupUserIds([]);
                      setGroupNameInput('');
                    }}
                    className="flex items-center space-x-3.5 p-2.5 rounded-xl hover:bg-[#F8FAFC] cursor-pointer transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-[#0F172A] block">New group</span>
                      <span className="text-xs text-[#64748B]">Create a group with colleagues</span>
                    </div>
                  </div>

                  {/* Action 2: New Community */}
                  <div
                    onClick={() => {
                      setIsCreatingCommunity(true);
                      setCommunityStep('members');
                      setIsCreatingGroup(false);
                      setSelectedGroupUserIds([]);
                      setCommunityNameInput('');
                      setCommunityDescInput('');
                    }}
                    className="flex items-center space-x-3.5 p-2.5 rounded-xl hover:bg-[#F8FAFC] cursor-pointer transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#059669] to-[#10B981] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-[#0F172A]">New community</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">Team</span>
                      </div>
                      <span className="text-xs text-[#64748B]">Organize departments, channels & announcements</span>
                    </div>
                  </div>
                </>
              )}

              {isLoadingUsers && (
                <div className="flex items-center justify-center p-6 text-[#64748B] space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Loading company colleagues...</span>
                </div>
              )}

              {/* Contacts List */}
              {filteredContacts.map((contact, idx) => {
                const prev = filteredContacts[idx - 1];
                const showSectionHeader = !prev || prev.section !== contact.section;
                const isSelected = contact.userId ? selectedGroupUserIds.includes(contact.userId) : false;

                return (
                  <React.Fragment key={contact.id}>
                    {showSectionHeader && contact.section !== 'self' && (
                      <div className="px-3 pt-3 pb-1 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                        {contact.section}
                      </div>
                    )}
                    <div
                      onClick={() => {
                        if (isCreatingGroup || isCreatingCommunity) {
                          if (contact.userId) {
                            setSelectedGroupUserIds((prev) =>
                              prev.includes(contact.userId!)
                                ? prev.filter((id) => id !== contact.userId)
                                : [...prev, contact.userId!]
                            );
                          }
                        } else {
                          onStartDirectChat({
                            name: contact.name,
                            avatar: contact.avatar,
                            role: contact.subtitle || 'Contact',
                            userId: contact.userId,
                          });
                          setShowingNewChatView(false);
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] cursor-pointer transition ${
                        isSelected ? 'bg-[#F1F5F9] ring-1 ring-[#4F46E5]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : contact.isSpecial ? (
                          <div className="w-10 h-10 rounded-full bg-[#B45309] text-amber-100 flex items-center justify-center font-bold shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#4F46E5] border border-[#4F46E5]/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {contact.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#0F172A] truncate">{contact.name}</h4>
                          <p className="text-xs text-[#64748B] truncate">{contact.subtitle}</p>
                        </div>
                      </div>

                      {(isCreatingGroup || isCreatingCommunity) && (
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
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── UNMISSABLE FLOATING NEXT BUTTON AT BOTTOM-RIGHT ── */}
            {(isCreatingGroup || isCreatingCommunity) && selectedGroupUserIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (isCreatingGroup) setGroupStep('details');
                  else if (isCreatingCommunity) setCommunityStep('details');
                }}
                className={`absolute bottom-6 right-5 z-30 flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-fadeIn ${
                  isCreatingCommunity
                    ? 'bg-[#059669] hover:bg-[#047857] shadow-[#059669]/35'
                    : 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-[#4F46E5]/35'
                }`}
                title="Continue to details"
              >
                <span>Next ({selectedGroupUserIds.length})</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </aside>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RENDER DEFAULT CHATS LIST (Matching Image 1 Exactly)
  // ─────────────────────────────────────────────────────────────
  const totalUnreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const unreadChatsCount = conversations.filter((c) => (c.unreadCount || 0) > 0).length;
  const totalGroupsCount = conversations.filter((c) => c.isGroup).length;
  const totalFavouritesCount = conversations.filter(
    (c) => favouriteChatIds.includes(c.id) || (c as any).isFavourite
  ).length;

  const filteredConversations = conversations.filter((chat) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!chat.name.toLowerCase().includes(q) && !chat.lastMessage.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (activeFilter === 'unread') return (chat.unreadCount || 0) > 0;
    if (activeFilter === 'favourites') return favouriteChatIds.includes(chat.id) || (chat as any).isFavourite;
    if (activeFilter === 'groups') return chat.isGroup;
    return true;
  });

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-[#E2E8F0] select-none text-[#0F172A] relative overflow-hidden font-['Segoe_UI',Helvetica,Arial,sans-serif]">
      
      {/* 1. Header with Chats Title and 3 dots Menu */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-white">
        <div className="flex items-center space-x-2">
          {(activeChatId || onBackToDashboard) && (
            <button
              onClick={() => {
                if (activeChatId) {
                  onSelectChat('');
                } else if (onBackToDashboard) {
                  onBackToDashboard();
                }
              }}
              title={activeChatId ? "Back to all chats" : "Back to dashboard"}
              aria-label="Back"
              className="p-1.5 -ml-1.5 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}
          {/* Chats label */}
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Chats
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Three dots menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] flex items-center justify-center transition cursor-pointer"
              aria-label="Options"
              title="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-1.5 z-50 animate-fadeIn text-sm text-[#0F172A]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowingNewChatView(true);
                      setIsCreatingGroup(false);
                      setIsCreatingCommunity(false);
                      setGroupStep('members');
                      setCommunityStep('members');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    New chat
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowingNewChatView(true);
                      setIsCreatingGroup(true);
                      setGroupStep('members');
                      setIsCreatingCommunity(false);
                      setSelectedGroupUserIds([]);
                      setGroupNameInput('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    New group
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowingNewChatView(true);
                      setIsCreatingCommunity(true);
                      setCommunityStep('members');
                      setIsCreatingGroup(false);
                      setSelectedGroupUserIds([]);
                      setCommunityNameInput('');
                      setCommunityDescInput('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between"
                  >
                    <span>New community</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Team</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setActiveFilter('unread'); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    Unread chats
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setActiveFilter('favourites'); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    Favourites
                  </button>
                  <div className="h-px bg-[#E2E8F0] my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (activeChatId) {
                        const activeC = conversations.find((c) => c.id === activeChatId);
                        if (activeC) onOpenDisappearingForChat?.(activeC);
                      } else if (conversations.length > 0) {
                        onOpenDisappearingForChat?.(conversations[0]);
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer flex items-center space-x-2 text-[#0F172A]"
                  >
                    <Clock className="w-4 h-4 text-[#00A884]" />
                    <span>Disappearing messages</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F8FAFC] text-[#475569] cursor-pointer"
                  >
                    Settings
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="px-3 pt-2 pb-2 shrink-0 bg-white">
        <div className="relative flex items-center bg-[#F1F5F9] rounded-lg px-3 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4F46E5] transition">
          <Search className="w-4 h-4 text-[#475569] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start a new chat"
            className="w-full bg-transparent text-[13.5px] text-[#0F172A] placeholder-[#475569] focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Filter Tabs (All, Unread, Favourites, Groups) */}
      <div
        ref={filterScrollRef}
        className="px-3 pb-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar border-b border-[#E2E8F0] shrink-0 bg-white"
      >
        {/* All */}
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer shrink-0 ${
            activeFilter === 'all'
              ? 'bg-[#EEF2FF] text-[#4F46E5]'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          All
        </button>

        {/* Unread */}
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition cursor-pointer shrink-0 ${
            activeFilter === 'unread'
              ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          Unread{totalUnreadCount > 0 ? ` ${totalUnreadCount}` : ''}
        </button>

        {/* Favourites */}
        <button
          onClick={() => setActiveFilter('favourites')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition cursor-pointer shrink-0 ${
            activeFilter === 'favourites'
              ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          Favourites{totalFavouritesCount > 0 ? ` ${totalFavouritesCount}` : ''}
        </button>

        {/* Groups */}
        <button
          onClick={() => setActiveFilter('groups')}
          className={`px-3 py-1 text-xs font-medium rounded-full transition cursor-pointer shrink-0 ${
            activeFilter === 'groups'
              ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          Groups{totalGroupsCount > 0 ? ` ${totalGroupsCount}` : ''}
        </button>

        {/* Right Arrow Button (scrolls filters horizontally) */}
        <button
          type="button"
          onClick={handleScrollFilters}
          title="Scroll filters"
          className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#475569] shrink-0 cursor-pointer hover:bg-[#E2E8F0] transition ml-auto"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. Chat Items List */}
      <div className="flex-1 overflow-y-auto chat-custom-scroll divide-y divide-[#F1F5F9] bg-white">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#64748B] select-none h-64">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
              {activeFilter === 'unread' ? (
                <Check className="w-6 h-6 text-[#4F46E5]" />
              ) : activeFilter === 'favourites' ? (
                <Star className="w-6 h-6 text-amber-500" />
              ) : activeFilter === 'groups' ? (
                <Users className="w-6 h-6 text-[#4F46E5]" />
              ) : (
                <Search className="w-6 h-6 text-[#475569]" />
              )}
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1">
              {activeFilter === 'unread'
                ? 'No unread chats'
                : activeFilter === 'favourites'
                ? 'No favourites yet'
                : activeFilter === 'groups'
                ? 'No groups found'
                : 'No chats found'}
            </p>
            <p className="text-xs text-[#64748B] max-w-[220px] mb-3 leading-relaxed">
              {activeFilter === 'unread'
                ? 'You have read all your messages.'
                : activeFilter === 'favourites'
                ? 'Hover over any chat and click the star icon to add it to your favourites.'
                : activeFilter === 'groups'
                ? 'You are not a member of any group chat yet.'
                : `No chats match "${searchQuery}".`}
            </p>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-full transition cursor-pointer"
              >
                View all chats
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isFav = favouriteChatIds.includes(chat.id) || (chat as any).isFavourite;

            const lastMsg =
              chat.messages && chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;

            const isLastMsgOutgoing = Boolean(
              chat.lastMessageIsOutgoing ?? lastMsg?.isOutgoing
            );

            const lastMsgStatus =
              chat.lastMessageStatus ??
              (lastMsg?.isOutgoing ? lastMsg.status : 'sent');

            const hasUnread = (chat.unreadCount || 0) > 0;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setOpenRowMenuChatId(openRowMenuChatId === chat.id ? null : chat.id);
                }}
                className={`group flex items-center px-3.5 py-3 cursor-pointer transition relative ${
                  isActive
                    ? 'bg-[#EEF2FF]'
                    : 'hover:bg-[#F8FAFC] bg-white'
                }`}
              >
                {/* Avatar */}
                <div className="relative mr-3.5 shrink-0">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : chat.isCommunity ? (
                    <div
                      style={{ backgroundColor: chat.avatarBg || '#059669' }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  ) : chat.avatarIconType === 'purple_group' ? (
                    <div
                      style={{ backgroundColor: chat.avatarBg || '#f3e8ff' }}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[#9333ea]"
                    >
                      <PurpleGroupIcon className="w-6 h-6 text-[#9333ea]" />
                    </div>
                  ) : (
                    <div
                      style={{ backgroundColor: chat.avatarBg || '#EEF2FF' }}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[#4F46E5] font-bold text-base"
                    >
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Online indicator dot (shown if not disappearing) */}
                  {chat.type === 'direct' && chat.isOnline && (!chat.disappearingTimer || chat.disappearingTimer === 'off') && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] border-2 border-white rounded-full" />
                  )}

                  {/* WhatsApp Authentic Disappearing Messages Clock Badge Overlaid on Avatar */}
                  {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#CBD5E1] shadow-2xs flex items-center justify-center z-10"
                      title={`Disappearing messages: ${chat.disappearingTimer.replace('_', ' ')}`}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[#00A884]">
                        <path d="M8 0a8 8 0 1 0 8 8A8.01 8.01 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 14.5 8 6.51 6.51 0 0 1 8 14.5zm.75-10.25h-1.5v4.5l3.5 2.1.75-1.23-2.75-1.62z" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Chat details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                      <h3 className="text-[15px] font-semibold text-[#0F172A] truncate">
                        {chat.name}
                      </h3>
                      {chat.isCommunity && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0 leading-tight">
                          Community
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs shrink-0 ${
                        hasUnread ? 'text-[#4F46E5] font-semibold' : 'text-[#64748B]'
                      }`}
                    >
                      {chat.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 min-w-0 flex-1 mr-2">
                      {isLastMsgOutgoing && (
                        <MessageStatusIcon
                          status={lastMsgStatus}
                          variant="sidebar"
                        />
                      )}
                      {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-[#64748B] shrink-0 mr-0.5 inline">
                          <path d="M8 0a8 8 0 1 0 8 8A8.01 8.01 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 14.5 8 6.51 6.51 0 0 1 8 14.5zm.75-10.25h-1.5v4.5l3.5 2.1.75-1.23-2.75-1.62z" />
                        </svg>
                      )}
                      <p
                        className={`text-[13px] truncate ${
                          hasUnread
                            ? 'text-[#0F172A] font-medium'
                            : 'text-[#64748B]'
                        }`}
                      >
                        {chat.lastMessage}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      {/* Favourite Star Icon */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavourite(chat.id, e)}
                        title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                        className={`p-1 rounded-full hover:bg-black/5 transition cursor-pointer ${
                          isFav
                            ? 'text-amber-500'
                            : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>

                      {/* Mute Icon */}
                      {chat.isMuted && (
                        <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" />
                      )}

                      {/* Green/Indigo Unread Badge matching WhatsApp */}
                      {hasUnread && (
                        <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                          {chat.unreadCount}
                        </span>
                      )}

                      {/* WhatsApp Hover Chevron Context Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenRowMenuChatId(openRowMenuChatId === chat.id ? null : chat.id);
                          }}
                          title="Chat options"
                          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {openRowMenuChatId === chat.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRowMenuChatId(null);
                              }}
                            />
                            <div
                              className="absolute right-0 top-6 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-sm text-[#0F172A] text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuChatId(null);
                                  onOpenDisappearingForChat?.(chat);
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer"
                              >
                                <div className="flex items-center space-x-2.5">
                                  <Clock className="w-4 h-4 text-[#00A884]" />
                                  <span>Disappearing messages</span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#00A884] bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {chat.disappearingTimer && chat.disappearingTimer !== 'off'
                                    ? chat.disappearingTimer === '24_hours' ? '24h' : chat.disappearingTimer === '7_days' ? '7d' : '90d'
                                    : 'Off'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuChatId(null);
                                  toggleFavourite(chat.id, null);
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer text-slate-700"
                              >
                                <Star className={`w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                                <span>{isFav ? 'Unfavourite' : 'Add to favourites'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuChatId(null);
                                  chat.isMuted = !chat.isMuted;
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer text-slate-700"
                              >
                                <VolumeX className="w-4 h-4 text-slate-400" />
                                <span>{chat.isMuted ? 'Unmute' : 'Mute notifications'}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Green Unread Badge matching WhatsApp Web */}
                      {hasUnread && (
                        <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Floating Action Button (FAB) for New Chat in Bottom-Right Corner (Matching previous black theme design) */}
      <button
        onClick={() => {
          setIsCreatingGroup(false);
          setIsCreatingCommunity(false);
          setGroupStep('members');
          setCommunityStep('members');
          setSelectedGroupUserIds([]);
          setGroupNameInput('');
          setCommunityNameInput('');
          setCommunityDescInput('');
          setShowingNewChatView(true);
        }}
        title="New chat"
        aria-label="New chat"
        className="absolute bottom-6 right-5 z-20 w-13 h-13 rounded-2xl bg-[#B63EEE] hover:bg-[#A02FD8] text-white flex items-center justify-center shadow-lg shadow-[#B63EEE]/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9h-5v5h-2v-5H6V9h5V4h2v5h5v2z" />
        </svg>
      </button>

    </aside>
  );
};

export default ChatSidebar;
