// src/modules/events/AllEventsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Search,
  ArrowLeft,
  Check,
  X,
  Tag,
  Filter,
} from 'lucide-react';

import pageBgAurora from '../../assets/page_bg_aurora.png';
import featuredWellness from '../../assets/sidebarpagesimages/events page wellness image.png';
import featuredFestive from '../../assets/sidebarpagesimages/events page festive celebration.png';
import featuredLeadership from '../../assets/sidebarpagesimages/events page leadership celebration.png';

export const AllEventsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState({
    1: false, // Wellness Workshop
    2: false, // Festive Celebration
    3: true,  // Leadership Meetup (Already RSVP'd)
    4: false, // Financial Awareness Session
    5: false, // Team Building Bootcamp
    6: false, // AI & Tech Innovations Talk
    7: false, // Diversity & Inclusion Talk
    8: false, // Diwali Celebration
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

  const ALL_EVENTS = [
    {
      id: 1,
      title: 'Wellness Workshop',
      category: 'Health & Wellness',
      image: featuredWellness,
      date: '25 Sep 2026',
      time: '10:00 AM - 12:00 PM',
      location: 'Microsoft Teams • Online',
      mode: 'Virtual',
      description: 'Guided mindfulness, desk yoga, mental fitness, and workplace stress reduction techniques.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      id: 2,
      title: 'Festive Celebration',
      category: 'Social & Cultural',
      image: featuredFestive,
      date: '02 Oct 2026',
      time: '06:00 PM - 09:00 PM',
      location: 'Main Auditorium & Cafeteria',
      mode: 'On-site',
      description: 'Company-wide cultural night with live musical performances, catered dinner, and festivities.',
      badgeColor: 'bg-pink-50 text-pink-700 border border-pink-200',
    },
    {
      id: 3,
      title: 'Leadership Meetup',
      category: 'Career & Growth',
      image: featuredLeadership,
      date: '15 Oct 2026',
      time: '11:00 AM - 01:00 PM',
      location: 'Briefing Center • 4th Floor',
      mode: 'Hybrid',
      description: 'Interactive leadership keynote, organizational strategy roadmap, and open executive Q&A.',
      badgeColor: 'bg-purple-50 text-[#6D28D9] border border-purple-200',
    },
    {
      id: 4,
      title: 'Financial Awareness Session',
      category: 'Finance & Tax',
      image: featuredWellness,
      date: '28 Sep 2026',
      time: '04:00 PM - 05:30 PM',
      location: 'Zoom Webinar • Online',
      mode: 'Virtual',
      description: 'Personal tax savings strategies, retirement planning, mutual funds, and employee benefits.',
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    {
      id: 5,
      title: 'Team Building Bootcamp',
      category: 'Social & Cultural',
      image: featuredFestive,
      date: '08 Oct 2026',
      time: '02:00 PM - 05:00 PM',
      location: 'Office Courtyard & Lawn',
      mode: 'On-site',
      description: 'Collaborative team-building games, problem solving challenges, and inter-department fun.',
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    {
      id: 6,
      title: 'Tech & AI Innovation Forum',
      category: 'Tech & Skills',
      image: featuredLeadership,
      date: '18 Oct 2026',
      time: '10:30 AM - 12:30 PM',
      location: 'Tech Hub • Room 502',
      mode: 'Hybrid',
      description: 'Showcase of emerging AI tools, engineering workflows, and automation insights for teams.',
      badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    },
    {
      id: 7,
      title: 'Diversity & Inclusion Talk',
      category: 'Career & Growth',
      image: featuredWellness,
      date: '22 Oct 2026',
      time: '03:00 PM - 04:30 PM',
      location: 'Virtual Broadcast • Online',
      mode: 'Virtual',
      description: 'Promoting inclusive culture, neurodiversity awareness, and equal opportunities in the workplace.',
      badgeColor: 'bg-teal-50 text-teal-700 border border-teal-200',
    },
    {
      id: 8,
      title: 'Diwali Celebration & Gala',
      category: 'Social & Cultural',
      image: featuredFestive,
      date: '29 Oct 2026',
      time: '05:30 PM - 08:30 PM',
      location: 'Campus Lawn & Cafeteria',
      mode: 'On-site',
      description: 'Grand Diwali party with traditional attires, festive lights, sweet distributions, and rewards.',
      badgeColor: 'bg-orange-50 text-orange-700 border border-orange-200',
    },
  ];

  const CATEGORIES = [
    'All',
    'Health & Wellness',
    'Social & Cultural',
    'Career & Growth',
    'Finance & Tax',
    'Tech & Skills',
  ];

  const filteredEvents = ALL_EVENTS.filter((evt) => {
    const matchesCategory =
      selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full w-full bg-[#F8FAFD] flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">

        {/* Main Content Area */}
        <main
          className="relative flex-1 min-w-0 h-full flex flex-col justify-start pt-2 pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto overflow-x-hidden gap-4 bg-no-repeat bg-cover bg-right-top"
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
          {/* 1. TOP HEADER & BREADCRUMBS                                               */}
          {/* ========================================================================= */}
          <section className="space-y-3 shrink-0">
            {/* Breadcrumbs + Back Button */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500" aria-label="Breadcrumb">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight size={14} className="text-slate-400" />
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  My Events
                </button>
                <ChevronRight size={14} className="text-slate-400" />
                <span className="text-black font-semibold">All Events</span>
              </nav>

              <button
                type="button"
                onClick={() => navigate('/events')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] bg-purple-50 hover:bg-purple-100/70 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={15} />
                <span>Back to Overview</span>
              </button>
            </div>

            {/* Title & Subtitle + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-tight">
                  All Company <span className="text-[#6D28D9]">Events</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
                  Browse, search, and register for all upcoming company activities, sessions, and celebrations.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? ALL_EVENTS.length
                    : ALL_EVENTS.filter((e) => e.category === cat).length;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-[#6D28D9] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-[#0A0A5C] border border-slate-200/70 hover:bg-slate-50'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. SMALL CARDS EVENT GRID                                                 */}
          {/* ========================================================================= */}
          <div className="flex-1">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs max-w-md mx-auto my-6 space-y-3">
                <Calendar size={36} className="text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-[#0A0A5C]">No events found</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your search query or switching to a different category filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-1.5 bg-[#6D28D9] text-white text-xs font-bold rounded-xl hover:bg-[#5B21B6] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 pb-6">
                {filteredEvents.map((event) => {
                  const isRegistered = registeredEvents[event.id];

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-purple-200"
                    >
                      <div>
                        {/* Event Thumbnail with Category & Mode Pills */}
                        <div className="w-full h-28 sm:h-30 rounded-xl overflow-hidden relative shadow-2xs border border-slate-100">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                          />
                          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[#6D28D9] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
                            {event.category}
                          </span>
                          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                            {event.mode}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className="font-bold text-[#0A0A5C] text-sm sm:text-[14.5px] group-hover:text-[#6D28D9] transition-colors leading-snug line-clamp-1 mt-2.5"
                          title={event.title}
                        >
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Metadata: Date, Time, Location */}
                        <div className="space-y-1 mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5 truncate">
                            <Calendar size={13} className="text-[#6D28D9] shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock size={13} className="text-[#6D28D9] shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-400">
                            <MapPin size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleRegister(event.id, event.title)}
                          className={`w-full py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs ${
                            isRegistered
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white'
                          }`}
                        >
                          {isRegistered ? 'Registered ✓' : 'Register Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllEventsPage;
