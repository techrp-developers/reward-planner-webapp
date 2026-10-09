// src/modules/home/components/OccasionCalendar.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';

export interface MeetingAttendee {
  name: string;
  avatar: string;
}

export type MeetingStatus = 'Complete' | 'Pending' | 'Cancelled';
export type ComputedStatus = 'completed' | 'upcoming' | 'time_passed' | 'cancelled';
export type TimeframeType = 'Day' | 'Week' | 'Month' | 'All';

export interface ScheduleMeeting {
  id: string | number;
  title: string;
  dateStr: string; // 'YYYY-MM-DD'
  time: string; // e.g. '10:30 AM', '1:00 PM', '4:00 PM'
  duration: string; // e.g. 'About 30 Min'
  status: MeetingStatus;
  attendees: MeetingAttendee[];
  description: string;
  location: string;
  meetLink?: string;
}

export interface EvaluatedMeeting extends ScheduleMeeting {
  displayType: ComputedStatus;
  displayLabel: string;
  isOverdue: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DEFAULT_ATTENDEES: MeetingAttendee[] = [
  { name: 'Monica Sylas', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80' },
  { name: 'Lokesh Ankam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
  { name: 'Chandra Shekar', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
  { name: 'Sushma Rao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
  { name: 'Rahul Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
  { name: 'Alina Hubner', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
];

// Helper to format short date (e.g. 'Oct 9')
function formatShortDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${MONTH_NAMES[monthIdx].slice(0, 3)} ${day}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Parse meeting date & time string into a valid Date object
function getMeetingDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split('-').map((n) => parseInt(n, 10));
    const clean = timeStr.trim().toUpperCase();
    const parts = clean.split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
    const isPM = clean.includes('PM');

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

// Convert 12-hour string (e.g. "10:30 AM", "2:00 PM") to 24-hour "HH:mm" for input type="time"
function to24HourTime(time12: string): string {
  try {
    const clean = time12.trim().toUpperCase();
    const parts = clean.split(' ');
    const [hStr, mStr] = parts[0].split(':');
    let h = parseInt(hStr, 10);
    const m = mStr ? parseInt(mStr, 10) : 0;
    const isPM = clean.includes('PM');
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } catch {
    return '11:00';
  }
}

// Convert 24-hour string (e.g. "14:30", "09:15") to 12-hour "hh:mm AM/PM"
function to12HourTime(time24: string): string {
  try {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  } catch {
    return '11:00 AM';
  }
}

// Compute dynamic meeting status:
// - Completed: Yellow
// - Upcoming: Green
// - Time Passed (time passed but not marked Complete): Red
// - Cancelled: Red
export function evaluateMeeting(meeting: ScheduleMeeting, now: Date = new Date()): EvaluatedMeeting {
  // If explicitly Cancelled -> Red
  if (meeting.status === 'Cancelled') {
    return {
      ...meeting,
      displayType: 'cancelled',
      displayLabel: 'Cancelled',
      isOverdue: false,
    };
  }

  // If marked Complete -> Yellow
  if (meeting.status === 'Complete') {
    return {
      ...meeting,
      displayType: 'completed',
      displayLabel: 'Completed',
      isOverdue: false,
    };
  }

  // Meeting is Pending / Scheduled:
  // Check if its time has already passed relative to real current time
  const meetingDate = getMeetingDateTime(meeting.dateStr, meeting.time);
  if (meetingDate && now.getTime() > meetingDate.getTime()) {
    // Time has passed and completed status is NOT updated -> RED!
    return {
      ...meeting,
      displayType: 'time_passed',
      displayLabel: 'Time Passed',
      isOverdue: true,
    };
  }

  // Future scheduled meeting -> GREEN (Upcoming)
  return {
    ...meeting,
    displayType: 'upcoming',
    displayLabel: 'Upcoming',
    isOverdue: false,
  };
}

// Visual styling rules for each status category
export function getStatusStyles(displayType: ComputedStatus) {
  switch (displayType) {
    case 'completed':
      // YELLOW: Warm yellow/amber (matching current design)
      return {
        lineClass: 'w-0.5 bg-[#F59E0B]',
        markerSymbol: '✻',
        markerClass: 'text-[#D97706] font-bold text-sm select-none -translate-x-1.5',
        triangleClass: 'bg-[#FEF3C7] border-l border-b border-[#FCD34D]',
        bubbleBoxClass: 'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F] shadow-2xs hover:shadow-xs',
        badgeClass: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
        timeTextClass: 'text-[#D97706] font-medium',
        dotColor: 'bg-[#F59E0B]',
      };
    case 'upcoming':
      // GREEN: Emerald green for all upcoming meetings
      return {
        lineClass: 'w-0.5 bg-[#10B981]',
        markerSymbol: null,
        markerClass: 'w-2.5 h-2.5 rounded-full bg-[#10B981] ring-4 ring-emerald-100 shadow-xs -translate-x-1',
        triangleClass: 'bg-[#ECFDF5] border-l border-b border-[#A7F3D0]',
        bubbleBoxClass: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D] shadow-2xs hover:shadow-xs',
        badgeClass: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]',
        timeTextClass: 'text-[#059669] font-medium',
        dotColor: 'bg-[#10B981]',
      };
    case 'time_passed':
      // RED: Red for meetings whose time has passed but status was not updated to Complete
      return {
        lineClass: 'w-0.5 bg-[#EF4444]',
        markerSymbol: null,
        markerClass: 'w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-4 ring-rose-200 animate-pulse shadow-xs -translate-x-1',
        triangleClass: 'bg-[#FFF1F2] border-l border-b border-[#FECDD3]',
        bubbleBoxClass: 'bg-[#FFF1F2] border-[#FECDD3] text-[#881337] shadow-2xs hover:shadow-xs ring-1 ring-rose-400/30',
        badgeClass: 'bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]',
        timeTextClass: 'text-[#E11D48] font-bold',
        dotColor: 'bg-[#EF4444]',
      };
    case 'cancelled':
      // RED: Red for cancelled meetings
      return {
        lineClass: 'w-0 border-l border-dashed border-[#EF4444]',
        markerSymbol: '✕',
        markerClass: 'text-[#DC2626] font-bold text-xs select-none -translate-x-1',
        triangleClass: 'bg-[#FFF1F2] border-l border-b border-[#FECDD3]',
        bubbleBoxClass: 'bg-[#FFF1F2]/90 border-[#FECDD3] text-[#881337] opacity-85 shadow-2xs hover:shadow-xs',
        badgeClass: 'bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]',
        timeTextClass: 'text-rose-500 font-medium',
        dotColor: 'bg-[#EF4444]',
      };
  }
}
// Known mock/dummy titles to filter out completely
const DUMMY_TITLES = new Set([
  'Daily Standup',
  'Executive Review',
  'Discussion on Websites',
  'Vendor Demo (Cancelled)',
  'Vendor Demo',
  'Discussion on Flow',
  'Sprint Planning & Backlog',
  'Client Architecture Review',
  'Quarterly Strategy & OKRs',
]);

const STORAGE_KEY = 'rp_executive_schedule_meetings_v6';

// Clock dial positions
const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const CLOCK_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];


// Calculate percentage across the 10:00 AM -> 6:00 PM timeline
function calculateTimelinePercentage(timeStr: string): number {
  try {
    const clean = timeStr.trim().toUpperCase();
    const parts = clean.split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
    const isPM = clean.includes('PM');

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const totalHours = hours + minutes / 60;
    // Timeline axis: 10:00 AM (10.0) to 6:00 PM (18.0) -> Span = 8 hrs
    const minHour = 10.0;
    const maxHour = 18.0;
    const percent = ((totalHours - minHour) / (maxHour - minHour)) * 74 + 8;
    return Math.max(6, Math.min(88, percent));
  } catch {
    return 38;
  }
}

export default function OccasionCalendar() {
  const today = useMemo(() => new Date(), []);

  // 1. Calendar starts defaulted to CURRENT REAL DATE
  const [currentYear, setCurrentYear] = useState<number>(() => today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(() => today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(() => today.getDate());

  // 2. Real-time clock display
  const [timeString, setTimeString] = useState<string>(() => {
    let hours = today.getHours();
    const mins = today.getMinutes();
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')} : ${String(mins).padStart(2, '0')}`;
  });
  const [period, setPeriod] = useState<'AM' | 'PM'>(() => (today.getHours() >= 12 ? 'PM' : 'AM'));
  const [isLiveClock, setIsLiveClock] = useState<boolean>(true);
  const [currentTimeTick, setCurrentTimeTick] = useState<Date>(() => new Date());

  // 3. Chart filter starts defaulted to 'Day' (Current Day Wise)
  const [timeframe, setTimeframe] = useState<TimeframeType>('Day');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ComputedStatus>('all');

  // Bookmarks & Toast
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    return localStorage.getItem('rp_exec_schedule_bookmarked') === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected meeting for Details Modal
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduleMeeting | null>(null);

  // Schedule / Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | number | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  });
  const [formTime, setFormTime] = useState<string>('12:00 PM');
  const [formDuration, setFormDuration] = useState<string>('About 30 Min');
  const [formStatus, setFormStatus] = useState<MeetingStatus>('Pending');
  const [formLocation, setFormLocation] = useState<string>('Google Meet (Virtual)');
  const [formDesc, setFormDesc] = useState<string>('');
  const [clockMode, setClockMode] = useState<'hours' | 'minutes'>('hours');

  // Parsed clock values for interactive clock dial
  const { clockHour, clockMinute, clockPeriod } = useMemo(() => {
    const clean = (formTime || '12:00 PM').trim().toUpperCase();
    const parts = clean.split(' ');
    const [hStr, mStr] = (parts[0] || '12:00').split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) h = 12;
    let m = parseInt(mStr, 10);
    if (isNaN(m)) m = 0;
    const p = clean.includes('PM') ? 'PM' : 'AM';
    return { clockHour: h, clockMinute: m, clockPeriod: p as 'AM' | 'PM' };
  }, [formTime]);

  const handleSelectHour = (h: number) => {
    const newTime = `${String(h).padStart(2, '0')}:${String(clockMinute).padStart(2, '0')} ${clockPeriod}`;
    setFormTime(newTime);
    setTimeout(() => setClockMode('minutes'), 260);
  };

  const handleSelectMinute = (m: number) => {
    const newTime = `${String(clockHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${clockPeriod}`;
    setFormTime(newTime);
  };

  const handleSelectPeriod = (p: 'AM' | 'PM') => {
    const newTime = `${String(clockHour).padStart(2, '0')}:${String(clockMinute).padStart(2, '0')} ${p}`;
    setFormTime(newTime);
  };

  const handleClockDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 100;
    const y = e.clientY - rect.top - 100;
    let rad = Math.atan2(y, x) + Math.PI / 2;
    if (rad < 0) rad += 2 * Math.PI;
    const deg = (rad * 180) / Math.PI;

    if (clockMode === 'hours') {
      let h = Math.round(deg / 30);
      if (h === 0) h = 12;
      handleSelectHour(h);
    } else {
      let m = Math.round(deg / 6);
      if (m === 60) m = 0;
      handleSelectMinute(m);
    }
  };

  // 4. Persistent meetings: ONLY real meetings added from today / schedule form (no static seed meetings)
  const [meetings, setMeetings] = useState<ScheduleMeeting[]>(() => {
    try {
      // Clear legacy storage containing previous static dummy meetings
      localStorage.removeItem('rp_executive_schedule_meetings_v5');
      localStorage.removeItem('rp_executive_schedule_meetings_v4');
      localStorage.removeItem('rp_executive_schedule_meetings_v3');
      localStorage.removeItem('rp_executive_schedule_meetings_v2');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep only user-added meetings, completely omitting static dummy entries
          return parsed.filter(
            (m) =>
              !DUMMY_TITLES.has(m.title) &&
              typeof m.id === 'string' &&
              m.id.startsWith('m-custom-')
          );
        }
      }
    } catch {
      // Fallback
    }
    // Starts completely clean with 0 static dummy meetings
    return [];
  });

  // Save meetings to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    } catch (e) {
      console.warn('Failed to save meetings:', e);
    }
  }, [meetings]);

  // Live ticking clock & time tick
  useEffect(() => {
    if (!isLiveClock) return;
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeTick(now);
      let hours = now.getHours();
      const mins = now.getMinutes();
      const p = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formatted = `${String(hours).padStart(2, '0')} : ${String(mins).padStart(2, '0')}`;
      setTimeString(formatted);
      setPeriod(p);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isLiveClock]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Format YYYY-MM-DD for selected date
  const selectedDateStr = useMemo(() => {
    const m = String(currentMonthIndex + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }, [currentYear, currentMonthIndex, selectedDay]);

  // Check if selected date is Today
  const isSelectedDateToday = useMemo(() => {
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonthIndex &&
      today.getDate() === selectedDay
    );
  }, [today, currentYear, currentMonthIndex, selectedDay]);

  // Dynamic real calendar days calculation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun .. 6 = Sat

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [currentYear, currentMonthIndex]);

  // Evaluated meetings with dynamic status calculation
  const evaluatedMeetings = useMemo(() => {
    return meetings.map((m) => evaluateMeeting(m, currentTimeTick));
  }, [meetings, currentTimeTick]);

  // Set of day numbers in current calendar month that have scheduled meetings
  const daysWithMeetings = useMemo(() => {
    const map = new Map<number, ComputedStatus>();
    const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-`;
    evaluatedMeetings.forEach((m) => {
      if (m.dateStr.startsWith(monthPrefix)) {
        const dayPart = parseInt(m.dateStr.split('-')[2], 10);
        if (!isNaN(dayPart)) {
          // Priority for dot color: time_passed (red) > upcoming (green) > completed (yellow)
          const cur = map.get(dayPart);
          if (m.displayType === 'time_passed') {
            map.set(dayPart, 'time_passed');
          } else if (!cur || cur === 'completed') {
            map.set(dayPart, m.displayType);
          }
        }
      }
    });
    return map;
  }, [evaluatedMeetings, currentYear, currentMonthIndex]);

  // Month switchers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
    showToast(`Switched calendar to ${MONTH_NAMES[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1]}`);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
    showToast(`Switched calendar to ${MONTH_NAMES[currentMonthIndex === 11 ? 0 : currentMonthIndex + 1]}`);
  };

  // Compute week bounds (Sunday through Saturday) for the selected date
  const weekRange = useMemo(() => {
    const targetDate = new Date(currentYear, currentMonthIndex, selectedDay);
    const dayOfWeek = targetDate.getDay(); // 0 (Sun) to 6 (Sat)

    const sunday = new Date(targetDate);
    sunday.setDate(targetDate.getDate() - dayOfWeek);

    const saturday = new Date(targetDate);
    saturday.setDate(targetDate.getDate() + (6 - dayOfWeek));

    const pad = (n: number) => String(n).padStart(2, '0');
    const startStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
    const endStr = `${saturday.getFullYear()}-${pad(saturday.getMonth() + 1)}-${pad(saturday.getDate())}`;

    const label = `${MONTH_NAMES[sunday.getMonth()].slice(0, 3)} ${sunday.getDate()} – ${MONTH_NAMES[saturday.getMonth()].slice(0, 3)} ${saturday.getDate()}`;
    return { startStr, endStr, label };
  }, [currentYear, currentMonthIndex, selectedDay]);

  // 5. Timeframe-based filtered meetings (Day, Week, Month, All)
  const timeframeMeetings = useMemo(() => {
    if (timeframe === 'Day') {
      return evaluatedMeetings.filter((m) => m.dateStr === selectedDateStr);
    }
    if (timeframe === 'Week') {
      return evaluatedMeetings.filter((m) => m.dateStr >= weekRange.startStr && m.dateStr <= weekRange.endStr);
    }
    if (timeframe === 'Month') {
      const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-`;
      return evaluatedMeetings.filter((m) => m.dateStr.startsWith(monthPrefix));
    }
    // 'All'
    return evaluatedMeetings;
  }, [evaluatedMeetings, timeframe, selectedDateStr, weekRange, currentYear, currentMonthIndex]);

  // 6. Final visible meetings after status pill filter (Completed, Upcoming, Time Passed, Cancelled)
  const visibleMeetings = useMemo(() => {
    let list = timeframeMeetings;
    if (statusFilter !== 'all') {
      list = list.filter((m) => m.displayType === statusFilter);
    }
    // Sort chronologically by time
    return [...list].sort((a, b) => {
      const getMin = (t: string) => {
        const clean = t.trim().toUpperCase();
        const parts = clean.split(' ');
        const [h, m] = parts[0].split(':').map((n) => parseInt(n, 10));
        let hour = h;
        if (clean.includes('PM') && hour < 12) hour += 12;
        if (!clean.includes('PM') && hour === 12) hour = 0;
        return hour * 60 + (m || 0);
      };
      return getMin(a.time) - getMin(b.time);
    });
  }, [timeframeMeetings, statusFilter]);

  // Counts for status legend based on current timeframe selection
  const statusCounts = useMemo(() => {
    return {
      completed: timeframeMeetings.filter((m) => m.displayType === 'completed').length,
      upcoming: timeframeMeetings.filter((m) => m.displayType === 'upcoming').length,
      time_passed: timeframeMeetings.filter((m) => m.displayType === 'time_passed').length,
      cancelled: timeframeMeetings.filter((m) => m.displayType === 'cancelled').length,
    };
  }, [timeframeMeetings]);

  // Meetings on currently selected day
  const meetingsForSelectedDay = useMemo(() => {
    return evaluatedMeetings.filter((m) => m.dateStr === selectedDateStr);
  }, [evaluatedMeetings, selectedDateStr]);

  // 7. Click on date: Updates date, sets chart to Day view, and opens Schedule Meeting Modal for clicked date
  const handleDateClick = (dayNum: number) => {
    setSelectedDay(dayNum);
    setTimeframe('Day'); // Focus chart on this day
    const pad = (n: number) => String(n).padStart(2, '0');
    const targetDateStr = `${currentYear}-${pad(currentMonthIndex + 1)}-${pad(dayNum)}`;
    handleOpenAddModal(targetDateStr);
  };

  // Open modal directly
  const handleOpenAddModal = (targetDate?: string | React.MouseEvent) => {
    const activeDate = typeof targetDate === 'string' ? targetDate : selectedDateStr;
    setEditingMeetingId(null);
    setFormTitle('');
    setFormDate(activeDate);
    setFormTime('12:00 PM');
    setClockMode('hours');
    setFormDuration('About 30 Min');
    setFormStatus('Pending');
    setFormLocation('Google Meet (Virtual)');
    setFormDesc('');
    setIsEditModalOpen(true);
  };

  // Open modal to edit existing meeting
  const handleOpenEditModal = (meeting: ScheduleMeeting) => {
    setEditingMeetingId(meeting.id);
    setFormTitle(meeting.title);
    setFormDate(meeting.dateStr);
    setFormTime(meeting.time);
    setClockMode('hours');
    setFormDuration(meeting.duration);
    setFormStatus(meeting.status);
    setFormLocation(meeting.location);
    setFormDesc(meeting.description);
    setIsEditModalOpen(true);
  };

  // One-click action: Mark meeting as Complete (turns it Yellow)
  const handleMarkAsComplete = (id: string | number) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Complete' } : m))
    );
    showToast('✓ Meeting marked as Complete! (Updated to yellow)');
    if (selectedMeeting && selectedMeeting.id === id) {
      setSelectedMeeting({ ...selectedMeeting, status: 'Complete' });
    }
  };

  // One-click action: Cancel meeting (turns it Red)
  const handleCancelMeeting = (id: string | number) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Cancelled' } : m))
    );
    showToast('✕ Meeting has been Cancelled (Updated to red)');
    if (selectedMeeting && selectedMeeting.id === id) {
      setSelectedMeeting({ ...selectedMeeting, status: 'Cancelled' });
    }
  };

  // Save new or edited meeting
  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter a meeting title');
      return;
    }

    const targetDate = formDate || selectedDateStr;

    if (editingMeetingId) {
      // Update existing meeting
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === editingMeetingId
            ? {
                ...m,
                title: formTitle.trim(),
                dateStr: targetDate,
                time: formTime.trim(),
                duration: formDuration.trim(),
                status: formStatus,
                location: formLocation.trim() || 'Google Meet',
                description: formDesc.trim(),
              }
            : m
        )
      );
      showToast(`Updated meeting: ${formTitle}`);
    } else {
      // Create new meeting
      const newMeeting: ScheduleMeeting = {
        id: `m-custom-${Date.now()}`,
        title: formTitle.trim(),
        dateStr: targetDate,
        time: formTime.trim(),
        duration: formDuration.trim(),
        status: formStatus,
        attendees: [DEFAULT_ATTENDEES[0], DEFAULT_ATTENDEES[1]],
        description: formDesc.trim() || 'Scheduled executive discussion & milestone review.',
        location: formLocation.trim() || 'Google Meet (Virtual)',
        meetLink: 'https://meet.google.com/rp-live-meeting',
      };
      setMeetings((prev) => [...prev, newMeeting]);

      // If scheduled date matches current view or today, ensure calendar selects it
      const parts = targetDate.split('-').map((n) => parseInt(n, 10));
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        setCurrentYear(parts[0]);
        setCurrentMonthIndex(parts[1] - 1);
        setSelectedDay(parts[2]);
      }
      setTimeframe('Day');
      showToast(`Added meeting to ${targetDate}: ${formTitle}`);
    }

    setIsEditModalOpen(false);
    setSelectedMeeting(null);
  };

  // Delete meeting
  const handleDeleteMeeting = (id: string | number) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    showToast('Meeting removed from schedule.');
    setSelectedMeeting(null);
  };

  // Quick delete latest meeting for selected day
  const handleQuickDeleteLatest = () => {
    if (meetingsForSelectedDay.length === 0) {
      showToast('No meetings on this day to delete.');
      return;
    }
    const toDelete = meetingsForSelectedDay[meetingsForSelectedDay.length - 1];
    handleDeleteMeeting(toDelete.id);
  };

  // Dynamic header overview title
  const overviewTitle = useMemo(() => {
    if (timeframe === 'Day') {
      return isSelectedDateToday
        ? `Today (${MONTH_NAMES[currentMonthIndex].slice(0, 3)} ${selectedDay})`
        : `${MONTH_NAMES[currentMonthIndex]} ${selectedDay}, ${currentYear}`;
    }
    if (timeframe === 'Week') {
      return `Week (${weekRange.label})`;
    }
    if (timeframe === 'Month') {
      return `${MONTH_NAMES[currentMonthIndex]} ${currentYear}`;
    }
    return 'All Scheduled Meetings';
  }, [timeframe, isSelectedDateToday, currentMonthIndex, selectedDay, currentYear, weekRange]);

  // Evaluated selected meeting for Details Modal
  const evaluatedSelectedMeeting = useMemo(() => {
    if (!selectedMeeting) return null;
    return evaluateMeeting(selectedMeeting, currentTimeTick);
  }, [selectedMeeting, currentTimeTick]);

  return (
    <section
      className="calendar-meeting-section mt-14 sm:mt-16 mb-12 font-['Poppins',sans-serif] bg-[#FEEDB4] border border-[#F5D565] rounded-[28px] sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_6px_24px_rgba(217,119,6,0.08)]"
      aria-label="Calendar Meeting Schedule"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0A0A5C] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-amber-400/20">
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

      {/* ── SECTION HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A5C] tracking-tight">
              Executive Schedule & Meetings
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FDE68A] text-[#78350F] border border-[#F5D565]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Agenda
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-[#D97706] shrink-0" />
            <span className="font-semibold text-slate-600">Company Calendar</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Global Hybrid Workspaces & Milestone Events
            </span>
          </div>
        </div>

        {/* Top Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => {
              const next = !isBookmarked;
              setIsBookmarked(next);
              localStorage.setItem('rp_exec_schedule_bookmarked', String(next));
              showToast(next ? 'Saved schedule to your bookmarks! 🔖' : 'Removed from bookmarked meetings');
            }}
            className="w-10 h-10 rounded-2xl bg-white border border-[#F5D565]/80 shadow-2xs hover:shadow-sm flex items-center justify-center text-slate-500 hover:text-[#D97706] hover:border-amber-400 transition-all cursor-pointer"
            aria-label="Bookmark Meeting"
            title={isBookmarked ? 'Bookmarked' : 'Bookmark Schedule'}
          >
            {isBookmarked ? (
              <BookmarkIcon sx={{ fontSize: 18 }} className="text-[#D97706]" />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 18 }} />
            )}
          </button>

          {/* Schedule / Add Meeting Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-10 h-10 rounded-2xl bg-white border border-[#F5D565]/80 shadow-2xs hover:shadow-sm flex items-center justify-center text-slate-500 hover:text-[#D97706] hover:border-amber-400 transition-all cursor-pointer"
            aria-label="Add or Edit Meeting"
            title="Schedule New Meeting"
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleQuickDeleteLatest}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
            aria-label="Delete Latest Meeting"
            title="Remove latest meeting on selected date"
          >
            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* ── TWO CARDS GRID MATCHING MOCKUP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ═══════════════════════════════════════════════════
            LEFT CARD: CALENDAR & TIME (4 COLUMNS)
        ═══════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div>
            {/* Month Switcher Header */}
            <div className="flex items-center justify-between mb-4 pb-1">
              <div
                className="flex items-center gap-1 cursor-pointer select-none group"
                onClick={() => {
                  // Jump to Today
                  setCurrentMonthIndex(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setSelectedDay(today.getDate());
                  setTimeframe('Day');
                  showToast(`Jumped to Today: ${MONTH_NAMES[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`);
                }}
                title="Click to jump to Today"
              >
                <span className="text-base sm:text-lg font-bold text-[#0A0A5C] group-hover:text-indigo-600 transition-colors">
                  {MONTH_NAMES[currentMonthIndex]} {currentYear}
                </span>
                <ChevronRightIcon sx={{ fontSize: 18 }} className="text-slate-400 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  aria-label="Previous Month"
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  aria-label="Next Month"
                >
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <span key={day} className="text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wider">
                  {day}
                </span>
              ))}
            </div>

            {/* Dynamic Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {calendarDays.map((dayNum, idx) => {
                if (!dayNum) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }
                const isSelected = selectedDay === dayNum;
                const meetingStatusType = daysWithMeetings.get(dayNum);
                const hasMeeting = Boolean(meetingStatusType);
                const isTodayCell =
                  today.getFullYear() === currentYear &&
                  today.getMonth() === currentMonthIndex &&
                  today.getDate() === dayNum;

                // Indicator dot color: red if overdue, green if upcoming, yellow if completed
                const dotColorClass =
                  meetingStatusType === 'time_passed' || meetingStatusType === 'cancelled'
                    ? 'bg-rose-500'
                    : meetingStatusType === 'upcoming'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500';

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => handleDateClick(dayNum)}
                    className={`relative h-8 w-8 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white font-bold shadow-md shadow-indigo-500/30 scale-105'
                        : isTodayCell
                        ? 'text-indigo-700 bg-indigo-50 font-bold border border-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={
                      isSelected
                        ? `Selected Date (${dayNum}) - Click to schedule meeting`
                        : isTodayCell
                        ? `Today (${dayNum}) - Click to schedule meeting`
                        : `Date ${dayNum} - Click to schedule meeting`
                    }
                  >
                    <span>{dayNum}</span>
                    {/* Indicator Dot if this day has scheduled events */}
                    {hasMeeting && !isSelected && (
                      <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & AM/PM Selector */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#0A0A5C]">Time</span>
              <button
                type="button"
                onClick={() => {
                  const next = !isLiveClock;
                  setIsLiveClock(next);
                  showToast(next ? 'Live clock sync activated ⏰' : 'Manual time mode set');
                }}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  isLiveClock
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Toggle live ticking clock"
              >
                {isLiveClock ? 'Live' : 'Set'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Digital Time Display Input */}
              <div
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-700 tracking-wider shadow-2xs cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => {
                  const hours = period === 'AM' ? '02 : 30' : '10 : 45';
                  setTimeString(hours);
                  showToast(`Selected time slot: ${hours} ${period}`);
                }}
                title="Click to cycle time presets"
              >
                {timeString}
              </div>

              {/* AM / PM Pill Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    period === 'AM'
                      ? 'bg-white text-[#0A0A5C] shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    period === 'PM'
                      ? 'bg-white text-[#0A0A5C] shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            RIGHT CARD: TIMELINE OVERVIEW (8 COLUMNS)
        ═══════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between overflow-hidden">
          <div>
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#0A0A5C]">
                  Overview
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  • {overviewTitle}
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {visibleMeetings.length} {visibleMeetings.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Status Legend (Interactive Filters for 4 categories) */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600 flex-wrap">
                  {/* Completed - Yellow */}
                  <button
                    type="button"
                    data-testid="filter-status-completed"
                    onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'completed' ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400 font-bold' : 'hover:bg-slate-50'
                    }`}
                    title="Filter completed meetings (Yellow)"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-2xs" />
                    <span>Completed</span>
                    <span className="text-[10px] text-slate-400">({statusCounts.completed})</span>
                  </button>

                  {/* Upcoming - Green */}
                  <button
                    type="button"
                    data-testid="filter-status-upcoming"
                    onClick={() => setStatusFilter(statusFilter === 'upcoming' ? 'all' : 'upcoming')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'upcoming' ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400 font-bold' : 'hover:bg-slate-50'
                    }`}
                    title="Filter upcoming meetings (Green)"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-2xs" />
                    <span>Upcoming</span>
                    <span className="text-[10px] text-slate-400">({statusCounts.upcoming})</span>
                  </button>

                  {/* Time Passed - Red */}
                  <button
                    type="button"
                    data-testid="filter-status-time_passed"
                    onClick={() => setStatusFilter(statusFilter === 'time_passed' ? 'all' : 'time_passed')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'time_passed' ? 'bg-rose-100 text-rose-900 ring-1 ring-rose-400 font-bold' : 'hover:bg-slate-50'
                    }`}
                    title="Filter meetings whose time passed without complete status (Red)"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse shadow-2xs" />
                    <span>Time Passed</span>
                    <span className="text-[10px] text-slate-400">({statusCounts.time_passed})</span>
                  </button>

                  {/* Cancelled - Red */}
                  <button
                    type="button"
                    data-testid="filter-status-cancelled"
                    onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'cancelled' ? 'bg-rose-100 text-rose-900 ring-1 ring-rose-400 font-bold' : 'hover:bg-slate-50'
                    }`}
                    title="Filter cancelled meetings (Red)"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-2xs" />
                    <span>Cancelled</span>
                    <span className="text-[10px] text-slate-400">({statusCounts.cancelled})</span>
                  </button>
                </div>

                {/* Filter Dropdown (Day, Week, Month, All) */}
                <div className="relative">
                  <button
                    type="button"
                    data-testid="timeframe-dropdown-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{timeframe}</span>
                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 w-44 animate-fadeIn">
                      {[
                        { id: 'Day', label: 'Day', desc: 'Selected Day / Today' },
                        { id: 'Week', label: 'Week', desc: 'Current Week (Sun-Sat)' },
                        { id: 'Month', label: 'Month', desc: 'Current Month' },
                        { id: 'All', label: 'All', desc: 'All Events' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          data-testid={`timeframe-opt-${item.id}`}
                          onClick={() => {
                            setTimeframe(item.id as TimeframeType);
                            setDropdownOpen(false);
                            showToast(`Filter applied: ${item.label} (${item.desc})`);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer flex flex-col ${
                            timeframe === item.id
                              ? 'bg-blue-50 text-[#3B82F6]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold">{item.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* + New Meeting Quick Button */}
                <button
                  type="button"
                  data-testid="new-meeting-quick-btn"
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer"
                  title="Schedule meeting"
                >
                  <AddCircleOutlineIcon sx={{ fontSize: 15 }} />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Timeline Canvas Container */}
            <div className="relative h-[290px] w-full overflow-x-auto no-scrollbar scrollbar-none pt-2">
              <div className="relative min-w-[760px] h-full">

                {/* Bottom Horizontal Timeline Axis */}
                <div className="absolute bottom-3 left-0 right-0 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none pt-2.5 px-4">
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">10:00 AM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">11:00 AM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">12:00 AM</span>
                  <span className="w-16 text-center font-bold text-[#0A0A5C] scale-105">1:00 PM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">2:00 PM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">3:00 PM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">4:00 PM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">5:00 PM</span>
                  <span className="w-16 text-center hover:text-slate-600 transition-colors">6:00 PM</span>
                  <span className="w-16 text-center text-slate-500 font-semibold">Today</span>
                </div>

                {/* Empty State when no meetings match */}
                {visibleMeetings.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pb-8 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mb-2 shadow-2xs">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 24 }} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">No Meetings Scheduled</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {timeframe === 'Day' && isSelectedDateToday
                        ? 'No meetings scheduled for today yet. Click below or pick any date on the calendar to schedule a new meeting.'
                        : `No meetings scheduled for ${overviewTitle}. Click below to add one.`}
                    </p>
                    <button
                      type="button"
                      data-testid="empty-schedule-meeting-btn"
                      onClick={() => handleOpenAddModal(selectedDateStr)}
                      className="mt-3.5 px-4 py-2 rounded-xl bg-[#0A0A5C] hover:bg-[#15157a] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                      <span>{isSelectedDateToday && timeframe === 'Day' ? 'Schedule Meeting for Today' : 'Schedule Meeting'}</span>
                    </button>
                  </div>
                ) : (
                  // Dynamic Meeting Items on Timeline
                  visibleMeetings.map((meeting, index) => {
                    const leftPercent = calculateTimelinePercentage(meeting.time);
                    // Stagger heights vertically: e.g. 48px, 104px, 160px
                    const topOffset = 48 + (index % 3) * 56;
                    const lineTop = topOffset + 24;

                    const styles = getStatusStyles(meeting.displayType);

                    return (
                      <React.Fragment key={meeting.id}>
                        {/* Vertical Indicator Line down to timeline axis */}
                        <div
                          className={`absolute bottom-[28px] z-0 ${styles.lineClass}`}
                          style={{
                            left: `${leftPercent}%`,
                            top: `${lineTop}px`,
                          }}
                        />

                        {/* Top Marker: Asterisk for complete, or colored dot */}
                        {styles.markerSymbol ? (
                          <div
                            className={`absolute z-10 ${styles.markerClass}`}
                            style={{
                              left: `${leftPercent}%`,
                              top: `${topOffset + 8}px`,
                            }}
                          >
                            {styles.markerSymbol}
                          </div>
                        ) : (
                          <div
                            className={`absolute z-10 ${styles.markerClass}`}
                            style={{
                              left: `${leftPercent}%`,
                              top: `${topOffset + 14}px`,
                            }}
                          />
                        )}

                        {/* Flag Speech Bubble */}
                        <div
                          className="absolute z-20 flex items-center cursor-pointer group hover:scale-105 transition-transform"
                          style={{
                            left: `calc(${leftPercent}% + 8px)`,
                            top: `${topOffset}px`,
                          }}
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          {/* Triangle Pointer */}
                          <div
                            className={`w-2.5 h-2.5 rotate-45 -mr-1.5 z-10 shadow-2xs ${styles.triangleClass}`}
                          />

                          {/* Speech Card Box */}
                          <div
                            className={`rounded-2xl px-3.5 py-1.5 flex items-center gap-3.5 border transition-shadow ${styles.bubbleBoxClass}`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold leading-tight truncate max-w-[140px] ${meeting.displayType === 'cancelled' ? 'line-through' : ''}`}>
                                  {meeting.title}
                                </span>
                                {/* Date badge shown when viewing Week, Month, or All */}
                                {timeframe !== 'Day' && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/80 text-indigo-700 border border-indigo-200/50 shrink-0">
                                    {formatShortDate(meeting.dateStr)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] ${styles.timeTextClass}`}>
                                  {meeting.duration}
                                </span>
                                {meeting.displayType === 'time_passed' && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                                    Time Passed
                                  </span>
                                )}
                                {meeting.displayType === 'cancelled' && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 border border-rose-300">
                                    Cancelled
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Attendee Avatars */}
                            <div className="flex -space-x-2 shrink-0">
                              {meeting.attendees.slice(0, 3).map((att, i) => (
                                <img
                                  key={i}
                                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                  src={att.avatar}
                                  alt={att.name}
                                  title={att.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── MEETING DETAILS MODAL ── */}
      {selectedMeeting && evaluatedSelectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setSelectedMeeting(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>

            {/* Status & Duration Header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  getStatusStyles(evaluatedSelectedMeeting.displayType).badgeClass
                }`}
              >
                {evaluatedSelectedMeeting.displayLabel}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {evaluatedSelectedMeeting.duration}
              </span>
            </div>

            <h3 className={`text-lg font-bold text-[#0A0A5C] mb-1 ${evaluatedSelectedMeeting.displayType === 'cancelled' ? 'line-through text-slate-500' : ''}`}>
              {evaluatedSelectedMeeting.title}
            </h3>

            {/* Warning alert if time passed without status update */}
            {evaluatedSelectedMeeting.displayType === 'time_passed' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 my-3 text-xs text-rose-900 flex items-start gap-2.5">
                <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-800">Time Passed • Status Not Updated</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    This meeting was scheduled for {evaluatedSelectedMeeting.time}, but has not been marked as Complete.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleMarkAsComplete(evaluatedSelectedMeeting.id)}
                    className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <CheckIcon sx={{ fontSize: 14 }} />
                    <span>Mark as Complete (Turn Yellow)</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 my-4 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-700">
                <AccessTimeIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                <span>{evaluatedSelectedMeeting.time} • {evaluatedSelectedMeeting.dateStr}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                <span>{evaluatedSelectedMeeting.location}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              {evaluatedSelectedMeeting.description}
            </p>

            <div className="mb-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Participants ({evaluatedSelectedMeeting.attendees.length})
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {evaluatedSelectedMeeting.attendees.map((att, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img
                      src={att.avatar}
                      alt={att.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-semibold text-slate-700">{att.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {evaluatedSelectedMeeting.displayType !== 'cancelled' ? (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Connecting to meeting video room...');
                    if (evaluatedSelectedMeeting.meetLink) {
                      window.open(evaluatedSelectedMeeting.meetLink, '_blank');
                    }
                    setSelectedMeeting(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <VideocamOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Join Meeting</span>
                </button>
              ) : (
                <div className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">
                  Meeting Cancelled
                </div>
              )}

              {evaluatedSelectedMeeting.displayType !== 'completed' && evaluatedSelectedMeeting.displayType !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsComplete(evaluatedSelectedMeeting.id)}
                  className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                  title="Mark as Complete"
                >
                  <CheckIcon sx={{ fontSize: 18 }} />
                </button>
              )}

              {evaluatedSelectedMeeting.displayType !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleCancelMeeting(evaluatedSelectedMeeting.id)}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  title="Cancel meeting"
                >
                  <BlockOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenEditModal(evaluatedSelectedMeeting)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Edit this meeting"
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteMeeting(evaluatedSelectedMeeting.id)}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                title="Delete this meeting"
              >
                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE / EDIT MEETING MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer z-10"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#0A0A5C]">
                {editingMeetingId ? 'Edit Meeting Schedule' : 'Schedule New Meeting'}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                📅 Target date: {formDate}
                {meetingsForSelectedDay.length > 0 && !editingMeetingId && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                    {meetingsForSelectedDay.length} existing meeting{meetingsForSelectedDay.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left Form Inputs (7 cols) */}
                <div className="md:col-span-7 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Executive Strategy Alignment"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Duration
                      </label>
                      <select
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="About 15 Min">About 15 Min</option>
                        <option value="About 30 Min">About 30 Min</option>
                        <option value="About 45 Min">About 45 Min</option>
                        <option value="About 60 Min">About 60 Min</option>
                        <option value="About 90 Min">About 90 Min</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as MeetingStatus)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Pending">Upcoming / Pending (Green)</option>
                        <option value="Complete">Complete (Yellow)</option>
                        <option value="Cancelled">Cancelled (Red)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google Meet (Room Alpha)"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description & Agenda
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Key topics, milestone reviews, agenda details..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>
                </div>

                {/* Right Interactive Visual Clock (5 cols) */}
                <div className="md:col-span-5 flex flex-col items-center bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                  <div className="w-full flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <AccessTimeIcon sx={{ fontSize: 15 }} className="text-indigo-600" />
                      <span>Meeting Time</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {formTime}
                    </span>
                  </div>

                  {/* Digital Time Readout & AM/PM Switcher */}
                  <div className="flex items-center justify-between w-full mb-2 px-1 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-testid="clock-hour-tab"
                        onClick={() => setClockMode('hours')}
                        className={`px-2.5 py-1 rounded-lg text-sm font-extrabold transition-all cursor-pointer ${
                          clockMode === 'hours'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Select Hour"
                      >
                        {String(clockHour).padStart(2, '0')}
                      </button>
                      <span className="font-extrabold text-slate-400 text-sm">:</span>
                      <button
                        type="button"
                        data-testid="clock-minute-tab"
                        onClick={() => setClockMode('minutes')}
                        className={`px-2.5 py-1 rounded-lg text-sm font-extrabold transition-all cursor-pointer ${
                          clockMode === 'minutes'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Select Minute"
                      >
                        {String(clockMinute).padStart(2, '0')}
                      </button>
                    </div>

                    {/* AM / PM Switcher */}
                    <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        type="button"
                        data-testid="clock-period-am"
                        onClick={() => handleSelectPeriod('AM')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          clockPeriod === 'AM'
                            ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        data-testid="clock-period-pm"
                        onClick={() => handleSelectPeriod('PM')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          clockPeriod === 'PM'
                            ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>

                  {/* Mode switcher tabs (Hours / Minutes) */}
                  <div className="flex items-center gap-1 w-full mb-2 bg-slate-200/60 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      data-testid="clock-mode-hours"
                      onClick={() => setClockMode('hours')}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        clockMode === 'hours' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Hours</span>
                    </button>
                    <button
                      type="button"
                      data-testid="clock-mode-minutes"
                      onClick={() => setClockMode('minutes')}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        clockMode === 'minutes' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Minutes</span>
                    </button>
                  </div>

                  {/* Circular Analog Clock Dial (200px) */}
                  {(() => {
                    const handDeg = clockMode === 'hours' ? (clockHour % 12) * 30 : clockMinute * 6;
                    const handRad = ((handDeg - 90) * Math.PI) / 180;
                    const handLength = 66;
                    const handTipX = 100 + handLength * Math.cos(handRad);
                    const handTipY = 100 + handLength * Math.sin(handRad);

                    return (
                      <div
                        data-testid="analog-clock-dial"
                        onClick={handleClockDialClick}
                        className="relative w-[200px] h-[200px] rounded-full bg-white border border-slate-200 shadow-xs cursor-pointer select-none"
                      >
                        {/* SVG Clock Hand & Center */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
                          {/* Face circle */}
                          <circle cx="100" cy="100" r="95" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="1" />
                          {/* Hand line */}
                          <line
                            x1="100"
                            y1="100"
                            x2={handTipX}
                            y2={handTipY}
                            stroke="#4F46E5"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Hand tip active circle */}
                          <circle cx={handTipX} cy={handTipY} r="14" fill="#4F46E5" />
                          {/* Center pivot */}
                          <circle cx="100" cy="100" r="4.5" fill="#4F46E5" />
                          <circle cx="100" cy="100" r="2" fill="#FFFFFF" />
                        </svg>

                        {/* Clock Face Numbers */}
                        {clockMode === 'hours'
                          ? CLOCK_HOURS.map((h) => {
                              const ang = (h % 12) * 30;
                              const rad = ((ang - 90) * Math.PI) / 180;
                              const nx = 100 + 66 * Math.cos(rad);
                              const ny = 100 + 66 * Math.sin(rad);
                              const isSelected = clockHour === h;
                              return (
                                <button
                                  key={h}
                                  type="button"
                                  data-testid={`clock-hour-num-${h}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectHour(h);
                                  }}
                                  style={{
                                    left: `${nx}px`,
                                    top: `${ny}px`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform cursor-pointer z-10 ${
                                    isSelected
                                      ? 'text-white scale-110'
                                      : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50'
                                  }`}
                                >
                                  {h}
                                </button>
                              );
                            })
                          : CLOCK_MINUTES.map((m) => {
                              const ang = m * 6;
                              const rad = ((ang - 90) * Math.PI) / 180;
                              const nx = 100 + 66 * Math.cos(rad);
                              const ny = 100 + 66 * Math.sin(rad);
                              const isSelected = Math.abs(clockMinute - m) < 3;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  data-testid={`clock-min-num-${m}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectMinute(m);
                                  }}
                                  style={{
                                    left: `${nx}px`,
                                    top: `${ny}px`,
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-transform cursor-pointer z-10 ${
                                    isSelected
                                      ? 'text-white scale-110'
                                      : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50'
                                  }`}
                                >
                                  {String(m).padStart(2, '0')}
                                </button>
                              );
                            })}
                      </div>
                    );
                  })()}

                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Click clock numbers to select {clockMode}
                  </p>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel / View Timeline
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                  <span>{editingMeetingId ? 'Save Changes' : 'Schedule Meeting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
