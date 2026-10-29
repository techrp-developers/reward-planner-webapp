import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../../context/AuthContext';
import { statusApi, CreateStatusPayload } from '../../../api/statusApi';
import { resolveAvatarUrl } from '../../../api/client';
import { isCompanyMatch, getCompanyFromUser, getCompanyIdFromUser } from '../../../services/celebrationService';
import { INITIAL_COMPANY_EMPLOYEES } from '../../../data/companyEmployeesData';

export interface StoryCommentItem {
  id: string | number;
  name: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

export interface StoryViewerItem {
  id: string | number;
  userId?: number;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  viewedAt: string;
  liked?: boolean;
}

export interface StorySlide {
  id: string | number;
  statusId?: number;
  image: string;
  caption: string;
  tag?: string;
  createdAt?: string;
  type?: 'image' | 'video' | 'text';
  backgroundColor?: string;
  fontStyle?: string;
  liked?: boolean;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  viewers?: StoryViewerItem[];
  comments?: StoryCommentItem[];
}

export interface EmployeeStory {
  id: string | number;
  userId?: number;
  name: string;
  avatar: string;
  role: string;
  department: string;
  company?: string;
  isUser?: boolean;
  viewed: boolean;
  slides: StorySlide[];
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const time = new Date(dateStr).getTime();
  if (isNaN(time)) return dateStr;
  const diffMs = Date.now() - time;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getSeedViewersForSlide(): StoryViewerItem[] {
  return [];
}

function getSeedCommentsForSlide(): StoryCommentItem[] {
  return [];
}

interface ViewerAvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const ViewerAvatar: React.FC<ViewerAvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatar]);

  const firstLetter = React.useMemo(() => {
    if (!name) return 'U';
    const clean = name.trim();
    const firstName = clean.split(/\s+/)[0] || clean;
    return firstName.charAt(0).toUpperCase() || 'U';
  }, [name]);

  const resolvedAvatar = React.useMemo(() => resolveAvatarUrl(avatar), [avatar]);
  const hasValidAvatar = Boolean(resolvedAvatar && !imgFailed);

  const bgGradients = [
    'from-[#8B5CF6] to-[#6D28D9] text-white',
    'from-[#EC4899] to-[#BE185D] text-white',
    'from-[#3B82F6] to-[#1D4ED8] text-white',
    'from-[#10B981] to-[#047857] text-white',
    'from-[#F59E0B] to-[#D97706] text-white',
    'from-[#6366F1] to-[#4338CA] text-white',
    'from-[#14B8A6] to-[#0F766E] text-white',
    'from-[#F43F5E] to-[#BE123C] text-white',
  ];
  const charCode = firstLetter.charCodeAt(0) || 0;
  const gradientClass = bgGradients[charCode % bgGradients.length];

  const sizeStyles = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/20 shadow-xs select-none ${className}`}
    >
      {hasValidAvatar ? (
        <img
          src={resolvedAvatar}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold bg-gradient-to-br ${gradientClass} uppercase tracking-wider`}
        >
          {firstLetter}
        </div>
      )}
    </div>
  );
};

interface StoryAvatarProps {
  name: string;
  avatar?: string;
  isViewed?: boolean;
  isUser?: boolean;
  hasSlides?: boolean;
  size?: 'sm' | 'md';
  onAddClick?: (e: React.MouseEvent) => void;
}

const StoryAvatar: React.FC<StoryAvatarProps> = ({
  name,
  avatar,
  isViewed,
  isUser,
  hasSlides,
  size = 'md',
  onAddClick,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatar]);

  const firstLetter = React.useMemo(() => {
    if (!name) return 'U';
    const clean = name.trim();
    const firstName = clean.split(/\s+/)[0] || clean;
    return firstName.charAt(0).toUpperCase() || 'U';
  }, [name]);

  const resolvedAvatar = React.useMemo(() => resolveAvatarUrl(avatar), [avatar]);
  const hasValidAvatar = Boolean(resolvedAvatar && !imgFailed);

  const bgGradients = [
    'from-rose-500 to-pink-600 text-white',
    'from-purple-600 to-indigo-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-emerald-500 to-teal-600 text-white',
    'from-sky-500 to-blue-600 text-white',
    'from-fuchsia-500 to-rose-600 text-white',
  ];
  const charCode = firstLetter.charCodeAt(0) || 0;
  const gradientClass = bgGradients[charCode % bgGradients.length];

  if (size === 'sm') {
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/80 shadow-xs shrink-0 bg-slate-800">
        {hasValidAvatar ? (
          <img
            src={resolvedAvatar}
            alt={name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-bold text-xs bg-gradient-to-br ${gradientClass} select-none uppercase`}>
            {firstLetter}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={`rounded-full transition-all duration-300 group-hover/story:scale-105 ${
          isUser && !hasSlides
            ? 'p-[1.5px] bg-slate-200'
            : isViewed
            ? 'p-[1.5px] bg-[#CBD5E1]'
            : 'p-[2px] bg-gradient-to-tr from-[#F59E0B] via-[#EC4899] to-[#8B5CF6]'
        }`}
      >
        <div className="p-[1.5px] bg-white rounded-full">
          <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] lg:w-[48px] lg:h-[48px] rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-slate-50">
            {hasValidAvatar ? (
              <img
                src={resolvedAvatar}
                alt={name}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center font-bold text-sm sm:text-base bg-gradient-to-br ${gradientClass} select-none uppercase tracking-tight`}>
                {firstLetter}
              </div>
            )}
          </div>
        </div>
      </div>

      {isUser && onAddClick && (
        <button
          type="button"
          onClick={onAddClick}
          className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white border-2 border-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
          title="Add a moment"
        >
          <AddIcon sx={{ fontSize: 10 }} />
        </button>
      )}
    </div>
  );
};

