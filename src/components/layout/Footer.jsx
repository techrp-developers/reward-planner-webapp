// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import rpLogo from '../../assets/rplogo_nobg.svg';
import { POLICIES_LIST } from '../../modules/policies/policiesData';

// Material UI Icons
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const Footer = () => {

  return (
    <footer
      className="w-full relative overflow-hidden border-t border-pink-200/90 font-['Poppins',sans-serif]"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF1F6 32%, #F698BD 72%, #EA4988 100%)',
      }}
    >
      {/* ── TOP GRADIENT ACCENT LINE ────────────────────────────────────────── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#8b3ab5] to-[#a855f7]" />

      {/* Subtle Ambient soft glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-4 sm:pt-8 sm:pb-5 space-y-6 relative z-10">
        {/* ── ROW 1: BRAND IDENTITY & DESCRIPTION (HORIZONTAL) ─────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-8 pb-5 border-b border-pink-200/80">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200/90 p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <img src={rpLogo} alt="Reward Planners Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-gray-900 text-lg tracking-wider block leading-tight">REWARDS PLANNER</span>
              <span className="text-xs font-bold text-[#EA4988] tracking-widest uppercase block">Corporate Enterprise Portal</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed font-medium max-w-4xl">
            RewardPlanners is India's leading corporate rewards and workforce engagement ecosystem by <strong className="text-gray-900 font-bold">MAA PRANAAM PRO PLANNER PRIVATE LIMITED</strong>, built for smarter benefits, corporate wellness, and milestone celebrations.
          </p>
        </div>

        {/* ── ROW 2: CORPORATE HEADQUARTERS & POLICIES & GOVERNANCE (COL-6 / COL-6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* COLUMN 1 (COL-6): CORPORATE HEADQUARTERS */}
          <div className="space-y-2.5">
            <h5 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA4988]" />
              <span>Corporate Headquarters</span>
            </h5>

            <div className="space-y-2 text-gray-800">
              {/* Company Entity Name & Status */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-gray-900 text-[13px] sm:text-sm tracking-wide">
                  MAA PRANAAM PRO PLANNER PVT. LTD.
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-emerald-800 border border-emerald-300 shadow-2xs">
                  Active Entity
                </span>
              </div>

              {/* CIN & GSTIN Monospace Details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">CIN:</span>
                  <span className="font-mono font-bold text-gray-900 text-xs">U62011PN2025PTC240931</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">GSTIN:</span>
                  <span className="font-mono font-bold text-gray-900 text-xs">27AATCM2605D1ZI</span>
                </div>
              </div>

              {/* Registered Address */}
              <div className="flex items-start gap-1.5 text-xs leading-relaxed text-gray-600 font-medium">
                <LocationOnOutlinedIcon sx={{ fontSize: 17 }} className="text-[#EA4988] shrink-0 mt-0.5" />
                <span>
                  Shop No 3, Bldg-B, KPCT Fatima, Sn-16/1/1, Opp Parmar, Wanowadi, Pune – 411040, Maharashtra
                </span>
              </div>

              {/* Quick Contact Info */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs font-medium text-gray-800 pt-0.5">
                <a
                  href="mailto:info@rewardplanners.com"
                  className="flex items-center gap-1.5 hover:text-[#EA4988] transition-colors cursor-pointer"
                >
                  <EmailOutlinedIcon sx={{ fontSize: 15 }} className="text-[#EA4988]" />
                  <span>info@rewardplanners.com</span>
                </a>
                <span className="text-pink-300">|</span>
                <a
                  href="tel:+918660583751"
                  className="flex items-center gap-1.5 hover:text-[#A654CD] transition-colors cursor-pointer"
                >
                  <PhoneOutlinedIcon sx={{ fontSize: 15 }} className="text-[#A654CD]" />
                  <span>+91 86605 83751</span>
                </a>
              </div>

              {/* App Store Download Badges */}
              <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white transition-transform hover:scale-102 cursor-pointer select-none shadow-md"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186A1.85 1.85 0 0 1 3 20.875V3.125c0-.49.196-.96.609-1.311z" fill="#00D2FF" />
                    <path d="M17.186 8.607L13.793 12l3.393 3.393 3.844-2.219a1.27 1.27 0 0 0 0-2.348l-3.844-2.219z" fill="#FFCE00" />
                    <path d="M3.609 1.814l10.184 10.186 3.393-3.393L5.438.414A1.27 1.27 0 0 0 3.609 1.814z" fill="#00F076" />
                    <path d="M17.186 15.393l-3.393-3.393L3.609 22.186a1.27 1.27 0 0 0 1.829 1.4l11.748-8.193z" fill="#FF3A44" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[8px] uppercase tracking-wider text-gray-300 font-semibold">GET IT ON</div>
                    <div className="text-xs font-bold text-white">Google Play</div>
                  </div>
                </a>

                <a
                  href="https://www.apple.com/app-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white transition-transform hover:scale-102 cursor-pointer select-none shadow-md"
                >
                  <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.04-1.82.93-2.87-.9.04-2 .6-2.65 1.36-.57.65-1.07 1.73-.93 2.76 1.01.08 2.03-.49 2.65-1.25z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[8px] tracking-wider text-gray-300 font-semibold">Download on the</div>
                    <div className="text-xs font-bold text-white">App Store</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2 (COL-6): POLICIES & GOVERNANCE */}
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="space-y-2.5">
              <h5 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA4988]" />
                <span>Policies & Governance</span>
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-[13px] text-gray-700 font-medium pt-0.5">
                {POLICIES_LIST.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className="hover:text-[#EA4988] transition-colors flex items-center gap-1.5 group cursor-pointer text-left py-0.5 w-full"
                    >
                      <ChevronRightIcon sx={{ fontSize: 14 }} className="text-gray-400 group-hover:text-[#EA4988] group-hover:translate-x-0.5 transition-all shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect With Us (Shown at the end) */}
            <div className="pt-2 flex flex-col sm:items-end space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block text-left sm:text-right">Connect With Us</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8.5 h-8.5 rounded-xl bg-white/90 hover:bg-[#0077B5] border border-pink-200/80 hover:border-transparent text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs cursor-pointer"
                >
                  <LinkedInIcon sx={{ fontSize: 18 }} />
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8.5 h-8.5 rounded-xl bg-white/90 hover:bg-[#1877F2] border border-pink-200/80 hover:border-transparent text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs cursor-pointer"
                >
                  <FacebookIcon sx={{ fontSize: 18 }} />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8.5 h-8.5 rounded-xl bg-white/90 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] border border-pink-200/80 hover:border-transparent text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs cursor-pointer"
                >
                  <InstagramIcon sx={{ fontSize: 18 }} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-8.5 h-8.5 rounded-xl bg-white/90 hover:bg-gray-900 border border-pink-200/80 hover:border-transparent text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs cursor-pointer"
                >
                  <TwitterIcon sx={{ fontSize: 18 }} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM COPYRIGHT AT THE VERY END (NO EXTRA SPACE) ───────────────── */}
      <div className="border-t border-pink-300/30 py-2.5 px-4 text-center text-xs text-gray-700 relative z-10">
        <p>
          © 2026 <strong className="text-gray-900 font-bold">Maa Pranaam Pro Planner Pvt. Ltd.</strong> All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
