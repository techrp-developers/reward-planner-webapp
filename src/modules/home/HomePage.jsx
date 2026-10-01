// src/modules/home/HomePage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Material UI Icons
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import LinkIcon from '@mui/icons-material/Link';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';
import OccasionCalendar from './components/OccasionCalendar';
import BenefitHighlights from './components/BenefitHighlights';
import ServiceDiscovery, { ServiceShortcuts } from './components/ServiceDiscovery';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawName = user?.name || user?.first_name;
  const name = rawName && !/^\d+$/.test(String(rawName).trim()) ? String(rawName).trim().split(' ')[0] : 'Sylas';
  const avatar = user?.userImage || user?.avatar;


  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Top Performers month filter
  const [activeMonth, setActiveMonth] = useState('July');

  // Announcements Carousel state
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Interactive reaction counters for announcements
  const [reactionCounts, setReactionCounts] = useState({
    kudos: 34,
    celebrated: 19
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleReaction = (type) => {
    setReactionCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    showToast(`Reaction added! Thank you for celebrating our team members! 🎉`);
  };

  // Onboarding Tasks state matching reference image (media_1790843021317.png)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Interview',
      time: 'Sep 13, 08:30',
      icon: DesktopWindowsOutlinedIcon,
      completed: true
    },
    {
      id: 2,
      title: 'Team Meeting',
      time: 'Sep 13, 10:30',
      icon: BoltIcon,
      completed: true
    },
    {
      id: 3,
      title: 'Project Update',
      time: 'Sep 13, 13:00',
      icon: ChatBubbleOutlineOutlinedIcon,
      completed: false
    },
    {
      id: 4,
      title: 'Discuss Q3 Goals',
      time: 'Sep 13, 14:45',
      icon: StraightenIcon,
      completed: false
    },
    {
      id: 5,
      title: 'HR Policy Review',
      time: 'Sep 13, 16:30',
      icon: LinkIcon,
      completed: false
    },
    {
      id: 6,
      title: 'Security Compliance',
      time: 'Sep 14, 11:00',
      icon: ShieldOutlinedIcon,
      completed: false
    },
    {
      id: 7,
      title: 'Development Setup',
      time: 'Sep 14, 14:00',
      icon: BusinessCenterOutlinedIcon,
      completed: false
    },
    {
      id: 8,
      title: 'Manager 1-on-1 Sync',
      time: 'Sep 15, 10:00',
      icon: PeopleOutlinedIcon,
      completed: false
    }
  ]);

  const [showAllTasks, setShowAllTasks] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');

  const addTask = (event) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    const time = taskDate
      ? new Date(taskDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'No due date';
    setTasks(previous => [{ id: crypto.randomUUID(), title, time, icon: AssignmentTurnedInOutlinedIcon, completed: false }, ...previous]);
    setTaskTitle('');
    setTaskDate('');
    setIsAddingTask(false);
    showToast('Task added to your list.');
  };

  const toggleTask = (taskId) => {
    setTasks(previous => previous.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
  };

  // Top Performers data matching podium layout in reference image (media_1790841692615.png)
  const performersData = {
    June: {
      podium: [
        {
          rank: 2,
          name: 'Lokesh Ankam',
          role: 'UX Designer',
          score: '5.0',
          badgeText: '2',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        },
        {
          rank: 1,
          name: 'Chandra Shekar',
          role: 'Product Lead',
          score: '5.0',
          isCrown: true,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        },
        {
          rank: 3,
          name: 'Monica Sylas',
          role: 'Sr. Designer',
          score: '5.0',
          badgeText: '3',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
        }
      ],
      list: [
        { id: 4, name: 'Alina Hubner', role: 'Recruiter', score: '4.9', points: '920 RP Coins', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80' },
        { id: 5, name: 'Yana Crout', role: 'Recruiter', score: '4.9', points: '890 RP Coins', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
        { id: 6, name: 'Thom Haye', role: 'UI Designer', score: '4.8', points: '840 RP Coins', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80' }
      ]
    },
    July: {
      podium: [
        {
          rank: 2,
          name: 'Alina Hubner',
          role: 'Talent Acquisition',
          score: '5.0',
          badgeText: '2',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
        },
        {
          rank: 1,
          name: 'Lokesh Ankam',
          role: 'UX Lead',
          score: '5.0',
          isCrown: true,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        },
        {
          rank: 3,
          name: 'Yana Crout',
          role: 'People Ops',
          score: '5.0',
          badgeText: '3',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        }
      ],
      list: [
        { id: 4, name: 'Chandra Shekar', role: 'Product Lead', score: '4.9', points: '910 RP Coins', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
        { id: 5, name: 'Thom Haye', role: 'UI Designer', score: '4.9', points: '880 RP Coins', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80' },
        { id: 6, name: 'Samuel Felix', role: 'Marketing Head', score: '4.8', points: '830 RP Coins', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80' }
      ]
    },
    August: {
      podium: [
        {
          rank: 2,
          name: 'Thom Haye',
          role: 'UI Designer',
          score: '5.0',
          badgeText: '2',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
        },
        {
          rank: 1,
          name: 'Monica Sylas',
          role: 'Design Director',
          score: '5.0',
          isCrown: true,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
        },
        {
          rank: 3,
          name: 'Chandra Shekar',
          role: 'Product Lead',
          score: '5.0',
          badgeText: '3',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        }
      ],
      list: [
        { id: 4, name: 'Lokesh Ankam', role: 'UX Designer', score: '4.9', points: '940 RP Coins', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
        { id: 5, name: 'Alina Hubner', role: 'Recruiter', score: '4.9', points: '890 RP Coins', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80' },
        { id: 6, name: 'Yana Crout', role: 'Recruiter', score: '4.8', points: '850 RP Coins', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
      ]
    }
  };

  const announcements = [
    {
      id: 1,
      type: 'eotm',
      name: 'Monica Sylas',
      title: 'Monica Sylas',
      badge: 'Employee of The Month',
      role: 'User Experience Designer',
      department: 'HDP Department',
      phone: '+91 8762198729',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bonus: '5,000 RP Coins',
      desc: 'Congratulations to Monica for extraordinary UX innovation, design systems leadership, and cross-team mentorship this month!',
      cta: 'Claim Rewards',
      actionType: 'claim',
      icon: MilitaryTechOutlinedIcon,
      color: 'from-amber-500/10 via-rose-500/10 to-purple-500/10'
    },
    {
      id: 2,
      type: 'birthday',
      name: "Sushma's Birthday",
      title: "Sushma's Birthday",
      badge: 'Birthday Celebration',
      person: 'Sushma',
      desc: "On occasion of Sushma's Birthday, let's meet and greet her warm wishes followed by cake cutting and celebration.",
      cta: 'Send Greetings',
      actionType: 'toast',
      icon: CakeOutlinedIcon,
      color: 'from-pink-500/10 to-purple-500/10'
    },
    {
      id: 3,
      type: 'anniversary',
      name: "Rahul's 5th Work Anniversary",
      title: "Rahul's 5th Work Anniversary",
      badge: 'Work Anniversary',
      person: 'Rahul Verma',
      desc: 'Congratulations to Rahul for completing 5 inspiring years at Reward Planners! Join us in wishing him continued success.',
      cta: 'Send Wishes',
      actionType: 'toast',
      icon: WorkspacePremiumIcon,
      color: 'from-amber-500/10 to-yellow-500/10'
    },
    {
      id: 4,
      type: 'townhall',
      name: 'All-Hands Townhall',
      title: 'All-Hands Townhall',
      badge: 'Quarterly Meetup',
      person: 'Executive Team',
      desc: 'Join our quarterly company townhall this Friday at 4:00 PM for vision updates, recognition awards and live Q&A.',
      cta: 'RSVP Now',
      actionType: 'toast',
      icon: CelebrationOutlinedIcon,
      color: 'from-blue-500/10 to-indigo-500/10'
    }
  ];

  const currentAnnouncement = announcements[announcementIndex];

  return (
    <div className="dashboard font-['Poppins',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0A0A5C] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-purple-400/20">
          <CheckIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* FULL-WIDTH DASHBOARD CONTENT WRAPPER */}
      <div className="dashboard-content">

        {/* ── 0. DASHBOARD HEADER BANNER MATCHING REFERENCE IMAGE ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 pt-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#24162F] tracking-tight leading-tight">
              Today's Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#776B80] font-medium mt-1">
              View employee recognition, team updates, upcoming events, and your daily activities in one place.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end shrink-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#24162F]">
              <ApartmentOutlinedIcon sx={{ fontSize: 18 }} className="text-[#1C0E28]" />
              <span>Reward Planners Enterprise</span>
            </div>
            <div className="text-xs text-[#776B80] font-medium mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* ── 1. TOP ENGAGEMENT & PRODUCTIVITY CARDS (3-COLUMN BALANCED FULL-WIDTH GRID) ── */}
        <ServiceShortcuts />

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          
          {/* Card 1: Top Performers (Company Leaderboard - Podium & Star Ratings) */}
          <div className="bg-white rounded-[24px] p-4 border border-[#E4DCE9]/80 shadow-[0_4px_24px_-2px_rgba(20,34,25,0.03)] hover:shadow-sm transition-all flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DCE9]/60">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#24162F] tracking-tight">
                    Top Performers
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#776B80]">
                    Company Leaderboard
                  </span>
                </div>

                {/* Month Switcher Pills */}
                <div className="bg-[#F6F2F8] p-1 rounded-full border border-[#E4DCE9]/60 flex items-center gap-1 text-xs font-semibold text-[#776B80]">
                  {['June', 'July', 'August'].map((m) => {
                    const isActive = activeMonth === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setActiveMonth(m)}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#1C0E28] text-white shadow-xs font-bold'
                            : 'text-[#776B80] hover:text-[#24162F]'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Podium Section (Top 3 Performers) */}
              {(() => {
                const currentMonthData = performersData[activeMonth] || performersData.July;
                const p1 = currentMonthData.podium.find((p) => p.rank === 1) || currentMonthData.podium[1];
                const p2 = currentMonthData.podium.find((p) => p.rank === 2) || currentMonthData.podium[0];
                const p3 = currentMonthData.podium.find((p) => p.rank === 3) || currentMonthData.podium[2];

                return (
                  <div className="pt-5 pb-4 flex items-end justify-center gap-2 sm:gap-4 lg:gap-5">
                    {/* Rank 2 (Left - Emerald badge 2, Star 5.0) */}
                    <div className="flex flex-col items-center text-center w-22 sm:w-26">
                      <div className="relative mb-2">
                        <img
                          src={p2.avatar}
                          alt={p2.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-white ring-2 ring-[#E4DCE9] shadow-sm"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#10B981] text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-sm">
                          2
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1 font-bold text-slate-800 text-sm sm:text-base">
                        <StarIcon sx={{ fontSize: 18 }} className="text-amber-400" />
                        <span>{p2.score}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#24162F] mt-0.5 leading-snug break-words">
                        {p2.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#776B80] leading-tight mt-0.5 font-medium">
                        {p2.role}
                      </div>
                    </div>

                    {/* Rank 1 (Center, Elevated - Gold Crown badge, Star 5.0) */}
                    <div className="flex flex-col items-center text-center w-26 sm:w-30 -mt-4">
                      <div className="relative mb-2">
                        <img
                          src={p1.avatar}
                          alt={p1.name}
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-amber-300 shadow-lg ring-4 ring-amber-200/50"
                        />
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                          <EmojiEventsIcon sx={{ fontSize: 18 }} className="text-white" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5 font-semibold text-slate-900 text-base sm:text-lg">
                        <StarIcon sx={{ fontSize: 20 }} className="text-amber-400" />
                        <span>{p1.score}</span>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-[#24162F] mt-0.5 leading-snug break-words">
                        {p1.name}
                      </div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-xs text-[#1C0E28] bg-[#F0E9F5] border border-[#E4D8ED] font-semibold leading-tight mt-1">
                        {p1.role}
                      </div>
                    </div>

                    {/* Rank 3 (Right - Bronze badge 3, Star 5.0) */}
                    <div className="flex flex-col items-center text-center w-22 sm:w-26">
                      <div className="relative mb-2">
                        <img
                          src={p3.avatar}
                          alt={p3.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-white ring-2 ring-[#E4DCE9] shadow-sm"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#F59E0B] text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-sm">
                          3
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1 font-bold text-slate-800 text-sm sm:text-base">
                        <StarIcon sx={{ fontSize: 18 }} className="text-amber-400" />
                        <span>{p3.score}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#24162F] mt-0.5 leading-snug break-words">
                        {p3.name}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#776B80] leading-tight mt-0.5 font-medium">
                        {p3.role}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Performers Ranked List (Ranks 4, 5, 6 with Star ratings) */}
              <div className="border-t border-[#E4DCE9]/60 pt-4 space-y-2">
                {(performersData[activeMonth]?.list || performersData.July.list).map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#F6F2F8] transition-all border border-transparent hover:border-[#E4DCE9]/60"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-5 h-5 rounded-full bg-[#F6F2F8] text-[#776B80] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 4}
                      </span>
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E4DCE9] shadow-2xs shrink-0"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#24162F]">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#776B80] font-medium">
                          {p.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block text-[11px] font-semibold text-[#776B80] bg-[#F6F2F8] px-2.5 py-0.5 rounded-full border border-[#E4DCE9]/60">
                        {p.points}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-slate-800 text-xs sm:text-sm">
                        <StarIcon sx={{ fontSize: 16 }} className="text-amber-400" />
                        <span>{p.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E4DCE9]/60 flex items-center justify-between text-[11px] text-[#776B80] font-medium">
              <span>Dynamic quarterly rankings</span>
              <span className="text-[#1C0E28] font-bold flex items-center gap-1 bg-[#F0E9F5] px-2.5 py-0.5 rounded-full border border-[#E4D8ED]">
                <AutoAwesomeIcon sx={{ fontSize: 13 }} /> Peer Recognition Model
              </span>
            </div>
          </div>

          {/* Card 2: Ultra-Premium Announcements & Spotlights */}
          <div className="bg-white rounded-[24px] p-4 border border-[#E4DCE9]/80 shadow-[0_4px_24px_-2px_rgba(20,34,25,0.03)] hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
            <div>
              {/* Header with Category & Carousel Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E4DCE9]/60">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-[#F0E9F5] flex items-center justify-center text-[#1C0E28]">
                    <CampaignOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#24162F] leading-tight">
                      Announcements
                    </h3>
                    <span className="text-[11px] text-[#776B80] font-medium">
                      Company Updates & Spotlights
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-xs text-[#776B80] font-semibold mr-1">
                    {announcementIndex + 1}/{announcements.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAnnouncementIndex((idx) => (idx > 0 ? idx - 1 : announcements.length - 1))}
                    aria-label="Previous announcement"
                    className="w-7 h-7 rounded-full border border-[#E4DCE9] hover:bg-[#F6F2F8] flex items-center justify-center text-[#55435F] transition-colors cursor-pointer active:scale-95"
                  >
                    <ChevronLeftIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementIndex((idx) => (idx < announcements.length - 1 ? idx + 1 : 0))}
                    aria-label="Next announcement"
                    className="w-7 h-7 rounded-full border border-[#E4DCE9] hover:bg-[#F6F2F8] flex items-center justify-center text-[#55435F] transition-colors cursor-pointer active:scale-95"
                  >
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* Category Quick Pills in responsive 4-col grid (avoids horizontal truncation e.g. Townhall) */}
              <div className="grid grid-cols-4 gap-2 pt-4 pb-4">
                {[
                  { label: 'Spotlight', icon: EmojiEventsIcon, index: 0 },
                  { label: 'Birthday', icon: CakeOutlinedIcon, index: 1 },
                  { label: 'Milestone', icon: WorkspacePremiumIcon, index: 2 },
                  { label: 'Townhall', icon: RocketLaunchOutlinedIcon, index: 3 }
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isActive = announcementIndex === cat.index;
                  return (
                    <button
                      key={cat.index}
                      type="button"
                      onClick={() => setAnnouncementIndex(cat.index)}
                      className={`inline-flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                        isActive
                          ? 'bg-[#1C0E28] text-white shadow-xs scale-[1.02]'
                          : 'bg-[#F6F2F8] text-[#776B80] hover:bg-[#E9ECE6]'
                      }`}
                    >
                      <CatIcon sx={{ fontSize: 13 }} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Announcement Slide */}
              {currentAnnouncement.type === 'eotm' ? (
                /* Premium Employee of the Month Spotlight */
                <div className="rounded-2xl p-4 bg-gradient-to-br from-[#F4EEF8] via-[#FAF8FC] to-[#F1EAF6] border border-[#E4DCE9] shadow-2xs relative overflow-hidden">
                  {/* Subtle background glow */}
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Profile & Badge */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={currentAnnouncement.image}
                        alt={currentAnnouncement.name}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover ring-3 ring-amber-400/60 shadow-md border-2 border-white"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md border-2 border-white flex items-center justify-center">
                        <MilitaryTechOutlinedIcon sx={{ fontSize: 14 }} className="text-amber-950" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C0E28] text-white shadow-2xs mb-1">
                        <EmojiEventsIcon sx={{ fontSize: 12 }} className="text-white" />
                        <span>{currentAnnouncement.badge}</span>
                      </span>
                      <h4 className="text-base font-semibold text-[#24162F] truncate">
                        {currentAnnouncement.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#776B80] truncate">
                        {currentAnnouncement.role} • <span className="text-[#93849F] font-medium">{currentAnnouncement.department}</span>
                      </p>
                    </div>
                  </div>

                  {/* Recognition Statement */}
                  <p className="text-xs text-[#55435F] leading-relaxed font-medium mt-4 bg-white/95 p-2 rounded-xl border border-[#E4DCE9]/80 shadow-2xs">
                    "{currentAnnouncement.desc}"
                  </p>

                  {/* Highlight Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 rounded-xl bg-white border border-[#E4DCE9] shadow-2xs flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[9px] text-[#776B80] font-semibold uppercase tracking-wider">
                        <MonetizationOnOutlinedIcon sx={{ fontSize: 12 }} className="text-amber-500" />
                        <span>Award</span>
                      </div>
                      <div className="text-xs font-semibold text-amber-600 mt-0.5">{currentAnnouncement.bonus}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E4DCE9] shadow-2xs flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[9px] text-[#776B80] font-semibold uppercase tracking-wider">
                        <TrendingUpIcon sx={{ fontSize: 12 }} className="text-[#1C0E28]" />
                        <span>Impact</span>
                      </div>
                      <div className="text-xs font-semibold text-[#1C0E28] mt-0.5">Top 1%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E4DCE9] shadow-2xs flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[9px] text-[#776B80] font-semibold uppercase tracking-wider">
                        <VerifiedOutlinedIcon sx={{ fontSize: 12 }} className="text-rose-500" />
                        <span>Delivery</span>
                      </div>
                      <div className="text-xs font-semibold text-rose-600 mt-0.5">100% On-Time</div>
                    </div>
                  </div>

                  {/* Interactive Peer Reactions with Material UI Icons */}
                  <div className="mt-4 pt-2.5 border-t border-[#E4DCE9]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#776B80] font-medium">Join the celebration:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReaction('kudos')}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F0E9F5] text-[#55435F] text-[11px] font-bold border border-[#E4DCE9] shadow-2xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <ThumbUpAltOutlinedIcon sx={{ fontSize: 13 }} className="text-[#1C0E28]" />
                        <span>Kudos</span>
                        <strong className="text-[#1C0E28]">({reactionCounts.kudos})</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReaction('celebrated')}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-[#55435F] text-[11px] font-bold border border-[#E4DCE9] shadow-2xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <CelebrationOutlinedIcon sx={{ fontSize: 13 }} className="text-rose-600" />
                        <span>Celebrate</span>
                        <strong className="text-rose-600">({reactionCounts.celebrated})</strong>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Other Announcements (Birthday, Anniversary, Townhall) */
                <div className={`rounded-2xl p-4 bg-gradient-to-br ${currentAnnouncement.color} border border-[#E4DCE9] shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[270px]`}>
                  <div>
                    <div className="flex items-center gap-4 mb-2.5">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-xs flex items-center justify-center text-rose-500 shrink-0">
                        {React.createElement(currentAnnouncement.icon, { sx: { fontSize: 24 } })}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1C0E28] bg-white px-2 py-0.5 rounded-full mb-1 shadow-2xs">
                          {React.createElement(currentAnnouncement.icon, { sx: { fontSize: 12 }, className: "text-[#1C0E28]" })}
                          <span>{currentAnnouncement.badge}</span>
                        </span>
                        <h4 className="text-base font-bold text-[#24162F]">
                          {currentAnnouncement.name}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-white/90 p-3 rounded-xl border border-white text-xs text-[#55435F] leading-relaxed font-medium mt-1">
                      {currentAnnouncement.desc}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#E4DCE9]/60 flex items-center justify-between text-[11px] text-[#776B80] font-medium">
                    <span className="flex items-center gap-1">
                      <EventOutlinedIcon sx={{ fontSize: 13 }} className="text-[#93849F]" />
                      Reward Planners Calendar
                    </span>
                    <span className="text-[#1C0E28] font-bold flex items-center gap-1">
                      <GroupsOutlinedIcon sx={{ fontSize: 13 }} />
                      Company-Wide Event
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions & Indicator Dots */}
            <div className="mt-4 pt-1">
              {currentAnnouncement.actionType === 'claim' ? (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Opening Reward Points Store & Claims...');
                    navigate('/rewards/explore');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1C0E28] hover:bg-[#321B44] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <MilitaryTechOutlinedIcon sx={{ fontSize: 17 }} />
                  <span>{currentAnnouncement.cta} & Explore Store</span>
                  <ArrowForwardIcon sx={{ fontSize: 15 }} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast(`Warm wishes and greetings sent to ${currentAnnouncement.person}! 🎈`)}
                  className="w-full py-2.5 rounded-xl bg-[#1C0E28] hover:bg-[#321B44] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <CelebrationOutlinedIcon sx={{ fontSize: 17 }} />
                  <span>{currentAnnouncement.cta}</span>
                  <ArrowForwardIcon sx={{ fontSize: 15 }} />
                </button>
              )}

              {/* Dots Indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {announcements.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAnnouncementIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      announcementIndex === i
                        ? 'w-6 bg-[#1C0E28]'
                        : 'w-1.5 bg-[#E4DCE9] hover:bg-[#CAD1C6]'
                    }`}
                    aria-label={`Go to announcement ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Onboarding Task (To-Do List matching reference media_1790850980239.jpg) */}
          <div className="bg-gradient-to-b from-[#321B44] via-[#1C0E28] to-[#1C0E28] rounded-[24px] p-4 border border-white/[0.08] shadow-[0_4px_24px_-2px_rgba(20,34,25,0.06)] hover:shadow-sm transition-all duration-300 flex flex-col justify-between text-white md:col-span-2 xl:col-span-1">
            <div>
              {/* Header: "Onboarding Task" left, "2/8" right */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-[#E2B842]">
                    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                      My to-do list
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Your daily tasks and reminders
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-light text-[#E2B842] tracking-wider">
                    {tasks.filter((t) => t.completed).length}/{tasks.length}
                  </span>
                </div>
              </div>

              {/* Progress Bar with dual-tone olive to gold glow */}
              <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden my-4 p-[1px]">
                <div
                  className="bg-gradient-to-r from-[#1C0E28] via-[#9876B0] to-[#C1A4D3] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(226,184,66,0.3)]"
                  style={{
                    width: `${(tasks.filter((t) => t.completed).length / tasks.length) * 100}%`
                  }}
                />
              </div>

              <button type="button" className="todo-add-toggle" onClick={() => setIsAddingTask(value => !value)} aria-expanded={isAddingTask} aria-controls="add-task-form">
                {isAddingTask ? 'Cancel' : '+ Add task'}
              </button>
              {isAddingTask && (
                <form id="add-task-form" className="todo-add-form" onSubmit={addTask}>
                  <label htmlFor="task-title">Task name</label>
                  <input id="task-title" autoFocus value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="What would you like to do?" maxLength={120} required />
                  <label htmlFor="task-date">Due date <span>(optional)</span></label>
                  <input id="task-date" type="datetime-local" value={taskDate} onChange={event => setTaskDate(event.target.value)} />
                  <button type="submit" disabled={!taskTitle.trim()}>Add to my list</button>
                  <p>Tasks are kept for this visit.</p>
                </form>
              )}

              {/* Task list */}
              <div className="space-y-2 pt-1">
                {(showAllTasks ? tasks : tasks.slice(0, 5)).map((task) => {
                  const IconComponent = task.icon;
                  return (
                    <button type="button" aria-pressed={task.completed}
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="w-full text-left flex items-center justify-between gap-2 p-2 sm:p-2 rounded-2xl hover:bg-white/[0.06] transition-all cursor-pointer group border border-transparent hover:border-white/[0.06]"
                    >
                      {/* Left: Icon circle + Title & Timestamp */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            task.completed
                              ? 'bg-white/[0.08] text-zinc-500'
                              : 'bg-white text-[#1C0E28] shadow-md group-hover:scale-105'
                          }`}
                        >
                          <IconComponent sx={{ fontSize: 20 }} />
                        </div>

                        <div>
                          <div
                            className={`text-xs sm:text-sm transition-colors ${
                              task.completed
                                ? 'font-medium text-zinc-400 line-through decoration-zinc-500/60'
                                : 'font-semibold text-white'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div
                            className={`text-[11px] mt-0.5 ${
                              task.completed ? 'text-zinc-500' : 'text-zinc-400'
                            }`}
                          >
                            {task.time}
                          </div>
                        </div>
                      </div>

                      {/* Right: Checkmark Badge */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          task.completed
                            ? 'bg-[#E2B842] text-[#1C0E28] shadow-[0_0_8px_rgba(226,184,66,0.4)]'
                            : 'bg-white/[0.06] group-hover:bg-white/[0.12] border border-white/[0.15]'
                        }`}
                      >
                        {task.completed && (
                          <CheckIcon sx={{ fontSize: 15 }} className="text-[#1C0E28]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Footer: View All toggle & Reward Coins note */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowAllTasks(!showAllTasks)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium flex items-center gap-1"
              >
                <span>{showAllTasks ? 'Show fewer tasks' : `View all (${tasks.length}) tasks`}</span>
              </button>


            </div>
          </div>

        </section>

        {/* ── 2. OCCASION CALENDAR SECTION (FULL-WIDTH) ── */}
        <OccasionCalendar />

        <ServiceDiscovery />

        {/* ── 3. WELLBEING & FINANCIAL SERVICES SECTION (FULL-WIDTH) ── */}
        <BenefitHighlights />


      </div>

      {/* Mobile Navigation Bar */}
      <nav className="dashboard-mobile-nav" aria-label="Dashboard navigation">
        <Link to="/" aria-current="page"><HomeOutlinedIcon sx={{ fontSize: 21 }} />Home</Link>
        <Link to="/rewards"><CardGiftcardIcon sx={{ fontSize: 21 }} />Rewards</Link>
        <Link to="/profile"><PersonOutlinedIcon sx={{ fontSize: 21 }} />Profile</Link>
      </nav>
    </div>
  );
};

export default HomePage;
