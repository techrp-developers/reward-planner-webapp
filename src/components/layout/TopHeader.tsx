// src/components/layout/TopHeader.jsx
// Black Theme Executive Header (3-Tier Structure: Row 1 Main Bar, Row 2 Services & Location, Row 3 Sub Categories)
// Row 1: Logo, Search Bar, Profile (Icon + First Name), Cart (Icon Only)
// Row 2: Available Services Chips (Products, Services, Payments) + Location Selector + Coin Balance

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useServiceCart } from '../../context/ServiceCartContext';
import { fetchGlobalSearchSuggestions } from '../../api/productApi';
import LocationModal from './LocationModal';
import AccountMenu from './AccountMenu';
import NotificationsPanel from './NotificationsPanel';
import RPpriceBadge from '../ui/RPpriceBadge';
import rpLogo from '../../assets/rp_logo_crisp.png';
import coinsIcon from '../../assets/home/coinsicon.png';
import userAvatar from '../../assets/home/user-avatar.png';
import AppsIcon from '@mui/icons-material/Apps';
import CircularHeaderNav from './CircularHeaderNav';

// Material UI Icons
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import iconHome from '../../assets/homeicon.png';
import iconProducts from '../../assets/producticon.png';
import iconServices from '../../assets/servicesicon.png';
import iconPayments from '../../assets/paymentsicon.png';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import iconNotification from '../../assets/icon5.png';
import iconProfile from '../../assets/icon6.png';

export const TopHeader = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const { pincode, cityName, selectedAddress, openLocationModal } = useLocation();
  const { serviceCartCount } = useServiceCart();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const isServicesPath = routerLocation.pathname.startsWith('/services');

  // Mobile Navigation Drawer (Hamburger) State

  const displayName = user?.name || user?.full_name || 'Shrinivas Karur';
  const avatarSrc = user?.avatar || user?.userImage || userAvatar || iconProfile;

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

  const rawPoints = user?.rewardPoints ?? user?.wallet_points ?? user?.points ?? user?.steps?.coins;
  const numericPoints = rawPoints == null || rawPoints === '' ? null : Number(rawPoints);
  const coinBalance = numericPoints !== null && Number.isFinite(numericPoints) && numericPoints >= 0
    ? numericPoints.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    : '—';
  const firstName = user?.name ? user.name.trim().split(' ')[0] : (user?.first_name || 'Profile');

  return (
    <>
      {/* Preserved Location Modal for address selection */}
      <LocationModal />


      <header className="sticky top-0 z-40 w-full bg-[#F3F0F5]/95 backdrop-blur-md border-b border-[#E4DCE9]/80 select-none py-3 sm:py-3.5 lg:py-4 px-4 sm:px-8 lg:px-12 antialiased">
        <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Group: [ + / Logo Squircle ] and [ ::: Name Pill ] */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#E4DCE9] flex items-center justify-center shrink-0 shadow-2xs hover:shadow-xs transition-shadow"
              title="Reward Planners Home"
            >
              <img src={rpLogo} alt="RewardPlanners" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full" />
            </Link>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-[#1C0E28] hover:bg-black text-white flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer group shrink-0"
              title="Profile & Settings" aria-label="Profile and settings"
            >
              <AppsIcon sx={{ fontSize: 16 }} className="text-zinc-300 group-hover:text-white" />
              <span className="hidden sm:inline tracking-tight text-white font-medium truncate max-w-[120px]">{displayName}</span>
            </button>
          </div>

          {/* Center Group: 3-Module Circular Carousel Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-[480px] mx-2">
            <CircularHeaderNav
              currentPath={routerLocation.pathname}
              onNavigate={(path) => navigate(path)}
            />
          </div>

          {/* Right Group: Notification with pip & Menu button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isServicesPath && (
              <Link
                to="/services/cart"
                aria-label={`Services cart, ${serviceCartCount} ${serviceCartCount === 1 ? 'item' : 'items'}`}
                title="View Services Cart"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E4DCE9] bg-white text-[#1C0E28] hover:bg-[#ECE7FF] focus-visible:outline-2 focus-visible:outline-[#78538F]"
              >
                <ShoppingCartOutlinedIcon aria-hidden="true" sx={{ fontSize: 22 }} />
                {serviceCartCount > 0 && (
                  <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[10px] font-bold text-white">
                    {serviceCartCount > 99 ? '99+' : serviceCartCount}
                  </span>
                )}
              </Link>
            )}

            <Link to="/profile" aria-label={`Your rewards: ${coinBalance === '—' ? 'balance unavailable' : `${coinBalance} RP Points`}`} title={coinBalance === '—' ? 'Points balance unavailable' : 'View your rewards'} className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3.5 border-r border-[#E4DCE9] text-[#1C0E28] rounded-l-xl focus-visible:outline-2 focus-visible:outline-[#78538F]">
              <img src={coinsIcon} alt="RP Coins" className="hidden sm:block w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0" />
              <span><strong className="block text-xs sm:text-sm font-semibold leading-tight max-w-[96px] truncate">{coinBalance}</strong><span className="block text-[9px] sm:text-[10px] text-[#776B80] mt-0.5 whitespace-nowrap">RP Points</span></span>
            </Link>

            <NotificationsPanel />

            <AccountMenu />
          </div>

        </div>

        {/* Mobile / Tablet scrollable 3-module carousel navigation */}
        <div className="lg:hidden mt-1.5 pt-1.5 border-t border-[#E4DCE9]/60">
          <CircularHeaderNav
            currentPath={routerLocation.pathname}
            onNavigate={(path) => navigate(path)}
            isMobile
          />
        </div>
      </header>
    </>
  );
};

export default TopHeader;
