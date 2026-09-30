// src/modules/home/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EmployeeSidebar from './components/EmployeeSidebar';
import {
  Star,
  TrendingUp,
  Gift,
  Clock,
  Calendar,
  Zap,
  Headphones,
  FileText,
  ChevronRight,
  ArrowRight,
  User,
  Copy,
  Check,
} from 'lucide-react';
import dashboardBanner from '../../assets/dashboard_banner.png';
import pageBgAurora from '../../assets/page_bg_aurora.png';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const points = user?.wallet_points || user?.points || 1000;
  const employerId = user?.employer_id || 'RP001234';
  const rawName = user?.name || user?.first_name;
  const isPhoneOrEmpty = !rawName || /^\d+$/.test(String(rawName).trim());
  const displayName = !isPhoneOrEmpty ? rawName : 'Shrinivas Karur';

  const handleCopyId = () => {
    navigator.clipboard.writeText(employerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="h-full w-full bg-[#F8FAFD] flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left Sidebar (Corporate Employee Navigation) */}
        <EmployeeSidebar />

        {/* Main Content Area with User Uploaded Aurora Background */}
        <main
          className="relative flex-1 min-w-0 h-full flex flex-col justify-between pt-1.5 sm:pt-2 pb-4 sm:pb-5 px-4 sm:px-6 lg:px-7 overflow-y-auto overflow-x-hidden gap-2 sm:gap-2.5 bg-no-repeat bg-cover bg-right-top"
          style={{
            backgroundImage: `url(${pageBgAurora})`,
          }}
        >
          {/* Top Block: Welcome Header in ONE Row + Employer ID */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 pt-0.5">

            {/* Left: Greeting in ONE row */}
            <div className="relative z-10 flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base lg:text-[17px] font-semibold text-[#0A0A5C] tracking-tight">
                Good to see you,
              </span>
              <h1 className="text-base sm:text-lg lg:text-[20px] font-black tracking-tight leading-tight flex items-center">
                <span className="bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#0A0A5C] bg-clip-text text-transparent">
                  {displayName}
                </span>
              </h1>
            </div>

            {/* Right: Employer ID Card */}
            <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-2xl py-1.5 sm:py-2 px-3.5 sm:px-4 shadow-xs border border-slate-100/90 flex items-center gap-3 shrink-0 hover:shadow-sm transition-all">
              <div className="w-8.5 h-8.5 rounded-full bg-[#E0E7FF] flex items-center justify-center shrink-0">
                <User size={18} className="text-[#4338CA] fill-[#4338CA]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight">Employer ID</p>
                <p className="text-sm sm:text-base font-black text-[#0A0A5C] tracking-wide leading-tight">
                  {employerId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer ml-1"
                title={copied ? 'Copied!' : 'Copy Employer ID'}
                aria-label="Copy Employer ID"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-600 stroke-[2.5]" />
                ) : (
                  <Copy size={16} className="stroke-[2.2]" />
                )}
              </button>
            </div>
          </div>

          {/* Promotional Dashboard Banner (Direct uncropped banner, no bg card, full width with compact height) */}
          <div className="w-full shrink-0 flex justify-center py-0.5">
            <img
              src={dashboardBanner}
              alt="A more rewarding because you matter"
              className="w-full h-[110px] sm:h-[135px] lg:h-[224px] block select-none"
            />
          </div>

          {/* ========================================================================= */}
          {/* 2. ENCLOSED HIGHLIGHTS CARD WITH 4 STAT PILLS                             */}
          {/* ========================================================================= */}
          <section
            className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs space-y-2 shrink-0"
            aria-label="Highlights"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 3 rounded vertical bars icon matching mockup */}
                <div className="flex items-end gap-1 h-5 text-[#6D28D9]">
                  <span className="w-1.5 h-3 bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] rounded-full" />
                  <span className="w-1.5 h-4.5 bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] rounded-full" />
                  <span className="w-1.5 h-3.5 bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] rounded-full" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Your Highlights</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/profile?tab=rewards')}
                className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
            </div>

            {/* 4 Highlights Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Card 1: Available Points */}
              <div className="bg-[#F4F2FF] rounded-xl p-2.5 sm:p-3 flex items-center gap-3 border border-purple-100/40 hover:shadow-2xs transition-shadow">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs text-white">
                  <Star size={22} className="stroke-[2.2] text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-[#0A0A5C] leading-tight">
                    {Number(points).toLocaleString()}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500">Available Points</p>
                </div>
              </div>

              {/* Card 2: This Month */}
              <div className="bg-[#EEFBF4] rounded-xl p-2.5 sm:p-3 flex items-center gap-3 border border-emerald-100/40 hover:shadow-2xs transition-shadow">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#059669] flex items-center justify-center shrink-0 shadow-xs text-white">
                  <TrendingUp size={22} className="stroke-[2.5] text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-[#047857] leading-tight">
                    +12%
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500">This Month</p>
                </div>
              </div>

              {/* Card 3: Redeemed Points */}
              <div className="bg-[#FDF2F7] rounded-xl p-2.5 sm:p-3 flex items-center gap-3 border border-pink-100/40 hover:shadow-2xs transition-shadow">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EC4899] flex items-center justify-center shrink-0 shadow-xs text-white">
                  <Gift size={22} className="stroke-[2.2] text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-[#0A0A5C] leading-tight">
                    500
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500">Redeemed Points</p>
                </div>
              </div>

              {/* Card 4: Upcoming Rewards */}
              <div className="bg-[#EEF7FF] rounded-xl p-2.5 sm:p-3 flex items-center gap-3 border border-sky-100/40 hover:shadow-2xs transition-shadow">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0284C7] flex items-center justify-center shrink-0 shadow-xs text-white">
                  <Clock size={22} className="stroke-[2.2] text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-[#0A0A5C] leading-tight">
                    5
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500">Upcoming Rewards</p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. BOTTOM ROW: 3 EQUAL-WIDTH PANELS                                      */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {/* CARD A: Engagement Score */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs space-y-2 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1 h-5 text-[#6D28D9]">
                  <span className="w-1.5 h-3 bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] rounded-full" />
                  <span className="w-1.5 h-4.5 bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] rounded-full" />
                  <span className="w-1.5 h-3.5 bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6] rounded-full" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Engagement Score</h3>
              </div>

              {/* Donut Gauge + Status Row */}
              <div className="flex items-center justify-around gap-2 py-0.5">
                {/* Donut SVG Ring */}
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="30%" stopColor="#3B82F6" />
                        <stop offset="70%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                    {/* Background Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#E0F2FE"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Progress Arc: 87% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="url(#scoreGaugeGrad)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - 0.87)}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl sm:text-2xl font-black text-[#0A0A5C] leading-none">
                      87
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 leading-none mt-0.5">
                      /100
                    </span>
                  </div>
                </div>

                {/* Score Status */}
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-black text-[#059669] leading-tight">
                    Excellent!
                  </p>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#059669]">
                    <span className="text-sm">▲</span>
                    <span>12%</span>
                    <span className="font-normal text-slate-400 text-xs">vs. last month</span>
                  </div>
                </div>
              </div>

              {/* Bottom Trophy Callout */}
              <div className="bg-[#F0F7FF] rounded-xl py-1.5 px-2.5 flex items-center gap-2 border border-blue-50/60">
                <span className="text-base shrink-0 select-none">🏆</span>
                <p className="text-[11px] sm:text-xs font-medium text-slate-600 leading-tight">
                  You're among the most active employees this month!
                </p>
              </div>
            </div>

            {/* CARD B: Upcoming Events */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs space-y-2 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#2563EB] stroke-[2.2]" />
                  <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Upcoming Events</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={13} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Event List */}
              <div className="space-y-1.5">
                {UPCOMING_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate('/events')}
                    className="flex items-center justify-between p-1.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Date Box */}
                      <div className="w-9 h-9 rounded-lg bg-[#FFF5F5] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-[#EF4444] uppercase leading-none">
                          {event.month}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#EF4444] leading-none mt-0.5">
                          {event.day}
                        </span>
                      </div>
                      {/* Event Details */}
                      <div>
                        <p className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] group-hover:text-[#2563EB] transition-colors leading-snug">
                          {event.title}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">{event.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-[#1E3A8A] group-hover:translate-x-0.5 transition-transform shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CARD C: Quick Actions */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs space-y-2 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-[#F59E0B] fill-[#F59E0B]" />
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Quick Actions</h3>
              </div>

              {/* 2x2 Grid of Actions */}
              <div className="grid grid-cols-2 gap-2">
                {/* Action 1: Redeem Rewards */}
                <button
                  type="button"
                  onClick={() => navigate('/store')}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#F0F7FF] hover:bg-[#E0EFFF] border border-blue-100/30 flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <Gift size={22} className="text-[#EC4899] stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#1E3A8A]">Redeem Rewards</span>
                </button>

                {/* Action 2: Upcoming Events */}
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#F0F7FF] hover:bg-[#E0EFFF] border border-blue-100/30 flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <Calendar size={22} className="text-[#2563EB] stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#1E3A8A]">Upcoming Events</span>
                </button>

                {/* Action 3: Get Support */}
                <button
                  type="button"
                  onClick={() => navigate('/customer-support')}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#F0F7FF] hover:bg-[#E0EFFF] border border-blue-100/30 flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <Headphones size={22} className="text-[#7C3AED] stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#1E3A8A]">Get Support</span>
                </button>

                {/* Action 4: View Benefits */}
                <button
                  type="button"
                  onClick={() => navigate('/benefits')}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#F0F7FF] hover:bg-[#E0EFFF] border border-blue-100/30 flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-2xs"
                >
                  <FileText size={22} className="text-[#2563EB] stroke-[2.2]" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#1E3A8A]">View Benefits</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
