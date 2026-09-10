// src/components/layout/TopHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { fetchGlobalSearchSuggestions } from '../../api/productApi';
import LocationModal from './LocationModal';
import RPpriceBadge from '../ui/RPpriceBadge';
import rpLogo from '../../assets/rp_logo.svg';

// Material UI Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const TopHeader = () => {
  const { user, isAuthenticated, logout, openAuth } = useAuth();
  const { pincode, cityName, openLocationModal } = useLocation();
  const { totalQuantity, openCartDrawer } = useCart();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [suggestions, setSuggestions] = useState({ products: [], services: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // User State
  const [showCoinsTooltip, setShowCoinsTooltip] = useState(false);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions({ products: [], services: [] });
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const data = await fetchGlobalSearchSuggestions(searchQuery.trim(), controller.signal);
        setSuggestions(data);
      } catch {
        // Ignored if cancelled
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const coinBalance = Number(user?.wallet_points || user?.points || user?.steps?.coins || 2450);
  const userName = user?.name || user?.first_name || 'Sign In';

  return (
    <>
      {/* GLOSSY HEADER USING APP BASE COLORS #FC8BAD AND #A654CD */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#FC8BAD] via-[#c86bc1] to-[#A654CD] text-white shadow-md overflow-visible">
        {/* Glossy top reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/22 via-transparent to-black/8 pointer-events-none" />

        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 h-[68px] flex items-center justify-between gap-4 relative z-10">
          {/* 1. BRAND & LOGO */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
              <img
                src={rpLogo}
                alt="Reward Planners Logo"
                className="ml-1 sm:ml-2 h-8 sm:h-9 w-auto max-h-[38px] object-contain group-hover:scale-105 transition-transform drop-shadow-sm shrink-0"
              />
              <span className="font-extrabold text-base sm:text-lg text-white leading-tight tracking-tight drop-shadow-xs">
                Reward<span className="text-yellow-200">Planners</span>
              </span>
            </Link>
          </div>

          {/* 2. AMAZON-STYLE LOCATION SELECTOR */}
          <button
            type="button"
            onClick={openLocationModal}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-xs transition-all cursor-pointer text-left shrink-0 text-white"
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 20 }} className="text-white shrink-0" />
            <div className="text-xs">
              <span className="text-white/80 block text-[10px] leading-tight font-medium">
                Deliver to {isAuthenticated ? (user?.name?.split(' ')[0] || 'You') : 'Location'}
              </span>
              <span className="font-bold text-white flex items-center gap-0.5 leading-tight">
                {cityName} {pincode}
                <KeyboardArrowDownIcon sx={{ fontSize: 15 }} className="text-white/80" />
              </span>
            </div>
          </button>

          {/* 3. FULL-WIDTH OMNIBAR SEARCH */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl mx-2">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center h-10.5 rounded-xl border-2 border-white/40 focus-within:border-white bg-white/95 backdrop-blur-md overflow-hidden transition-all shadow-md"
            >
              {/* Category dropdown selector */}
              <div className="hidden sm:flex items-center pl-3 pr-2 h-full bg-gray-100 text-xs font-semibold text-gray-700 border-r border-gray-200 shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Categories</option>
                  <option value="Products">Products</option>
                  <option value="Services">Services</option>
                  <option value="BBPS">Bill Pay</option>
                </select>
              </div>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, services, utilities, deals... (⌘K)"
                className="w-full px-3 text-sm bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
              />

              {/* Search action button */}
              <button
                type="submit"
                className="h-full px-4 text-white flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 shrink-0 bg-gradient-to-r from-[#A654CD] to-[#8E3DB5]"
              >
                <SearchIcon sx={{ fontSize: 19 }} />
              </button>
            </form>

            {/* SUGGESTIONS FLYOUT */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-12 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-400">Searching catalog...</div>
                ) : suggestions.products.length === 0 && suggestions.services.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No instant matches found for "{searchQuery}". Press Enter to see all results.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 p-2">
                    {/* Products matches */}
                    <div className="p-2">
                      <div className="text-[11px] font-bold uppercase text-gray-400 px-2 mb-2 flex items-center gap-1.5">
                        <Inventory2OutlinedIcon sx={{ fontSize: 15 }} className="text-[#5F341A]" />
                        Matching Products
                      </div>
                      <div className="space-y-1">
                        {suggestions.products.slice(0, 5).map((prod) => (
                          <Link
                            key={prod.id}
                            to={`/product/${prod.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <img
                              src={prod.image || '/placeholder.png'}
                              alt=""
                              className="w-8 h-8 rounded-md object-cover border border-gray-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{prod.title}</p>
                              <span className="text-[10px] text-gray-500 font-medium">In Products</span>
                            </div>
                            <RPpriceBadge value={prod.price || 499} />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Services matches */}
                    <div className="p-2">
                      <div className="text-[11px] font-bold uppercase text-gray-400 px-2 mb-2 flex items-center gap-1.5">
                        <ShieldOutlinedIcon sx={{ fontSize: 15 }} className="text-[#4F6BFF]" />
                        Matching Services & Bills
                      </div>
                      <div className="space-y-1">
                        {suggestions.services.slice(0, 5).map((srv) => (
                          <Link
                            key={srv.id}
                            to={`/services/${srv.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{srv.title}</p>
                              <span className="text-[10px] text-gray-500">Service & Consultations</span>
                            </div>
                            <ArrowForwardIcon sx={{ fontSize: 15 }} className="text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. USER UTILITIES (COINS, NOTIFICATIONS, ACCOUNT, CART) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* RP Coins Wallet Pill */}
            <div
              className="relative"
              onMouseEnter={() => setShowCoinsTooltip(true)}
              onMouseLeave={() => setShowCoinsTooltip(false)}
            >
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/35 bg-white/20 backdrop-blur-md shadow-xs transition-transform hover:scale-105 cursor-pointer text-decoration-none hover:bg-white/30 text-white"
              >
                <MonetizationOnIcon sx={{ fontSize: 18 }} className="text-yellow-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-white">
                    {coinBalance.toLocaleString('en-IN')}
                  </span>
                  <span className="hidden xl:inline text-[11px] font-bold text-yellow-100">
                    RP Coins
                  </span>
                </div>
              </Link>

              {/* Coins Flyout Tooltip */}
              {showCoinsTooltip && (
                <div className="absolute right-0 top-10 w-64 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 p-3 z-50 text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-gray-700">Rewards Balance</span>
                    <span className="font-extrabold text-[#A654CD]">{coinBalance} Coins</span>
                  </div>
                  <p className="text-[11px] text-gray-500 my-2">
                    Worth <strong className="text-emerald-700">₹{coinBalance}</strong> against purchases, service bookings, and utility bill discounts.
                  </p>
                  <Link
                    to="/wallet"
                    className="block text-center w-full py-1.5 rounded-md font-bold text-white text-xs bg-gradient-to-r from-[#FC8BAD] to-[#A654CD]"
                  >
                    View Coin Statement
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-white hover:bg-white/15 transition-colors"
              title="Notifications"
            >
              <NotificationsOutlinedIcon sx={{ fontSize: 22 }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-300 ring-2 ring-white/30" />
            </Link>

            {/* User Account Link - Navigates directly to /profile without popup */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/20 border border-white/20 backdrop-blur-xs transition-all cursor-pointer text-white text-decoration-none group"
                title="View My Profile"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#A654CD] flex items-center justify-center text-xs font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left text-xs">
                  <span className="text-[10px] text-white/80 font-medium leading-none">Hello,</span>
                  <span className="font-bold text-white line-clamp-1 max-w-[110px] leading-tight mt-0.5">
                    {userName}
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/35 backdrop-blur-md text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-103"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 19 }} />
              <span className="hidden sm:inline">Cart</span>
              {totalQuantity > 0 && (
                <span className="bg-amber-400 text-amber-950 font-extrabold text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal />
    </>
  );
};

export default TopHeader;
