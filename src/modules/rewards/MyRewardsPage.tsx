// src/modules/rewards/MyRewardsPage.jsx
// Exact implementation of the My Rewards page matching design mockup
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Visual Assets extracted directly from mockup
import rewardsHeroGift from '../../assets/rewards/rewards_hero_gift.png';
import rewardsPromoBanner from '../../assets/sidebarpagesimages/rewards section images 1.png';
import rewardCoinsStack from '../../assets/rewards/reward_coins_stack.png';

// Category icons from sidebarpagesimages
import catGiftCards from '../../assets/sidebarpagesimages/gift card image.png';
import catProducts from '../../assets/sidebarpagesimages/products image in rewrads.png';
import catExperiences from '../../assets/sidebarpagesimages/experiences in rewards section.png';
import catWellness from '../../assets/sidebarpagesimages/wellness.png';
import catCorporate from '../../assets/sidebarpagesimages/corporate gifts.png';

// Featured Rewards from sidebarpagesimages
import featuredWatch from '../../assets/sidebarpagesimages/noise watch.png';
import featuredEarbuds from '../../assets/sidebarpagesimages/boat.png';
import featuredMyntra from '../../assets/sidebarpagesimages/myntra gift cards.png';
import featuredSpa from '../../assets/sidebarpagesimages/spa & wellness voucher.png';

// Trending Rewards from sidebarpagesimages
import trendingAmazon from '../../assets/sidebarpagesimages/amazon crad.png';
import trendingSwiggy from '../../assets/sidebarpagesimages/siggy gift crd.png';
import trendingFlight from '../../assets/sidebarpagesimages/flight vouchers.png';

// Recommended For You from sidebarpagesimages
import recMovie from '../../assets/sidebarpagesimages/movie vouchers.png';
import recDining from '../../assets/sidebarpagesimages/dining vouchers.png';
import recHotel from '../../assets/sidebarpagesimages/hotel stay vouchers.png';

// Lucide & Material Icons
import {
  ChevronRight,
  Info,
  BarChart2,
  Headphones,
  Heart,
  Gift,
  ShoppingCart,
  Star,
  CheckCircle2,
  X,
} from 'lucide-react';

