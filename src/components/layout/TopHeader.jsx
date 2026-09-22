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
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CloseIcon from '@mui/icons-material/Close';
import userAvatar from '../../assets/home/user-avatar.png';

export const TopHeader = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const { pincode, cityName, selectedAddress, openLocationModal } = useLocation();
  const { totalQuantity, openCartDrawer } = useCart();
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

      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] antialiased select-none">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Left: Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-1.5 -ml-1 text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors md:hidden flex items-center justify-center shrink-0 cursor-pointer"
            >
              <MenuIcon sx={{ fontSize: 24 }} />
            </button>

            <Link to="/" className="flex items-center gap-2.5 text-decoration-none shrink-0 group">
              <img
                src={rpLogo}
                alt="Reward Planners"
                className="h-9.5 w-auto max-h-[40px] object-contain group-hover:scale-105 transition-transform shrink-0"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <div className="flex flex-col text-left leading-none tracking-tight">
                <span className="font-extrabold text-[#090D42] text-[15px] sm:text-base leading-tight">
                  Reward
                </span>
                <span className="font-extrabold text-[#090D42] text-[15px] sm:text-base leading-tight">
                  Planners
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clean Nav Pills (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-2.5">
            <Link
              to="/"
              className={`px-5.5 py-2 rounded-full text-[15px] sm:text-base transition-all ${
                activeTab === 'home'
                  ? 'font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE] shadow-xs'
                  : 'font-semibold text-slate-800 hover:text-[#6D28D9] hover:bg-purple-50/70 border border-transparent'
              }`}
            >
              Home
            </Link>
            <Link
              to="/store"
              className={`px-5.5 py-2 rounded-full text-[15px] sm:text-base transition-all ${
                activeTab === 'products'
                  ? 'font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE] shadow-xs'
                  : 'font-semibold text-slate-800 hover:text-[#6D28D9] hover:bg-purple-50/70 border border-transparent'
              }`}
            >
              Products
            </Link>
            <Link
              to="/services"
              className={`px-5.5 py-2 rounded-full text-[15px] sm:text-base transition-all ${
                activeTab === 'services'
                  ? 'font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE] shadow-xs'
                  : 'font-semibold text-slate-800 hover:text-[#6D28D9] hover:bg-purple-50/70 border border-transparent'
              }`}
            >
              Services
            </Link>
            <Link
              to="/bbps"
              className={`px-5.5 py-2 rounded-full text-[15px] sm:text-base transition-all ${
                activeTab === 'payments'
                  ? 'font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE] shadow-xs'
                  : 'font-semibold text-slate-800 hover:text-[#6D28D9] hover:bg-purple-50/70 border border-transparent'
              }`}
            >
              Payments
            </Link>
          </nav>

          {/* Right: Notification Bell + User Avatar (Cart icon removed per request) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="relative p-2 rounded-full text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 23 }} />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                2
              </span>
            </button>

            {/* Profile Avatar */}
            <Link
              to="/profile"
              className="flex items-center justify-center cursor-pointer ml-1 group"
              title="My Profile"
            >
              <img
                src={userAvatar}
                alt="Profile"
                className="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-purple-200/90 group-hover:ring-purple-500 transition-all shadow-xs"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopHeader;
