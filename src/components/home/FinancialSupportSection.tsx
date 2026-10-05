// src/components/home/FinancialSupportSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const FINANCIAL_SERVICES = [
  {
    id: 'claims',
    title: 'Claim Assistance',
    badge: 'Zero Hassle',
    desc: 'Insurance claim support, document guidance, real-time claim tracking, renewal reminders, and dedicated policy advocates.',
    actionLabel: 'Get Claim Help',
    route: '/services/category/2',
    icon: HealthAndSafetyOutlinedIcon,
    accentBg: 'from-emerald-500/15 to-teal-500/10 text-emerald-600',
    borderColor: 'border-emerald-200/80',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    id: 'planning',
    title: 'Professional Financial Planning',
    badge: 'Certified Experts',
    desc: 'Smart financial roadmaps for personal savings, family protection, high-yield investments, and long-term milestone goals.',
    actionLabel: 'Schedule Advisory',
    route: '/services/mutual-funds',
    icon: AccountBalanceOutlinedIcon,
    accentBg: 'from-purple-500/15 to-indigo-500/10 text-[#8b3ab5]',
    borderColor: 'border-purple-200/80',
    buttonColor: 'bg-[#8b3ab5] hover:bg-[#7a329f] text-white',
  },
  {
    id: 'portfolio',
    title: 'Free Portfolio Analysis',
    badge: '100% Free',
    desc: 'Deep investment health check, insurance gap analysis, asset allocation suggestions, and personalized recommendations.',
    actionLabel: 'Analyze Portfolio',
    route: '/services/mutual-funds',
    icon: AssessmentOutlinedIcon,
    accentBg: 'from-purple-500/15 to-pink-500/10 text-[#8b3ab5]',
    borderColor: 'border-purple-200/80',
    buttonColor: 'bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white hover:opacity-95',
  },
];

export const FinancialSupportSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/20 rounded-3xl border border-indigo-100 p-5 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-100/80 pb-4">
        <div className="space-y-1 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-[11px] font-black uppercase tracking-wider text-indigo-800">
            Advisory & Protection
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Financial Support Beyond Rewards
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            Support employees with insurance claims, policy guidance, investment reviews, and long-term financial wellness.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/services')}
          className="shrink-0 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-indigo-200 shadow-2xs hover:bg-indigo-50 transition-colors"
        >
          <span>All Advisory Services</span>
          <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
        </button>
      </div>

      {/* 3 Offerings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {FINANCIAL_SERVICES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border ${item.borderColor} bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.accentBg} flex items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    <Icon sx={{ fontSize: 24 }} />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${item.buttonColor}`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FinancialSupportSection;
