// src/modules/bbps/components/BbpsHeroBanner.tsx
import React from 'react';
import { Sparkles, ShieldCheck, History, Zap } from 'lucide-react';
import bbpsHeroBg from '../../../assets/payments/bbps payments logo.png';

interface BbpsHeroBannerProps {
  activeTab: 'pay' | 'history' | string;
  onTabChange: (tab: 'pay' | 'history') => void;
}

export const BbpsHeroBanner: React.FC<BbpsHeroBannerProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-purple-200/40 select-none group"
      style={{ aspectRatio: '1270 / 395' }}
    >
      {/* 3rd uploaded image as the background - Full native 1024x395 dimensions, zero cropping */}
      <img
        src={bbpsHeroBg}
        alt="Everything due, all in one place"
        className="w-full h-full object-cover select-none pointer-events-none"
        style={{
          imageRendering: '-webkit-optimize-contrast',
        }}
      />

      {/* Subtle soft gradient scrim on left to ensure maximum text contrast while keeping 3D artwork crystal clear */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/75 via-purple-950/30 to-transparent pointer-events-none" />

      {/* Left Content: Title & Subtitle matching reference design */}
      <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-5 sm:p-8 md:p-12 lg:p-14 z-10 max-w-lg lg:max-w-xl space-y-1.5 sm:space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-semibold text-purple-200 w-fit">
          <Sparkles size={12} className="text-amber-300 shrink-0" />
          <span>Bharat BillPay (BBPS) Gateway</span>
        </div>

        <div>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight">
            Everything due,
          </h1>
          <p className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-semibold text-purple-100 mt-0.5 sm:mt-1 tracking-tight drop-shadow-md">
            all in one place.
          </p>
        </div>

        {/* Accent bottom line */}
        <div className="w-8 sm:w-12 h-1 bg-[#DCC3EF] rounded-full opacity-90 mt-1" />

        {/* Trust badges */}
        <div className="flex items-center gap-3 pt-1 text-[10px] sm:text-xs text-white/80 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>NPCI Assured</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>Instant Confirmation</span>
          </div>
        </div>
      </div>

      {/* Top Right: Mode Switcher ("Pay Bills" / "History") cleanly tucked in corner without covering artwork */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-20">
        <div className="flex items-center gap-1 bg-black/45 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/25 shadow-xl">
          <button
            type="button"
            onClick={() => onTabChange('pay')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pay'
                ? 'bg-white text-[#704096] shadow-md font-extrabold'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap size={13} />
            <span>Pay Bills</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-[#704096] shadow-md font-extrabold'
                : 'text-purple-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <History size={13} />
            <span>History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BbpsHeroBanner;
