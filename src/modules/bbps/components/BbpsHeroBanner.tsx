// src/modules/bbps/components/BbpsHeroBanner.jsx
import React from 'react';
import { Wallet, Sparkles, ShieldCheck, History, Zap } from 'lucide-react';

export const BbpsHeroBanner = ({ activeTab, onTabChange }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7953B5] via-[#68439F] to-[#70479E] text-white p-6 sm:p-8 md:p-10 border border-[#A985CC] shadow-xl shadow-purple-900/15">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-purple-900/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Text & Titles */}
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-100">
            <Sparkles size={14} className="text-amber-300" />
            <span>Bharat BillPay (BBPS) Official Gateway</span>
          </div>

          <div className="pt-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-sm leading-tight">
              Everything due,
            </h1>
            <span className="block text-xl sm:text-2xl md:text-3xl font-bold text-purple-100 mt-0.5 tracking-tight">
              all in one place.
            </span>
          </div>

          {/* Accent bottom line */}
          <div className="w-10 h-1 bg-[#DCC3EF] rounded-full opacity-90 mt-4" />

          {/* Trust badges */}
          <div className="flex items-center gap-4 pt-3 text-xs text-purple-200/90 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>NPCI / BBPS Assured</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>

        {/* Right: Floating Tilted Squircle Wallet Card & Mode Switcher */}
        <div className="flex flex-col items-end gap-4 self-end md:self-center">
          {/* Tilted Glass Wallet Card (Matching mobile UI) */}
          <div className="relative group">
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-md p-1.5 sm:p-2 rotate-6 shadow-2xl border border-white/30 flex items-center justify-center transition-transform group-hover:rotate-0 duration-300">
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#DCC3EF] to-[#704096] flex items-center justify-center text-white shadow-inner">
                <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <button
              type="button"
              onClick={() => onTabChange('pay')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pay'
                  ? 'bg-white text-[#704096] shadow-md font-extrabold'
                  : 'text-purple-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Zap size={14} />
              <span>Pay Bills</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#704096] shadow-md font-extrabold'
                  : 'text-purple-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <History size={14} />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BbpsHeroBanner;