const INITIAL_STORIES: EmployeeStory[] = [
  {
    id: 'user',
    name: 'Your story',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Team Member',
    department: 'MPS Global',
    company: 'MPS Global',
    isUser: true,
    viewed: false,
    slides: [],
  },
  {
    id: 'emp-mps-001',
    name: 'Monica Sylas',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'User Experience Designer',
    department: 'HDP Department',
    company: 'MPS Global',
    viewed: false,
    slides: [
      {
        id: 'ms1',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
        caption: 'Kicking off the quarterly design system update with our team! 🎨👩‍💻',
        tag: 'Design Sync',
        createdAt: '1h ago',
      },
      {
        id: 'ms2',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
        caption: 'Courtyard brainstorm with fresh coffee: ideas flow so much better outdoors ☕💡',
        tag: 'Workspace',
        createdAt: '2h ago',
      },
    ],
  },
  {
    id: 'emp-mps-002',
    name: 'Lokesh Ankam',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'UX Lead',
    department: 'Design',
    company: 'MPS Global',
    viewed: false,
    slides: [
      {
        id: 'la1',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
        caption: 'Shipped our zero-defect component library updates for release 4.2! Huge kudos team 🚀🔥',
        tag: 'Tech Release',
        createdAt: '3h ago',
      },
    ],
  },
  {
    id: 'emp-mps-004',
    name: 'Yana Crout',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'People Ops Partner',
    department: 'People Operations',
    company: 'MPS Global',
    viewed: false,
    slides: [
      {
        id: 'yc1',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
        caption: 'Welcoming our brilliant new cohort of corporate team members today! 🌟🤝',
        tag: 'Welcome Aboard',
        createdAt: '4h ago',
      },
    ],
  },
  {
    id: 'emp-mps-005',
    name: 'Chandra Shekar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Product Lead',
    department: 'Product Management',
    company: 'MPS Global',
    viewed: false,
    slides: [
      {
        id: 'cs1',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
        caption: 'Hit our 100K active employee benefits redemption milestone this afternoon! Team celebratory lunch 🍕🏆',
        tag: '100K Milestone',
        createdAt: '5h ago',
      },
    ],
  },
  {
    id: 'emp-mps-007',
    name: 'Samuel Felix',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    role: 'Marketing Head',
    department: 'Marketing',
    company: 'MPS Global',
    viewed: true,
    slides: [
      {
        id: 'sf1',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
        caption: 'New corporate perks campaigns are outperforming all Q3 engagement benchmarks! 🎯📈',
        tag: 'Growth Record',
        createdAt: '6h ago',
      },
    ],
  },
  {
    id: 'emp-rp-001',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    role: 'Engineering Lead',
    department: 'Engineering',
    company: 'Reward Planners',
    viewed: false,
    slides: [
      {
        id: 'ps1',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Zero downtime microservices upgrade complete. Production is running blazing fast! ⚡🛡️',
        tag: 'Engineering Win',
        createdAt: '2h ago',
      },
    ],
  },
  {
    id: 'emp-db-001',
    name: 'Sahil Mujawar',
    avatar: 'https://cdn.rewardplanners.com/public/customers/3/profile-1780557293208-fy7idl.jpg',
    role: 'Cloud Infrastructure',
    department: 'Core Platform',
    company: 'Reward Planners',
    viewed: false,
    slides: [
      {
        id: 'sm1',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cloud infrastructure autoscaling validated for peak benefits redemption traffic! 📊⚡',
        tag: 'Platform Stability',
        createdAt: '3h ago',
      },
    ],
  },
  {
    id: 'emp-db-003',
    name: 'Shrinivas Karur',
    avatar: 'https://cdn.rewardplanners.com/public/customers/2/profile-1782469870592-8d0opj.webp',
    role: 'Operations Lead',
    department: 'Operations',
    company: 'Reward Planners',
    viewed: false,
    slides: [
      {
        id: 'sk1',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Corporate partner onboarding completed ahead of schedule this week! 💼📊',
        tag: 'Operations Win',
        createdAt: '4h ago',
      },
    ],
  },
  {
    id: 'emp-db-002',
    name: 'Sakshi Nit',
    avatar: 'https://cdn.rewardplanners.com/public/customers/10/profile-1781847143044-r3xwx8.jpg',
    role: 'Quality Assurance Lead',
    department: 'Quality Engineering',
    company: 'Policy Planner',
    viewed: true,
    slides: [
      {
        id: 'sn1',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
        caption: 'Comprehensive end-to-end test suite passing across all devices and browsers! ✅📱',
        tag: 'QA Milestone',
        createdAt: '7h ago',
      },
    ],
  },
  {
    id: 'emp-pp-002',
    name: 'Rohit Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Policy Operations Lead',
    department: 'Underwriting & Operations',
    company: 'Policy Planner',
    viewed: false,
    slides: [
      {
        id: 'rk1',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
        caption: 'Automated claim underwriting approval rate reached 99.4% today! 📈📑',
        tag: 'Operational Win',
        createdAt: '4h ago',
      },
    ],
  },
  {
    id: 'emp-tcs-001',
    name: 'Rajesh Nair',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Principal Consultant',
    department: 'Cloud Infrastructure',
    company: 'Tata Consultancy Services',
    viewed: false,
    slides: [
      {
        id: 'rn1',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
        caption: 'Cloud migration architect sync concluded with zero architecture debt! ☁️🛡️',
        tag: 'Cloud Milestone',
        createdAt: '5h ago',
      },
    ],
  },
];

