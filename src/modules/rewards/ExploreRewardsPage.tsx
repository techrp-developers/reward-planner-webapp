// src/modules/rewards/ExploreRewardsPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeSidebar } from '../home/components/EmployeeSidebar';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  ArrowUpDown,
  Filter as FilterIcon,
  Info,
  Check,
  X,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

import rewardCoinsStack from '../../assets/rewards/reward_coins_stack.png';
import amazonCardImg from '../../assets/sidebarpagesimages/amazon crad.png';
import myntraCardImg from '../../assets/sidebarpagesimages/myntra gift cards.png';
import noiseWatchImg from '../../assets/sidebarpagesimages/noise watch.png';
import boatImg from '../../assets/sidebarpagesimages/boat.png';
import flightVoucherImg from '../../assets/sidebarpagesimages/flight vouchers.png';
import swiggyDiningImg from '../../assets/sidebarpagesimages/siggy gift crd.png';
import spaVoucherImg from '../../assets/sidebarpagesimages/spa & wellness voucher.png';
import hotelVoucherImg from '../../assets/sidebarpagesimages/hotel stay vouchers.png';
import movieVoucherImg from '../../assets/sidebarpagesimages/movie vouchers.png';
import corporateGiftsImg from '../../assets/sidebarpagesimages/corporate gifts.png';

