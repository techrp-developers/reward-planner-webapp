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
import { useAuth } from '../../../context/AuthContext';

export interface StorySlide {
  id: string | number;
  image: string;
  caption: string;
  tag?: string;
  createdAt?: string;
}

export interface EmployeeStory {
  id: string | number;
  name: string;
  avatar: string;
  role: string;
  department: string;
  isUser?: boolean;
  viewed: boolean;
  slides: StorySlide[];
}

const INITIAL_STORIES: EmployeeStory[] = [
  {
    id: 'user',
    name: 'Your story',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Product Designer',
    department: 'Design & UX',
    isUser: true,
    viewed: false,
    slides: [
      {
        id: 'u1',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Kicking off the new quarterly design sprint with our incredible team! 🚀✨',
        tag: 'Team Milestone',
        createdAt: '15m ago',
      },
    ],
  },
  {
    id: 'maya',
    name: 'Maya S.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'Lead UX Architect',
    department: 'Design Systems',
    viewed: false,
    slides: [
      {
        id: 'm1',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
        caption: 'Proud to present our accessible component library updates at the monthly tech sync! 🎨👩‍💻',
        tag: 'Tech Talk',
        createdAt: '2h ago',
      },
      {
        id: 'm2',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
        caption: 'Brainstorming session in the courtyard - great ideas always flow with fresh coffee ☕💡',
        tag: 'Workspace Moments',
        createdAt: '1h ago',
      },
    ],
  },
  {
    id: 'aarav',
    name: 'Aarav M.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'Senior Backend Engineer',
    department: 'Core Infrastructure',
    viewed: false,
    slides: [
      {
        id: 'a1',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
        caption: 'Zero downtime microservices migration completed successfully! Massive shoutout to devops 🎉🔥',
        tag: 'Engineering Win',
        createdAt: '3h ago',
      },
    ],
  },
  {
    id: 'nina',
    name: 'Nina P.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    role: 'People & Culture Lead',
    department: 'Human Resources',
    viewed: true,
    slides: [
      {
        id: 'n1',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
        caption: 'Welcoming 12 brilliant new minds to Reward Planners today! Welcome aboard everyone! 🌟🤝',
        tag: 'New Cohort',
        createdAt: '6h ago',
      },
    ],
  },
  {
    id: 'rohan',
    name: 'Rohan I.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'Product Operations Lead',
    department: 'Growth & Strategy',
    viewed: false,
    slides: [
      {
        id: 'r1',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
        caption: 'Hit our 100K active employee benefits redemption milestone this afternoon! Team celebratory lunch 🍕🏆',
        tag: 'Milestone 100K',
        createdAt: '4h ago',
      },
    ],
  },
  {
    id: 'sana',
    name: 'Sana K.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'Data Scientist',
    department: 'Analytics & AI',
    viewed: true,
    slides: [
      {
        id: 's1',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        caption: 'Visualizing predictive engagement patterns for quarterly rewards allocation. Data tells vivid stories 📊✨',
        tag: 'Insights & AI',
        createdAt: '7h ago',
      },
    ],
  },
  {
    id: 'dev',
    name: 'Dev M.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    role: 'DevOps & Cloud Engineer',
    department: 'Cloud Platform',
    viewed: false,
    slides: [
      {
        id: 'd1',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        caption: 'Morning summit hike before diving into code. Nature clears the head like nothing else 🏔️☀️',
        tag: 'Wellness & Life',
        createdAt: '5h ago',
      },
    ],
  },
  {
    id: 'priya',
    name: 'Priya D.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    role: 'Quality Engineering Lead',
    department: 'Core Products',
    viewed: false,
    slides: [
      {
        id: 'p1',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Shipped our zero-defect automation pipeline for release 4.2! Kudos to the QA squad 🚀✨',
        tag: 'Engineering Win',
        createdAt: '4h ago',
      },
    ],
  },
  {
    id: 'vikram',
    name: 'Vikram K.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    role: 'Mobile App Architect',
    department: 'Mobile Experience',
    viewed: false,
    slides: [
      {
        id: 'v1',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1000&q=80',
        caption: 'New mobile app update is live on iOS & Android! Super fast rewards redemption 📱⚡',
        tag: 'Mobile Launch',
        createdAt: '3h ago',
      },
    ],
  },
  {
    id: 'ananya',
    name: 'Ananya V.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    role: 'Brand & Communications',
    department: 'Marketing',
    viewed: true,
    slides: [
      {
        id: 'av1',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
        caption: 'Behind the scenes at our Employer of Choice brand photoshoot! 📸✨',
        tag: 'Brand Story',
        createdAt: '8h ago',
      },
    ],
  },
  {
    id: 'kabir',
    name: 'Kabir R.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    role: 'Financial Analyst',
    department: 'Finance & Planning',
    viewed: false,
    slides: [
      {
        id: 'k1',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Completed quarterly corporate tax & benefits savings analysis ahead of schedule 💼📊',
        tag: 'Finance Win',
        createdAt: '2h ago',
      },
    ],
  },
  {
    id: 'neha',
    name: 'Neha T.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    role: 'Customer Success Manager',
    department: 'Partner Success',
    viewed: false,
    slides: [
      {
        id: 'nh1',
        image: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=1000&q=80',
        caption: '99.4% customer satisfaction score across our top corporate enterprise clients this month! ❤️🎉',
        tag: 'Client Delight',
        createdAt: '5h ago',
      },
    ],
  },
  {
    id: 'arjun',
    name: 'Arjun M.',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    role: 'InfoSec Engineer',
    department: 'Security & Trust',
    viewed: true,
    slides: [
      {
        id: 'ar1',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
        caption: 'Annual SOC2 Type II audit completed with zero non-conformances! 🛡️🔐',
        tag: 'Security Win',
        createdAt: '9h ago',
      },
    ],
  },
  {
    id: 'tanvi',
    name: 'Tanvi B.',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
    role: 'Growth Marketing Lead',
    department: 'User Acquisition',
    viewed: false,
    slides: [
      {
        id: 'tb1',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80',
        caption: '250,000 active employees visited our rewards marketplace this week! Record growth 🚀🎯',
        tag: 'Growth Record',
        createdAt: '6h ago',
      },
    ],
  },
  {
    id: 'sameer',
    name: 'Sameer G.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'Corporate Counsel',
    department: 'Legal & Risk',
    viewed: true,
    slides: [
      {
        id: 'sg1',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
        caption: '5-year work anniversary at Reward Planners! Grateful for this amazing journey 🥂🎊',
        tag: '5-Year Milestone',
        createdAt: '10h ago',
      },
    ],
  },
];

