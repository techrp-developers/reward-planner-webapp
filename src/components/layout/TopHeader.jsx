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
import iconHome from '../../assets/icon1.png';
import iconProducts from '../../assets/icon2.png';
import iconServices from '../../assets/icon3.png';
import iconPayments from '../../assets/icon4.png';
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

          {/* Center: Clean Nav Links with Icons & Active Indicator (Mockup Parity) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3">
            <Link
              to="/"
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] sm:text-base transition-all group ${
                activeTab === 'home'
                  ? 'font-bold text-[#6D28D9]'
                  : 'font-semibold text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/60'
              }`}
            >
              <img
                src={iconHome}
                alt="Home"
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 object-contain mix-blend-multiply shrink-0 group-hover:scale-110 transition-transform"
              />
              <span>Home</span>
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#7C3AED] rounded-full shadow-xs" />
              )}
            </Link>

            <Link
              to="/store"
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] sm:text-base transition-all group ${
                activeTab === 'products'
                  ? 'font-bold text-[#6D28D9]'
                  : 'font-semibold text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/60'
              }`}
            >
              <img
                src={iconProducts}
                alt="Products"
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 object-contain mix-blend-multiply shrink-0 group-hover:scale-110 transition-transform"
              />
              <span>Products</span>
              {activeTab === 'products' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#7C3AED] rounded-full shadow-xs" />
              )}
            </Link>

            <Link
              to="/services"
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] sm:text-base transition-all group ${
                activeTab === 'services'
                  ? 'font-bold text-[#6D28D9]'
                  : 'font-semibold text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/60'
              }`}
            >
              <img
                src={iconServices}
                alt="Services"
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 object-contain mix-blend-multiply shrink-0 group-hover:scale-110 transition-transform"
              />
              <span>Services</span>
              {activeTab === 'services' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#7C3AED] rounded-full shadow-xs" />
              )}
            </Link>

            <Link
              to="/bbps"
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] sm:text-base transition-all group ${
                activeTab === 'payments'
                  ? 'font-bold text-[#6D28D9]'
                  : 'font-semibold text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/60'
              }`}
            >
              <img
                src={iconPayments}
                alt="Payments"
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 object-contain mix-blend-multiply shrink-0 group-hover:scale-110 transition-transform"
              />
              <span>Payments</span>
              {activeTab === 'payments' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#7C3AED] rounded-full shadow-xs" />
              )}
            </Link>
          </nav>

          {/* Right: 3D Notification Bell + 3D User Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* 3D Notification Bell with Badge 3 */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="relative p-1 rounded-full text-slate-700 hover:opacity-90 transition-all cursor-pointer group"
              title="Notifications"
              aria-label="Notifications"
            >
              <img
                src={iconNotification}
                alt="Notifications"
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 object-contain group-hover:scale-110 transition-transform"
              />
            </button>

            {/* 3D Profile Avatar */}
            <Link
              to="/profile"
              className="flex items-center justify-center cursor-pointer group ml-0.5"
              title="My Profile"
            >
              <img
                src={iconProfile}
                alt="Profile"
                className="w-9 h-9 sm:w-9.5 sm:h-9.5 object-contain group-hover:scale-110 transition-transform"
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopHeader;
