// src/components/home/HowItWorksSection.jsx
import React from 'react';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const STEPS = [
  {
    step: '01',
    title: 'Set Goals',
    desc: 'Define custom KPIs like performance, attendance, or sales milestones tailored to your business needs.',
    tag: 'Configuration',
    icon: FlagOutlinedIcon,
    accent: 'from-violet-500 to-indigo-600',
    lightBg: 'bg-violet-50',
    borderColor: 'border-violet-100',
    textColor: 'text-violet-700',
  },
  {
    step: '02',
    title: 'Distribute Points',
    desc: 'Automatically reward employees based on achieved criteria. Points credit instantly with zero manual overhead.',
    tag: 'Automation',
    icon: AutoAwesomeOutlinedIcon,
    accent: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50',
    borderColor: 'border-pink-100',
    textColor: 'text-pink-700',
  },
  {
    step: '03',
    title: 'Redeem Benefits',
    desc: 'Employees unlock curated brand merchandise, insurance savings, utility bill payments, and financial advice.',
    tag: 'Fulfillment',
    icon: RedeemOutlinedIcon,
    accent: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    textColor: 'text-emerald-700',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Background Accent Sheen */}
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-violet-100/40 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-1.5">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-[11px] font-black uppercase tracking-wider text-[#4F46E5]">
          How It Works
        </span>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
          Simple. Powerful. Impactful.
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Three easy steps to transform your workplace culture into a measurable, rewarding experience.
        </p>
      </div>

      {/* 3 Step Cards with connecting arrows on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`relative p-5 rounded-2xl border ${item.borderColor} bg-gradient-to-b from-white to-gray-50/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                {/* Header row: Step badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-gray-900 text-white tracking-wider">
                    STEP {item.step}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
                  >
                    <Icon sx={{ fontSize: 24 }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.lightBg} ${item.textColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Footer step indicator */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
                <span>Phase {item.step} of 03</span>
                {index < STEPS.length - 1 ? (
                  <span className="hidden md:flex items-center gap-1 text-[#4F46E5] font-bold">
                    Next <ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold">✓ Goal Realized</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorksSection;