export default function EmployeeStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<EmployeeStory[]>(() => {
    try {
      const stored = localStorage.getItem('rp_employee_stories_v5');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_STORIES;
  });

  // Track active story modal view by ID
  const [activeStoryId, setActiveStoryId] = useState<string | number | null>(null);
  const [viewingQueue, setViewingQueue] = useState<EmployeeStory[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Add Story Modal state (matching user reference UI)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [storyPreviewImage, setStoryPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive reactions in story viewer
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync user avatar if authenticated
  useEffect(() => {
    if (user) {
      setStories((prev) =>
        prev.map((s) =>
          s.isUser
            ? {
                ...s,
                avatar: user.userImage || user.avatar || s.avatar,
                name: 'Your story',
              }
            : s
        )
      );
    }
  }, [user]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        localStorage.setItem('rp_employee_stories_v5', JSON.stringify(next));
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
  };

  // Next Slide / Next Story
  const handleNextSlide = useCallback(() => {
    if (!activeStory) return;

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
            localStorage.setItem('rp_employee_stories_v5', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else {
        handleCloseStory();
      }
    }
  }, [activeStory, activeStoryIndex, currentSlideIndex, viewingQueue]);

  // Previous Slide / Previous Story
  const handlePrevSlide = useCallback(() => {
    if (!activeStory) return;

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

  // Slide Progress Timer (5 seconds per slide)
  useEffect(() => {
    if (activeStoryId === null || isPaused) return;

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
  }, [activeStoryId, currentSlideIndex, isPaused, handleNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (activeStoryId === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseStory();
      if (e.key === 'ArrowRight') handleNextSlide();
      if (e.key === 'ArrowLeft') handlePrevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryId, handleNextSlide, handlePrevSlide]);

  // Handle image upload from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStoryPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add moment slide to preview
  const handleAddToPreview = () => {
    const chosenImage =
      storyPreviewImage ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80';

    const newSlide: StorySlide = {
      id: Date.now(),
      image: chosenImage,
      caption: 'Shared a new moment with the team ✨',
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
        localStorage.setItem('rp_employee_stories_v5', JSON.stringify(next));
      } catch {}
      return next;
    });

    setIsAddModalOpen(false);
    setStoryPreviewImage(null);
    showToast('Your story has been added to preview! 🎉');
  };

  return (
    <section className="w-full pt-3 sm:pt-4 pb-2 sm:pb-3 mb-2 sm:mb-3 select-none" aria-label="Employee Stories">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C0E28] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-purple-400/20">
          <AutoAwesomeIcon sx={{ fontSize: 18 }} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── STORIES CAROUSEL TRACK (FULL SCREEN, ARROWS ON LEFT & RIGHT) ── */}
      <div className="relative flex items-center w-full py-1 px-1 sm:px-1.5 group/carousel">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center text-slate-700 hover:text-[#1C0E28] hover:bg-slate-50 transition-all cursor-pointer shrink-0 z-10 mr-1 sm:mr-1.5"
          aria-label="Scroll stories left"
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </button>

        {/* Horizontal Story Circles Row */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex items-center gap-5 sm:gap-6 lg:gap-7 overflow-x-auto no-scrollbar py-1 flex-1 cursor-grab active:cursor-grabbing"
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
                  if (isUser) {
                    setIsAddModalOpen(true);
                  } else {
                    handleOpenStory(story.id);
                  }
                }}
              >
                {/* Enlarged Avatar with Ring */}
                <div className="relative">
                  {/* Instagram-style Ring */}
                  <div
                    className={`rounded-full transition-all duration-300 group-hover/story:scale-105 ${
                      isUser
                        ? 'p-[2px] bg-slate-200'
                        : isViewed
                        ? 'p-[2px] bg-[#CBD5E1]'
                        : 'p-[2.5px] bg-gradient-to-tr from-[#F59E0B] via-[#EC4899] to-[#8B5CF6]'
                    }`}
                  >
                    <div className="p-[2px] bg-white rounded-full">
                      <img
                        src={story.avatar}
                        alt={story.name}
                        className="w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] lg:w-14 lg:h-14 rounded-full object-cover shrink-0"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Add Story (+) Badge for User */}
                  {isUser && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddModalOpen(true);
                      }}
                      className="absolute bottom-0 right-0 w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white border-2 border-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer"
                      title="Add a moment"
                    >
                      <AddIcon sx={{ fontSize: 12 }} />
                    </button>
                  )}
                </div>

                {/* Name & Status */}
                <span className="mt-1.5 text-xs sm:text-[13px] font-semibold text-[#1C0E28] tracking-tight max-w-[76px] text-center truncate group-hover/story:text-[#7C3AED] transition-colors leading-tight">
                  {story.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#776B80] font-normal leading-tight max-w-[76px] text-center truncate mt-0.5">
                  {isUser ? 'Add a moment' : isViewed ? 'Viewed' : 'New story'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center text-slate-700 hover:text-[#1C0E28] hover:bg-slate-50 transition-all cursor-pointer shrink-0 z-10 ml-1 sm:ml-1.5"
          aria-label="Scroll stories right"
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
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
            {/* Background Story Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={activeSlide.image}
                alt={activeSlide.caption}
                className="w-full h-full object-cover"
              />
              {/* Dark Gradient Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
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
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/80 shadow-xs"
                  />
                  <div className="text-white">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs sm:text-sm font-bold">{activeStory.name}</span>
                      <VerifiedIcon sx={{ fontSize: 14 }} className="text-[#38BDF8]" />
                      <span className="text-[11px] text-white/70">• {activeSlide.createdAt || 'Just now'}</span>
                    </div>
                    <span className="text-[10px] text-white/75 block">
                      {activeStory.role} • {activeStory.department}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseStory}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close story"
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </button>
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

              {/* Story Caption */}
              <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed drop-shadow-sm mb-3">
                {activeSlide.caption}
              </p>

              {/* Interactive Reaction & Reply Bar */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/15">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      showToast(`Reply sent to ${activeStory.name}! 💬`);
                      setReplyText('');
                    }
                  }}
                  placeholder={`Reply to ${activeStory.name}...`}
                  className="flex-1 bg-white/15 hover:bg-white/20 focus:bg-white/25 placeholder:text-white/60 text-white text-xs px-3.5 py-2 rounded-full border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-md transition-all"
                />

                {replyText.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Reply sent to ${activeStory.name}! 💬`);
                      setReplyText('');
                    }}
                    className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <SendIcon sx={{ fontSize: 15 }} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setLiked(!liked);
                        showToast(liked ? 'Reaction removed' : `Liked ${activeStory.name}'s story! ❤️`);
                      }}
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title="Like story"
                    >
                      {liked ? (
                        <FavoriteIcon sx={{ fontSize: 18 }} className="text-rose-500 animate-bounce" />
                      ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`Sent celebration to ${activeStory.name}! 🎉`)}
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title="Celebrate"
                    >
                      <CelebrationIcon sx={{ fontSize: 18 }} className="text-amber-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`Sent kudos to ${activeStory.name}! 👍`)}
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title="Kudos"
                    >
                      <ThumbUpIcon sx={{ fontSize: 17 }} className="text-sky-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
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
            setIsAddModalOpen(false);
            setStoryPreviewImage(null);
          }}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative select-none animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button at Top Right */}
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setStoryPreviewImage(null);
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
            <p className="text-sm text-slate-500 mb-5 leading-normal">
              Add a photo to share a little moment with your team.
            </p>

            {/* Dashed Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-[#DDD6FE] bg-[#FAF8FF] hover:bg-[#F5F3FF] transition-all flex flex-col items-center justify-center py-10 px-6 sm:py-11 cursor-pointer group/upload mb-6"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
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
                    Click to change image
                  </div>
                </div>
              ) : (
                <>
                  <AddPhotoAlternateOutlinedIcon
                    sx={{ fontSize: 42 }}
                    className="text-[#7C3AED] mb-2.5 group-hover/upload:scale-105 transition-transform"
                  />
                  <span className="text-sm sm:text-[15px] font-bold text-[#6D28D9] mb-1">
                    Choose an image
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    Preview only · nothing is published
                  </span>
                </>
              )}
            </div>

            {/* Bottom Actions: Cancel & Add to preview */}
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setStoryPreviewImage(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-transparent"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddToPreview}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#1C0E28] hover:bg-[#2D1640] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <AutoAwesomeIcon sx={{ fontSize: 16 }} className="text-white" />
                <span>Add to preview</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
