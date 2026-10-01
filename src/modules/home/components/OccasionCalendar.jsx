// src/modules/home/components/OccasionCalendar.jsx
import React, { useState } from 'react';
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

export default function OccasionCalendar() {
  // Calendar state
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5); // June
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(7);
  const [timeString, setTimeString] = useState('09 : 41');
  const [period, setPeriod] = useState('AM');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timeframe, setTimeframe] = useState('This Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Calendar dates matching the reference image layout (Day 1 starts under TUE)
  // [empty, empty, 1, 2, 3, 4, 5, 6, 7, 8, ...]
  const juneDays = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, null, null, null
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
    showToast(`Switched calendar to ${months[currentMonthIndex === 0 ? 11 : currentMonthIndex - 1]}`);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
    showToast(`Switched calendar to ${months[currentMonthIndex === 11 ? 0 : currentMonthIndex + 1]}`);
  };

  // Meeting events matching the exact reference image
  const meetings = [
    {
      id: 1,
      title: 'Daily Call',
      time: '10:30 AM',
      duration: 'About 30 Min',
      status: 'Complete',
      statusType: 'complete',
      timelineLeft: '8%',
      lineHeight: 'h-16',
      attendees: [
        { name: 'Sushma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
        { name: 'Rahul Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }
      ],
      description: 'Daily team standup covering active deliverables, design milestones, and sprint blockers.',
      location: 'Google Meet (Room Alpha)'
    },
    {
      id: 2,
      title: 'Discussion on Websites',
      time: '1:00 PM',
      duration: 'About 30 Min',
      status: 'Running',
      statusType: 'running',
      timelineLeft: '39%',
      lineHeight: 'h-28',
      attendees: [
        { name: 'Monica Sylas', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80' },
        { name: 'Lokesh Ankam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' }
      ],
      description: 'Reviewing modern dashboard layouts, interactive responsive cards, and full-width alignment.',
      location: 'San Francisco, CA 6391 Elgin St. Celina, Delaware 10299'
    },
    {
      id: 3,
      title: 'Discussion on Flow',
      time: '4:00 PM',
      duration: 'About 30 Min',
      status: 'Pending',
      statusType: 'pending',
      timelineLeft: '69%',
      lineHeight: 'h-14',
      attendees: [
        { name: 'Chandra Shekar', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
        { name: 'Samuel Felix', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }
      ],
      description: 'Aligning on customer checkout journeys, coin balance calculations, and reward claims.',
      location: 'Conference Room B • Main Campus'
    }
  ];

  return (
    <section className="calendar-meeting-section mt-4 mb-8 font-['Poppins',sans-serif]" aria-label="Calendar Meeting Schedule">
      {/* Toast Feedback */}
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

      {/* ── SECTION HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A5C] tracking-tight">
              Executive Schedule & Meetings
            </h2>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-[#6D28D9] border border-purple-200/60">
              Live Agenda
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-[#6D28D9] shrink-0" />
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
              setIsBookmarked(!isBookmarked);
              showToast(isBookmarked ? 'Removed from bookmarked meetings' : 'Saved meeting to your bookmarks! 🔖');
            }}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm flex items-center justify-center text-slate-500 hover:text-[#6D28D9] hover:border-purple-200 transition-all cursor-pointer"
            aria-label="Bookmark Meeting"
          >
            {isBookmarked ? (
              <BookmarkIcon sx={{ fontSize: 18 }} className="text-[#6D28D9]" />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: 18 }} />
            )}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => showToast('Opening meeting schedule editor...')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm flex items-center justify-center text-slate-500 hover:text-[#6D28D9] hover:border-purple-200 transition-all cursor-pointer"
            aria-label="Edit Meeting"
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => showToast('Meeting removed from schedule.')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
            aria-label="Delete Meeting"
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
              <div className="flex items-center gap-1 cursor-pointer select-none">
                <span className="text-base sm:text-lg font-bold text-[#0A0A5C]">
                  {months[currentMonthIndex]} {currentYear}
                </span>
                <ChevronRightIcon sx={{ fontSize: 18 }} className="text-slate-400 mt-0.5" />
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

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
              {juneDays.map((dayNum, idx) => {
                if (!dayNum) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }
                const isSelected = selectedDay === dayNum;
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      setSelectedDay(dayNum);
                      showToast(`Selected date: ${months[currentMonthIndex]} ${dayNum}, ${currentYear}`);
                    }}
                    className={`h-8 w-8 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white font-bold shadow-md shadow-indigo-500/30 scale-105'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & AM/PM Selector */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#0A0A5C]">
              Time
            </span>

            <div className="flex items-center gap-2">
              {/* Digital Time Display Input */}
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-700 tracking-wider shadow-2xs">
                {timeString}
              </div>

              {/* AM / PM Toggle */}
              <div className="bg-slate-100/90 p-0.5 rounded-xl flex items-center text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
              <h3 className="text-base sm:text-lg font-bold text-[#0A0A5C]">
                Overview
              </h3>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Status Legend */}
                <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                    <span className="text-slate-600">Complete</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] shadow-2xs" />
                    <span className="text-slate-700">Running</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-2xs" />
                    <span className="text-slate-700">Pending</span>
                  </span>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{timeframe}</span>
                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 w-36 animate-fadeIn">
                      {['Today', 'This Week', 'This Month'].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => {
                            setTimeframe(tf);
                            setDropdownOpen(false);
                            showToast(`Filter set to: ${tf}`);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors cursor-pointer ${
                            timeframe === tf
                              ? 'bg-blue-50 text-[#3B82F6] font-bold'
                              : 'text-slate-600 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Canvas Container */}
            <div className="relative h-[290px] w-full overflow-x-auto scrollbar-none pt-2">
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

                {/* ── EVENT 1: Daily Call (Complete - 10:30 AM) ── */}
                {/* Vertical Dashed Line from top down to axis */}
                <div className="absolute left-[78px] top-[74px] bottom-[28px] w-0 border-l border-dashed border-slate-300 z-0" />
                {/* Top Asterisk Marker */}
                <div className="absolute left-[72px] top-[56px] z-10 text-slate-400 font-bold text-sm select-none">
                  ✻
                </div>
                {/* Flag Speech Bubble */}
                <div
                  className="absolute left-[86px] top-[48px] z-20 flex items-center cursor-pointer group hover:scale-105 transition-transform"
                  onClick={() => setSelectedMeeting(meetings[0])}
                >
                  <div className="w-2.5 h-2.5 rotate-45 -mr-1.5 z-10 bg-slate-100 border-l border-b border-slate-300 shadow-2xs" />
                  <div className="bg-slate-100/95 border border-slate-300/80 rounded-2xl px-3.5 py-1.5 flex items-center gap-3.5 shadow-2xs group-hover:shadow-xs transition-shadow">
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">Daily Call</div>
                      <div className="text-[10px] text-slate-400 font-medium">About 30 Min</div>
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                      {meetings[0].attendees.map((att, i) => (
                        <img
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                          src={att.avatar}
                          alt={att.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── EVENT 2: Discussion on Websites (Running - 1:00 PM) ── */}
                {/* Vertical Solid Blue Line from top down to axis */}
                <div className="absolute left-[288px] top-[126px] bottom-[28px] w-0.5 bg-[#3B82F6] z-0" />
                {/* Blue Dot Marker */}
                <div className="absolute left-[284px] top-[120px] z-10 w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-4 ring-blue-100 shadow-xs" />
                {/* Flag Speech Bubble */}
                <div
                  className="absolute left-[294px] top-[106px] z-20 flex items-center cursor-pointer group hover:scale-105 transition-transform"
                  onClick={() => setSelectedMeeting(meetings[1])}
                >
                  <div className="w-2.5 h-2.5 rotate-45 -mr-1.5 z-10 bg-[#E0E7FF] border-l border-b border-[#A5B4FC] shadow-2xs" />
                  <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl px-3.5 py-1.5 flex items-center gap-3.5 shadow-2xs group-hover:shadow-xs transition-shadow">
                    <div>
                      <div className="text-xs font-bold text-[#1E1B4B] leading-tight">Discussion on Websites</div>
                      <div className="text-[10px] text-[#6366F1] font-semibold">About 30 Min</div>
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                      {meetings[1].attendees.map((att, i) => (
                        <img
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                          src={att.avatar}
                          alt={att.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── EVENT 3: Discussion on Flow (Pending - 4:00 PM) ── */}
                {/* Vertical Solid Amber Line from top down to axis */}
                <div className="absolute left-[508px] top-[182px] bottom-[28px] w-0.5 bg-[#F59E0B] z-0" />
                {/* Yellow Dot Marker */}
                <div className="absolute left-[504px] top-[176px] z-10 w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-4 ring-amber-100 shadow-xs" />
                {/* Flag Speech Bubble */}
                <div
                  className="absolute left-[514px] top-[162px] z-20 flex items-center cursor-pointer group hover:scale-105 transition-transform"
                  onClick={() => setSelectedMeeting(meetings[2])}
                >
                  <div className="w-2.5 h-2.5 rotate-45 -mr-1.5 z-10 bg-[#FEF3C7] border-l border-b border-[#FCD34D] shadow-2xs" />
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-3.5 py-1.5 flex items-center gap-3.5 shadow-2xs group-hover:shadow-xs transition-shadow">
                    <div>
                      <div className="text-xs font-bold text-[#78350F] leading-tight">Discussion on Flow</div>
                      <div className="text-[10px] text-[#D97706] font-semibold">About 30 Min</div>
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                      {meetings[2].attendees.map((att, i) => (
                        <img
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                          src={att.avatar}
                          alt={att.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── MEETING DETAILS MODAL ── */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setSelectedMeeting(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                selectedMeeting.statusType === 'complete'
                  ? 'bg-slate-100 text-slate-600'
                  : selectedMeeting.statusType === 'running'
                  ? 'bg-blue-50 text-[#3B82F6]'
                  : 'bg-amber-50 text-[#D97706]'
              }`}>
                {selectedMeeting.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedMeeting.duration}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0A0A5C] mb-1">
              {selectedMeeting.title}
            </h3>

            <div className="space-y-2 my-4 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-700">
                <AccessTimeIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                <span>{selectedMeeting.time} • Today</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                <span>{selectedMeeting.location}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              {selectedMeeting.description}
            </p>

            <div className="mb-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Participants ({selectedMeeting.attendees.length})
              </span>
              <div className="flex items-center gap-3">
                {selectedMeeting.attendees.map((att, i) => (
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  showToast('Connecting to meeting video room...');
                  setSelectedMeeting(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <VideocamOutlinedIcon sx={{ fontSize: 18 }} />
                <span>Join Meeting</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMeeting(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