export const ExploreRewardsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userCoins, setUserCoins] = useState(12500);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const categories = [
    'All',
    'Gift Cards',
    'Products',
    'Experiences',
    'Travel',
    'Dining',
    'Wellness Rewards',
    'Corporate Gifts'
  ];

  const allRewards = [
    // Page 1 (The exact 8 cards from the design)
    {
      id: 1,
      brand: 'Amazon',
      title: 'Amazon Gift Card',
      category: 'Gift Cards',
      coins: 500,
      image: amazonCardImg,
      description: 'Instant digital voucher valid on millions of products on Amazon India.',
      terms: 'Valid for 1 year from issue date.'
    },
    {
      id: 2,
      brand: 'Myntra',
      title: 'Myntra Gift Card',
      category: 'Gift Cards',
      coins: 500,
      image: myntraCardImg,
      description: 'Upgrade your wardrobe with top fashion labels and accessories on Myntra.',
      terms: 'No minimum order required.'
    },
    {
      id: 3,
      brand: 'Noise',
      title: 'Noise Smart Watch',
      category: 'Products',
      coins: 5000,
      image: noiseWatchImg,
      description: 'Feature-packed smartwatch with 1.85" HD display, Bluetooth calling and health metrics.',
      terms: '1 year manufacturer warranty included.'
    },
    {
      id: 4,
      brand: 'boAt',
      title: 'boAt Airdopes',
      category: 'Products',
      coins: 3000,
      image: boatImg,
      description: 'True wireless earbuds with signature high-bass sound and 42-hour playtime.',
      terms: 'Standard replacement guarantee.'
    },
    {
      id: 5,
      brand: 'Travel',
      title: 'Flight Voucher',
      category: 'Travel',
      coins: 2000,
      image: flightVoucherImg,
      description: 'Domestic and international airline booking discount voucher across major carriers.',
      terms: 'Redeemable on travel portals.'
    },
    {
      id: 6,
      brand: 'Dining',
      title: 'Dining Voucher',
      category: 'Dining',
      coins: 1000,
      image: swiggyDiningImg,
      description: 'Enjoy delicious food delivery and gourmet restaurant dining discounts with Swiggy.',
      terms: 'Valid for online food orders.'
    },
    {
      id: 7,
      brand: 'Wellness Rewards',
      title: 'Spa Voucher',
      category: 'Wellness Rewards',
      coins: 2500,
      image: spaVoucherImg,
      description: 'Rejuvenating aromatherapy and relaxation spa experience at partner salons & resorts.',
      terms: 'Advance booking recommended.'
    },
    {
      id: 8,
      brand: 'Travel',
      title: 'Hotel Stay Voucher',
      category: 'Travel',
      coins: 5000,
      image: hotelVoucherImg,
      description: 'Luxury hotel stay voucher applicable across premium boutique and 5-star hotels.',
      terms: 'Valid for 6 months.'
    },
    // Page 2 Extra Rewards for pagination
    {
      id: 9,
      brand: 'Entertainment',
      title: 'Movie Voucher',
      category: 'Experiences',
      coins: 1000,
      image: movieVoucherImg,
      description: 'Book movie tickets on BookMyShow and PVR for the latest cinema releases.',
      terms: 'Valid across all cinemas nationwide.'
    },
    {
      id: 10,
      brand: 'Corporate',
      title: 'Corporate Gift Hamper',
      category: 'Corporate Gifts',
      coins: 3500,
      image: corporateGiftsImg,
      description: 'Curated premium office essentials, desk decor and gourmet confectionery.',
      terms: 'Direct shipping to your doorstep.'
    }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRedeemConfirm = () => {
    if (!selectedReward) return;
    if (userCoins < selectedReward.coins) {
      showToast('Insufficient RP Coins balance.');
      return;
    }
    setIsRedeeming(true);
    setTimeout(() => {
      setUserCoins((prev) => prev - selectedReward.coins);
      setIsRedeeming(false);
      showToast(`🎉 Congratulations! You have successfully redeemed "${selectedReward.title}".`);
      setSelectedReward(null);
    }, 800);
  };

  // Filter & Sort Logic
  const filteredRewards = useMemo(() => {
    let result = allRewards;

    if (selectedCategory !== 'All') {
      result = result.filter(
        (r) =>
          r.category.toLowerCase() === selectedCategory.toLowerCase() ||
          r.brand.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.brand.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.coins - b.coins);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.coins - a.coins);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [allRewards, selectedCategory, searchQuery, sortBy]);

  // Pagination (8 items per page)
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage) || 1;
  const paginatedRewards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRewards.slice(start, start + itemsPerPage);
  }, [filteredRewards, currentPage]);

  return (
    <div className="h-full w-full bg-[#F8FAFD] flex flex-col overflow-hidden font-['Poppins',sans-serif]">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">
        {/* ── 1. SIDEBAR WITH ACTIVE 'My Rewards' TAB ── */}
        <EmployeeSidebar activeTab="rewards" />

        {/* ── 2. MAIN DASHBOARD CONTENT AREA ── */}
        <main className="relative flex-1 min-w-0 h-full flex flex-col justify-start pt-3 pb-8 px-4 sm:px-6 lg:px-8 overflow-y-auto overflow-x-hidden gap-4 bg-gradient-to-b from-[#FAF8FF] via-[#F4F3FC] to-[#F8FAFD]">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 bg-[#0A0A5C] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-purple-400/20">
              <Check size={16} className="text-emerald-400 stroke-[3]" />
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="ml-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── TOP HEADER SECTION ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              {/* Breadcrumb: Home > My Rewards > Explore Rewards */}
              <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500" aria-label="Breadcrumb">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight size={13} className="text-slate-400" />
                <button
                  type="button"
                  onClick={() => navigate('/rewards')}
                  className="hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  My Rewards
                </button>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="text-[#111827] font-semibold">Explore Rewards</span>
              </nav>

              {/* Title: Explore Rewards */}
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-tight">
                Explore Rewards
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
                Browse and redeem rewards with your RP Coins.
              </p>
            </div>

            {/* Top Right Reward Balance Card */}
            <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs px-4 py-2.5 sm:px-5 sm:py-3 flex items-center gap-3.5 shrink-0 self-start sm:self-auto">
              <img
                src={rewardCoinsStack}
                alt="RP Coins"
                className="w-11 h-10 object-contain shrink-0"
              />
              <div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-500">
                  <span>Reward Balance</span>
                  <Info size={12} className="text-slate-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#0A0A5C] tracking-tight leading-none mt-0.5">
                  {userCoins.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
                  RP Coins
                </div>
              </div>
            </div>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="relative w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-2.5 sm:py-3 flex items-center gap-3 shadow-2xs focus-within:border-[#6D28D9] focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search rewards, brands or categories"
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ── FILTER & CATEGORY PILLS ROW ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5B21B6] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Right Buttons: Sort By & Filter */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
              {/* Sort By Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="bg-white border border-slate-200/80 rounded-xl px-3 sm:px-3.5 py-1.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <ArrowUpDown size={13} className="text-slate-500" />
                  <span>Sort By</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-fadeIn text-xs">
                    <button
                      type="button"
                      onClick={() => { setSortBy('default'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-purple-50 hover:text-[#6D28D9] ${sortBy === 'default' ? 'font-bold text-[#6D28D9]' : 'text-slate-600'}`}
                    >
                      Featured (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy('price-low'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-purple-50 hover:text-[#6D28D9] ${sortBy === 'price-low' ? 'font-bold text-[#6D28D9]' : 'text-slate-600'}`}
                    >
                      Coins: Low to High
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy('price-high'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-purple-50 hover:text-[#6D28D9] ${sortBy === 'price-high' ? 'font-bold text-[#6D28D9]' : 'text-slate-600'}`}
                    >
                      Coins: High to Low
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-purple-50 hover:text-[#6D28D9] ${sortBy === 'name' ? 'font-bold text-[#6D28D9]' : 'text-slate-600'}`}
                    >
                      Name: A to Z
                    </button>
                  </div>
                )}
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSortBy('default');
                  showToast('Filters reset to default.');
                }}
                className="bg-white border border-slate-200/80 rounded-xl px-3 sm:px-3.5 py-1.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <FilterIcon size={13} className="text-slate-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* ── 8-REWARDS GRID (4 Columns x 2 Rows) ── */}
          {paginatedRewards.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-2xs my-6">
              <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No rewards found</h3>
              <p className="text-xs text-slate-500 mt-1">Try searching for a different keyword or select another category.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#6D28D9] text-white text-xs font-semibold hover:bg-[#5B21B6] transition-colors"
              >
                View All Rewards
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
              {paginatedRewards.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100/90 p-3 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Card Content Top */}
                  <div>
                    {/* Image Container with 16/10 aspect ratio */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 mb-2.5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
                      />
                    </div>

                    {/* Brand / Category */}
                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1 mb-0.5">
                      {item.brand}
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-[#111827] line-clamp-1 group-hover:text-[#6D28D9] transition-colors">
                      {item.title}
                    </h3>

                    {/* Price Row: Gold Coin [R] + Amount + RP Coins */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-xs border border-amber-300/60 shrink-0 select-none">
                        R
                      </span>
                      <span className="text-sm sm:text-base font-black text-[#0A0A5C]">
                        {item.coins.toLocaleString()}
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                        RP Coins
                      </span>
                    </div>
                  </div>

                  {/* CTA Button: View Reward */}
                  <button
                    type="button"
                    onClick={() => setSelectedReward(item)}
                    className="w-full mt-3 py-2 sm:py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    View Reward
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── PAGINATION BAR ── */}
          <div className="flex items-center justify-center gap-2 pt-3 pb-2 select-none">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
              }`}
            >
              <ChevronLeft size={15} />
            </button>

            {[1, 2, 3].slice(0, Math.max(1, totalPages)).map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5B21B6] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center transition-colors ${
                currentPage >= totalPages
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
              }`}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* ── REWARD DETAILS & REDEEM MODAL ── */}
          {selectedReward && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-[#6D28D9]">{selectedReward.brand}</span>
                    <h2 className="text-lg font-bold text-[#0A0A5C]">{selectedReward.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedReward(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Image */}
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img
                    src={selectedReward.image}
                    alt={selectedReward.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Modal Description & Terms */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <p>{selectedReward.description}</p>
                  <p className="text-[11px] text-slate-400 italic">Terms: {selectedReward.terms}</p>
                </div>

                {/* Coin Calculation Summary */}
                <div className="bg-purple-50/70 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Current RP Coins Balance:</span>
                    <span className="font-bold text-[#0A0A5C]">{userCoins.toLocaleString()} Coins</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Reward Cost:</span>
                    <span className="font-bold text-rose-600">-{selectedReward.coins.toLocaleString()} Coins</span>
                  </div>
                  <div className="border-t border-purple-200/60 pt-1.5 flex items-center justify-between text-xs font-bold text-[#0A0A5C]">
                    <span>Balance After Redemption:</span>
                    <span className="text-[#16A34A]">{(userCoins - selectedReward.coins).toLocaleString()} Coins</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isRedeeming || userCoins < selectedReward.coins}
                    onClick={handleRedeemConfirm}
                    className={`flex-1 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
                      isRedeeming || userCoins < selectedReward.coins
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-[#6D28D9] hover:bg-[#5B21B6]'
                    }`}
                  >
                    {isRedeeming ? 'Redeeming...' : 'Confirm Redemption'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ExploreRewardsPage;
