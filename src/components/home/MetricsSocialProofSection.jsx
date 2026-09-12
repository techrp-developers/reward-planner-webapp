// src/components/home/MetricsSocialProofSection.jsx
import React from 'react';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

const METRICS = [
  {
    id: 'employees',
    value: '10K+',
    label: 'Employees Engaged',
    desc: 'Active corporate members earning rewards daily',
    icon: PeopleAltOutlinedIcon,
    accent: 'from-violet-500/15 to-indigo-500/10 text-[#7C3AED]',
    border: 'border-violet-200/80',
  },
  {
    id: 'rewards',
    value: '500+',
    label: 'Rewards Redeemed',
    desc: 'Instant vouchers, merchandise & perks claimed',
    icon: CardGiftcardOutlinedIcon,
    accent: 'from-pink-500/15 to-rose-500/10 text-pink-600',
    border: 'border-pink-200/80',
  },
  {
    id: 'growth',
    value: '95%',
    label: 'Participation Growth',
    desc: 'Measurable rise in peer appreciation & engagement',
    icon: TrendingUpOutlinedIcon,
    accent: 'from-emerald-500/15 to-teal-500/10 text-emerald-600',
    border: 'border-emerald-200/80',
  },
  {
    id: 'access',
    value: '24/7',
    label: 'Benefit Access',
    desc: 'Round-the-clock claim guidance & portal support',
    icon: SupportAgentOutlinedIcon,
    accent: 'from-amber-500/15 to-orange-500/10 text-amber-600',
    border: 'border-amber-200/80',
  },
];

export const MetricsSocialProofSection = () => {
  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden">
      {/* Subtle background ambient sheen */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-br from-violet-100/40 via-pink-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-50 border border-violet-200/70 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
            Proven Corporate Impact
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Rewards That Drive Real Engagement
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal max-w-2xl mx-auto leading-relaxed">
            Build a culture where achievements are noticed, points are useful, and every employee gets access to meaningful benefits.
          </p>
        </div>

        {/* 4 Metric Cards (2x2 on mobile/tablet, 4x1 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pt-1">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className={`p-3.5 sm:p-5 rounded-2xl border ${metric.border} bg-gradient-to-b from-white to-gray-50/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
              >
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${metric.accent} flex items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Verified
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {metric.value}
                  </h3>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 mt-1">
                    {metric.label}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-normal mt-0.5 leading-relaxed line-clamp-2">
                    {metric.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MetricsSocialProofSection;
