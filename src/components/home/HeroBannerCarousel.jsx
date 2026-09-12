// src/components/home/HeroBannerCarousel.jsx
// Professional Auto-Sliding Hero Banner Carousel (2-second auto-rotate, Senior UI/UX Design)
// Floating badges are safely anchored to the showcase card (no edge clipping/cropping)
// Exact gradients:
// 1. #FFFFFF -> #A462FC (Purple)
// 2. #FFFFFF -> #7BCF45 (Green)
// 3. #FFFFFF -> #EA4988 (Pink)
// 4. #FFFFFF -> #F8A926 (Orange)

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Material UI Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BoltIcon from '@mui/icons-material/Bolt';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';

export const BANNER_SLIDES = [
  {
    id: 1,
    tag: 'Corporate Rewards Festival',
    tagIcon: AutoAwesomeIcon,
    tagBg: 'bg-purple-100/90 text-[#7928CA]',
    tagBorder: 'border-purple-200',
    title: 'Pay Up to 100% with RP Coins on Premium Electronics',
    subtitle:
      'Unlock corporate-exclusive discounts on Apple, Samsung, Sony, and Bose. Redeem your accumulated perk balance instantly at checkout.',
    perks: ['100% Tax-Free Perks', 'Brand Warranty Included', 'Instant Delivery'],
    primaryBtn: { text: 'Explore Electronics Deals', link: '/store' },
    secondaryBtn: { text: 'Check Coin Balance', link: '/wallet' },
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F6EEFF 32%, #CEAAFE 72%, #A462FC 100%)',
    accentColor: '#A462FC',
    badgeText: 'FESTIVAL SPECIAL',
    badgeDiscount: 'Save ₹12,500',
    badgeSub: 'On Laptops & Phones',
    badgeIcon: LaptopMacOutlinedIcon,
    cardGraphic: {
      type: 'tech',
      floatingCard1: { title: 'Apple MacBook Air M3', price: '₹99,900', coinTag: 'Save ₹15,000' },
      floatingCard2: { title: 'Sony WH-1000XM5', price: '₹24,990', coinTag: '50% Coins' },
    },
    floatingPills: {
      pill1: {
        icon: DiamondOutlinedIcon,
        iconColor: '#7928CA',
        iconBg: 'bg-purple-100 text-[#7928CA]',
        label: 'Instant',
        value: 'Cashback',
      },
      pill2: {
        icon: VerifiedUserIcon,
        iconColor: '#10B981',
        iconBg: 'bg-emerald-100 text-emerald-700',
        label: '100% Genuine',
        value: 'Brand Direct',
      },
    },
  },
  {
    id: 2,
    tag: 'Corporate Wellness & Healthcare',
    tagIcon: VerifiedUserIcon,
    tagBg: 'bg-emerald-100/90 text-emerald-800',
    tagBorder: 'border-emerald-200',
    title: 'Comprehensive Health Checkups & Corporate Wellness',
    subtitle:
      'Book full-body diagnostic screenings, gym memberships, and dental packages at zero out-of-pocket expense with company credits.',
    perks: ['NABL Accredited Labs', 'Home Sample Collection', '100% Company Sponsored'],
    primaryBtn: { text: 'Book Health Package', link: '/services' },
    secondaryBtn: { text: 'View Wellness Packages', link: '/services' },
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F3FCF0 32%, #B5EB93 72%, #7BCF45 100%)',
    accentColor: '#7BCF45',
    badgeText: 'CORPORATE WELLNESS',
    badgeDiscount: 'Free Screening',
    badgeSub: 'Worth ₹3,499 Included',
    badgeIcon: LocalHospitalOutlinedIcon,
    cardGraphic: {
      type: 'health',
      floatingCard1: { title: 'Comprehensive 84-Test Package', price: '₹0 Co-Pay', coinTag: '100% Covered' },
      floatingCard2: { title: 'Cult.fit & Gym Pass', price: '₹1,299/mo', coinTag: 'Coins Discount' },
    },
    floatingPills: {
      pill1: {
        icon: VerifiedUserIcon,
        iconColor: '#059669',
        iconBg: 'bg-emerald-100 text-emerald-700',
        label: 'NABL Certified',
        value: 'Free Checkup',
      },
      pill2: {
        icon: BoltIcon,
        iconColor: '#65A30D',
        iconBg: 'bg-lime-100 text-lime-700',
        label: 'Zero Co-Pay',
        value: '100% Covered',
      },
    },
  },
  {
    id: 3,
    tag: 'Limited Flash Vouchers',
    tagIcon: WhatshotIcon,
    tagBg: 'bg-pink-100/90 text-pink-700',
    tagBorder: 'border-pink-200',
    title: 'Instant Gift Vouchers: Up to 50% Off Top Fashion Brands',
    subtitle:
      'Myntra, Nykaa, Amazon, Swiggy, and Starbucks vouchers delivered to your mobile instantly with guaranteed employee extra discounts.',
    perks: ['Instant SMS & Email Delivery', 'Stack with Store Offers', 'Zero Expiry Stress'],
    primaryBtn: { text: 'Grab Flash Vouchers', link: '/deals' },
    secondaryBtn: { text: 'Browse 150+ Brands', link: '/store' },
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #FDF1F6 32%, #F698BD 72%, #EA4988 100%)',
    accentColor: '#EA4988',
    badgeText: 'FLASH SALE',
    badgeDiscount: 'Flat 50% Coins',
    badgeSub: 'Ends in 03h:42m',
    badgeIcon: LocalMallOutlinedIcon,
    cardGraphic: {
      type: 'vouchers',
      floatingCard1: { title: 'Myntra Gift Card ₹2,000', price: '₹1,500 + 500 Coins', coinTag: 'Best Seller' },
      floatingCard2: { title: 'Starbucks Coffee Voucher', price: '₹500', coinTag: 'Instant 20% Off' },
    },
    floatingPills: {
      pill1: {
        icon: WhatshotIcon,
        iconColor: '#BE185D',
        iconBg: 'bg-pink-100 text-pink-700',
        label: 'Instant',
        value: 'Cashback',
      },
      pill2: {
        icon: DiamondOutlinedIcon,
        iconColor: '#DB2777',
        iconBg: 'bg-rose-100 text-rose-700',
        label: 'SMS Delivery',
        value: 'Instant Code',
      },
    },
  },
  {
    id: 4,
    tag: 'Bharat BillPay & Utilities',
    tagIcon: BoltIcon,
    tagBg: 'bg-amber-100/90 text-amber-800',
    tagBorder: 'border-amber-200',
    title: 'Zero Convenience Fee on Electricity, Gas & FASTag Bills',
    subtitle:
      'Pay your household bills through NPCI Bharat BillPay and pay directly with RP Coins. Instant confirmation with 5% rewards cashback.',
    perks: ['Official BBPS Certified', 'Instant Receipt PDF', 'Earn 5X Coins per Bill'],
    primaryBtn: { text: 'Pay Household Bills', link: '/bbps' },
    secondaryBtn: { text: 'View Supported Boards', link: '/bbps' },
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFF9F0 32%, #FCD08D 72%, #F8A926 100%)',
    accentColor: '#F8A926',
    badgeText: 'INSTANT BBPS',
    badgeDiscount: '5% Cashback',
    badgeSub: 'On Electricity & FASTag',
    badgeIcon: ElectricBoltOutlinedIcon,
    cardGraphic: {
      type: 'bbps',
      floatingCard1: { title: 'State Electricity Bill', price: '₹2,450', coinTag: 'Paid with Coins' },
      floatingCard2: { title: 'FASTag Instant Top-up', price: '₹1,000', coinTag: 'Zero Fee' },
    },
    floatingPills: {
      pill1: {
        icon: DiamondOutlinedIcon,
        iconColor: '#D97706',
        iconBg: 'bg-amber-100 text-amber-700',
        label: 'Instant',
        value: 'Cashback',
      },
      pill2: {
        icon: ElectricBoltOutlinedIcon,
        iconColor: '#EA580C',
        iconBg: 'bg-orange-100 text-orange-700',
        label: '100%',
        value: 'Paperless',
      },
    },
  },
];