export const MyRewardsPage = () => {
  const navigate = useNavigate();

  // Active top tab
  const [activeTab, setActiveTab] = useState('Overview');

  // Wishlist state for cards
  const [wishlist, setWishlist] = useState({
    watch: false,
    earbuds: false,
    myntra: false,
    spa: false,
  });

  // Modal State for Redemption
  const [redeemModal, setRedeemModal] = useState({
    open: false,
    item: null,
    success: false,
  });

  const toggleWishlist = (key) => {
    setWishlist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRedeemClick = (item) => {
    setRedeemModal({
      open: true,
      item,
      success: false,
    });
  };

  const handleConfirmRedeem = () => {
    setRedeemModal((prev) => ({ ...prev, success: true }));
    setTimeout(() => {
      setRedeemModal({ open: false, item: null, success: false });
    }, 2000);
  };

  return (
    <div className="h-full w-full bg-[#F8FAFD] flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">
        {/* ── 1. SIDEBAR WITH ACTIVE 'My Rewards' TAB ── */}

        {/* ── 2. MAIN DASHBOARD CONTENT AREA ── */}
        <main
          className="relative flex-1 min-w-0 h-full flex flex-col justify-start pt-3 pb-8 px-4 sm:px-6 lg:px-8 overflow-y-auto overflow-x-hidden gap-4 bg-gradient-to-b from-[#FAF8FF] via-[#F4F3FC] to-[#F8FAFD]"
        >
        {/* ── TOP HERO HEADER SECTION ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500" aria-label="Breadcrumb">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hover:text-[#6D28D9] transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-[#111827] font-semibold">My Rewards</span>
            </nav>

            {/* Title: In pure black color */}
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
              My Rewards
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
              Explore, earn and redeem rewards that make your employee experience more rewarding.
            </p>
          </div>

          {/* Top Right Hero Graphic (Plan Reward Grow + 3D Gift Box) */}
          <div className="hidden md:block shrink-0">
            <img
              src={rewardsHeroGift}
              alt="Plan Reward Grow"
              className="h-20 lg:h-22 w-auto object-contain select-none pointer-events-none"
            />
          </div>
        </div>

        {/* ── TABS ROW: Bold tabs matching user specification ── */}
        <div className="flex items-center gap-6 border-b border-gray-200/80 max-w-2xl pt-1 pb-2">
          {['Overview', 'Available Rewards', 'Redeemed', 'Wishlist'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (tab === 'Available Rewards') {
                    navigate('/rewards/explore');
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`relative text-xs sm:text-sm font-bold transition-all pb-1 cursor-pointer ${
                  isActive
                    ? 'text-[#6D28D9]'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#6D28D9] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 2-COLUMN MAIN LAYOUT (MATCHING MOCKUP 65% / 35%) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ═══════════════════════════════════════════════════
              LEFT COLUMN (COL 1 TO 7)
          ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. "Your rewards, your choices!" Promo Banner (Explore Rewards) */}
            <div
              onClick={() => navigate('/rewards/explore')}
              className="relative w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
              title="Explore Rewards"
            >
              <img
                src={rewardsPromoBanner}
                alt="Your rewards, your choices!"
                className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

            {/* 2. Reward Categories */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Reward Categories</h3>
                <button
                  type="button"
                  onClick={() => navigate('/rewards/explore')}
                  className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* 5 Category Cards */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {[
                  { id: 'gift_cards', name: 'Gift Cards', sub: '100+ options', img: catGiftCards },
                  { id: 'products', name: 'Products', sub: 'Top brands', img: catProducts },
                  { id: 'experiences', name: 'Experiences', sub: 'Curated for you', img: catExperiences },
                  { id: 'wellness', name: 'Wellness', sub: 'Healthier you', img: catWellness },
                  { id: 'corporate', name: 'Corporate Gifts', sub: 'For every occasion', img: catCorporate },
                ].map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => navigate('/store')}
                    className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-12 sm:w-16 sm:h-14 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] leading-tight group-hover:text-[#6D28D9] h-8 flex items-center justify-center">
                      {cat.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {cat.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Featured Rewards */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Featured Rewards</h3>
                <button
                  type="button"
                  onClick={() => navigate('/rewards/explore')}
                  className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* 4 Cards Grid with Right Chevron indicator */}
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'watch',
                      title: 'Noise Smart Watch',
                      price: '2,500 RP Coins',
                      coins: 2500,
                      img: featuredWatch,
                    },
                    {
                      id: 'earbuds',
                      title: 'boAt Airdopes',
                      price: '1,800 RP Coins',
                      coins: 1800,
                      img: featuredEarbuds,
                    },
                    {
                      id: 'myntra',
                      title: 'Myntra Gift Card',
                      price: '1,000 RP Coins',
                      coins: 1000,
                      img: featuredMyntra,
                    },
                    {
                      id: 'spa',
                      title: 'Spa & Wellness Voucher',
                      price: '2,000 RP Coins',
                      coins: 2000,
                      img: featuredSpa,
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-100 p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-purple-200 transition-all group"
                    >
                      {/* Image + Wishlist Heart */}
                      <div className="relative w-full aspect-[16/11] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(item.id);
                          }}
                          className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Heart
                            size={12}
                            className={
                              wishlist[item.id]
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-gray-400 hover:text-rose-500'
                            }
                          />
                        </button>
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Info & CTA */}
                      <div className="pt-2 space-y-1.5 text-center">
                        <h4 className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] line-clamp-1 leading-tight">
                          {item.title}
                        </h4>
                        <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                          {item.price}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRedeemClick(item)}
                          className="w-full py-1.5 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-[13px] font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Scroll Indicator Chevron */}
                <button
                  type="button"
                  onClick={() => navigate('/store')}
                  className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* 4. Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Recent Activity</h3>
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=orders')}
                  className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 1,
                    icon: Gift,
                    iconBg: 'bg-rose-50 text-rose-500',
                    title: 'Earned Rewards',
                    sub: 'Welcome Bonus',
                    date: '25 Sep 2026 • 10:15 AM',
                    amount: '+500 Coins',
                    positive: true,
                  },
                  {
                    id: 2,
                    icon: ShoppingCart,
                    iconBg: 'bg-rose-50 text-rose-500',
                    title: 'Redeemed Rewards',
                    sub: 'Amazon Gift Card',
                    date: '12 Sep 2026 • 03:00 PM',
                    amount: '-1,000 Coins',
                    positive: false,
                  },
                  {
                    id: 3,
                    icon: Star,
                    iconBg: 'bg-rose-50 text-rose-500',
                    title: 'Earned Rewards',
                    sub: 'Event Participation',
                    date: '05 Sep 2026 • 11:20 AM',
                    amount: '+300 Coins',
                    positive: true,
                  },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl hover:bg-gray-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[#0A0A5C]">{act.title}</div>
                          <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{act.sub}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs sm:text-sm font-extrabold ${
                            act.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}
                        >
                          {act.amount}
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 font-medium">{act.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              RIGHT COLUMN (COL 8 TO 12)
          ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Reward Balance & Earning History Split Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                {/* Left Side: Reward Balance */}
                <div className="pr-3 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700">
                    <span>Reward Balance</span>
                    <Info size={12} className="text-slate-400" />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <img
                      src={rewardCoinsStack}
                      alt="Coins"
                      className="w-10 h-9 object-contain shrink-0"
                    />
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-[#0A0A5C] tracking-tight leading-none">
                        12,500
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
                        RP Coins
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/rewards/explore')}
                    className="w-full py-1.5 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-[13px] font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Redeem Now
                  </button>
                </div>

                {/* Right Side: Earning History */}
                <div className="pl-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-700">
                    <span>Earning History</span>
                    <BarChart2 size={13} className="text-[#6D28D9]" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="text-slate-500">Earned this month</span>
                      <span className="font-bold text-[#16A34A]">+2,000</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="text-slate-500">Total Earned</span>
                      <span className="font-bold text-[#0A0A5C]">28,500</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="text-slate-500">Total Redeemed</span>
                      <span className="font-bold text-[#0A0A5C]">16,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Trending Rewards */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Trending Rewards</h3>
                <button
                  type="button"
                  onClick={() => navigate('/rewards/explore')}
                  className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="relative">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'amazon',
                      title: 'Amazon Gift Card',
                      sub: 'From 500 RP Coins',
                      coins: 500,
                      img: trendingAmazon,
                    },
                    {
                      id: 'swiggy',
                      title: 'Swiggy Gift Card',
                      sub: 'From 500 RP Coins',
                      coins: 500,
                      img: trendingSwiggy,
                    },
                    {
                      id: 'flight',
                      title: 'Flight Vouchers',
                      sub: 'From 2,000 RP Coins',
                      coins: 2000,
                      img: trendingFlight,
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-purple-200 transition-all text-center group"
                    >
                      <div className="w-full aspect-[16/11] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="pt-1.5 space-y-1">
                        <div className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium line-clamp-1">
                          {item.sub}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRedeemClick(item)}
                          className="w-full py-1.5 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Recommended For You */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Recommended For You</h3>
                <button
                  type="button"
                  onClick={() => navigate('/rewards/explore')}
                  className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'movie',
                    title: 'Movie Vouchers',
                    sub: '1,000 RP Coins',
                    coins: 1000,
                    img: recMovie,
                  },
                  {
                    id: 'dining',
                    title: 'Dining Vouchers',
                    sub: '1,500 RP Coins',
                    coins: 1500,
                    img: recDining,
                  },
                  {
                    id: 'hotel',
                    title: 'Hotel Stay Vouchers',
                    sub: '5,000 RP Coins',
                    coins: 5000,
                    img: recHotel,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-purple-200 transition-all text-center group"
                  >
                    <div className="w-full aspect-[16/11] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="pt-1.5 space-y-1">
                      <div className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium line-clamp-1">
                        {item.sub}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRedeemClick(item)}
                        className="w-full py-1.5 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-[13px] font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Need Help? Support Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Headphones size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0A0A5C]">Need Help?</h4>
                  <p className="text-[10.5px] text-gray-500 leading-tight">
                    Have a question about rewards, redemptions or anything else? Our support team is here to help.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/customer-support')}
                className="shrink-0 px-3.5 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-500/70 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer shadow-2xs"
              >
                Get Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

      {/* ── 3. REDEEM CONFIRMATION MODAL ── */}
      {redeemModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gray-100">
            {redeemModal.success ? (
              <div className="space-y-3 py-4 animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-black text-gray-900">Redemption Successful!</h3>
                <p className="text-xs text-gray-600">
                  You have successfully redeemed{' '}
                  <span className="font-bold text-gray-900">{redeemModal.item?.title}</span>. Details and voucher code have been sent to your registered work email.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-black text-gray-900">Confirm Redemption</h3>
                  <button
                    type="button"
                    onClick={() => setRedeemModal({ open: false, item: null, success: false })}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2 py-1">
                  <h4 className="text-sm font-bold text-gray-800">{redeemModal.item?.title}</h4>
                  <div className="text-xs text-gray-500">
                    Coins required:{' '}
                    <span className="font-extrabold text-[#6D28D9]">
                      {redeemModal.item?.coins?.toLocaleString() || redeemModal.item?.price} RP Coins
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Available balance: <span className="font-bold text-gray-700">12,500 RP Coins</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRedeemModal({ open: false, item: null, success: false })}
                    className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRedeem}
                    className="flex-1 py-2 rounded-xl bg-[#6D28D9] text-white text-xs font-bold hover:bg-[#5B21B6] transition-colors shadow-sm cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRewardsPage;
