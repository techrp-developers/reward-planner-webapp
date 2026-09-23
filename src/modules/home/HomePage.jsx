// src/modules/home/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmployeeSidebar from './components/EmployeeSidebar';
import {
  BarChart2,
  TrendingUp,
  Star,
  Gift,
  Clock,
  Calendar,
  ChevronRight,
  Zap,
  Headphones,
  FileText,
  Trophy,
} from 'lucide-react';
import homeBottomBanner from '../../assets/home/home_bottom_banner.png';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const points = user?.wallet_points || user?.points || 1000;

  const UPCOMING_EVENTS = [
    {
      id: 1,
      month: 'SEP',
      day: '24',
      title: 'Wellness Webinar',
      subtitle: 'Online Session',
    },
    {
      id: 2,
      month: 'SEP',
      day: '28',
      title: 'Financial Awareness Session',
      subtitle: 'Virtual Event',
    },
    {
      id: 3,
      month: 'OCT',
      day: '05',
      title: 'Diwali Celebration',
      subtitle: 'Office Premises',
    },
  ];

  return (
    <div className="h-full w-full bg-[#F8FAFC] flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left Sidebar (Corporate Employee Navigation) */}
        <EmployeeSidebar />

        {/* Main Content Area (Single Page Non-Scrolling Viewport) */}
        <main className="flex-1 min-w-0 h-full flex flex-col justify-between p-4 sm:p-5 lg:p-6 overflow-hidden gap-3.5">
          {/* Top Block: Welcome Header + Stat Highlights (with tight spacing) */}
          <div className="space-y-2.5 sm:space-y-3 shrink-0">
            {/* ========================================================================= */}
            {/* 1. WELCOME HEADER + DYNAMIC CALENDAR WIDGET                                */}
            {/* ========================================================================= */}
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {/* Ambient Background Wave Glow */}
              <div className="absolute -top-4 right-16 w-80 h-28 bg-gradient-to-l from-purple-100/60 via-pink-100/40 to-transparent rounded-full blur-2xl pointer-events-none" />

              {/* Left: Greeting in 2 rows as requested */}
              <div className="relative z-10 space-y-0.5">
                <h1 className="text-lg sm:text-xl lg:text-[22px] font-black text-[#2E1065] tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-500 text-sm sm:text-base lg:text-[19px]">Good to see you,</span>
                  <span>Welcome back!</span>
                  <span className="inline-block text-base sm:text-lg lg:text-xl hover:rotate-12 transition-transform duration-200">👋</span>
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                  Let's make today more rewarding.
                </p>
              </div>

              {/* Right: Calendar Widget Card */}
              <div className="bg-white rounded-2xl py-2.5 px-4 shadow-xs border border-slate-100 flex items-center gap-3.5 shrink-0 hover:shadow-sm transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                  <Calendar size={20} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monday</p>
                  <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    22 Sep 2026
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">Have a rewarding day!</p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. 4 STAT HIGHLIGHT CARDS (HEADER REMOVED PER USER REQUEST)                */}
            {/* ========================================================================= */}
            <section className="shrink-0" aria-label="Highlights">
              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Available Points */}
                <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs shadow-purple-500/20">
                    <Star size={18} fill="white" className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      {Number(points).toLocaleString()}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">Available Points</p>
                  </div>
                </div>

                {/* Card 2: This Month */}
                <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/20">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      +12%
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">This Month</p>
                  </div>
                </div>

                {/* Card 3: Redeemed Points */}
                <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EC4899] text-white flex items-center justify-center shrink-0 shadow-xs shadow-pink-500/20">
                    <Gift size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      500
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">Redeemed Points</p>
                  </div>
                </div>

                {/* Card 4: Upcoming Rewards */}
                <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-100 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      5
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">Upcoming Rewards</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* 3. MIDDLE ROW: ENGAGEMENT SCORE + UPCOMING EVENTS + QUICK ACTIONS          */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CARD A: Engagement Score */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-2xs space-y-3.5 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-slate-900">Engagement Score</h3>
              </div>

              {/* Donut Gauge + Status */}
              <div className="flex items-center justify-around gap-3 py-0.5">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="scoreGradientCompact" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="text-slate-100 stroke-current"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="url(#scoreGradientCompact)"
                      strokeWidth="9"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - 0.87)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-900 leading-none">87</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">/100</span>
                  </div>
                </div>

                {/* Score Status */}
                <div className="space-y-0.5">
                  <p className="text-base font-black text-[#10B981] leading-tight">Excellent!</p>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#10B981]">
                    <span>↑ 12%</span>
                    <span className="font-normal text-slate-400">vs. last month</span>
                  </div>
                </div>
              </div>

              {/* Bottom Callout */}
              <div className="bg-amber-50/90 border border-amber-100/90 rounded-xl py-2 px-2.5 flex items-center gap-2">
                <Trophy size={16} className="text-amber-500 shrink-0" />
                <p className="text-[11px] font-semibold text-amber-900 leading-tight">
                  You're among the most active employees this month!
                </p>
              </div>
            </div>

            {/* CARD B: Upcoming Events */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-2xs space-y-2.5 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar size={18} className="text-[#7C3AED]" />
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Events</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=events')}
                  className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {/* Event List */}
              <div className="space-y-1.5">
                {UPCOMING_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate('/profile?tab=events')}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Date Box */}
                      <div className="w-9 h-10 rounded-xl bg-rose-50 border border-rose-100/80 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase leading-none">
                          {event.month}
                        </span>
                        <span className="text-sm font-black text-rose-600 leading-none mt-0.5">
                          {event.day}
                        </span>
                      </div>
                      {/* Event Details */}
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-snug">
                          {event.title}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {event.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* CARD C: Quick Actions */}
            <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-2xs space-y-2.5 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-1.5">
                <Zap size={18} className="text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              </div>

              {/* 2x2 Grid of Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Action 1: Redeem Rewards */}
                <button
                  type="button"
                  onClick={() => navigate('/store')}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-100/80 hover:border-purple-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <Gift size={20} className="text-pink-500" />
                  <span className="text-[11px] font-bold text-slate-800">Redeem Rewards</span>
                </button>

                {/* Action 2: Upcoming Events */}
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=events')}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-100/80 hover:border-blue-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <Calendar size={20} className="text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-800">Upcoming Events</span>
                </button>

                {/* Action 3: Get Support */}
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=support')}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-100/80 hover:border-purple-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <Headphones size={20} className="text-purple-600" />
                  <span className="text-[11px] font-bold text-slate-800">Get Support</span>
                </button>

                {/* Action 4: View Benefits */}
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=benefits')}
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-sky-50/60 border border-slate-100/80 hover:border-sky-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <FileText size={20} className="text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-800">View Benefits</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. BOTTOM PROMOTIONAL BANNER: 'A more rewarding because you matter'        */}
          {/* ========================================================================= */}
          <div
            onClick={() => navigate('/store')}
            className="relative w-full rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer border border-pink-100/80 shrink-0"
            title="A more rewarding because you matter. Plan Reward Grow"
          >
            <img
              src={homeBottomBanner}
              alt="A more rewarding because you matter. Rewards. Wellness. Everyday Convenience. All in one place. Plan Reward Grow"
              className="w-full max-h-[90px] xl:max-h-[105px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
