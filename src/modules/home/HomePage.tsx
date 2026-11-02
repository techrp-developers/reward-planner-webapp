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
import whatsappDoodle from '../../assets/home/whatsapp_doodle.png';
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
      setTasks(previous => previous.filter(task => task.id !== String(taskId)));
      showToast('Task removed');
    }
  };

  const toggleTask = async (taskId: string | number) => {
    setTasks(previous => previous.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    
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

          {/* Card 3: WhatsApp Chat Screen Theme for To-Do List */}
          <div
            className="rounded-[24px] overflow-hidden border border-[#D1D7DB] shadow-[0_4px_24px_-2px_rgba(20,34,25,0.08)] hover:shadow-md transition-all duration-300 flex flex-col justify-between md:col-span-2 xl:col-span-1 relative select-none"
            style={{
              backgroundColor: '#EFEAE2',
              backgroundImage: `url(${whatsappDoodle})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '360px',
            }}
          >
            <div>
              {/* WhatsApp App Bar Header */}
              <div className="bg-[#008069] text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-black/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs shrink-0">
                    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] sm:text-base font-semibold text-white tracking-tight leading-tight">
                      My to-do list
                    </h3>
                    <span className="text-[11px] text-[#D1EBE7] font-normal leading-tight block">
                      Your daily tasks and reminders
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-[#006653] text-[#D9FDD3] border border-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider shadow-inner">
                    {tasks.filter((t) => t.completed).length}/{tasks.length}
                  </span>
                </div>
              </div>

              {/* WhatsApp Progress Indicator Line */}
              <div className="w-full bg-[#005E4D] h-1.5 overflow-hidden">
                <div
                  className="bg-[#25D366] h-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(37,211,102,0.7)]"
                  style={{
                    width: `${tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}%`
                  }}
                />
              </div>

              {/* Chat Content Body */}
              <div className="p-4 sm:p-5">
                {/* WhatsApp Chat Date Chip */}
                <div className="flex justify-center mb-3">
                  <span className="bg-white/85 backdrop-blur-xs text-[#54656F] text-[10.5px] font-semibold px-3 py-0.5 rounded-md shadow-[0_1px_0.5px_rgba(11,20,26,0.12)] uppercase tracking-wider">
                    Today
                  </span>
                </div>

                {/* Add Task Button / Composer Toggle */}
                <button
                  type="button"
                  className="todo-wa-add-toggle"
                  onClick={() => setIsAddingTask(value => !value)}
                  aria-expanded={isAddingTask}
                  aria-controls="add-task-form"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#00A884]/15 text-[#00A884] flex items-center justify-center font-bold text-xs leading-none">
                      {isAddingTask ? '×' : '+'}
                    </span>
                    <span>{isAddingTask ? 'Cancel' : 'Add a new task...'}</span>
                  </span>
                  <span className="text-[11px] text-[#008069] font-semibold">
                    {isAddingTask ? 'Close' : '+ Add task'}
                  </span>
                </button>

                {isAddingTask && (
                  <form id="add-task-form" className="todo-wa-add-form" onSubmit={addTask}>
                    <label htmlFor="task-title">Task name</label>
                    <input
                      id="task-title"
                      autoFocus
                      value={taskTitle}
                      onChange={event => setTaskTitle(event.target.value)}
                      placeholder="What would you like to do?"
                      maxLength={120}
                      required
                    />
                    <label htmlFor="task-date">Due date <span>(optional)</span></label>
                    <input
                      id="task-date"
                      type="datetime-local"
                      value={taskDate}
                      onChange={event => setTaskDate(event.target.value)}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={!taskTitle.trim()}
                        className="flex-1 py-2 px-3.5 bg-[#00A884] hover:bg-[#008069] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        Add to my list
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
                        className="py-2 px-3 bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#54656F] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-[10.5px] text-[#667781] mt-0.5">Tasks are saved to your account.</p>
                  </form>
                )}

                {/* Task list with WhatsApp Message Bubbles */}
                <div className="space-y-2 pt-1">
                  {(showAllTasks ? tasks : tasks.slice(0, 5)).map((task) => {
                    const IconComponent = task.icon || AssignmentTurnedInOutlinedIcon;
                    const isEditing = editingTaskId === String(task.id);

                    if (isEditing) {
                      return (
                        <form
                          key={task.id}
                          onSubmit={(e) => saveEditTask(e, task.id)}
                          className="todo-wa-edit-box"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#54656F] font-semibold px-0.5">
                            <span>Edit Task</span>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="text-[#8696A0] hover:text-[#111B21] transition-colors cursor-pointer"
                              title="Cancel editing"
                            >
                              <CloseIcon sx={{ fontSize: 15 }} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            maxLength={120}
                            placeholder="Task name"
                            autoFocus
                            required
                          />
                          <div className="flex items-center gap-2 pt-0.5">
                            <input
                              type="datetime-local"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                            />
                            <button
                              type="submit"
                              disabled={!editTitle.trim() || isSubmittingEdit}
                              className="todo-wa-edit-btn-save"
                            >
                              {isSubmittingEdit ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="todo-wa-edit-btn-cancel"
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
                        className={`w-full text-left flex items-center justify-between gap-2 p-2.5 rounded-2xl transition-all group border shadow-[0_1px_1px_rgba(11,20,26,0.12)] ${
                          task.completed
                            ? 'bg-[#D9FDD3] border-[#B7E4C7]/70 rounded-tr-sm'
                            : 'bg-white border-[#E9EDEF] rounded-tl-sm hover:border-[#D1D7DB]'
                        }`}
                      >
                        {/* Left: Icon circle + Title & Timestamp (clickable to toggle completion) */}
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="flex items-center gap-3 flex-1 text-left min-w-0 bg-transparent border-none p-0 cursor-pointer"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              task.completed
                                ? 'bg-[#C2EBB8] text-[#008069]'
                                : 'bg-[#EFEAE2] text-[#008069] group-hover:scale-105'
                            }`}
                          >
                            <IconComponent sx={{ fontSize: 18 }} />
                          </div>

                          <div className="min-w-0 pr-1">
                            <div
                              className={`text-xs sm:text-[13px] truncate transition-colors ${
                                task.completed
                                  ? 'font-medium text-[#54656F] line-through decoration-[#54656F]/60'
                                  : 'font-semibold text-[#111B21]'
                              }`}
                            >
                              {task.title}
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 flex items-center gap-1 ${
                                task.completed ? 'text-[#008069] font-medium' : 'text-[#667781]'
                              }`}
                            >
                              {task.completed && (
                                <DoneAllIcon sx={{ fontSize: 14 }} className="text-[#53BDEB]" titleAccess="Completed" />
                              )}
                              <span>{task.time}</span>
                            </div>
                          </div>
                        </button>

                        {/* Right: Actions (Edit, Delete, Checkmark) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => startEditingTask(task, e)}
                            title="Edit task"
                            aria-label={`Edit ${task.title}`}
                            className="todo-wa-action-btn edit"
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => deleteTask(task.id, e)}
                            title="Delete task"
                            aria-label={`Delete ${task.title}`}
                            className="todo-wa-action-btn delete"
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                          </button>

                          {/* Checkmark Badge */}
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            title={task.completed ? 'Mark pending' : 'Mark completed'}
                            aria-label={task.completed ? 'Mark pending' : 'Mark completed'}
                            aria-pressed={task.completed}
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              task.completed
                                ? 'bg-[#00A884] text-white shadow-xs'
                                : 'bg-white hover:bg-gray-50 border border-[#8696A0]'
                            }`}
                          >
                            {task.completed && (
                              <CheckIcon sx={{ fontSize: 14 }} className="text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card Footer: View All toggle */}
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[11px] bg-white/40 backdrop-blur-2xs">
              <button
                type="button"
                onClick={() => setShowAllTasks(!showAllTasks)}
                className="bg-white/90 hover:bg-white text-[#008069] hover:text-[#006653] font-semibold text-xs px-3 py-1 rounded-full shadow-[0_1px_1px_rgba(11,20,26,0.08)] border border-[#E9EDEF] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllTasks ? 'Show fewer tasks' : `View all (${tasks.length}) tasks`}</span>
              </button>
              <span className="text-[10px] text-[#667781] font-medium flex items-center gap-1">
                🔒 Saved locally
              </span>
            </div>
          </div>

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
