// src/components/home/PlatformCapabilitiesSection.jsx
import React from 'react';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

const CAPABILITIES = [
  {
    id: 'rewards',
    title: 'Employee Rewards',
    badge: 'Marketplace',
    desc: 'Flexible reward marketplace with gift cards, electronics, premium brand rewards, and 1-click redemption.',
    icon: CardGiftcardOutlinedIcon,
    accent: 'bg-violet-100 text-[#7C3AED]',
    border: 'border-violet-100',
  },
  {
    id: 'incentives',
    title: 'Incentive Compensation',
    badge: 'Automation',
    desc: 'Automated incentive calculations, sales contests, real-time leaderboards, target progress, and milestone payout management.',
    icon: LeaderboardOutlinedIcon,
    accent: 'bg-pink-100 text-pink-600',
    border: 'border-pink-100',
  },
  {
    id: 'loyalty',
    title: 'Channel & Partner Loyalty',
    badge: 'Growth',
    desc: 'Enterprise loyalty programs for employees, dealers, and channel partners with campaign tracking and automated disbursement.',
    icon: LoyaltyOutlinedIcon,
    accent: 'bg-amber-100 text-amber-600',
    border: 'border-amber-100',
  },
  {
    id: 'pulse',
    title: 'Pulse & Sentiment Analytics',
    badge: 'Insights',
    desc: 'Anonymous surveys, pulse polls, mood meters, quizzes, and real-time sentiment analytics to gauge workplace satisfaction.',
    icon: PollOutlinedIcon,
    accent: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
  },
];

export const PlatformCapabilitiesSection = () => {
  return (
    <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-pink-50 border border-pink-200/70 text-xs font-bold uppercase tracking-wider text-[#A654CD]">
            Enterprise Solutions
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Transform Employee Recognition & Rewards
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
            Reward Planner combines recognition, benefits, wallet, wellbeing and financial services into one unified experience.
          </p>
        </div>

        {/* 3 Quick Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700">
            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} className="text-[#7C3AED]" />
            <span>Reward Wallet</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700">
            <ShieldOutlinedIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
            <span>Verified Benefits</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700">
            <DashboardOutlinedIcon sx={{ fontSize: 16 }} className="text-blue-600" />
            <span>Admin Control</span>
          </span>
        </div>
      </div>

      {/* 4 Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.id}
              className={`p-5 rounded-2xl border ${cap.border} bg-gradient-to-b from-white to-gray-50/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl ${cap.accent} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {cap.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  {cap.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PlatformCapabilitiesSection;
