// src/modules/ecommerce/components/EcommerceBannerCarousel.jsx
// Dedicated E-Commerce Hero Banner: White Background, Full Width, Compact Height, 2s Auto-Scroll
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StarIcon from '@mui/icons-material/Star';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import HeadsetIcon from '@mui/icons-material/Headset';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import promoGiftBox from '../../../assets/home/promo-giftbox.png';

// 4 Distinct E-Commerce Banners with Clean White/Light Backgrounds
const ECOM_SLIDES = [
  {
    id: 1,
    categoryTag: '⚡ MEGA TECH CARNIVAL',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    titlePrimary: 'Next-Gen Tech.',
    titleHighlight: 'Up to 60% Off.',
    highlightColor: 'text-[#3814F0]',
    description: 'Top-tier smartwatches, wireless audio & high-performance accessories with reward benefits.',
    couponCode: 'TECH60',
    perk: 'Earn 2X Coins',
    ctaText: 'Shop Tech Deals',
    ctaLink: '/store?category=Electronics',
    ctaBg: 'bg-[#3814F0] hover:bg-[#2B0DBA] text-white',
    badgeIcon: WhatshotIcon,
    badgeIconColor: 'text-amber-500',
    badgeIconBg: 'bg-amber-50',
    badgeText: '⭐ 4.8 / 5.0 Rating',
    badgeSub: '12.4k+ Reviews',
    floatingOffer: '⚡ Flat ₹500 Off',
    offerColor: 'bg-amber-100 text-amber-900 border-amber-200',
    lightBorder: 'border-blue-100',
    softTint: 'from-blue-50/40 via-white to-indigo-50/30',
  },
  {
    id: 2,
    categoryTag: '🎵 AUDIO & SOUND FESTIVAL',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    titlePrimary: 'Immersive Sound.',
    titleHighlight: 'Min. 45% Off.',
    highlightColor: 'text-[#E11D48]',
    description: 'Active noise cancellation earbuds, rich bass & all-day battery life for music and calls.',
    couponCode: 'SOUND45',
    perk: 'Extra 15% Off',
    ctaText: 'Explore Audio Gear',
    ctaLink: '/store?category=Electronics',
    ctaBg: 'bg-[#E11D48] hover:bg-[#BE123C] text-white',
    badgeIcon: HeadsetIcon,
    badgeIconColor: 'text-rose-500',
    badgeIconBg: 'bg-rose-50',
    badgeText: '🎧 ANC Enabled',
    badgeSub: '48H Battery Life',
    floatingOffer: '🔥 From ₹899',
    offerColor: 'bg-rose-100 text-rose-900 border-rose-200',
    lightBorder: 'border-rose-100',
    softTint: 'from-rose-50/40 via-white to-pink-50/30',
  },
  {
    id: 3,
    categoryTag: '💼 WORKPLACE PERKS',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    titlePrimary: 'Smart Workspaces.',
    titleHighlight: 'Corporate Deals.',
    highlightColor: 'text-[#059669]',
    description: 'Ergonomic mobile stands, quiet wireless mice & desk organizers curated for efficiency.',
    couponCode: 'DESK25',
    perk: 'Free Delivery',
    ctaText: 'Upgrade Desk Setup',
    ctaLink: '/store',
    ctaBg: 'bg-[#059669] hover:bg-[#047857] text-white',
    badgeIcon: WorkOutlineIcon,
    badgeIconColor: 'text-emerald-600',
    badgeIconBg: 'bg-emerald-50',
    badgeText: '💼 Corporate Perk',
    badgeSub: 'Verified Quality',
    floatingOffer: '✨ Extra 20% Coins',
    offerColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    lightBorder: 'border-emerald-100',
    softTint: 'from-emerald-50/40 via-white to-teal-50/30',
  },
  {
    id: 4,
    categoryTag: '🪙 ZERO RUPEE REWARDS STORE',
    tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    titlePrimary: 'Pay Zero Rupees.',
    titleHighlight: '100% Coin Redeem.',
    highlightColor: 'text-[#D97706]',
    description: 'Redeem 100% of your cart value using RP Reward Coins. No minimum order limit.',
    couponCode: 'COINS100',
    perk: 'Zero Cash Pay',
    ctaText: 'Redeem Coins Now',
    ctaLink: '/deals',
    ctaBg: 'bg-[#D97706] hover:bg-[#B45309] text-white',
    badgeIcon: null, // Uses 3D Gift Box image
    badgeText: '🪙 100% Free Store',
    badgeSub: 'Use Wallet Coins',
    floatingOffer: '🎉 ₹0 Delivery Fee',
    offerColor: 'bg-amber-100 text-amber-900 border-amber-200',
    lightBorder: 'border-amber-100',
    softTint: 'from-amber-50/40 via-white to-orange-50/30',
  },
];

