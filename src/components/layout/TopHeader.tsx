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
import AccountMenu from './AccountMenu';
import NotificationsPanel from './NotificationsPanel';
import RPpriceBadge from '../ui/RPpriceBadge';
import rpLogo from '../../assets/rp_logo_crisp.png';
import pointsCoin from '../../assets/rewards/reward_coins_stack.png';
import userAvatar from '../../assets/home/user-avatar.png';
import AppsIcon from '@mui/icons-material/Apps';

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
  const { totalQuantity, openCartDrawer } = useCart();
  const { serviceCartCount } = useServiceCart();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  // Mobile Navigation Drawer (Hamburger) State

  const displayName = user?.name || user?.full_name || 'Shrinivas Karur';
  const avatarSrc = user?.avatar || user?.userImage || userAvatar || iconProfile;

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

  const rawPoints = user?.rewardPoints ?? user?.wallet_points ?? user?.points ?? user?.steps?.coins;
  const numericPoints = rawPoints == null || rawPoints === '' ? null : Number(rawPoints);
  const coinBalance = numericPoints !== null && Number.isFinite(numericPoints) && numericPoints >= 0
    ? numericPoints.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    : '—';
  const firstName = user?.name ? user.name.trim().split(' ')[0] : (user?.first_name || 'Profile');

  const isEcommercePath =
    routerLocation.pathname.startsWith('/store') ||
    routerLocation.pathname.startsWith('/deals') ||
    routerLocation.pathname.startsWith('/product');

  const isServicesPath =
    routerLocation.pathname.startsWith('/services') ||
    routerLocation.pathname.startsWith('/insurance') ||
    routerLocation.pathname.startsWith('/tax');

  const isPaymentPath =
    routerLocation.pathname.startsWith('/bbps');

  const isHomePath = routerLocation.pathname === '/';

  let activeTab = 'home';
  let activeTabIndex = 0;
  if (isHomePath) {
    activeTab = 'home';
    activeTabIndex = 0;
  } else if (isEcommercePath) {
    activeTab = 'products';
    activeTabIndex = 1;
  } else if (isServicesPath) {
    activeTab = 'services';
    activeTabIndex = 2;
  } else if (isPaymentPath) {
    activeTab = 'payments';
    activeTabIndex = 3;
  }

  return (
    <>
      {/* Preserved Location Modal for address selection */}
      <LocationModal />


      <header className="sticky top-0 z-40 w-full bg-[#F3F0F5]/95 backdrop-blur-md border-b border-[#E4DCE9]/80 select-none py-4 px-4 sm:px-8 lg:px-12 antialiased">
        <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left Group: [ + / Logo Squircle ] and [ ::: Name Pill ] */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-[#E4DCE9] flex items-center justify-center shrink-0"
              title="Reward Planners Home"
            >
              <img src={rpLogo} alt="RewardPlanners" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full" />
            </Link>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="h-10 sm:h-11 px-2 sm:px-4 rounded-full bg-[#1C0E28] hover:bg-black text-white flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer group shrink-0"
              title="Profile & Settings" aria-label="Profile and settings"
            >
              <AppsIcon sx={{ fontSize: 16 }} className="text-zinc-300 group-hover:text-white" />
              <span className="hidden sm:inline tracking-tight text-white font-medium truncate max-w-[120px]">{displayName}</span>
            </button>
          </div>

          {/* Center Group: Floating Pill Navigation Capsule with Sliding Active Pill */}
          <div className="hidden xl:flex items-center justify-center flex-1 max-w-[530px] mx-2">
            <nav className="relative bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-[0_2px_14px_rgba(15,23,42,0.06)] border border-[#E2E8F0] flex items-center w-full justify-between select-none">
              
              {/* Sliding Active Pill Background Indicator */}
              <div
                className="absolute top-1.5 bottom-1.5 rounded-full bg-[#1C0E28] shadow-sm transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                style={{
                  width: 'calc(25% - 4px)',
                  left: `calc(${activeTabIndex * 25}% + 2px)`,
                }}
              />

              {/* 1. Dashboard Tab */}
              <Link
                to="/"
                className={`relative z-10 flex-1 flex items-center justify-center py-2.5 px-3 sm:px-4 rounded-full text-sm sm:text-[15px] font-bold tracking-tight transition-colors duration-200 cursor-pointer ${
                  activeTab === 'home'
                    ? 'text-white font-extrabold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span>Dashboard</span>
              </Link>

              {/* 2. Products Tab */}
              <Link
                to="/store"
                className={`relative z-10 flex-1 flex items-center justify-center py-2.5 px-3 sm:px-4 rounded-full text-sm sm:text-[15px] font-bold tracking-tight transition-colors duration-200 cursor-pointer ${
                  activeTab === 'products'
                    ? 'text-white font-extrabold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span>Products</span>
              </Link>

              {/* 3. Services Tab */}
              <Link
                to="/services"
                className={`relative z-10 flex-1 flex items-center justify-center py-2.5 px-3 sm:px-4 rounded-full text-sm sm:text-[15px] font-bold tracking-tight transition-colors duration-200 cursor-pointer ${
                  activeTab === 'services'
                    ? 'text-white font-extrabold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span>Services</span>
              </Link>

              {/* 4. Payments Tab */}
              <Link
                to="/bbps"
                className={`relative z-10 flex-1 flex items-center justify-center py-2.5 px-3 sm:px-4 rounded-full text-sm sm:text-[15px] font-bold tracking-tight transition-colors duration-200 cursor-pointer ${
                  activeTab === 'payments'
                    ? 'text-white font-extrabold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span>Payments</span>
              </Link>
            </nav>
          </div>

          {/* Right Group: Notification with pip & Menu button */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link to="/rewards" aria-label={`Your rewards: ${coinBalance === '—' ? 'balance unavailable' : `${coinBalance} RP Points`}`} title={coinBalance === '—' ? 'Points balance unavailable' : 'View your rewards'} className="flex items-center gap-2 pr-2 sm:pr-4 border-r border-[#E4DCE9] text-[#1C0E28] rounded-l-xl focus-visible:outline-2 focus-visible:outline-[#78538F]">
              <img src={pointsCoin} alt="" className="hidden sm:block w-8 h-8 object-contain" />
              <span><strong className="block text-xs sm:text-sm font-semibold leading-tight max-w-[96px] truncate">{coinBalance}</strong><span className="block text-[9px] sm:text-[10px] text-[#776B80] mt-1 whitespace-nowrap">RP Points</span></span>
            </Link>
            <NotificationsPanel />


            <AccountMenu />
          </div>

        </div>

        {/* Mobile / Tablet scrollable tab bar if on small screen */}
        <div className="xl:hidden mt-2 pt-2 border-t border-[#E4DCE9]/60">
          <nav className="relative bg-white rounded-full p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E4DCE9]/80 flex items-center justify-between text-xs font-semibold select-none overflow-hidden">
            {/* Sliding Active Pill Background Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-[#1C0E28] shadow-xs transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
              style={{
                width: 'calc(25% - 4px)',
                left: `calc(${activeTabIndex * 25}% + 2px)`,
              }}
            />

            <Link
              to="/"
              className={`relative z-10 flex-1 flex items-center justify-center py-2 px-2 rounded-full transition-colors text-xs sm:text-[13px] font-bold ${
                activeTab === 'home' ? 'text-white font-extrabold' : 'text-[#64748B]'
              }`}
            >
              <span>Dashboard</span>
            </Link>

            <Link
              to="/store"
              className={`relative z-10 flex-1 flex items-center justify-center py-2 px-2 rounded-full transition-colors text-xs sm:text-[13px] font-bold ${
                activeTab === 'products' ? 'text-white font-extrabold' : 'text-[#64748B]'
              }`}
            >
              <span>Products</span>
            </Link>

            <Link
              to="/services"
              className={`relative z-10 flex-1 flex items-center justify-center py-2 px-2 rounded-full transition-colors text-xs sm:text-[13px] font-bold ${
                activeTab === 'services' ? 'text-white font-extrabold' : 'text-[#64748B]'
              }`}
            >
              <span>Services</span>
            </Link>

            <Link
              to="/bbps"
              className={`relative z-10 flex-1 flex items-center justify-center py-2 px-2 rounded-full transition-colors text-xs sm:text-[13px] font-bold ${
                activeTab === 'payments' ? 'text-white font-extrabold' : 'text-[#64748B]'
              }`}
            >
              <span>Payments</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default TopHeader;
