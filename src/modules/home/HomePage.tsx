// src/modules/home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { todoApi } from '../../api/todoApi';
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
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import gameIcon from '../../assets/home/Gameicon.png';
import chatIcon from '../../assets/home/Chaticon.png';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatarUrl } from '../../api/client';
import './HomePage.css';
import OccasionCalendar from './components/OccasionCalendar';
import BenefitHighlights from './components/BenefitHighlights';
import ServiceDiscovery, { ServiceShortcuts } from './components/ServiceDiscovery';
import EmployeeStories from './components/EmployeeStories';
import EmployeeBirthdays from './components/EmployeeBirthdays';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();
  const rawName = user?.name || user?.first_name;
  const name = rawName && !/^\d+$/.test(String(rawName).trim()) ? String(rawName).trim().split(' ')[0] : 'Sylas';
  const avatar = resolveAvatarUrl(user?.userImage || user?.user_image || user?.avatar || user?.photo);


  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Top Performers month filter
  const [activeMonth, setActiveMonth] = useState('July');

  // Announcements Carousel state
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Interactive reaction counters for announcements
  const [reactionCounts, setReactionCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_announcement_reactions');
      return saved ? JSON.parse(saved) : { kudos: 34, celebrated: 19 };
    } catch {
      return { kudos: 34, celebrated: 19 };
    }
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleReaction = (type) => {
    setReactionCounts((prev) => {
      const updated = { ...prev, [type]: (prev[type] || 0) + 1 };
      try {
        localStorage.setItem('rp_announcement_reactions', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
    showToast(`Reaction added! Thank you for celebrating with the team! 🎉`);
  };

  const handleGameClick = () => {
    navigate('/games');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  // Helper to map an appropriate icon based on task title/context
  const getTaskIcon = (title?: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('interview') || t.includes('desktop') || t.includes('laptop')) return DesktopWindowsOutlinedIcon;
    if (t.includes('team') || t.includes('meeting') || t.includes('sync') || t.includes('1-on-1')) return PeopleOutlinedIcon;
    if (t.includes('chat') || t.includes('discuss') || t.includes('talk')) return ChatBubbleOutlineOutlinedIcon;
    if (t.includes('security') || t.includes('compliance')) return ShieldOutlinedIcon;
    if (t.includes('setup') || t.includes('work') || t.includes('dev')) return BusinessCenterOutlinedIcon;
    if (t.includes('goal') || t.includes('review') || t.includes('plan')) return StraightenIcon;
    if (t.includes('policy') || t.includes('link')) return LinkIcon;
    if (t.includes('fast') || t.includes('urgent') || t.includes('electric')) return BoltIcon;
    return AssignmentTurnedInOutlinedIcon;
  };

  // Initial Onboarding Tasks state matching reference design
  const initialFallbackTasks = [
    {
      id: '1',
      title: 'Interview',
      time: 'Sep 13, 08:30',
      icon: DesktopWindowsOutlinedIcon,
      completed: true
    },
    {
      id: '2',
      title: 'Team Meeting',
      time: 'Sep 13, 10:30',
      icon: BoltIcon,
      completed: true
    },
    {
      id: '3',
      title: 'Project Update',
      time: 'Sep 13, 13:00',
      icon: ChatBubbleOutlineOutlinedIcon,
      completed: false
    },
    {
      id: '4',
      title: 'Discuss Q3 Goals',
      time: 'Sep 13, 14:45',
      icon: StraightenIcon,
      completed: false
    },
    {
      id: '5',
      title: 'HR Policy Review',
      time: 'Sep 13, 16:30',
      icon: LinkIcon,
      completed: false
    },
    {
      id: '6',
      title: 'Security Compliance',
      time: 'Sep 14, 11:00',
      icon: ShieldOutlinedIcon,
      completed: false
    },
    {
      id: '7',
      title: 'Development Setup',
      time: 'Sep 14, 14:00',
      icon: BusinessCenterOutlinedIcon,
      completed: false
    },
    {
      id: '8',
      title: 'Manager 1-on-1 Sync',
      time: 'Sep 15, 10:00',
      icon: PeopleOutlinedIcon,
      completed: false
    }
  ];

  const [tasks, setTasks] = useState<any[]>(initialFallbackTasks);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Fetch live tasks from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveTasks() {
      try {
        const liveTodos = await todoApi.getTodos();
        if (isMounted && Array.isArray(liveTodos) && liveTodos.length > 0) {
          const formatted = liveTodos.map((item) => ({
            id: String(item.id),
            title: item.title,
            time: item.time || (item.date ? `${item.date} ${item.startTime || ''}`.trim() : 'No due date'),
            rawDate: item.date || '',
            completed: Boolean(item.completed),
            icon: getTaskIcon(item.title),
          }));
          setTasks(formatted);
        }
      } catch (err) {
        console.warn('Could not load live todos, keeping fallback tasks:', err);
      }
    }
    fetchLiveTasks();

    const handleTodoRefresh = () => fetchLiveTasks();
    window.addEventListener('rp_todo_updated', handleTodoRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener('rp_todo_updated', handleTodoRefresh);
    };
  }, []);

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    const token = sessionStorage.getItem('rp_access_token') || localStorage.getItem('rp_access_token');
    if (!token && !isAuthenticated) {
      showToast('Please sign in to save tasks to your account.');
      if (openAuth) openAuth('login');
      return;
    }

    const dateObj = taskDate ? new Date(taskDate) : new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const task_date = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    
    const startHours = pad(dateObj.getHours());
    const startMinutes = pad(dateObj.getMinutes());
    const start_time = `${startHours}:${startMinutes}:00`;

    const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
    const end_time = `${pad(endDateObj.getHours())}:${pad(endDateObj.getMinutes())}:00`;

    try {
      const res = await todoApi.createTodo({
        task_date,
        start_time,
        end_time,
        title,
        subtitle: 'Dashboard task',
        reminder_time: start_time,
      });

      if (res?.success) {
        const displayTime = taskDate
          ? new Date(taskDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : `${startHours}:${startMinutes} - ${pad(endDateObj.getHours())}:${pad(endDateObj.getMinutes())}`;

        const newTask = {
          id: String(res.todoId || Date.now()),
          title,
          time: displayTime,
          rawDate: taskDate,
          icon: getTaskIcon(title),
          completed: false
        };

        setTasks(previous => [newTask, ...previous]);
        setTaskTitle('');
        setTaskDate('');
        setIsAddingTask(false);
        showToast('Task saved to your database! ✓');
        window.dispatchEvent(new CustomEvent('rp_todo_updated'));
      } else {
        showToast(res?.message || 'Could not save task. Please try again.');
      }
    } catch (err: any) {
      console.error('Backend task create error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save task to database';
      showToast(`Error: ${errMsg}`);
    }
  };

  const startEditingTask = (task: any, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setEditingTaskId(String(task.id));
    setEditTitle(task.title);
    setEditDate(task.rawDate || '');
  };

  const cancelEditing = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setEditingTaskId(null);
    setEditTitle('');
    setEditDate('');
  };

  const saveEditTask = async (event: React.FormEvent, taskId: string | number) => {
    event.preventDefault();
    const title = editTitle.trim();
    if (!title) return;

    setIsSubmittingEdit(true);
    const numericId = Number(taskId);

    if (!isNaN(numericId) && numericId > 0) {
      const dateObj = editDate ? new Date(editDate) : new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const task_date = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;

      const startHours = pad(dateObj.getHours());
      const startMinutes = pad(dateObj.getMinutes());
      const start_time = `${startHours}:${startMinutes}:00`;

      const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
      const end_time = `${pad(endDateObj.getHours())}:${pad(endDateObj.getMinutes())}:00`;

      try {
        const res = await todoApi.updateTodo(taskId, {
          title,
          task_date,
          start_time,
          end_time,
          reminder_time: start_time,
        });

        if (res?.success) {
          const displayTime = editDate
            ? new Date(editDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : `${startHours}:${startMinutes} - ${pad(endDateObj.getHours())}:${pad(endDateObj.getMinutes())}`;

          setTasks(previous => previous.map(task =>
            task.id === String(taskId)
              ? { ...task, title, time: displayTime, rawDate: editDate, icon: getTaskIcon(title) }
              : task
          ));
          setEditingTaskId(null);
          showToast('Task updated successfully! ✓');
          window.dispatchEvent(new CustomEvent('rp_todo_updated'));
        } else {
          showToast(res?.message || 'Could not update task');
        }
      } catch (err: any) {
        console.error('Backend updateTodo error:', err);
        const errMsg = err?.response?.data?.message || err?.message || 'Failed to update task';
        showToast(`Error: ${errMsg}`);
      } finally {
        setIsSubmittingEdit(false);
      }
    } else {
      setTasks(previous => previous.map(task =>
        task.id === String(taskId)
          ? { ...task, title, icon: getTaskIcon(title) }
          : task
      ));
      setEditingTaskId(null);
      setIsSubmittingEdit(false);
      showToast('Task updated');
    }
  };

  const deleteTask = async (taskId: string | number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const numericId = Number(taskId);

    if (!isNaN(numericId) && numericId > 0) {
      try {
        const res = await todoApi.deleteTodo(taskId);
        if (res?.success) {
          setTasks(previous => previous.filter(task => task.id !== String(taskId)));
          showToast('Task deleted successfully! ✓');
          window.dispatchEvent(new CustomEvent('rp_todo_updated'));
        } else {
          showToast(res?.message || 'Could not delete task');
        }
      } catch (err: any) {
        console.error('Backend deleteTask error:', err);
        const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete task';
        showToast(`Error: ${errMsg}`);
      }
    } else {
      setTasks(previous => previous.filter(task => String(task.id) !== String(taskId)));
      showToast('Task removed');
    }
  };

  const toggleTask = async (taskId: string | number) => {
    setTasks(previous => previous.map(task => String(task.id) === String(taskId) ? { ...task, completed: !task.completed } : task));
    
    const numericId = Number(taskId);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        await todoApi.completeTodo(taskId);
        window.dispatchEvent(new CustomEvent('rp_todo_updated'));
      } catch (err) {
        console.warn('Backend completeTodo error:', err);
      }
    }
  };




  const announcements = [
    {
      id: 1,
      type: 'spotlight',
      title: 'Q3 Rewards & Recognition Program',
      badge: 'Company Spotlight',
      icon: EmojiEventsIcon,
      desc: 'Reward Planners has launched the Q3 Recognition initiative across all company teams! Appreciate your colleagues with kudos, achieve quarterly milestones, and redeem bonus RP Coins across the corporate store.',
      tags: ['5,000 RP Pool', 'All Departments', 'Active Q3'],
      cta: 'Explore Rewards Store',
      actionType: 'claim',
      color: 'from-amber-500/10 via-rose-500/10 to-purple-500/10'
    },
    {
      id: 2,
      type: 'birthday',
      title: "Team Birthday Celebrations",
      badge: 'Birthday Celebration',
      icon: CakeOutlinedIcon,
      desc: "Warmest birthday wishes to our colleagues celebrating this month! Join the company celebration followed by cake cutting and greetings.",
      tags: ['Celebration', 'Cake Cutting', '4:30 PM Today'],
      cta: 'Send Birthday Wishes',
      actionType: 'toast',
      person: 'our Birthday Celebrants',
      color: 'from-pink-500/10 via-purple-500/10 to-rose-500/10'
    },
    {
      id: 3,
      type: 'milestone',
      title: 'Work Anniversary Milestones',
      badge: 'Work Anniversary',
      icon: WorkspacePremiumIcon,
      desc: 'Congratulations to our dedicated team members achieving notable work anniversary milestones this quarter. Thank you for your leadership and excellence at Reward Planners!',
      tags: ['Loyalty Honors', 'Recognition Badges', '5+ Years'],
      cta: 'Send Milestone Wishes',
      actionType: 'toast',
      person: 'our Milestone Achievers',
      color: 'from-amber-500/10 via-yellow-500/10 to-orange-500/10'
    }
  ];

  const currentAnnouncement = announcements[announcementIndex];

  return (
    <div className="dashboard no-scrollbar font-['Poppins',sans-serif] bg-white">
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

      {/* ── 0. EMPLOYEE STORIES SECTION (Full Screen Width, No Outer Padding) ── */}
      <EmployeeStories />

      {/* FULL-WIDTH DASHBOARD CONTENT WRAPPER */}
      <div className="dashboard-content bg-white px-4 sm:px-5 lg:px-6">

        {/* ── 0.5. TEAM BIRTHDAYS SECTION (First Today's Birthday, Then Upcoming) ── */}
        <EmployeeBirthdays />

        {/* ── 1. TOP ENGAGEMENT & PRODUCTIVITY CARDS (3-COLUMN BALANCED FULL-WIDTH GRID) ── */}
        <section className="engagement-cards-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch mb-16 sm:mb-20">
          
          {/* Card 1: Top Performers (Lightweight Leaderboard Preview - No Dummy Profiles, Ready for Live Data) */}
          <div className="rounded-[24px] p-5 shadow-[0_4px_24px_-2px_rgba(20,34,25,0.04)] hover:shadow-sm transition-all flex flex-col justify-between bg-[#E0C3F2] border border-[#C79FE0] text-[#24162F]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#C79FE0]/70">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#24162F] tracking-tight">
                    Top Performers
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B537B]">
                    Company Leaderboard
                  </span>
                </div>

                {/* Month Switcher Pills */}
                <div className="bg-white/80 p-1 rounded-full border border-[#C79FE0]/80 flex items-center gap-1 text-xs font-semibold text-[#6B537B]">
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
                            : 'text-[#6B537B] hover:text-[#24162F]'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clean, Lightweight Top Performers Podium Standings Placeholder */}
              <div className="pt-4 pb-2">
                <div className="bg-white/85 rounded-2xl p-4 sm:p-5 border border-[#C79FE0]/75 shadow-2xs text-center flex flex-col items-center justify-between min-h-[255px]">
                  <div>
                    {/* Top Trophy Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C0E28] to-[#3B1E54] text-amber-400 flex items-center justify-center shadow-md mb-2.5 mx-auto">
                      <EmojiEventsIcon sx={{ fontSize: 26 }} className="text-amber-400" />
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#24162F]">
                      Top Performers ({activeMonth})
                    </h4>
                    <p className="text-xs text-[#6B537B] font-medium max-w-xs mt-1 leading-relaxed mx-auto">
                      Standings are being calculated from active employee achievements and quiz scores. Top performers will be showcased here!
                    </p>
                  </div>

                  {/* 3-Spot Clean Podium Preview (Prepares for upcoming user profiles) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full my-3">
                    {/* 2nd Place */}
                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#C79FE0]/70 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center mb-1 shadow-2xs">
                        2
                      </div>
                      <div className="text-xs font-bold text-[#24162F]">2nd Place</div>
                      <div className="text-[10px] text-[#6B537B] font-medium mt-0.5">Revealing soon</div>
                    </div>

                    {/* 1st Place (Elevated) */}
                    <div className="bg-white p-3 rounded-xl border-2 border-amber-300 flex flex-col items-center justify-center text-center shadow-sm -mt-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center mb-1 shadow-xs">
                        <EmojiEventsIcon sx={{ fontSize: 15 }} className="text-white" />
                      </div>
                      <div className="text-xs font-extrabold text-[#24162F]">1st Place</div>
                      <div className="text-[10px] text-amber-600 font-bold mt-0.5">Top Achiever</div>
                    </div>

                    {/* 3rd Place */}
                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#C79FE0]/70 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-6 h-6 rounded-full bg-[#F59E0B] text-white text-[11px] font-black flex items-center justify-center mb-1 shadow-2xs">
                        3
                      </div>
                      <div className="text-xs font-bold text-[#24162F]">3rd Place</div>
                      <div className="text-[10px] text-[#6B537B] font-medium mt-0.5">Revealing soon</div>
                    </div>
                  </div>

                  {/* Lightweight Highlight Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-[#1C0E28]">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-[#C79FE0]/70 shadow-2xs">
                      🏆 5,000 RP Coins Pool
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-[#C79FE0]/70 shadow-2xs">
                      👥 All Employees Eligible
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#C79FE0]/70 flex items-center justify-between text-[11px] text-[#6B537B] font-medium">
              <span>Dynamic quarterly rankings</span>
              <span className="text-[#1C0E28] font-bold flex items-center gap-1 bg-white/80 px-2.5 py-0.5 rounded-full border border-[#C79FE0]/80">
                <AutoAwesomeIcon sx={{ fontSize: 13 }} /> Live Company Tracking
              </span>
            </div>
          </div>

          {/* Card 2: Ultra-Premium Announcements & Spotlights */}
          <div className="rounded-[24px] p-5 shadow-[0_4px_24px_-2px_rgba(20,34,25,0.04)] hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-[#FCD7BD] border border-[#E9AC85]">
            <div>
              {/* Header with Category & Carousel Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E9AC85]/70">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-white/80 border border-[#E9AC85]/80 flex items-center justify-center text-[#1C0E28]">
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
                    className="w-7 h-7 rounded-full border border-[#E9AC85] bg-white/70 hover:bg-white flex items-center justify-center text-[#55435F] transition-colors cursor-pointer active:scale-95"
                  >
                    <ChevronLeftIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementIndex((idx) => (idx < announcements.length - 1 ? idx + 1 : 0))}
                    aria-label="Next announcement"
                    className="w-7 h-7 rounded-full border border-[#E9AC85] bg-white/70 hover:bg-white flex items-center justify-center text-[#55435F] transition-colors cursor-pointer active:scale-95"
                  >
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* Category Quick Pills in responsive 3-col grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 pb-4">
                {[
                  { label: 'Spotlight', icon: EmojiEventsIcon, index: 0 },
                  { label: 'Birthday', icon: CakeOutlinedIcon, index: 1 },
                  { label: 'Milestone', icon: WorkspacePremiumIcon, index: 2 }
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isActive = announcementIndex === cat.index;
                  return (
                    <button
                      key={cat.index}
                      type="button"
                      onClick={() => setAnnouncementIndex(cat.index)}
                      className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                        isActive
                          ? 'bg-[#1C0E28] text-white shadow-xs scale-[1.02]'
                          : 'bg-white/70 border border-[#E9AC85] text-[#776B80] hover:bg-white'
                      }`}
                    >
                      <CatIcon sx={{ fontSize: 13 }} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Announcement Slide (Clean, concise & expressive card with NO dummy profile) */}
              <div className="rounded-2xl p-4 bg-white/90 border border-[#E9AC85]/80 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[255px]">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  {/* Category Badge & Title */}
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#1C0E28] text-white flex items-center justify-center shadow-xs shrink-0">
                      {React.createElement(currentAnnouncement.icon, { sx: { fontSize: 22 }, className: "text-amber-400" })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1C0E28] text-white shadow-2xs mb-1">
                        {React.createElement(currentAnnouncement.icon, { sx: { fontSize: 12 }, className: "text-amber-400" })}
                        <span>{currentAnnouncement.badge}</span>
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-[#24162F] leading-snug">
                        {currentAnnouncement.title}
                      </h4>
                    </div>
                  </div>

                  {/* Concise expressive announcement description */}
                  <p className="text-xs text-[#55435F] leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-[#E9AC85]/50 shadow-2xs">
                    "{currentAnnouncement.desc}"
                  </p>

                  {/* Expressive Highlight Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {currentAnnouncement.tags?.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-bold text-[#1C0E28] bg-white px-2.5 py-1 rounded-lg border border-[#E9AC85]/60 shadow-2xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interactive Peer Reactions */}
                <div className="mt-3 pt-2.5 border-t border-[#E9AC85]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#776B80] font-medium">Join celebration:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReaction('kudos')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-[#55435F] text-[11px] font-bold border border-[#E9AC85] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ThumbUpAltOutlinedIcon sx={{ fontSize: 13 }} className="text-[#1C0E28]" />
                      <span>Kudos</span>
                      <strong className="text-[#1C0E28]">({reactionCounts.kudos})</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReaction('celebrated')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-[#55435F] text-[11px] font-bold border border-[#E9AC85] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <CelebrationOutlinedIcon sx={{ fontSize: 13 }} className="text-rose-600" />
                      <span>Celebrate</span>
                      <strong className="text-rose-600">({reactionCounts.celebrated})</strong>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Indicator Dots */}
            <div className="mt-4 pt-1">
              {currentAnnouncement.actionType === 'claim' ? (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Opening Products Store & Deals...');
                    navigate('/store');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1C0E28] hover:bg-[#321B44] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <MilitaryTechOutlinedIcon sx={{ fontSize: 17 }} />
                  <span>{currentAnnouncement.cta}</span>
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
                        : 'w-1.5 bg-[#E9AC85]/60 hover:bg-[#E9AC85]'
                    }`}
                    aria-label={`Go to announcement ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Executive Premium To-Do List */}
          {(() => {
            const completedTasksCount = tasks.filter((t) => t.completed).length;
            const pendingTasksCount = tasks.filter((t) => !t.completed).length;
            const totalTasksCount = tasks.length;
            const completionPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

            const filteredTasks = tasks.filter((task) => {
              if (taskFilter === 'pending') return !task.completed;
              if (taskFilter === 'completed') return task.completed;
              return true;
            });

            const displayedTasks = showAllTasks ? filteredTasks : filteredTasks.slice(0, 4);

            return (
              <div className="rounded-[24px] p-5 shadow-[0_4px_24px_-2px_rgba(20,34,25,0.04)] hover:shadow-sm transition-all flex flex-col justify-between bg-[#D7EFE4] border border-[#A6DEC5] text-[#143228] md:col-span-2 xl:col-span-1">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#A6DEC5]/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#1C0E28] text-emerald-300 flex items-center justify-center shadow-xs shrink-0">
                        <PlaylistAddCheckIcon sx={{ fontSize: 20 }} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#143228] tracking-tight">
                          My To-Do List
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#467362]">
                          Daily Priorities & Tasks
                        </span>
                      </div>
                    </div>

                    {/* Completion Progress Pill */}
                    <div className="bg-white/85 px-3 py-1 rounded-full border border-[#A6DEC5] flex items-center gap-1.5 text-xs font-bold text-[#143228] shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{completedTasksCount}/{totalTasksCount} Done</span>
                    </div>
                  </div>

                  {/* 3 Filter Tabs (All, Pending, Completed) matching Card 2's category grid */}
                  <div className="grid grid-cols-3 gap-2.5 pt-4 pb-3">
                    {[
                      { id: 'all', label: `All (${totalTasksCount})` },
                      { id: 'pending', label: `Pending (${pendingTasksCount})` },
                      { id: 'completed', label: `Done (${completedTasksCount})` },
                    ].map((tab) => {
                      const isActive = taskFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTaskFilter(tab.id as 'all' | 'pending' | 'completed')}
                          className={`inline-flex items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate ${
                            isActive
                              ? 'bg-[#1C0E28] text-white shadow-xs scale-[1.02]'
                              : 'bg-white/70 border border-[#A6DEC5] text-[#467362] hover:bg-white'
                          }`}
                        >
                          <span className="truncate">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Thin High-Precision Progress Bar */}
                  <div className="w-full bg-white/70 h-1.5 rounded-full overflow-hidden p-0.5 border border-[#A6DEC5]/60 mb-3.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>

                  {/* Main Card Container (Clean white card matching Card 1 and Card 2 min-height) */}
                  <div className="rounded-2xl p-3.5 sm:p-4 bg-white/90 border border-[#A6DEC5]/80 shadow-2xs min-h-[255px] flex flex-col justify-between">
                    <div>
                      {/* Inline Composer (When adding new task) */}
                      {isAddingTask && (
                        <form onSubmit={addTask} className="mb-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs flex flex-col gap-2.5 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs font-bold text-[#143228]">
                            <span className="flex items-center gap-1.5">
                              <AddIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
                              <span>New Priority Task</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsAddingTask(false)}
                              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </button>
                          </div>

                          <input
                            type="text"
                            autoFocus
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="What needs to be accomplished?"
                            maxLength={120}
                            required
                            className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg px-3 py-1.5 text-xs text-[#143228] font-medium placeholder:text-slate-400 outline-none transition-all"
                          />

                          <div className="flex items-center gap-2">
                            <input
                              type="datetime-local"
                              value={taskDate}
                              onChange={(e) => setTaskDate(e.target.value)}
                              className="flex-1 bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-[11px] text-[#143228] outline-none transition-all"
                            />
                            <button
                              type="submit"
                              disabled={!taskTitle.trim()}
                              className="py-1 px-3 bg-[#1C0E28] hover:bg-[#321B44] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAddingTask(false)}
                              className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Task List */}
                      {displayedTasks.length === 0 ? (
                        <div className="py-10 px-4 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200 flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                            <CheckIcon sx={{ fontSize: 20 }} />
                          </div>
                          <p className="text-xs font-bold text-[#143228]">No tasks in this view</p>
                          <p className="text-[11px] text-[#467362] mt-0.5">
                            {taskFilter === 'completed'
                              ? 'Complete tasks to see them archived here.'
                              : 'You are all caught up! Click below to add a new task.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {displayedTasks.map((task) => {
                            const IconComponent = task.icon || AssignmentTurnedInOutlinedIcon;
                            const isEditing = editingTaskId === String(task.id);

                            if (isEditing) {
                              return (
                                <form
                                  key={task.id}
                                  onSubmit={(e) => saveEditTask(e, task.id)}
                                  className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-300 shadow-xs flex flex-col gap-2"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-bold text-[#143228]">
                                    <span>Edit Task</span>
                                    <button
                                      type="button"
                                      onClick={cancelEditing}
                                      className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    >
                                      <CloseIcon sx={{ fontSize: 14 }} />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    maxLength={120}
                                    placeholder="Task title"
                                    autoFocus
                                    required
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-[#143228] outline-none"
                                  />

                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="datetime-local"
                                      value={editDate}
                                      onChange={(e) => setEditDate(e.target.value)}
                                      className="flex-1 bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2 py-1 text-[11px] text-[#143228] outline-none"
                                    />
                                    <button
                                      type="submit"
                                      disabled={!editTitle.trim() || isSubmittingEdit}
                                      className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {isSubmittingEdit ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditing}
                                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              );
                            }

                            return (
                              <div
                                key={task.id}
                                className={`w-full flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all duration-200 group ${
                                  task.completed
                                    ? 'bg-slate-50/70 border-slate-200/80'
                                    : 'bg-white hover:bg-emerald-50/30 border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                                }`}
                              >
                                {/* Left: Custom Checkbox + Task Icon + Title & Time */}
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  {/* Custom Premium Checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => toggleTask(task.id)}
                                    title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                      task.completed
                                        ? 'bg-emerald-500 text-white shadow-2xs scale-100'
                                        : 'border-2 border-slate-300 group-hover:border-emerald-500 bg-white hover:scale-105'
                                    }`}
                                  >
                                    {task.completed && <CheckIcon sx={{ fontSize: 13 }} className="text-white font-bold" />}
                                  </button>

                                  {/* Task Icon Badge */}
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                      task.completed
                                        ? 'bg-slate-100 text-slate-400'
                                        : 'bg-emerald-50 text-emerald-700 group-hover:scale-105'
                                    }`}
                                  >
                                    <IconComponent sx={{ fontSize: 16 }} />
                                  </div>

                                  {/* Title & Time */}
                                  <div
                                    className="min-w-0 flex-1 cursor-pointer"
                                    onClick={() => toggleTask(task.id)}
                                  >
                                    <div
                                      className={`text-xs sm:text-[13px] truncate transition-colors ${
                                        task.completed
                                          ? 'line-through text-slate-400 font-normal decoration-slate-300'
                                          : 'font-semibold text-[#143228] group-hover:text-emerald-950'
                                      }`}
                                    >
                                      {task.title}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 py-0.2 rounded ${
                                          task.completed
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-emerald-50 text-emerald-800'
                                        }`}
                                      >
                                        <AccessTimeOutlinedIcon sx={{ fontSize: 11 }} />
                                        <span>{task.time}</span>
                                      </span>
                                      {task.completed && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                          Done
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Actions (Edit & Delete) */}
                                <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={(e) => startEditingTask(task, e)}
                                    title="Edit task"
                                    aria-label={`Edit ${task.title}`}
                                    className="w-6 h-6 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <EditOutlinedIcon sx={{ fontSize: 14 }} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => deleteTask(task.id, e)}
                                    title="Delete task"
                                    aria-label={`Delete ${task.title}`}
                                    className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Inner Footer: View all toggle */}
                    {filteredTasks.length > 4 && (
                      <div className="pt-2.5 mt-2 border-t border-slate-100 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowAllTasks(!showAllTasks)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>{showAllTasks ? 'Show fewer tasks' : `View all ${filteredTasks.length} tasks`}</span>
                          <ArrowForwardIcon sx={{ fontSize: 12 }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions & Indicator (Matching Card 1 & Card 2 bottom structure) */}
                <div className="mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(value => !value)}
                    className="w-full py-2.5 rounded-xl bg-[#1C0E28] hover:bg-[#321B44] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <AddIcon sx={{ fontSize: 17 }} />
                    <span>{isAddingTask ? 'Close Task Form' : 'Add New Task'}</span>
                  </button>

                  {/* Status footer with sync badge */}
                  <div className="flex items-center justify-between text-[11px] text-[#467362] font-semibold mt-3 px-1">
                    <span className="flex items-center gap-1.5">
                      <CloudDoneOutlinedIcon sx={{ fontSize: 14 }} className="text-emerald-600" />
                      <span>Cloud Synced</span>
                    </span>
                    <span className="text-[10.5px] text-[#467362]/80">
                      {completedTasksCount} of {totalTasksCount} tasks completed
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

        </section>

        {/* ── 2. YOUR BENEFIT HIGHLIGHTS SECTION ── */}
        <BenefitHighlights />

        {/* ── 3. SERVICE SHORTCUTS ── */}
        <ServiceShortcuts />

        {/* ── 4. OCCASION CALENDAR SECTION (FULL-WIDTH) ── */}
        <OccasionCalendar />

        <ServiceDiscovery />
      </div>

      {/* Floating Sticky Actions: Game & Chat in Right Corner */}
      <aside
        className="fixed right-4 sm:right-6 md:right-8 bottom-24 sm:bottom-8 z-40 flex flex-col items-center gap-3 sm:gap-3.5 select-none"
        aria-label="Floating Shortcuts"
      >
        {/* Game Icon Floating Button */}
        <button
          type="button"
          onClick={handleGameClick}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-hidden cursor-pointer"
          aria-label="Games & Challenges"
        >
          {/* Tooltip on hover (desktop) */}
          <span className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#1C0E28] text-white text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 border border-purple-400/20 hidden sm:flex items-center">
            Games & Challenges
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1C0E28]" />
          </span>

          <img
            src={gameIcon}
            alt="Games & Challenges"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(107,33,168,0.38)] group-hover:drop-shadow-[0_12px_26px_rgba(107,33,168,0.6)] transition-all pointer-events-none"
            loading="eager"
            draggable={false}
          />
        </button>

        {/* Chat Icon Floating Button */}
        <button
          type="button"
          onClick={handleChatClick}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 md:w-[60px] md:h-[60px] rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-hidden cursor-pointer"
          aria-label="Customer Support & Chat"
        >
          {/* Tooltip on hover (desktop) */}
          <span className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#1C0E28] text-white text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 border border-purple-400/20 hidden sm:flex items-center">
            Support & Chat
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1C0E28]" />
          </span>

          <img
            src={chatIcon}
            alt="Support & Chat"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(147,51,234,0.38)] group-hover:drop-shadow-[0_12px_26px_rgba(147,51,234,0.6)] transition-all pointer-events-none"
            loading="eager"
            draggable={false}
          />
        </button>
      </aside>

      {/* Mobile Navigation Bar */}
      <nav className="dashboard-mobile-nav" aria-label="Dashboard navigation">
        <Link to="/" aria-current="page"><HomeOutlinedIcon sx={{ fontSize: 21 }} />Home</Link>
        <Link to="/store"><CardGiftcardIcon sx={{ fontSize: 21 }} />Products</Link>
        <Link to="/profile"><PersonOutlinedIcon sx={{ fontSize: 21 }} />Profile</Link>
      </nav>
    </div>
  );
};

export default HomePage;
