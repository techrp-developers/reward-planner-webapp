// src/components/layout/TopHeader.jsx
// Black Theme Executive Header (3-Tier Structure: Row 1 Main Bar, Row 2 Services & Location, Row 3 Sub Categories)
// Row 1: Logo, Search Bar, Profile (Icon + First Name), Cart (Icon Only)
// Row 2: Available Services Chips (Products, Services, Payments) + Location Selector + Coin Balance

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useServiceCart } from '../../context/ServiceCartContext';
import { fetchGlobalSearchSuggestions } from '../../api/productApi';
import LocationModal from './LocationModal';
import MobileNavDrawer from './MobileNavDrawer';
import RPpriceBadge from '../ui/RPpriceBadge';
import rpLogo from '../../assets/rplogo_nobg.svg';

// Material UI Icons
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

export const TopHeader = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const { pincode, cityName, selectedAddress, openLocationModal } = useLocation();
  const { totalQuantity } = useCart();
  const { serviceCartCount } = useServiceCart();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  // Mobile Navigation Drawer (Hamburger) State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isServicePath =
    routerLocation.pathname.startsWith('/services') ||
    routerLocation.pathname === '/insurance' ||
    routerLocation.pathname === '/tax';

  const cartBadgeCount = isServicePath ? serviceCartCount : (totalQuantity > 0 ? totalQuantity : serviceCartCount);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [suggestions, setSuggestions] = useState({ products: [], services: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Coins Tooltip State
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
  const firstName = user?.name ? user.name.trim().split(' ')[0] : (user?.first_name || 'Profile');

  return (
    <>
      <header className="sticky top-0 z-40 w-full select-none relative shadow-md">
        {/* ========================================================================= */}
        {/* ROW 1: BRAND LOGO, SEARCH BAR, PROFILE (ICON+NAME), CART (ICON ONLY)     */}
        {/* GLOSSY CUSTOM THEME: #180d26 + #8b3ab5 with radial glows and reflection   */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#180d26] text-white relative z-30 border-b border-white/10">
          {/* Isolated background sheen with overflow-hidden */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Radial gradient ambient glows from the custom theme */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(168,85,247,0.42),transparent_38%),radial-gradient(circle_at_88%_85%,rgba(252,63,120,0.32),transparent_42%)]" />

            {/* Subtle micro-grid overlay */}
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:36px_36px]" />

            {/* Glossy top reflection sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" />
          </div>

          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6 relative z-10">
            {/* 1. BRAND & LOGO WITH HAMBURGER BUTTON ON MOBILE/TABLET */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                data-testid="hamburger-menu-btn"
                aria-label="Open Navigation Menu"
                className="p-1 sm:p-1.5 -ml-1 text-white hover:text-purple-200 hover:bg-white/10 rounded-xl transition-colors lg:hidden flex items-center justify-center shrink-0 cursor-pointer"
                title="All Categories & Services"
              >
                <MenuIcon sx={{ fontSize: 26 }} />
              </button>

              <Link to="/" className="flex items-center gap-2 text-decoration-none group shrink-0">
                <img
                  src={rpLogo}
                  alt="Reward Planners Logo"
                  className="h-8.5 w-8.5 sm:h-11 sm:w-11 max-h-[44px] object-contain group-hover:scale-105 transition-transform drop-shadow-md shrink-0"
                />
                <span className="font-extrabold text-base sm:text-lg leading-tight tracking-tight drop-shadow-xs">
                  <span className="text-[#FC8BAD]">Reward</span><span className="text-[#F8A926]">Planners</span>
                </span>
              </Link>
            </div>

            {/* 2. OMNIBAR SEARCH BAR (Desktop & Tablet: sm+ screens, inline in Row 1) */}
            <div ref={searchContainerRef} className="hidden sm:block relative z-50 ml-auto w-full max-w-lg md:max-w-xl lg:max-w-2xl mr-2 sm:mr-3">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center h-10.5 rounded-xl border border-white/20 focus-within:border-purple-400 bg-white/95 backdrop-blur-md overflow-hidden transition-all shadow-inner focus-within:bg-white"
              >
                {/* Category Dropdown */}
                <div className="hidden sm:flex items-center pl-3 pr-2 h-full bg-purple-50/70 text-[13.5px] font-semibold text-slate-700 border-r border-purple-100 shrink-0">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-transparent border-none outline-none cursor-pointer pr-1 text-slate-700 text-[13.5px]"
                  >
                    <option value="All" className="bg-white text-slate-900 text-[13.5px]">All Categories</option>
                    <option value="Products" className="bg-white text-slate-900 text-[13.5px]">Products</option>
                    <option value="Services" className="bg-white text-slate-900 text-[13.5px]">Services</option>
                    <option value="BBPS" className="bg-white text-slate-900 text-[13.5px]">Bill Pay</option>
                  </select>
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Search products, services, utilities, deals..."
                  className="w-full px-3 text-[13.5px] bg-transparent text-slate-900 placeholder-slate-400 outline-none font-medium"
                />

                {/* Clear search button if query present */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer shrink-0"
                    aria-label="Clear search"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </button>
                )}

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="h-full px-4 text-white flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 shrink-0 bg-gradient-to-r from-[#8b3ab5] to-[#a855f7]"
                  aria-label="Search"
                >
                  <SearchIcon sx={{ fontSize: 19 }} />
                </button>
              </form>

              {/* SEARCH SUGGESTIONS FLYOUT */}
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-12 bg-white text-slate-900 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.38)] border border-purple-200 z-[100] overflow-hidden max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-slate-500">Searching catalog...</div>
                  ) : suggestions.products.length === 0 && suggestions.services.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No instant matches found for "{searchQuery}". Press Enter to see all results.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-purple-100 p-2">
                      {/* Products matches */}
                      <div className="p-2">
                        <div className="text-[11px] font-bold uppercase text-purple-600 px-2 mb-2 flex items-center gap-1.5">
                          <Inventory2OutlinedIcon sx={{ fontSize: 15 }} className="text-[#8b3ab5]" />
                          Matching Products
                        </div>
                        <div className="space-y-1">
                          {suggestions.products.slice(0, 5).map((prod) => (
                            <Link
                              key={prod.id}
                              to={`/product/${prod.id}`}
                              onClick={() => setShowSuggestions(false)}
                              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-purple-50/60 transition-colors"
                            >
                              <img
                                src={prod.image || '/placeholder.png'}
                                alt=""
                                className="w-8 h-8 rounded-md object-cover border border-purple-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{prod.title}</p>
                                <span className="text-[10px] text-slate-500 font-medium">In Products</span>
                              </div>
                              <RPpriceBadge value={prod.price || 499} />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Services matches */}
                      <div className="p-2">
                        <div className="text-[11px] font-bold uppercase text-purple-600 px-2 mb-2 flex items-center gap-1.5">
                          <ShieldOutlinedIcon sx={{ fontSize: 15 }} className="text-[#8b3ab5]" />
                          Matching Services & Bills
                        </div>
                        <div className="space-y-1">
                          {suggestions.services.slice(0, 5).map((srv) => (
                            <Link
                              key={srv.id}
                              to={`/services/detail/${srv.id}`}
                              onClick={() => setShowSuggestions(false)}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50/60 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{srv.title}</p>
                                <span className="text-[10px] text-slate-500">Service & Consultations</span>
                              </div>
                              <ArrowForwardIcon sx={{ fontSize: 15 }} className="text-slate-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. PROFILE & CART UTILITIES (WHITE BACKGROUND WITH BLACK ICONS & TEXT) */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Profile Link (Profile Icon + First Name) */}
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 h-9 sm:h-10.5 rounded-xl bg-white hover:bg-slate-100 border border-white/90 transition-all cursor-pointer text-black text-decoration-none shrink-0 group shadow-xs hover:scale-102"
                  title="My Profile"
                >
                  <PersonOutlinedIcon sx={{ fontSize: 19 }} className="text-black group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs sm:text-[13.5px] text-black tracking-tight max-w-[70px] sm:max-w-none truncate">
                    {firstName}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openAuth}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 h-9 sm:h-10.5 rounded-xl bg-white hover:bg-slate-100 border border-white/90 transition-all cursor-pointer text-black text-xs sm:text-[13.5px] font-bold shadow-xs hover:scale-102"
                >
                  <PersonOutlinedIcon sx={{ fontSize: 19 }} className="text-black" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Shopping / Services Cart Button (WHITE BACKGROUND WITH BLACK CART ICON) */}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    isServicePath
                      ? '/services/cart'
                      : totalQuantity > 0
                      ? '/cart'
                      : serviceCartCount > 0
                      ? '/services/cart'
                      : '/cart'
                  )
                }
                className="relative w-9 h-9 sm:w-10.5 sm:h-10.5 rounded-xl bg-white hover:bg-slate-100 border border-white/90 text-black transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs hover:scale-105"
                title={isServicePath ? 'Services Cart' : 'Shopping Cart'}
                aria-label={isServicePath ? 'Services Cart' : 'Shopping Cart'}
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} className="text-black" />
                {cartBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#fc3f78] to-[#8b3ab5] text-white font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {cartBadgeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* DEDICATED MOBILE SEARCH BAR (< sm screens) */}
          <div className="block sm:hidden w-full px-3 py-2 bg-[#180d26] border-t border-white/10 relative z-30">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center h-10 rounded-xl border border-white/20 focus-within:border-purple-400 bg-white/95 backdrop-blur-md overflow-hidden transition-all shadow-inner focus-within:bg-white"
            >
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Search products, services, bills, deals..."
                className="w-full px-3 text-xs bg-transparent text-slate-900 placeholder-slate-400 outline-none font-medium"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer shrink-0"
                  aria-label="Clear search"
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </button>
              )}

              <button
                type="submit"
                className="h-full px-3.5 text-white flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 shrink-0 bg-gradient-to-r from-[#8b3ab5] to-[#a855f7]"
                aria-label="Search"
              >
                <SearchIcon sx={{ fontSize: 18 }} />
              </button>
            </form>

            {/* Mobile Suggestions Flyout */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute left-3 right-3 top-13 bg-white text-slate-900 rounded-2xl shadow-2xl border border-purple-200 z-[100] overflow-hidden max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500">Searching catalog...</div>
                ) : suggestions.products.length === 0 && suggestions.services.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No instant matches found for "{searchQuery}". Press Enter to see all results.
                  </div>
                ) : (
                  <div className="divide-y divide-purple-100 p-2">
                    {suggestions.products.length > 0 && (
                      <div className="p-1">
                        <div className="text-[10px] font-bold uppercase text-purple-600 px-2 mb-1.5 flex items-center gap-1.5">
                          <Inventory2OutlinedIcon sx={{ fontSize: 14 }} className="text-[#8b3ab5]" />
                          Matching Products
                        </div>
                        <div className="space-y-1">
                          {suggestions.products.slice(0, 4).map((prod) => (
                            <Link
                              key={prod.id}
                              to={`/product/${prod.id}`}
                              onClick={() => setShowSuggestions(false)}
                              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-50/60 transition-colors"
                            >
                              <img
                                src={prod.image || '/placeholder.png'}
                                alt=""
                                className="w-7 h-7 rounded-md object-cover border border-purple-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{prod.title}</p>
                              </div>
                              <RPpriceBadge value={prod.price || 499} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {suggestions.services.length > 0 && (
                      <div className="p-1">
                        <div className="text-[10px] font-bold uppercase text-purple-600 px-2 mb-1.5 flex items-center gap-1.5">
                          <ShieldOutlinedIcon sx={{ fontSize: 14 }} className="text-[#8b3ab5]" />
                          Matching Services & Bills
                        </div>
                        <div className="space-y-1">
                          {suggestions.services.slice(0, 4).map((srv) => (
                            <Link
                              key={srv.id}
                              to={`/services/detail/${srv.id}`}
                              onClick={() => setShowSuggestions(false)}
                              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50/60 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{srv.title}</p>
                              </div>
                              <ArrowForwardIcon sx={{ fontSize: 14 }} className="text-slate-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: AVAILABLE SERVICES CHIPS (PRODUCTS, SERVICES, PAYMENTS) + LOCATION */}
        {/* GLOSSY CUSTOM THEME: #180d26 matching Header Top Bar                      */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#180d26] text-white relative z-10 overflow-hidden border-b border-white/10 py-1.5 shadow-xs">
          {/* Subtle radial ambient glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(168,85,247,0.22),transparent_45%),radial-gradient(circle_at_82%_50%,rgba(252,63,120,0.18),transparent_45%)]" />

          {/* Subtle micro-grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:36px_36px]" />

          {/* Glossy top reflection sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15" />

          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-8 flex items-center overflow-x-auto no-scrollbar relative z-10">
            <div className="flex items-center justify-between w-full min-w-max gap-2.5 sm:gap-4 py-0.5">
              {/* Left: Services Chips (Products, Services, Payments) */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Products Chip */}
                <Link
                  to="/store"
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 h-8.5 sm:h-9.5 rounded-xl text-xs sm:text-[13.5px] font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 shadow-xs ${
                    routerLocation.pathname.startsWith('/store') || routerLocation.pathname.startsWith('/product')
                      ? 'bg-white text-black border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.45)]'
                      : 'bg-white hover:bg-slate-100 text-black border border-white/90 shadow-xs'
                  }`}
                >
                  <ShoppingBagOutlinedIcon sx={{ fontSize: 16 }} className="text-black" />
                  <span className="text-black">Products</span>
                </Link>

                {/* Services Chip */}
                <Link
                  to="/services"
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 h-8.5 sm:h-9.5 rounded-xl text-xs sm:text-[13.5px] font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 shadow-xs ${
                    routerLocation.pathname.startsWith('/services')
                      ? 'bg-white text-black border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.45)]'
                      : 'bg-white hover:bg-slate-100 text-black border border-white/90 shadow-xs'
                  }`}
                >
                  <BuildOutlinedIcon sx={{ fontSize: 16 }} className="text-black" />
                  <span className="text-black">Services</span>
                </Link>

                {/* Payments Chip */}
                <Link
                  to="/bbps"
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 h-8.5 sm:h-9.5 rounded-xl text-xs sm:text-[13.5px] font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 shadow-xs ${
                    routerLocation.pathname.startsWith('/bbps')
                      ? 'bg-white text-black border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.45)]'
                      : 'bg-white hover:bg-slate-100 text-black border border-white/90 shadow-xs'
                  }`}
                >
                  <BoltOutlinedIcon sx={{ fontSize: 16 }} className="text-black" />
                  <span className="text-black">Payments</span>
                </Link>
              </div>

              {/* Right: Location & RP Coins (Positioned at the end of Row 2) */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Location Selector Chip */}
                <button
                  type="button"
                  data-testid="header-location-btn"
                  onClick={openLocationModal}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 h-8.5 sm:h-9.5 rounded-xl bg-white hover:bg-slate-100 border border-white/90 text-black shadow-xs transition-all cursor-pointer shrink-0 hover:scale-102"
                >
                  <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-[#fc3f78] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-medium text-slate-600 hidden md:inline">
                    Deliver to {isAuthenticated ? (selectedAddress?.contact_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'You') : 'Location'}:
                  </span>
                  <span className="text-xs sm:text-[13.5px] font-bold text-black flex items-center gap-0.5">
                    {cityName} {pincode}
                    <KeyboardArrowDownIcon sx={{ fontSize: 15 }} className="text-slate-700" />
                  </span>
                </button>

                {/* RP Coins Wallet Chip */}
                {isAuthenticated && (
                  <div
                    className="relative shrink-0"
                    onMouseEnter={() => setShowCoinsTooltip(true)}
                    onMouseLeave={() => setShowCoinsTooltip(false)}
                  >
                    <Link
                      to="/wallet"
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 h-8.5 sm:h-9.5 rounded-xl bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] hover:opacity-95 border border-white/30 text-white transition-all text-xs sm:text-[13.5px] font-bold cursor-pointer text-decoration-none shadow-xs backdrop-blur-md hover:scale-102 shrink-0"
                    >
                      <MonetizationOnIcon sx={{ fontSize: 16 }} className="text-amber-200" />
                      <span className="font-bold text-white tracking-tight">{coinBalance.toLocaleString('en-IN')} RP Coins</span>
                    </Link>

                  {/* Coins Flyout Tooltip */}
                  {showCoinsTooltip && (
                    <div className="absolute right-0 top-11 w-64 bg-[#1e1030] text-white rounded-xl shadow-2xl border border-white/15 p-3 z-50 text-xs animate-fade-in backdrop-blur-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="font-bold text-purple-100">Rewards Balance</span>
                        <span className="font-extrabold text-amber-300">{coinBalance} Coins</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 my-2">
                        Worth <strong className="text-emerald-400">₹{coinBalance}</strong> against purchases, service bookings, and utility bill discounts.
                      </p>
                      <Link
                        to="/wallet"
                        className="block text-center w-full py-1.5 rounded-lg font-bold text-white text-xs bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-90 transition-opacity shadow-xs"
                      >
                        View Coin Statement
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Location Modal */}
    <LocationModal />

    {/* Mobile Navigation Drawer (Hamburger Menu with Services & Sub Categories) */}
    <MobileNavDrawer
      isOpen={isMobileNavOpen}
      onClose={() => setIsMobileNavOpen(false)}
    />
    </>
  );
};

export default TopHeader;
