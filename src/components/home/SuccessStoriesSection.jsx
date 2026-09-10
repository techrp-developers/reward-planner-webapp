// src/components/home/SuccessStoriesSection.jsx
import React, { useState } from 'react';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "Reward Planner has completely transformed how we engage with our employees. The rewards system is simple, effective, and genuinely appreciated by our team. We've seen higher participation and better employee satisfaction within months.",
    name: 'Anjali M',
    role: 'Business Analyst',
    company: 'Enterprise Tech Partner',
    rating: 5,
    avatarBg: 'from-violet-500 to-indigo-600',
  },
  {
    id: 2,
    quote:
      'The seamless combination of instant RP points, BBPS utility payments, and discounted health insurance has made RewardPlanners our employees’ favorite daily workplace perk. Redemption is instantaneous.',
    name: 'Vikram S',
    role: 'Head of People & Culture',
    company: 'Fintech Solutions Ltd',
    rating: 5,
    avatarBg: 'from-pink-500 to-rose-600',
  },
  {
    id: 3,
    quote:
      'Our team loved the birthday celebrations and instant voucher marketplace. The financial planning advisory and insurance claim assistance added genuine value for our staff beyond standard gift cards.',
    name: 'Sneha R',
    role: 'Senior Operations Lead',
    company: 'Global Retail Services',
    rating: 5,
    avatarBg: 'from-emerald-500 to-teal-600',
  },
];

export const SuccessStoriesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-7 shadow-xs space-y-6 relative overflow-hidden">
      {/* Background sheen */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-50/60 via-violet-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with Navigation Arrows */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-50 border border-violet-200/70 text-[11px] font-black uppercase tracking-wider text-[#7C3AED]">
            Success Stories
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Success Stories That Inspire Better Workplaces
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Real rewards, meaningful benefits, and smarter employee experiences that drive engagement and growth.
          </p>
        </div>

        {/* Previous / Next Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 14 }} />
          </button>
          <span className="text-xs font-bold text-gray-400 px-1">
            {activeIndex + 1} / {TESTIMONIALS.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowForwardIosOutlinedIcon sx={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      {/* Testimonial Active Display */}
      <div className="relative z-10 bg-gradient-to-r from-violet-50/40 via-white to-pink-50/30 rounded-2xl border border-gray-200/90 p-6 sm:p-8 transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar with initial */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${current.avatarBg} text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md`}
            >
              {current.name.charAt(0)}
            </div>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(current.rating)].map((_, i) => (
                <StarIcon key={i} sx={{ fontSize: 16 }} />
              ))}
            </div>
          </div>

          {/* Testimonial Text */}
          <div className="space-y-3 flex-1">
            <div className="text-[#7C3AED]/40">
              <FormatQuoteIcon sx={{ fontSize: 36 }} />
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed italic">
              "{current.quote}"
            </p>

            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-black text-gray-900">
                  {current.name}
                </h4>
                <p className="text-xs font-semibold text-gray-500">
                  {current.role} • <span className="text-[#7C3AED]">{current.company}</span>
                </p>
              </div>

              {/* Dots indicator */}
              <div className="flex items-center gap-1.5">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeIndex
                        ? 'w-6 bg-[#7C3AED]'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
