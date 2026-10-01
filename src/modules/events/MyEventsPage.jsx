// src/modules/events/MyEventsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeSidebar from '../home/components/EmployeeSidebar';
import {
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Headphones,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

import pageBgAurora from '../../assets/page_bg_aurora.png';
import eventHeroCalendar from '../../assets/events/event_hero_calendar.png';
import eventBannerStage from '../../assets/sidebarpagesimages/my events posterrr 1.png';
import featuredWellness from '../../assets/sidebarpagesimages/events page wellness image.png';
import featuredFestive from '../../assets/sidebarpagesimages/events page festive celebration.png';
import featuredLeadership from '../../assets/sidebarpagesimages/events page leadership celebration.png';
import eventTicketsPromo from '../../assets/events/event_tickets_promo.png';

export const MyEventsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState({
    1: false, // Wellness Workshop
    2: false, // Festive Celebration
    3: true,  // Leadership Meetup (Already RSVP'd)
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRegister = (id, title) => {
    setRegisteredEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (!registeredEvents[id]) {
      showToast(`Successfully registered for ${title}!`);
    } else {
      showToast(`Registration cancelled for ${title}.`);
    }
  };

  // Recent Activity Items matching the mockup exactly
  const RECENT_ACTIVITIES = [
    {
      id: 1,
      type: 'registered',
      action: 'Registered',
      event: 'Wellness Workshop',
      datetime: '25 Sep 2026 • 10:15 AM',
      badge: 'Registered',
      badgeColor: 'bg-[#E8F8F0] text-[#10B981]',
      iconType: 'calendar',
    },
    {
      id: 2,
      type: 'attended',
      action: 'Attended',
      event: 'Team Building Bootcamp',
      datetime: '12 Sep 2026 • 03:00 PM',
      badge: 'Attended',
      badgeColor: 'bg-[#E8F8F0] text-[#10B981]',
      iconType: 'check',
    },
    {
      id: 3,
      type: 'confirmed',
      action: 'RSVP Confirmed',
      event: 'Leadership Meetup',
      datetime: '10 Sep 2026 • 11:20 AM',
      badge: 'Confirmed',
      badgeColor: 'bg-[#E8F8F0] text-[#10B981]',
      iconType: 'doc',
    },
    {
      id: 4,
      type: 'registered',
      action: 'Registered',
      event: 'Festive Celebration',
      datetime: '02 Oct 2026 • 06:05 PM',
      badge: 'Registered',
      badgeColor: 'bg-[#E8F8F0] text-[#10B981]',
      iconType: 'calendar',
    },
    {
      id: 5,
      type: 'attended',
      action: 'Attended',
      event: 'Diversity & Inclusion Talk',
      datetime: '28 Aug 2026 • 02:00 PM',
      badge: 'Attended',
      badgeColor: 'bg-[#E8F8F0] text-[#10B981]',
      iconType: 'check',
    },
  ];

  // Featured Events matching the mockup exactly
  const FEATURED_EVENTS = [
    {
      id: 1,
      title: 'Wellness Workshop',
      image: featuredWellness,
      date: '25 Sep 2026',
      time: '10:00 AM - 12:00 PM',
      actionType: 'register',
    },
    {
      id: 2,
      title: 'Festive Celebration',
      image: featuredFestive,
      date: '02 Oct 2026',
      time: '06:00 PM - 09:00 PM',
      actionType: 'register',
    },
    {
      id: 3,
      title: 'Leadership Meetup',
      image: featuredLeadership,
      date: '15 Oct 2026',
      time: '11:00 AM - 01:00 PM',
      actionType: 'view',
    },
  ];

  const TABS = ['Overview', 'Upcoming Events', 'Registered', 'Past Events'];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'Upcoming Events') {
      navigate('/events/all');
    }
  };

  return (
    <div className="h-full w-full bg-[#F8FAFD] flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left Sidebar (Corporate Employee Navigation with 'My Events' highlighted) */}
        <EmployeeSidebar activeItem="My Events" />

        {/* Main Content Area with User Aurora Background */}
        <main
          className="relative flex-1 min-w-0 h-full flex flex-col justify-start pt-1.5 sm:pt-2 pb-4 sm:pb-5 px-4 sm:px-6 lg:px-7 overflow-y-auto overflow-x-hidden gap-3 bg-no-repeat bg-cover bg-right-top"
          style={{
            backgroundImage: `url(${pageBgAurora})`,
          }}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 bg-[#0A0A5C] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm animate-fadeIn">
              <Check size={16} className="text-emerald-400 stroke-[3]" />
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="ml-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. TOP HERO SECTION: Breadcrumb + Title + Right Hero Artwork              */}
          {/* ========================================================================= */}
          <section className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 pt-0.5">
            {/* Left: Breadcrumbs + Title */}
            <div className="space-y-1 relative z-10">
              <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 mb-0.5" aria-label="Breadcrumb">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="text-[#111827] font-semibold">My Events</span>
              </nav>

              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-tight">
                My <span className="text-[#6D28D9]">Events</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
                Discover, register and attend experiences that keep your workplace engaging.
              </p>
            </div>

            {/* Right: 3D Calendar + Plan Reward Grow Banner Art */}
            <div className="shrink-0 flex items-center justify-end select-none relative">
              <img
                src={eventHeroCalendar}
                alt="Plan Reward Grow - Events"
                className="h-[74px] sm:h-[84px] lg:h-[92px] w-auto object-contain block select-none pointer-events-none drop-shadow-2xs"
              />
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. MAIN TWO-COLUMN CONTENT GRID (Tab bar is inside Left Column)           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start flex-1 min-h-0">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT COLUMN: Tab Navigation + Stage Banner + Recent Activity          */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              
              {/* Tab Navigation Bar (Inside Left Column per mockup) */}
              <div className="bg-white rounded-2xl px-5 sm:px-6 py-2.5 flex items-center gap-6 sm:gap-8 border border-slate-100 shadow-2xs shrink-0 select-none">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleTabClick(tab)}
                      className={`text-xs sm:text-sm font-bold transition-all relative cursor-pointer pb-1 ${
                        isActive
                          ? 'text-[#6D28D9] after:content-[""] after:absolute after:bottom-[-10px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#6D28D9] after:rounded-full'
                          : 'text-slate-700 hover:text-[#0A0A5C]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Banner: Don't miss what's next! */}
              <div
                onClick={() => navigate('/events/all')}
                className="relative rounded-2xl overflow-hidden shadow-xs cursor-pointer group transition-all duration-200 hover:shadow-md border border-purple-900/10 shrink-0 aspect-[2.6/1]"
                title="Don't miss what's next! Explore Events"
              >
                <img
                  src={eventBannerStage}
                  alt="Don't miss what's next! Explore and join exciting company events"
                  className="w-full h-full object-cover object-center block select-none group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>

              {/* Recent Activity Card */}
              <section
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs space-y-2.5 shrink-0"
                aria-label="Recent Activity"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Recent Activity</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/events/all')}
                    className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {/* Rows List */}
                <div className="space-y-1.5 sm:space-y-2">
                  {RECENT_ACTIVITIES.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-50 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Activity Icon */}
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                            activity.iconType === 'calendar'
                              ? 'bg-[#FDF2F7] text-[#EC4899]'
                              : activity.iconType === 'doc'
                              ? 'bg-[#EEF7FF] text-[#2563EB]'
                              : 'bg-[#EEFBF4] text-[#10B981]'
                          }`}
                        >
                          {activity.iconType === 'calendar' ? (
                            <Calendar size={18} className="stroke-[2.2]" />
                          ) : activity.iconType === 'doc' ? (
                            <FileText size={18} className="stroke-[2.2]" />
                          ) : (
                            <CheckCircle2 size={18} className="stroke-[2.5]" />
                          )}
                        </div>

                        {/* Title and Event Subtitle */}
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#0A0A5C] leading-snug">
                            {activity.action}
                          </p>
                          <p className="text-xs sm:text-[13px] font-medium text-slate-500 leading-tight">
                            {activity.event}
                          </p>
                        </div>
                      </div>

                      {/* Right: Date/Time + Status Badge */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <span className="text-xs sm:text-[13px] text-slate-400 font-medium hidden sm:inline">
                          {activity.datetime}
                        </span>
                        <span
                          className={`text-xs sm:text-[13px] font-semibold px-3 py-1 rounded-full ${activity.badgeColor}`}
                        >
                          {activity.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Featured Events + Looking for More? + Need Help?       */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              
              {/* Card 1: Featured Events (Aligned with Tab Bar at Top) */}
              <section
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-xs space-y-2.5 relative"
                aria-label="Featured Events"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Featured Events</h3>
                  <button
                    type="button"
                    onClick={() => navigate('/events/all')}
                    className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {/* 3 Featured Event Cards Grid */}
                <div className="relative">
                  <div className="grid grid-cols-3 gap-2.5">
                    {FEATURED_EVENTS.map((event) => {
                      const isRegistered = registeredEvents[event.id];

                      return (
                        <div
                          key={event.id}
                          className="bg-white rounded-xl flex flex-col justify-between"
                        >
                          {/* Event Thumbnail */}
                          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-2xs">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover select-none"
                            />
                          </div>

                          {/* Event Title */}
                          <p
                            className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] mt-1.5 leading-snug line-clamp-1"
                            title={event.title}
                          >
                            {event.title}
                          </p>

                          {/* Date and Time */}
                          <div className="space-y-0.5 mt-1 text-[11px] sm:text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1 truncate">
                              <Calendar size={11} className="shrink-0 text-slate-400" />
                              <span className="truncate">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate">
                              <Clock size={11} className="shrink-0 text-slate-400" />
                              <span className="truncate">{event.time}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-2">
                            {event.actionType === 'view' ? (
                              <button
                                type="button"
                                onClick={() => navigate('/events/all')}
                                className="w-full py-1.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-[13px] font-bold rounded-xl transition-colors cursor-pointer text-center shadow-2xs"
                              >
                                View
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRegister(event.id, event.title)}
                                className={`w-full py-1.5 text-xs sm:text-[13px] font-bold rounded-xl transition-colors cursor-pointer text-center shadow-2xs ${
                                  isRegistered
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white'
                                }`}
                              >
                                {isRegistered ? 'Registered' : 'Register'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Card 2: Looking for more events? */}
              <section
                className="bg-gradient-to-r from-[#EFF6FF] via-[#F5F3FF] to-[#FAF5FF] rounded-2xl p-3.5 sm:p-4 border border-purple-100/70 shadow-xs flex items-center justify-between gap-3 overflow-hidden select-none"
                aria-label="More Events Banner"
              >
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Looking for more events?</h4>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-snug max-w-[200px] sm:max-w-[240px]">
                    Explore upcoming activities, workshops and celebrations curated for you and your team.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/events/all')}
                    className="mt-2 inline-block px-4 py-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    See All Events
                  </button>
                </div>

                <div className="shrink-0 flex items-center justify-center">
                  <img
                    src={eventTicketsPromo}
                    alt="Event Tickets"
                    className="w-20 sm:w-24 h-auto object-contain pointer-events-none drop-shadow-2xs mix-blend-multiply"
                  />
                </div>
              </section>

              {/* Card 3: Need Help? */}
              <section
                className="bg-[#F6FDF9] rounded-2xl p-3 sm:p-3.5 border border-emerald-100 shadow-xs flex items-center justify-between gap-3 select-none"
                aria-label="Support Section"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-emerald-200 shadow-2xs flex items-center justify-center text-emerald-600 shrink-0">
                    <Headphones size={18} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#0A0A5C]">Need Help?</h5>
                    <p className="text-xs text-slate-500 leading-tight">
                      Have a question about event registrations? Our support team is here to help.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/customer-support')}
                  className="shrink-0 px-3.5 py-1.5 bg-white border border-emerald-500 hover:bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Get Support
                </button>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyEventsPage;