export default function EmployeeStories() {
  const { user } = useAuth();

  // Retrieve cached user profile from session/local storage for instant hydration
  const cachedUser = React.useMemo(() => {
    try {
      const stored = sessionStorage.getItem('rp_user_profile') || localStorage.getItem('rp_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const activeUser = user || cachedUser;
  const activeCompanyName = getCompanyFromUser(activeUser) || (activeUser ? '' : 'MPS Global');
  const activeCompanyId =
    getCompanyIdFromUser(activeUser) ||
    activeUser?.company_id ||
    activeUser?.companyId ||
    activeUser?.company?.company_id ||
    activeUser?.company?.id ||
    activeUser?.employeeInfo?.company_id ||
    '';
  const activeUserId =
    activeUser?.userId ||
    activeUser?.user_id ||
    activeUser?.id ||
    activeUser?.customer_id ||
    '';

  const companyStorageKey = React.useMemo(() => {
    const safeComp = (activeCompanyId || activeCompanyName || (activeUserId ? `user_${activeUserId}` : 'company')).toString().replace(/[^a-z0-9]/gi, '_');
    return `rp_stories_${safeComp}`;
  }, [activeCompanyId, activeCompanyName, activeUserId]);

  const [stories, setStories] = useState<EmployeeStory[]>(() => {
    try {
      // Purge legacy global cross-company storage keys so stories from other companies never leak
      localStorage.removeItem('rp_employee_stories_v5');
      localStorage.removeItem('rp_employee_stories_v6');
      localStorage.removeItem('rp_employee_stories');

      const safeComp = (activeCompanyId || activeCompanyName || (activeUserId ? `user_${activeUserId}` : 'company')).toString().replace(/[^a-z0-9]/gi, '_');
      const stored = sessionStorage.getItem(`rp_stories_${safeComp}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.every(
            (s: EmployeeStory) => s.isUser || (s.company && isCompanyMatch(s.company, activeCompanyName))
          );
          if (valid) return parsed;
        }
      }
    } catch {}

    const userEntry: EmployeeStory = {
      id: 'user',
      name: 'Your story',
      avatar: resolveAvatarUrl(
        (activeUser as any)?.userImage ||
        (activeUser as any)?.avatar ||
        (activeUser as any)?.user_image ||
        (activeUser as any)?.photo
      ),
      role: (activeUser as any)?.designation || (activeUser as any)?.role || 'Team Member',
      department: (activeUser as any)?.department || activeCompanyName || 'Team Member',
      company: activeCompanyName || 'Company',
      isUser: true,
      viewed: false,
      slides: [],
    };

    // If authenticated user, do not seed with fake colleague stories
    if (activeUser) {
      return [userEntry];
    }

    const companyColleagues = INITIAL_STORIES.filter(
      (s) => !s.isUser && s.company && isCompanyMatch(s.company, activeCompanyName)
    );

    return [userEntry, ...companyColleagues];
  });
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Track active story modal view by ID
  const [activeStoryId, setActiveStoryId] = useState<string | number | null>(null);
  const [viewingQueue, setViewingQueue] = useState<EmployeeStory[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Add Story Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [storyPreviewImage, setStoryPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive reactions in story viewer
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Instagram-style Viewers, Likes, and Comments Bottom Sheet
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
  const [activityTab, setActivityTab] = useState<'viewers' | 'likes' | 'comments'>('viewers');
  const [viewerSearchQuery, setViewerSearchQuery] = useState('');
  const [sheetCommentText, setSheetCommentText] = useState('');

  // Delete Story Confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingSlide, setIsDeletingSlide] = useState(false);

  // Per-slide state caches
  const [slideViewersMap, setSlideViewersMap] = useState<Record<string, StoryViewerItem[]>>({});
  const [slideCommentsMap, setSlideCommentsMap] = useState<Record<string, StoryCommentItem[]>>({});
  const [slideLikesMap, setSlideLikesMap] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [slideLikesUsersMap, setSlideLikesUsersMap] = useState<Record<string, StoryViewerItem[]>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load live feed from backend status APIs strictly for active company
  const loadStoriesFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      // 1. Gather all known user IDs & employee records for the active company
      const companyUserIds = new Set<number>();
      const companyEmployeesMap = new Map<number, { name: string; avatar?: string; role?: string; department?: string; company: string }>();

      // A. Active user's colleagues in profile
      const profileColleagues = [
        ...(Array.isArray(activeUser?.birthday_employees) ? activeUser.birthday_employees : []),
        ...(Array.isArray(activeUser?.today_birthdays) ? activeUser.today_birthdays : []),
        ...(Array.isArray(activeUser?.upcoming_birthdays) ? activeUser.upcoming_birthdays : []),
        ...(Array.isArray(activeUser?.company_users) ? activeUser.company_users : []),
        ...(Array.isArray(activeUser?.employees) ? activeUser.employees : []),
        ...(Array.isArray(activeUser?.company?.employees) ? activeUser.company.employees : []),
      ];

      for (const col of profileColleagues) {
        const uId = col.recipient_user_id || col.user_id || col.id;
        if (uId && Number(uId) > 0) {
          companyUserIds.add(Number(uId));
          companyEmployeesMap.set(Number(uId), {
            name: col.name,
            avatar: resolveAvatarUrl(col.image || col.photo || col.user_image || col.avatar || col.userImage),
            role: col.role || 'Colleague',
            department: col.department || activeCompanyName,
            company: activeCompanyName,
          });
        }
      }

      // B. Fetch audience options and isolate ONLY employees belonging to active company
      let audiencePeople: any[] = [];
      try {
        const audience = await statusApi.getAudienceOptions();
        audiencePeople = audience?.people || [];
        for (const person of audiencePeople) {
          const personCompId = person.company?.id;
          const personCompName = person.company?.name;
          const matches =
            (activeCompanyId && personCompId && String(personCompId) === String(activeCompanyId)) ||
            (personCompName && isCompanyMatch(personCompName, activeCompanyName));

          if (matches && person.id && Number(person.id) > 0) {
            companyUserIds.add(Number(person.id));
            if (!companyEmployeesMap.has(Number(person.id))) {
              companyEmployeesMap.set(Number(person.id), {
                name: person.name,
                avatar: resolveAvatarUrl(person.image_url || person.user_image || person.avatar),
                role: 'Colleague',
                department: activeCompanyName,
                company: activeCompanyName,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch audience options:', err);
      }

      // 2. Fetch live status feed directly (backend enforces company visibility at SQL level)
      const [feedGroups, myStatuses] = await Promise.all([
        statusApi.getFeed(),
        statusApi.getMine(),
      ]);

      const currentUserId = activeUserId ? Number(activeUserId) : undefined;

      // 3. Build user slides
      const mySlides: StorySlide[] = (myStatuses || []).map((s) => ({
        id: s.id,
        statusId: s.id,
        image: s.media_url || '',
        caption: s.text || '',
        tag: 'Your Moment',
        createdAt: formatRelativeTime(s.created_at),
        type: s.type,
        backgroundColor: s.background_color || undefined,
        fontStyle: s.font_style || undefined,
        liked: s.liked,
        likeCount: s.like_count,
        commentCount: s.comment_count,
        viewCount: s.view_count,
      }));

      const myStory: EmployeeStory = {
        id: 'user',
        userId: currentUserId,
        name: 'Your story',
        avatar: resolveAvatarUrl(
          (activeUser as any)?.userImage ||
          (activeUser as any)?.avatar ||
          (activeUser as any)?.user_image ||
          (activeUser as any)?.photo
        ),
        role: (activeUser as any)?.designation || (activeUser as any)?.role || 'Team Member',
        department: (activeUser as any)?.department || activeCompanyName,
        company: activeCompanyName,
        isUser: true,
        viewed: mySlides.length > 0 ? mySlides.every((s: any) => s.viewed) : false,
        slides: mySlides,
      };

      // 4. Process feed groups returned by backend
      const colleagueStories: EmployeeStory[] = [];
      if (feedGroups && feedGroups.length > 0) {
        for (const group of feedGroups) {
          const groupId = Number(group.user.id);
          if (currentUserId && groupId === currentUserId) {
            continue;
          }

          const slides: StorySlide[] = (group.statuses || []).map((s) => ({
            id: s.id,
            statusId: s.id,
            image: s.media_url || '',
            caption: s.text || '',
            tag: s.type === 'video' ? 'Video' : 'Moment',
            createdAt: formatRelativeTime(s.created_at),
            type: s.type,
            backgroundColor: s.background_color || undefined,
            fontStyle: s.font_style || undefined,
            liked: s.liked,
            likeCount: s.like_count,
            commentCount: s.comment_count,
            viewCount: s.view_count,
          }));

          if (slides.length > 0) {
            const registeredEmp = companyEmployeesMap.get(groupId);
            colleagueStories.push({
              id: `colleague-${group.user.id}`,
              userId: group.user.id,
              name: registeredEmp?.name || group.user.name,
              avatar: resolveAvatarUrl(
                group.user.image_url ||
                group.user.user_image ||
                registeredEmp?.avatar ||
                ''
              ),
              role: registeredEmp?.role || 'Colleague',
              department: registeredEmp?.department || activeCompanyName || 'Team Member',
              company: activeCompanyName || 'Company',
              viewed: !group.has_unviewed,
              slides,
            });
          }
        }
      }

      // 5. Update stories state strictly partitioned by company
      if (colleagueStories.length > 0 || mySlides.length > 0) {
        const combined = [myStory, ...colleagueStories];
        setStories(combined);
        try {
          sessionStorage.setItem(companyStorageKey, JSON.stringify(combined));
        } catch {}
      } else {
        // In authenticated mode, keep user's story without fake dummy colleagues
        if (!activeUser) {
          const companyColleagues = INITIAL_STORIES.filter(
            (s) => !s.isUser && s.company && isCompanyMatch(s.company, activeCompanyName)
          );
          setStories([myStory, ...companyColleagues]);
        } else {
          setStories([myStory]);
        }
      }
    } catch (err) {
      console.warn('Failed to load status feed:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [activeUser, activeCompanyName, activeCompanyId, activeUserId, companyStorageKey]);

  useEffect(() => {
    loadStoriesFeed();
  }, [loadStoriesFeed]);

  // Dynamically sort stories:
  // 1. "Your story" pinned at the beginning (index 0)
  // 2. All unviewed / newly added stories at the starting
  // 3. All viewed stories moved to the end
  const sortedStories = React.useMemo(() => {
    const userStory = stories.find((s) => s.isUser);
    const otherStories = stories.filter((s) => !s.isUser);
    const newStories = otherStories.filter((s) => !s.viewed);
    const viewedStories = otherStories.filter((s) => s.viewed);

    return [
      ...(userStory ? [userStory] : []),
      ...newStories,
      ...viewedStories,
    ];
  }, [stories]);

  const activeStoryIndex = viewingQueue.findIndex((s) => s.id === activeStoryId);
  const activeStory = activeStoryIndex !== -1 ? viewingQueue[activeStoryIndex] : null;
  const activeSlide = activeStory ? activeStory.slides[currentSlideIndex] : null;
  const hasPrevStory = currentSlideIndex > 0 || activeStoryIndex > 0;

  const isMyStory = Boolean(
    activeStory?.isUser ||
    (activeStory?.userId && activeUserId && Number(activeStory.userId) === Number(activeUserId)) ||
    activeStory?.name === 'Your story' ||
    (activeUser && activeStory?.name === ((activeUser as any)?.name || (activeUser as any)?.fullName))
  );

  const currentUserName =
    (activeUser as any)?.name ||
    (activeUser as any)?.fullName ||
    'You';

  const currentUserAvatar = resolveAvatarUrl(
    (activeUser as any)?.userImage ||
    (activeUser as any)?.avatar ||
    (activeUser as any)?.user_image ||
    (activeUser as any)?.photo ||
    ''
  );

  const currentSlideKey = activeSlide ? String(activeSlide.id) : '';
  const currentViewers = (currentSlideKey && slideViewersMap[currentSlideKey]) || activeSlide?.viewers || [];
  const currentComments = (currentSlideKey && slideCommentsMap[currentSlideKey]) || activeSlide?.comments || [];
  const currentSlideLikes = (currentSlideKey && slideLikesMap[currentSlideKey]) || {
    liked: Boolean(liked),
    count: typeof activeSlide?.likeCount === 'number' ? activeSlide.likeCount : likeCount,
  };
  const currentLikedUsers = (currentSlideKey && slideLikesUsersMap[currentSlideKey]) || [];

  const filteredViewers = React.useMemo(() => {
    if (!viewerSearchQuery.trim()) return currentViewers;
    const q = viewerSearchQuery.toLowerCase();
    return currentViewers.filter(
      (v) => v.name.toLowerCase().includes(q) || (v.role && v.role.toLowerCase().includes(q))
    );
  }, [currentViewers, viewerSearchQuery]);

  const filteredLikers = React.useMemo(() => {
    if (!viewerSearchQuery.trim()) return currentLikedUsers;
    const q = viewerSearchQuery.toLowerCase();
    return currentLikedUsers.filter(
      (v) => v.name.toLowerCase().includes(q) || (v.role && v.role.toLowerCase().includes(q))
    );
  }, [currentLikedUsers, viewerSearchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to fetch live real viewers, likes & comments for active slide
  const refreshSlideInteractions = useCallback(async (statusId: number, slideKey: string) => {
    // 1. Fetch real viewers
    try {
      const viewersData = await statusApi.getViewers(statusId);
      if (Array.isArray(viewersData)) {
        const realViewers: StoryViewerItem[] = viewersData.map((v: any, idx: number) => ({
          id: `real-v-${v.user_id || v.id || idx}`,
          userId: v.user_id || v.user?.id,
          name: v.name || v.user?.name || 'Colleague',
          avatar: resolveAvatarUrl(v.image_url || v.user?.image_url || v.user_image || v.user?.user_image),
          role: v.role || v.user?.designation || 'Colleague',
          department: v.department || v.user?.department || activeCompanyName || 'Team Member',
          viewedAt: v.viewed_at ? formatRelativeTime(v.viewed_at) : (v.created_at ? formatRelativeTime(v.created_at) : 'Just now'),
          liked: Boolean(v.liked),
        }));
        setSlideViewersMap((prev) => ({ ...prev, [slideKey]: realViewers }));
      }
    } catch {}

    // 2. Fetch real likes & users who liked
    try {
      const likesRes = await statusApi.getLikes(statusId);
      if (likesRes) {
        const realLikeUsers: StoryViewerItem[] = (likesRes.users || []).map((u, idx) => ({
          id: `real-like-${u.id || idx}`,
          userId: u.id,
          name: u.name,
          avatar: resolveAvatarUrl(u.image_url),
          role: 'Colleague',
          department: activeCompanyName || 'Team Member',
          viewedAt: u.liked_at ? formatRelativeTime(u.liked_at) : 'Liked',
          liked: true,
        }));
        setSlideLikesUsersMap((prev) => ({ ...prev, [slideKey]: realLikeUsers }));
        setLikeCount(likesRes.like_count);
        setSlideLikesMap((prev) => ({
          ...prev,
          [slideKey]: {
            liked: prev[slideKey]?.liked ?? Boolean(activeSlide?.liked),
            count: likesRes.like_count,
          },
        }));
      }
    } catch {}

    // 3. Fetch real comments
    try {
      const commentsData = await statusApi.getComments(statusId);
      if (Array.isArray(commentsData)) {
        const realComments: StoryCommentItem[] = commentsData.map((c: any, idx: number) => ({
          id: `real-c-${c.id || idx}`,
          name: c.user?.name || c.name || 'Colleague',
          avatar: resolveAvatarUrl(c.user?.image_url || c.image_url || c.user?.user_image || c.avatar),
          text: c.comment_text || c.text || c.comment || '',
          createdAt: c.created_at ? formatRelativeTime(c.created_at) : 'Just now',
        }));
        setSlideCommentsMap((prev) => ({ ...prev, [slideKey]: realComments }));
      }
    } catch {}
  }, [activeCompanyName, activeSlide?.liked]);

  // Mark status viewed & hydrate per-slide REAL viewers, comments, and likes
  useEffect(() => {
    if (!activeSlide) return;

    const key = String(activeSlide.id);

    // Sync like state from slide
    const slideLike = slideLikesMap[key] || {
      liked: Boolean(activeSlide.liked),
      count: typeof activeSlide.likeCount === 'number' ? activeSlide.likeCount : 0,
    };
    setLiked(slideLike.liked);
    setLikeCount(slideLike.count);

    // Initialize slideLikesMap if needed
    if (!slideLikesMap[key]) {
      setSlideLikesMap((prev) => ({ ...prev, [key]: slideLike }));
    }

    // Initialize slideViewersMap with empty default (no fake seed data)
    if (!slideViewersMap[key]) {
      setSlideViewersMap((prev) => ({ ...prev, [key]: activeSlide.viewers || [] }));
    }

    // Initialize slideCommentsMap with empty default (no fake seed data)
    if (!slideCommentsMap[key]) {
      setSlideCommentsMap((prev) => ({ ...prev, [key]: activeSlide.comments || [] }));
    }

    // If backend statusId exists, mark as viewed and fetch live viewers, likes & comments
    if (activeSlide.statusId) {
      statusApi
        .markViewed(activeSlide.statusId)
        .then((res) => {
          if (res?.viewed) {
            setStories((prev) =>
              prev.map((story) => {
                const hasSlide = story.slides.some((sl) => sl.id === activeSlide.id);
                if (hasSlide) {
                  return {
                    ...story,
                    viewed: story.slides.every((sl) => sl.id === activeSlide.id || (sl as any).viewed),
                  };
                }
                return story;
              })
            );
          }
        })
        .catch(() => {});

      refreshSlideInteractions(activeSlide.statusId, key);
    }
  }, [activeSlide?.id, activeSlide?.statusId, refreshSlideInteractions]);

  // Interactive scroll states (drag and wheel)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [draggedDistance, setDraggedDistance] = useState(0);

  // Horizontal scroll buttons - only scrolls when arrows are clicked
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mouse wheel horizontal scroll support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Mouse drag-to-scroll support
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
    setDraggedDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
    setDraggedDistance((prev) => prev + Math.abs(walk));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      setDraggedDistance(0);
    }, 200);
  };

  // Open a specific story
  const handleOpenStory = (storyId: string | number) => {
    // Snapshot the current sorted order for uninterrupted modal playback
    setViewingQueue(sortedStories);
    setActiveStoryId(storyId);
    setCurrentSlideIndex(0);
    setSlideProgress(0);
    setLiked(false);
    setReplyText('');

    // Mark as viewed
    setStories((prev) => {
      const next = prev.map((s) =>
        s.id === storyId ? { ...s, viewed: true } : s
      );
      try {
        sessionStorage.setItem(companyStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCloseStory = () => {
    setActiveStoryId(null);
    setViewingQueue([]);
    setCurrentSlideIndex(0);
    setSlideProgress(0);
    setIsPaused(false);
    setIsActivitySheetOpen(false);
    setIsDeleteConfirmOpen(false);
    setViewerSearchQuery('');
    setSheetCommentText('');
  };

  // Next Slide / Next Story
  const handleNextSlide = useCallback(() => {
    if (!activeStory) return;
    setIsActivitySheetOpen(false);
    setIsDeleteConfirmOpen(false);
    setViewerSearchQuery('');
    setSheetCommentText('');

    if (currentSlideIndex < activeStory.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setSlideProgress(0);
    } else {
      // Advance to next story in viewingQueue
      if (activeStoryIndex < viewingQueue.length - 1) {
        const nextStory = viewingQueue[activeStoryIndex + 1];
        setActiveStoryId(nextStory.id);
        setCurrentSlideIndex(0);
        setSlideProgress(0);
        setLiked(false);
        setReplyText('');

        // Mark as viewed
        setStories((prev) => {
          const next = prev.map((s) =>
            s.id === nextStory.id ? { ...s, viewed: true } : s
          );
          try {
            sessionStorage.setItem(companyStorageKey, JSON.stringify(next));
          } catch {}
          return next;
        });
      } else {
        handleCloseStory();
      }
    }
  }, [activeStory, activeStoryIndex, currentSlideIndex, viewingQueue, companyStorageKey]);

  // Previous Slide / Previous Story
  const handlePrevSlide = useCallback(() => {
    if (!activeStory) return;
    setIsActivitySheetOpen(false);
    setIsDeleteConfirmOpen(false);
    setViewerSearchQuery('');
    setSheetCommentText('');

    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setSlideProgress(0);
    } else {
      // Go to previous story if available
      if (activeStoryIndex > 0) {
        const prevStory = viewingQueue[activeStoryIndex - 1];
        setActiveStoryId(prevStory.id);
        setCurrentSlideIndex(prevStory.slides.length - 1);
        setSlideProgress(0);
      }
    }
  }, [activeStory, activeStoryIndex, currentSlideIndex, viewingQueue]);

  // Slide Progress Timer (5 seconds per slide, paused when sheets/modals are active)
  useEffect(() => {
    if (activeStoryId === null || isPaused || isActivitySheetOpen || isDeleteConfirmOpen) return;

    const interval = 50; // update every 50ms
    const step = (100 / (5000 / interval)); // 5000ms = 5s

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryId, currentSlideIndex, isPaused, isActivitySheetOpen, isDeleteConfirmOpen, handleNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (activeStoryId === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDeleteConfirmOpen) {
          setIsDeleteConfirmOpen(false);
          setIsPaused(false);
        } else if (isActivitySheetOpen) {
          setIsActivitySheetOpen(false);
          setIsPaused(false);
        } else {
          handleCloseStory();
        }
      }
      if (!isActivitySheetOpen && !isDeleteConfirmOpen) {
        if (e.key === 'ArrowRight') handleNextSlide();
        if (e.key === 'ArrowLeft') handlePrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryId, isActivitySheetOpen, isDeleteConfirmOpen, handleNextSlide, handlePrevSlide]);

  // Handle image upload from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStoryPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Like via Backend API & Update Cache
  const handleToggleLike = async () => {
    if (!activeSlide) return;
    const key = String(activeSlide.id);
    const currentLike = slideLikesMap[key] || { liked: Boolean(liked), count: likeCount };
    const newLiked = !currentLike.liked;
    const nextCount = newLiked ? currentLike.count + 1 : Math.max(0, currentLike.count - 1);

    setLiked(newLiked);
    setLikeCount(nextCount);
    setSlideLikesMap((prev) => ({ ...prev, [key]: { liked: newLiked, count: nextCount } }));

    // Also update viewers list so that this viewer has liked badge
    setSlideViewersMap((prev) => {
      const list = prev[key] || [];
      const userIndex = list.findIndex(
        (v) => (v.userId && activeUserId && v.userId === activeUserId) || v.name === currentUserName
      );
      if (userIndex !== -1) {
        const updated = [...list];
        updated[userIndex] = { ...updated[userIndex], liked: newLiked };
        return { ...prev, [key]: updated };
      } else if (newLiked) {
        const newViewer: StoryViewerItem = {
          id: `viewer-me-${Date.now()}`,
          userId: activeUserId || undefined,
          name: currentUserName,
          avatar: currentUserAvatar,
          role: (activeUser as any)?.designation || 'Team Member',
          department: activeCompanyName,
          viewedAt: 'Just now',
          liked: true,
        };
        return { ...prev, [key]: [newViewer, ...list] };
      }
      return prev;
    });

    showToast(newLiked ? `Liked ${activeStory?.name}'s story! ❤️` : 'Reaction removed');

    if (activeSlide.statusId) {
      try {
        const res = await statusApi.toggleLike(activeSlide.statusId);
        if (res) {
          setLiked(res.liked);
          setLikeCount(res.like_count);
          setSlideLikesMap((prev) => ({
            ...prev,
            [key]: { liked: res.liked, count: res.like_count },
          }));
        }
        await refreshSlideInteractions(activeSlide.statusId, key);
      } catch (e) {
        console.warn('Failed to toggle like on backend:', e);
      }
    }
  };

  // Send Reply via Backend API
  const handleSendReply = async () => {
    const textToSend = replyText.trim();
    if (!textToSend || !activeStory || !activeSlide) return;

    const key = String(activeSlide.id);
    const newComment: StoryCommentItem = {
      id: `c-me-${Date.now()}`,
      name: currentUserName,
      avatar: currentUserAvatar,
      text: textToSend,
      createdAt: 'Just now',
    };

    setSlideCommentsMap((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newComment],
    }));

    setReplyText('');
    showToast(`Reply sent to ${activeStory.name}! 💬`);

    if (activeSlide.statusId) {
      try {
        await statusApi.createComment(activeSlide.statusId, textToSend);
        await refreshSlideInteractions(activeSlide.statusId, key);
      } catch (e) {
        console.warn('Failed to post comment to backend:', e);
      }
    }
  };

  // Add comment from within the Activity Sheet
  const handleAddSheetComment = async () => {
    const textToSend = sheetCommentText.trim();
    if (!textToSend || !activeSlide) return;

    const key = String(activeSlide.id);
    const newComment: StoryCommentItem = {
      id: `c-sheet-${Date.now()}`,
      name: currentUserName,
      avatar: currentUserAvatar,
      text: textToSend,
      createdAt: 'Just now',
    };

    setSlideCommentsMap((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newComment],
    }));

    setSheetCommentText('');
    showToast('Comment added! 💬');

    if (activeSlide.statusId) {
      try {
        await statusApi.createComment(activeSlide.statusId, textToSend);
        await refreshSlideInteractions(activeSlide.statusId, key);
      } catch (e) {
        console.warn('Failed to post comment to backend:', e);
      }
    }
  };

  // Delete Active Story Slide
  const handleDeleteActiveSlide = async () => {
    if (!activeStory || !activeSlide) return;
    setIsDeletingSlide(true);
    try {
      if (activeSlide.statusId) {
        try {
          await statusApi.deleteStatus(activeSlide.statusId);
        } catch (err) {
          console.warn('Failed to delete status on backend, deleting locally:', err);
        }
      }

      const targetSlideId = activeSlide.id;
      const targetStoryId = activeStory.id;

      setStories((prev) => {
        const next = prev.map((story) => {
          if (story.id === targetStoryId) {
            const remainingSlides = story.slides.filter((sl) => sl.id !== targetSlideId);
            return {
              ...story,
              slides: remainingSlides,
            };
          }
          return story;
        });
        try {
          sessionStorage.setItem(companyStorageKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      setViewingQueue((prev) => {
        return prev.map((story) => {
          if (story.id === targetStoryId) {
            return {
              ...story,
              slides: story.slides.filter((sl) => sl.id !== targetSlideId),
            };
          }
          return story;
        });
      });

      setIsDeleteConfirmOpen(false);
      setIsActivitySheetOpen(false);
      showToast('Story deleted successfully 🗑️');

      const currentRemainingSlides = activeStory.slides.filter((sl) => sl.id !== targetSlideId);

      if (currentRemainingSlides.length > 0) {
        if (currentSlideIndex >= currentRemainingSlides.length) {
          setCurrentSlideIndex(currentRemainingSlides.length - 1);
        }
        setSlideProgress(0);
      } else {
        // No remaining slides in this story
        if (activeStoryIndex < viewingQueue.length - 1) {
          const nextStory = viewingQueue[activeStoryIndex + 1];
          if (nextStory && nextStory.slides.length > 0) {
            setActiveStoryId(nextStory.id);
            setCurrentSlideIndex(0);
            setSlideProgress(0);
          } else {
            handleCloseStory();
          }
        } else {
          handleCloseStory();
        }
      }
    } catch (err) {
      console.error('Error deleting story slide:', err);
      showToast('Failed to delete story');
    } finally {
      setIsDeletingSlide(false);
    }
  };

  // Publish Story to Backend Status API
  const handlePublishStory = async () => {
    if (!selectedFile && !storyCaption.trim()) {
      showToast('Please select a photo or enter a caption');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploaded = false;
      if (selectedFile) {
        const isVideo = selectedFile.type.startsWith('video/');
        const payload: CreateStatusPayload = {
          media: selectedFile,
          type: isVideo ? 'video' : 'image',
          text: storyCaption.trim() || undefined,
          visibility: 'same_company',
        };
        const res = await statusApi.createStatus(payload);
        if (res?.success || res?.data) {
          uploaded = true;
        }
      } else if (storyCaption.trim()) {
        const payload: CreateStatusPayload = {
          type: 'text',
          text: storyCaption.trim(),
          background_color: '#4F46E5',
          visibility: 'same_company',
        };
        const res = await statusApi.createStatus(payload);
        if (res?.success || res?.data) {
          uploaded = true;
        }
      }

      if (uploaded) {
        showToast('Your story is now live! 🎉');
        setIsAddModalOpen(false);
        setSelectedFile(null);
        setStoryPreviewImage(null);
        setStoryCaption('');
        await loadStoriesFeed();
        return;
      }
    } catch (err) {
      console.warn('Failed to publish status to backend, falling back to preview:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Fallback to local preview if backend call fails or offline
    handleAddToPreviewFallback();
  };

  const handleAddToPreviewFallback = () => {
    const chosenImage =
      storyPreviewImage ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80';

    const newSlide: StorySlide = {
      id: Date.now(),
      image: chosenImage,
      caption: storyCaption.trim() || 'Shared a new moment with the team ✨',
      tag: 'Team Milestone',
      createdAt: 'Just now',
    };

    setStories((prev) => {
      const next = prev.map((s) => {
        if (s.isUser) {
          return {
            ...s,
            viewed: false,
            slides: [newSlide, ...s.slides],
          };
        }
        return s;
      });
      try {
        sessionStorage.setItem(companyStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });

    setIsAddModalOpen(false);
    setSelectedFile(null);
    setStoryPreviewImage(null);
    setStoryCaption('');
    showToast('Your story has been added! 🎉');
  };

  return (
    <section className="w-full pt-3 sm:pt-4 pb-1 sm:pb-1.5 mb-1 sm:mb-1.5 select-none" aria-label="Employee Stories">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C0E28] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-purple-400/20">
          <AutoAwesomeIcon sx={{ fontSize: 18 }} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── STORIES CAROUSEL TRACK (FULL SCREEN, ARROWS ON LEFT & RIGHT) ── */}
      <div className="relative flex items-center w-full py-0.5 px-1 sm:px-1.5 group/carousel">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E2E8F0] shadow-xs hover:shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center text-slate-700 hover:text-[#1C0E28] hover:bg-slate-50 transition-all cursor-pointer shrink-0 z-10 mr-1 sm:mr-1.5"
          aria-label="Scroll stories left"
        >
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        </button>

        {/* Horizontal Story Circles Row */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex items-center gap-4 sm:gap-5 lg:gap-6 overflow-x-auto no-scrollbar py-0.5 flex-1 cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {sortedStories.map((story) => {
            const isUser = story.isUser;
            const isViewed = story.viewed;

            return (
              <div
                key={story.id}
                className="flex flex-col items-center shrink-0 cursor-pointer group/story select-none"
                onClick={() => {
                  if (draggedDistance > 8) return;
                  if (isUser && (!story.slides || story.slides.length === 0)) {
                    setIsAddModalOpen(true);
                  } else {
                    handleOpenStory(story.id);
                  }
                }}
              >
                {/* Compact Avatar with Ring */}
                <StoryAvatar
                  name={story.name}
                  avatar={story.avatar}
                  isViewed={isViewed}
                  isUser={isUser}
                  hasSlides={Boolean(story.slides && story.slides.length > 0)}
                  onAddClick={
                    isUser
                      ? (e) => {
                          e.stopPropagation();
                          setIsAddModalOpen(true);
                        }
                      : undefined
                  }
                />

                {/* Name & Status */}
                <span className="mt-1 text-[11px] sm:text-xs font-semibold text-[#1C0E28] tracking-tight max-w-[70px] text-center truncate group-hover/story:text-[#7C3AED] transition-colors leading-tight">
                  {story.name}
                </span>
                <span className="text-[9.5px] sm:text-[10px] text-[#776B80] font-normal leading-tight max-w-[70px] text-center truncate mt-0.5">
                  {isUser ? (story.slides.length > 0 ? (isViewed ? 'Viewed' : 'Your story') : 'Add a moment') : isViewed ? 'Viewed' : 'New story'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E2E8F0] shadow-xs hover:shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center text-slate-700 hover:text-[#1C0E28] hover:bg-slate-50 transition-all cursor-pointer shrink-0 z-10 ml-1 sm:ml-1.5"
          aria-label="Scroll stories right"
        >
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          INSTAGRAM-STYLE FULLSCREEN STORY VIEWER MODAL
      ══════════════════════════════════════════════════════════ */}
      {activeStory && activeSlide && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-fadeIn"
          onClick={handleCloseStory}
        >
          {/* Main Story Container */}
          <div
            className="relative w-full sm:max-w-md h-full sm:h-[88vh] sm:max-h-[760px] bg-[#0F172A] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Story Content */}
            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
              {activeSlide.type === 'text' || (!activeSlide.image && activeSlide.caption) ? (
                <div
                  className="w-full h-full flex items-center justify-center p-8 text-center"
                  style={{ backgroundColor: activeSlide.backgroundColor || '#202C33' }}
                >
                  <p className="text-white text-xl sm:text-2xl font-bold leading-relaxed max-w-sm drop-shadow-md">
                    {activeSlide.caption}
                  </p>
                </div>
              ) : activeSlide.type === 'video' || (activeSlide.image && (activeSlide.image.endsWith('.mp4') || activeSlide.image.endsWith('.mov'))) ? (
                <video
                  src={activeSlide.image}
                  autoPlay
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeSlide.image}
                  alt={activeSlide.caption || activeStory.name}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Dark Gradient Overlay for readability (except for full text cards) */}
              {activeSlide.type !== 'text' && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
              )}
            </div>

            {/* Top Bar: Progress Bars + Author Info + Close Button */}
            <div className="relative z-20 p-3.5 sm:p-4">
              {/* Segmented Progress Bars */}
              <div className="flex items-center gap-1.5 mb-3">
                {activeStory.slides.map((slide, idx) => {
                  let width = '0%';
                  if (idx < currentSlideIndex) width = '100%';
                  else if (idx === currentSlideIndex) width = `${slideProgress}%`;

                  return (
                    <div
                      key={slide.id}
                      className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white rounded-full transition-all duration-75"
                        style={{ width }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StoryAvatar name={activeStory.name} avatar={activeStory.avatar} size="sm" />
                  <div className="text-white">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs sm:text-sm font-bold">
                        {isMyStory ? 'My status' : activeStory.name}
                      </span>
                      {!isMyStory && (
                        <>
                          <VerifiedIcon sx={{ fontSize: 14 }} className="text-[#38BDF8]" />
                          <span className="text-[11px] text-white/70">• {activeSlide.createdAt || 'Just now'}</span>
                        </>
                      )}
                    </div>
                    {isMyStory ? (
                      <span className="text-[10px] text-white/75 block">
                        {activeSlide.createdAt || 'Just now'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/75 block">
                        {activeStory.role} • {activeStory.department}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Delete Story (if isMyStory) + Close Button */}
                <div className="flex items-center gap-2">
                  {isMyStory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteConfirmOpen(true);
                        setIsPaused(true);
                      }}
                      className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Delete story"
                      aria-label="Delete story"
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseStory}
                    className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close story"
                  >
                    <CloseIcon sx={{ fontSize: 22 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Invisible Tap Zones: Left = Prev, Right = Next */}
            <div className="absolute inset-y-16 inset-x-0 z-10 flex">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={handlePrevSlide}
                title="Previous slide"
              />
              <div
                className="w-2/3 h-full cursor-pointer"
                onClick={handleNextSlide}
                title="Next slide"
              />
            </div>

            {/* Story Navigation Arrows (Exact match to user's reference) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (hasPrevStory) handlePrevSlide();
              }}
              disabled={!hasPrevStory}
              className={`absolute left-3 sm:left-4 top-[54%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                hasPrevStory
                  ? 'bg-white hover:bg-slate-100 text-slate-900 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-white/40 text-slate-800/60 backdrop-blur-md cursor-not-allowed'
              }`}
              title="Previous slide"
              aria-label="Previous story slide"
            >
              <ArrowBackIcon sx={{ fontSize: 19 }} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextSlide();
              }}
              className="absolute right-3 sm:right-4 top-[54%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-100 text-slate-900 shadow-md hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Next slide"
              aria-label="Next story slide"
            >
              <ArrowForwardIcon sx={{ fontSize: 19 }} />
            </button>

            {/* Bottom Section: Tag, Caption, Reaction & Reply Bar */}
            <div className="relative z-20 p-4 sm:p-5 text-white">
              {/* Story Tag */}
              {activeSlide.tag && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white mb-2 border border-white/20 shadow-xs">
                  <AutoAwesomeIcon sx={{ fontSize: 12 }} className="text-amber-300" />
                  {activeSlide.tag}
                </span>
              )}

              {/* Story Caption (for non-text slides) */}
              {activeSlide.type !== 'text' && Boolean(activeSlide.caption) && (
                <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed drop-shadow-sm mb-3">
                  {activeSlide.caption}
                </p>
              )}

              {/* Bottom Action Bar: Differentiated for My Story vs Other Stories */}
              {isMyStory ? (
                /* ── MY STORY BOTTOM BAR: Simple icons at left corner without bg card ── */
                <div className="flex items-center justify-start gap-5 pt-1">
                  {/* 1. Views Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActivityTab('viewers');
                      setIsActivitySheetOpen(true);
                      setIsPaused(true);
                      if (activeSlide?.statusId) {
                        refreshSlideInteractions(activeSlide.statusId, String(activeSlide.id));
                      }
                    }}
                    className="flex items-center gap-1.5 text-white/90 hover:text-white transition-all cursor-pointer group active:scale-95"
                    title={`${currentViewers.length} views`}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 22 }} className="group-hover:scale-110 transition-transform drop-shadow" />
                    <span className="text-xs font-semibold drop-shadow">
                      {currentViewers.length}
                    </span>
                  </button>

                  {/* 2. Likes Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActivityTab('likes');
                      setIsActivitySheetOpen(true);
                      setIsPaused(true);
                      if (activeSlide?.statusId) {
                        refreshSlideInteractions(activeSlide.statusId, String(activeSlide.id));
                      }
                    }}
                    className="flex items-center gap-1.5 text-white/90 hover:text-white transition-all cursor-pointer group active:scale-95"
                    title={`${currentSlideLikes.count ?? currentLikedUsers.length} likes`}
                  >
                    <FavoriteBorderIcon sx={{ fontSize: 21 }} className="group-hover:scale-110 transition-transform drop-shadow" />
                    <span className="text-xs font-semibold drop-shadow">
                      {currentSlideLikes.count ?? currentLikedUsers.length}
                    </span>
                  </button>

                  {/* 3. Comments Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setActivityTab('comments');
                      setIsActivitySheetOpen(true);
                      setIsPaused(true);
                      if (activeSlide?.statusId) {
                        refreshSlideInteractions(activeSlide.statusId, String(activeSlide.id));
                      }
                    }}
                    className="flex items-center gap-1.5 text-white/90 hover:text-white transition-all cursor-pointer group active:scale-95"
                    title={`${currentComments.length} comments`}
                  >
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 20 }} className="group-hover:scale-110 transition-transform drop-shadow" />
                    <span className="text-xs font-semibold drop-shadow">
                      {currentComments.length}
                    </span>
                  </button>
                </div>
              ) : (
                /* ── ANOTHER USER'S STORY BOTTOM BAR: ONLY Comment & Like ── */
                <div className="flex items-center gap-2 pt-1 border-t border-white/15">
                  {/* Reply / Comment Section Input */}
                  <div className="flex-1 min-w-0 relative flex items-center">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onFocus={() => setIsPaused(true)}
                      onBlur={() => {
                        if (!isActivitySheetOpen && !isDeleteConfirmOpen) {
                          setIsPaused(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && replyText.trim()) {
                          handleSendReply();
                        }
                      }}
                      placeholder={`Reply to ${activeStory.name}...`}
                      className="w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 placeholder:text-white/60 text-white text-xs pl-4 pr-10 py-2.5 rounded-full border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-md transition-all"
                    />
                    {replyText.trim() && (
                      <button
                        type="button"
                        onClick={handleSendReply}
                        className="absolute right-1 w-7 h-7 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-95"
                        title="Send reply"
                      >
                        <SendIcon sx={{ fontSize: 14 }} />
                      </button>
                    )}
                  </div>

                  {/* Like Story Option */}
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer shrink-0 group"
                    title={currentSlideLikes.liked ? 'Unlike story' : 'Like story'}
                  >
                    {currentSlideLikes.liked ? (
                      <FavoriteIcon sx={{ fontSize: 19 }} className="text-rose-500 animate-bounce" />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 19 }} className="text-white group-hover:text-rose-300 transition-colors" />
                    )}
                    {currentSlideLikes.count > 0 && (
                      <span className="text-xs font-semibold text-white/90">
                        {currentSlideLikes.count}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                INSTAGRAM-STYLE ACTIVITY SHEET (VIEWERS, LIKES, COMMENTS)
            ══════════════════════════════════════════════════════════ */}
            {isActivitySheetOpen && isMyStory && (
              <div
                className="absolute inset-x-0 bottom-0 max-h-[82%] bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/20 z-40 flex flex-col shadow-2xl transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="pt-2.5 pb-1 flex flex-col items-center">
                  <div className="w-10 h-1 bg-white/30 rounded-full" />
                </div>

                {/* Sheet Header: Tabs & Close Button */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActivityTab('viewers')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activityTab === 'viewers'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
                      <span>Seen by ({currentViewers.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivityTab('likes')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activityTab === 'likes'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      <FavoriteIcon sx={{ fontSize: 13 }} />
                      <span>Likes ({currentSlideLikes.count ?? currentLikedUsers.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivityTab('comments')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activityTab === 'comments'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 13 }} />
                      <span>Comments ({currentComments.length})</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsActivitySheetOpen(false);
                      setIsPaused(false);
                    }}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>

                {/* Search Bar for Viewers & Likes tabs */}
                {activityTab !== 'comments' && (
                  <div className="px-4 pt-3 pb-2">
                    <div className="relative">
                      <SearchIcon
                        sx={{ fontSize: 16 }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                      />
                      <input
                        type="text"
                        value={viewerSearchQuery}
                        onChange={(e) => setViewerSearchQuery(e.target.value)}
                        placeholder={`Search ${activityTab === 'likes' ? 'likes' : 'viewers'}...`}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                      />
                    </div>
                  </div>
                )}

                {/* Tab Body Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 max-h-[280px]">
                  {/* ── 1. VIEWERS TAB ── */}
                  {activityTab === 'viewers' && (
                    <>
                      {filteredViewers.length > 0 ? (
                        filteredViewers.map((viewer) => (
                          <div
                            key={viewer.id}
                            className="flex items-center justify-between py-1.5 hover:bg-white/5 rounded-xl px-2 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ViewerAvatar
                                name={viewer.name}
                                avatar={viewer.avatar}
                                size="md"
                                className="border-white/20 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                  {viewer.name}
                                </p>
                                <p className="text-[10px] text-white/60 truncate">
                                  {viewer.role || 'Colleague'} • {viewer.viewedAt}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {viewer.liked && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-400/30">
                                  <FavoriteIcon sx={{ fontSize: 12 }} className="text-rose-500" />
                                  Liked
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-white/50 text-xs">
                          {viewerSearchQuery ? 'No colleagues found matching search' : 'No viewers recorded yet'}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── 2. LIKES TAB ── */}
                  {activityTab === 'likes' && (
                    <>
                      {filteredLikers.length > 0 ? (
                        filteredLikers.map((viewer) => (
                          <div
                            key={viewer.id}
                            className="flex items-center justify-between py-1.5 hover:bg-white/5 rounded-xl px-2 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ViewerAvatar
                                name={viewer.name}
                                avatar={viewer.avatar}
                                size="md"
                                className="border-white/20 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                  {viewer.name}
                                </p>
                                <p className="text-[10px] text-white/60 truncate">
                                  {viewer.role || 'Colleague'} • {viewer.department || activeCompanyName}
                                </p>
                              </div>
                            </div>

                            <FavoriteIcon sx={{ fontSize: 16 }} className="text-rose-500 shrink-0" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-white/50 text-xs">
                          {viewerSearchQuery ? 'No likes matching search' : 'No likes on this story yet'}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── 3. COMMENTS TAB ── */}
                  {activityTab === 'comments' && (
                    <>
                      {currentComments.length > 0 ? (
                        currentComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start gap-2.5 py-1.5 hover:bg-white/5 rounded-xl px-2 transition-colors"
                          >
                            <ViewerAvatar
                              name={comment.name}
                              avatar={comment.avatar}
                              size="sm"
                              className="border-white/20 shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white">
                                  {comment.name}
                                </span>
                                <span className="text-[10px] text-white/50">
                                  • {comment.createdAt}
                                </span>
                              </div>
                              <p className="text-xs text-white/90 leading-relaxed mt-0.5">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-white/50 text-xs">
                          No comments yet. Be the first to reply!
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Inline Comment Input Box for Comments Tab */}
                {activityTab === 'comments' && (
                  <div className="p-3 border-t border-white/10 bg-slate-950/40">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sheetCommentText}
                        onChange={(e) => setSheetCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && sheetCommentText.trim()) {
                            handleAddSheetComment();
                          }
                        }}
                        placeholder="Add a comment..."
                        className="flex-1 bg-white/10 text-white placeholder:text-white/40 text-xs px-3.5 py-2 rounded-full border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSheetComment}
                        disabled={!sheetCommentText.trim()}
                        className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <SendIcon sx={{ fontSize: 14 }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                DELETE STORY CONFIRMATION MODAL
            ══════════════════════════════════════════════════════════ */}
            {isDeleteConfirmOpen && (
              <div
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full max-w-[320px] bg-white rounded-2xl p-5 shadow-2xl text-center select-none animate-scaleUp">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 26 }} />
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    Delete Story?
                  </h4>
                  <p className="text-xs text-slate-500 mb-5 leading-normal">
                    Are you sure you want to delete this moment? This story will be permanently removed.
                  </p>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={isDeletingSlide}
                      onClick={() => {
                        setIsDeleteConfirmOpen(false);
                        setIsPaused(false);
                      }}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingSlide}
                      onClick={handleDeleteActiveSlide}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {isDeletingSlide ? (
                        <>
                          <CircularProgress size={14} sx={{ color: 'white' }} />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <span>Delete</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SHARE A MOMENT / ADD STORY MODAL (EXACT MATCH TO USER REFERENCE)
      ══════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            if (!isSubmitting) {
              setIsAddModalOpen(false);
              setSelectedFile(null);
              setStoryPreviewImage(null);
              setStoryCaption('');
            }
          }}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative select-none animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button at Top Right */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedFile(null);
                setStoryPreviewImage(null);
                setStoryCaption('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
              title="Close"
              aria-label="Close modal"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>

            {/* Category Kicker */}
            <span className="text-[11px] font-bold tracking-wider text-[#8B5CF6] uppercase block mb-1">
              YOUR MOMENT
            </span>

            {/* Title */}
            <h3 className="text-2xl font-bold text-[#1C0E28] tracking-tight mb-1.5">
              Share a new story
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-slate-500 mb-4 leading-normal">
              Share a photo, video, or moment with your team.
            </p>

            {/* Dashed Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-[#DDD6FE] bg-[#FAF8FF] hover:bg-[#F5F3FF] transition-all flex flex-col items-center justify-center py-7 px-6 cursor-pointer group/upload mb-4"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                className="hidden"
              />

              {storyPreviewImage ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-xs group/preview">
                  <img
                    src={storyPreviewImage}
                    alt="Selected story preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Click to change photo
                  </div>
                </div>
              ) : (
                <>
                  <AddPhotoAlternateOutlinedIcon
                    sx={{ fontSize: 40 }}
                    className="text-[#7C3AED] mb-2 group-hover/upload:scale-105 transition-transform"
                  />
                  <span className="text-sm sm:text-[15px] font-bold text-[#6D28D9] mb-1">
                    Choose a photo or video
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    JPG, PNG, WebP or MP4 up to 25MB
                  </span>
                </>
              )}
            </div>

            {/* Caption Input */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Caption or message (optional)
              </label>
              <input
                type="text"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                placeholder="What's happening? (e.g. Launched new product! 🚀)"
                maxLength={500}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
              />
            </div>

            {/* Bottom Actions: Cancel & Publish Story */}
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedFile(null);
                  setStoryPreviewImage(null);
                  setStoryCaption('');
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-transparent"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePublishStory}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#1C0E28] hover:bg-[#2D1640] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <AutoAwesomeIcon sx={{ fontSize: 16 }} className="text-amber-300" />
                    <span>Publish story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
