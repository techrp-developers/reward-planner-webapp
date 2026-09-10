// src/components/home/MobileAppDownloadSection.jsx
import React from 'react';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rewardsplanners&pcampaignid=web_share&pli=1';
const APP_STORE_URL =
  'https://apps.apple.com/in/app/reward-planners/id6763531257';

const HIGHLIGHTS = [
  'Real-time RP Point notifications',
  '1-Tap BBPS bills & voucher redemption',
  'Instant insurance claim tracking',
  'Biometric & SSO corporate login',
];

export const MobileAppDownloadSection = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#1E1B4B] to-[#312E81] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-white/10">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#A654CD]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-t from-[#FC8BAD]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left column: App Value & Download buttons */}
        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-pink-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Reward Planners Mobile App</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Take Your Perks & Rewards Everywhere
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
            Download the official Reward Planners mobile application on Android and iOS. Track wallet coins, claim flash corporate deals, and access financial assistance anytime, anywhere.
          </p>

          {/* Highlights checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {HIGHLIGHTS.map((hl, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs font-semibold text-gray-200"
              >
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} className="text-emerald-400 shrink-0" />
                <span>{hl}</span>
              </div>
            ))}
          </div>

          {/* Store Download Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-3">
            {/* Google Play Button */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-md active:scale-95 group"
            >
              <AndroidIcon sx={{ fontSize: 26 }} className="text-emerald-600 transition-transform group-hover:scale-110" />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-none">
                  GET IT ON
                </span>
                <span className="block text-sm font-black text-gray-900 leading-tight">
                  Google Play
                </span>
              </div>
            </a>

            {/* Apple App Store Button */}
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-95 group"
            >
              <AppleIcon sx={{ fontSize: 28 }} className="text-white transition-transform group-hover:scale-110" />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70 leading-none">
                  Download on the
                </span>
                <span className="block text-sm font-black text-white leading-tight">
                  App Store
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Right column: QR code card & Enterprise entity badge */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-4 text-center">
          {/* Quick Scan Card */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-2 shadow-lg">
            <div className="w-28 h-28 bg-white rounded-xl p-2 mx-auto flex items-center justify-center text-gray-900 shadow-inner">
              <QrCode2OutlinedIcon sx={{ fontSize: 88 }} className="text-[#312E81]" />
            </div>
            <p className="text-[11px] font-bold text-gray-200">
              Scan to Download Instantly
            </p>
          </div>

          {/* Corporate Compliance Badge */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left max-w-xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />
              <span>Official Enterprise App</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Owned & operated by <strong>MAA PRANAAM PRO PLANNER PVT LTD</strong>. CIN: U62011PN2025PTC240931.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppDownloadSection;
