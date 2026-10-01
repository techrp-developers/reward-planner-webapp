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
import rpLogo from '../../assets/rp_logo_crisp.png';
import userAvatar from '../../assets/home/user-avatar.png';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AppsIcon from '@mui/icons-material/Apps';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  const coinBalance = Number(user?.wallet_points || user?.points || user?.steps?.coins || 2450);
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

  let activeTab = '';
  if (isHomePath) activeTab = 'home';
  else if (isEcommercePath) activeTab = 'products';
  else if (isServicesPath) activeTab = 'services';
  else if (isPaymentPath) activeTab = 'payments';

  return (
    <>
      {/* Preserved Location Modal for address selection */}
      <LocationModal />

      {/* Preserved Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <header className="sticky top-0 z-40 w-full bg-[#EFF2EC]/95 backdrop-blur-md border-b border-[#E2E6DF]/80 select-none py-3.5 px-4 sm:px-6 lg:px-8 xl:px-10 antialiased">
        <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between gap-3">
          
          {/* Left Group: [ + / Logo Squircle ] and [ ::: Name Pill ] */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#4A6443] hover:bg-[#3D5437] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0"
              title="Reward Planners Home"
            >
              <AddRoundedIcon sx={{ fontSize: 24, strokeWidth: 2 }} />
            </Link>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-full bg-[#121815] hover:bg-black text-white flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer group shrink-0"
              title="Profile & Settings"
            >
              <AppsIcon sx={{ fontSize: 16 }} className="text-zinc-300 group-hover:text-white" />
              <span className="tracking-tight text-white font-medium">{displayName}</span>
            </button>
          </div>

          {/* Center Group: Floating Pill Navigation Capsule */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-[500px] mx-2">
            <nav className="bg-white rounded-full p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E6DF]/80 flex items-center gap-1 w-full justify-between">
              <Link
                to="/"
                className={`flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'home'
                    ? 'bg-[#4A6443] text-white shadow-xs'
                    : 'text-[#5F6B5D] hover:text-[#121815] hover:bg-[#F5F7F4]'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/store"
                className={`flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'products'
                    ? 'bg-[#4A6443] text-white shadow-xs'
                    : 'text-[#5F6B5D] hover:text-[#121815] hover:bg-[#F5F7F4]'
                }`}
              >
                Products
              </Link>

              <Link
                to="/services"
                className={`flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'services'
                    ? 'bg-[#4A6443] text-white shadow-xs'
                    : 'text-[#5F6B5D] hover:text-[#121815] hover:bg-[#F5F7F4]'
                }`}
              >
                Services
              </Link>

              <Link
                to="/bbps"
                className={`flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'payments'
                    ? 'bg-[#4A6443] text-white shadow-xs'
                    : 'text-[#5F6B5D] hover:text-[#121815] hover:bg-[#F5F7F4]'
                }`}
              >
                Payments
              </Link>
            </nav>
          </div>

          {/* Right Group: Notification with pip & Menu button */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Notification Bell with Red Pip */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white hover:bg-[#F5F7F4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E2E6DF]/80 flex items-center justify-center cursor-pointer transition-all group shrink-0"
              title="Notifications"
              aria-label="Notifications"
            >
              <NotificationsOutlinedIcon sx={{ fontSize: 21 }} className="text-[#2D3B2E] group-hover:scale-105 transition-transform" />
              <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white absolute top-2.5 right-2.5 shadow-2xs" />
            </button>

            {/* Menu / Hamburger button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white hover:bg-[#F5F7F4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E2E6DF]/80 flex items-center justify-center cursor-pointer transition-all group shrink-0"
              title="Open Navigation Menu"
              aria-label="Menu"
            >
              <MenuRoundedIcon sx={{ fontSize: 22 }} className="text-[#2D3B2E] group-hover:scale-105 transition-transform" />
            </button>
          </div>

        </div>

        {/* Mobile / Tablet scrollable tab bar if on small screen */}
        <div className="md:hidden mt-2.5 pt-2 border-t border-[#E2E6DF]/60">
          <nav className="bg-white rounded-full p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E2E6DF]/80 flex items-center justify-between text-xs font-semibold overflow-x-auto no-scrollbar">
            <Link
              to="/"
              className={`flex-1 text-center py-1.5 px-2.5 rounded-full transition-all ${
                activeTab === 'home'
                  ? 'bg-[#4A6443] text-white shadow-xs'
                  : 'text-[#5F6B5D]'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/store"
              className={`flex-1 text-center py-1.5 px-2.5 rounded-full transition-all ${
                activeTab === 'products'
                  ? 'bg-[#4A6443] text-white shadow-xs'
                  : 'text-[#5F6B5D]'
              }`}
            >
              Products
            </Link>
            <Link
              to="/services"
              className={`flex-1 text-center py-1.5 px-2.5 rounded-full transition-all ${
                activeTab === 'services'
                  ? 'bg-[#4A6443] text-white shadow-xs'
                  : 'text-[#5F6B5D]'
              }`}
            >
              Services
            </Link>
            <Link
              to="/bbps"
              className={`flex-1 text-center py-1.5 px-2.5 rounded-full transition-all ${
                activeTab === 'payments'
                  ? 'bg-[#4A6443] text-white shadow-xs'
                  : 'text-[#5F6B5D]'
              }`}
            >
              Payments
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default TopHeader;