export const EcommerceBannerCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ECOM_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + ECOM_SLIDES.length) % ECOM_SLIDES.length);
  }, []);

  // Auto-scroll every 2 seconds when not hovered (per user request)
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 2000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const handleCopyCoupon = (e, code) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className="w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* FULL WIDTH COMPACT SLIDER CONTAINER */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm h-[200px] sm:h-[220px] md:h-[240px] flex items-stretch">
        {ECOM_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const BadgeIconComponent = slide.badgeIcon;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-gradient-to-r ${slide.softTint} py-3.5 sm:py-4 md:py-5 px-6 sm:px-12 md:px-16 flex flex-col justify-between transition-all duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Top Row: Category Tag + Floating Offer Tag */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase border shadow-2xs ${slide.tagColor}`}
                  >
                    {slide.categoryTag}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                    <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} className="text-slate-500" />
                    <span>Free Delivery</span>
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border shadow-2xs ${slide.offerColor}`}
                >
                  {slide.floatingOffer}
                </span>
              </div>

              {/* Middle Row: Content & Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center my-auto">
                {/* Left Text Block */}
                <div className="sm:col-span-9 space-y-1">
                  <h2 className="text-xl sm:text-2xl md:text-[28px] font-black text-[#0A0E54] tracking-tight leading-tight">
                    {slide.titlePrimary}{' '}
                    <span className={slide.highlightColor}>{slide.titleHighlight}</span>
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed line-clamp-1 max-w-2xl">
                    {slide.description}
                  </p>

                  {/* Actions & Perks Row */}
                  <div className="pt-1.5 flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={() => navigate(slide.ctaLink)}
                      className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-extrabold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer ${slide.ctaBg}`}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </button>

                    {/* Perk Pill */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-700 text-[11px] font-bold">
                      <MonetizationOnOutlinedIcon sx={{ fontSize: 14 }} className="text-amber-500" />
                      <span>{slide.perk}</span>
                    </div>

                    {/* Interactive Copy Coupon */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyCoupon(e, slide.couponCode)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300/80 text-slate-800 text-[11px] font-mono font-bold transition-all cursor-pointer group"
                      title="Click to copy coupon code"
                    >
                      <span className="text-slate-400 font-sans text-[9px] uppercase">Code:</span>
                      <span className="text-slate-900 font-extrabold">{slide.couponCode}</span>
                      {copiedCode === slide.couponCode ? (
                        <CheckIcon sx={{ fontSize: 12 }} className="text-emerald-600" />
                      ) : (
                        <ContentCopyIcon sx={{ fontSize: 12 }} className="text-slate-400 group-hover:text-slate-700" />
                      )}
                      {copiedCode === slide.couponCode && (
                        <span className="text-[9px] text-emerald-600 font-bold ml-0.5">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Visual Badge (Compact) */}
                <div className="hidden sm:flex sm:col-span-3 items-center justify-end">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2.5 max-w-[170px]">
                    {slide.id === 4 ? (
                      <img
                        src={promoGiftBox}
                        alt="Rewards Gift"
                        className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl ${slide.badgeIconBg} ${slide.badgeIconColor} flex items-center justify-center shrink-0`}
                      >
                        {BadgeIconComponent && <BadgeIconComponent sx={{ fontSize: 20 }} />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate leading-tight">
                        {slide.badgeText}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        {slide.badgeSub}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Minimal Dot Indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {ECOM_SLIDES.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentIndex(dotIdx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentIndex === dotIdx
                        ? 'w-5 bg-[#3814F0]'
                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-sm border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-sm border border-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
};

export default EcommerceBannerCarousel;