export const HeroBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = BANNER_SLIDES.length;

  // Auto-slide every 2 seconds (2000ms)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 2000);

    return () => clearInterval(timerRef.current);
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const currentSlide = BANNER_SLIDES[currentIndex];

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-white/60 transition-all select-none min-h-[460px] sm:min-h-[420px] md:min-h-[460px] lg:h-[480px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Linear Gradient Background */}
      {BANNER_SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        const SlideTagIcon = slide.tagIcon;
        const SlideBadgeIcon = slide.badgeIcon;
        const Pill1Icon = slide.floatingPills?.pill1?.icon || DiamondOutlinedIcon;
        const Pill2Icon = slide.floatingPills?.pill2?.icon || ElectricBoltOutlinedIcon;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            style={{
              background: slide.gradient,
            }}
          >
            {/* Subtle gloss overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/5 pointer-events-none" />

            {/* Decorative background ambient orbs */}
            <div
              className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none"
              style={{ backgroundColor: slide.accentColor }}
            />
            <div className="absolute top-4 right-1/3 w-64 h-64 rounded-full blur-2xl opacity-20 bg-white pointer-events-none" />

            {/* Content Container (Comfortable horizontal clearance to prevent arrow overlap) */}
            <div className="w-full h-full max-w-[1500px] mx-auto px-5 sm:px-14 lg:px-20 flex items-center justify-between gap-8 relative z-20">
              {/* LEFT COLUMN: Punchy Copy & CTAs */}
              <div className="flex-1 max-w-2xl py-6 sm:py-8 flex flex-col justify-center space-y-3 sm:space-y-4">
                {/* Eyebrow Tag Pill */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider border shadow-2xs backdrop-blur-md ${slide.tagBg} ${slide.tagBorder}`}
                  >
                    <SlideTagIcon sx={{ fontSize: 14 }} />
                    {slide.tag}
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-white/70 px-2.5 py-0.5 rounded-full border border-gray-200/80 shadow-2xs backdrop-blur-xs">
                    <MonetizationOnIcon sx={{ fontSize: 14 }} className="text-amber-500" />
                    RP Coins Eligible
                  </span>
                </div>

                {/* Main Headline in Poppins */}
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-[1.2] tracking-tight">
                  {slide.title}
                </h2>

                {/* Value Proposition Description */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-xl font-medium line-clamp-3 sm:line-clamp-none">
                  {slide.subtitle}
                </p>

                {/* 3 Perks Checkmark Pills */}
                <div className="hidden sm:flex flex-wrap items-center gap-2.5 pt-1">
                  {slide.perks.map((perk, pIdx) => (
                    <span
                      key={pIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-800 bg-white/80 border border-gray-200/90 px-2.5 py-1 rounded-lg shadow-2xs backdrop-blur-xs"
                    >
                      <CheckCircleIcon sx={{ fontSize: 14, color: slide.accentColor }} />
                      {perk}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 pb-6 sm:pb-0">
                  <Link
                    to={slide.primaryBtn.link}
                    className="inline-flex items-center gap-2 px-4.5 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    style={{
                      backgroundColor: slide.accentColor,
                    }}
                  >
                    <span>{slide.primaryBtn.text}</span>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Link>

                  <Link
                    to={slide.secondaryBtn.link}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-800 bg-white/80 hover:bg-white border border-gray-300/80 hover:border-gray-400 transition-all shadow-xs backdrop-blur-xs"
                  >
                    <span>{slide.secondaryBtn.text}</span>
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: Senior UI 3D Showcase & Glass Cards */}
              <div className="hidden lg:flex flex-1 items-center justify-center relative max-w-md h-full py-4">
                {/* Floating Card & Badges Anchor Wrapper */}
                <div className="relative w-full max-w-sm">
                  {/* Center Showcase Card */}
                  <div className="relative w-full bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-4.5 border border-white/95 shadow-xl space-y-2.5 transform hover:scale-[1.01] transition-transform duration-300">
                    {/* Top Badge Ribbon */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                          style={{ backgroundColor: slide.accentColor }}
                        >
                          <SlideBadgeIcon sx={{ fontSize: 20 }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                            {slide.badgeText}
                          </p>
                          <p className="text-sm font-black text-gray-900 leading-tight">
                            {slide.badgeDiscount}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                        {slide.badgeSub}
                      </span>
                    </div>

                    {/* Floating Glass Item 1 */}
                    <div className="p-2.5 rounded-2xl bg-white/95 border border-gray-100 shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-900 truncate">
                          {slide.cardGraphic.floatingCard1.title}
                        </p>
                        <p className="text-xs font-extrabold text-gray-700 mt-0.5">
                          {slide.cardGraphic.floatingCard1.price}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-black px-2.5 py-1 rounded-lg text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: slide.accentColor }}
                      >
                        {slide.cardGraphic.floatingCard1.coinTag}
                      </span>
                    </div>

                    {/* Floating Glass Item 2 */}
                    <div className="p-2.5 rounded-2xl bg-white/95 border border-gray-100 shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-900 truncate">
                          {slide.cardGraphic.floatingCard2.title}
                        </p>
                        <p className="text-xs font-extrabold text-gray-700 mt-0.5">
                          {slide.cardGraphic.floatingCard2.price}
                        </p>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                        {slide.cardGraphic.floatingCard2.coinTag}
                      </span>
                    </div>

                    {/* Bottom Verification Footer (Clean & 100% Unobscured) */}
                    <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-gray-500 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <VerifiedUserIcon sx={{ fontSize: 14 }} className="text-emerald-600" /> Corporate Verified
                      </span>
                      <span className="text-gray-400">Reward Planners Network</span>
                    </div>
                  </div>

                  {/* Floating Decorative Pill 1: Floats above the top-right of the card (0% card overlap) */}
                  {slide.floatingPills?.pill1 && (
                    <div className="absolute bottom-[calc(100%+8px)] right-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-lg border border-white/90 flex items-center gap-2 banner-float-top pointer-events-none">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${slide.floatingPills.pill1.iconBg}`}
                      >
                        <Pill1Icon sx={{ fontSize: 15 }} />
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-tight whitespace-nowrap">
                          {slide.floatingPills.pill1.label}
                        </p>
                        <p className="text-xs font-black text-gray-900 leading-tight mt-0.5 whitespace-nowrap">
                          {slide.floatingPills.pill1.value}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Floating Decorative Pill 2: Floats below the bottom-left of the card (0% card overlap, zero obstruction of Corporate Verified) */}
                  {slide.floatingPills?.pill2 && (
                    <div className="absolute top-[calc(100%+8px)] left-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-lg border border-white/90 flex items-center gap-2 banner-float-bottom pointer-events-none">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${slide.floatingPills.pill2.iconBg}`}
                      >
                        <Pill2Icon sx={{ fontSize: 15 }} />
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider leading-tight whitespace-nowrap">
                          {slide.floatingPills.pill2.label}
                        </p>
                        <p className="text-xs font-black text-gray-900 leading-tight mt-0.5 whitespace-nowrap">
                          {slide.floatingPills.pill2.value}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Manual Left/Right Navigation Arrows (Desktop & Tablet only to prevent mobile text overlap) */}
      <button
        type="button"
        onClick={handlePrev}
        className="hidden sm:flex absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md border border-white/90 items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
        aria-label="Previous Slide"
      >
        <ChevronLeftIcon sx={{ fontSize: 22 }} />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="hidden sm:flex absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md border border-white/90 items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
        aria-label="Next Slide"
      >
        <ChevronRightIcon sx={{ fontSize: 22 }} />
      </button>

      {/* Bottom Pagination Dots & 3-Second Active Progress Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 shadow-sm">
        {BANNER_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              className="relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                width: isActive ? '34px' : '9px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {/* Animated Progress Fill for active slide (3 seconds) */}
              {isActive && (
                <div
                  key={currentIndex}
                  className="h-full bg-white rounded-full animate-progress"
                  style={{
                    animation: isPaused ? 'none' : 'progressTimer 3s linear forwards',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* CSS Keyframe Animations for Progress & Subtle Float */}
      <style>{`
        @keyframes progressTimer {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes bannerFloatTop {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes bannerFloatBottom {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(5px);
          }
        }

        .banner-float-top {
          animation: bannerFloatTop 3.2s ease-in-out infinite;
        }

        .banner-float-bottom {
          animation: bannerFloatBottom 3.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroBannerCarousel;
