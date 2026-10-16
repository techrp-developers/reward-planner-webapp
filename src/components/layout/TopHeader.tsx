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
import mpsLogo from '../../assets/mps_logo.svg';
import coinsIcon from '../../assets/home/coinsicon.png';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CircularHeaderNav from './CircularHeaderNav';
import { IMAGE_BASE_URL } from '../../api/endpoints';

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

export const TopHeader = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const { pincode, cityName, selectedAddress, openLocationModal } = useLocation();
  const { serviceCartCount } = useServiceCart();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const isServicesPath = routerLocation.pathname.startsWith('/services');

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

  // Active User Company Info and Logo Resolution
  const [companyLogoFailed, setCompanyLogoFailed] = useState(false);
  const rawCompanyLogo =
    user?.company?.logo ||
    user?.company?.logo_url ||
    user?.company?.image ||
    user?.company_logo ||
    user?.companyLogo ||
    user?.employeeInfo?.company_logo ||
    user?.employeeInfo?.company?.logo ||
    user?.employer?.logo;

  const companyName =
    user?.company?.name ||
    user?.company_name ||
    (typeof user?.company === 'string' ? user?.company : '') ||
    user?.employeeInfo?.company ||
    user?.employer?.name ||
    'MPS Global';

  const companyLogoSrc = React.useMemo(() => {
    if (rawCompanyLogo && typeof rawCompanyLogo === 'string' && rawCompanyLogo.trim()) {
      const clean = rawCompanyLogo.trim();
      if (/^https?:\/\//i.test(clean)) return clean;
      return `${IMAGE_BASE_URL}/${encodeURI(clean.replace(/^\/+/, ''))}`;
    }
    if (/mps/i.test(companyName)) {
      return mpsLogo;
    }
    return null;
  }, [rawCompanyLogo, companyName]);

  useEffect(() => {
    setCompanyLogoFailed(false);
  }, [companyLogoSrc]);

  return (
    <>
      {/* Preserved Location Modal for address selection */}
      <LocationModal />


      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E4DCE9]/80 select-none py-2.5 sm:py-3.5 lg:py-3.5 px-2 sm:px-2.5 lg:px-3 antialiased">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3.5 relative">
          
          {/* Left Group: Active User's Company Logo Chip (in left corner) */}
          <div className="flex items-center shrink-0 z-10">
            <Link
              to="/profile"
              aria-label={`Company: ${companyName}`}
              title={`Company: ${companyName}`}
              className="flex items-center gap-2 sm:gap-2.5 h-10 sm:h-11 lg:h-[46px] px-3 sm:px-3.5 lg:px-4 rounded-full bg-white hover:bg-[#F6F2F8] border border-[#E2E8F0] text-[#1C0E28] shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-xs transition-all shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#78538F]"
            >
              {companyLogoSrc && !companyLogoFailed ? (
                <img
                  src={companyLogoSrc}
                  alt={`${companyName} Logo`}
                  onError={() => setCompanyLogoFailed(true)}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7.5 lg:h-7.5 object-contain rounded-xs shrink-0"
                />
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7.5 lg:h-7.5 rounded-full bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                  <BusinessOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
              )}
              <span className="text-xs sm:text-[13px] lg:text-sm font-bold text-[#1C0E28] max-w-[120px] sm:max-w-[150px] lg:max-w-[170px] truncate leading-tight">
                {companyName}
              </span>
            </Link>
          </div>

          {/* Center Group: Modules Navigation (Centered in Desktop Header) */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-10 w-[520px] xl:w-[550px]">
            <CircularHeaderNav
              currentPath={routerLocation.pathname}
              onNavigate={(path) => navigate(path)}
            />
          </div>

          {/* Right Group: RP Coins + Notifications + Menu + RP Logo Circle (in right corner) */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0 z-10">
            {isServicesPath && (
              <Link
                to="/services/cart"
                aria-label={`Services cart, ${serviceCartCount} ${serviceCartCount === 1 ? 'item' : 'items'}`}
                title="View Services Cart"
                className="relative flex h-9.5 w-9.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-[#E4DCE9] bg-white text-[#1C0E28] hover:bg-[#ECE7FF] focus-visible:outline-2 focus-visible:outline-[#78538F]"
              >
                <ShoppingCartOutlinedIcon aria-hidden="true" sx={{ fontSize: 20 }} />
                {serviceCartCount > 0 && (
                  <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[9px] font-bold text-white">
                    {serviceCartCount > 99 ? '99+' : serviceCartCount}
                  </span>
                )}
              </Link>
            )}

            {/* RP Coins */}
            <Link to="/profile" aria-label={`Your rewards: ${coinBalance === '—' ? 'balance unavailable' : `${coinBalance} RP Points`}`} title={coinBalance === '—' ? 'Points balance unavailable' : 'View your rewards'} className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-[#E4DCE9] text-[#1C0E28] rounded-l-xl focus-visible:outline-2 focus-visible:outline-[#78538F]">
              <img src={coinsIcon} alt="RP Coins" className="hidden sm:block w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 object-contain shrink-0" />
              <span><strong className="block text-xs sm:text-[13px] font-semibold leading-tight max-w-[92px] truncate">{coinBalance}</strong><span className="block text-[8.5px] sm:text-[9.5px] text-[#776B80] leading-none mt-0.5 whitespace-nowrap">RP Points</span></span>
            </Link>

            <NotificationsPanel />

            <AccountMenu />

            {/* RP Logo Circle (in right corner) */}
            <Link
              to="/"
              className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11.5 lg:h-11.5 rounded-full bg-white border border-[#E4DCE9] flex items-center justify-center shrink-0 shadow-xs hover:shadow-md transition-all group cursor-pointer"
              title="Reward Planners Home"
            >
              <img
                src={rpLogo}
                alt="RewardPlanners"
                className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7 object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

        </div>

        {/* Mobile / Tablet scrollable 3-module carousel navigation */}
        <div className="lg:hidden mt-1 pt-1 border-t border-[#E4DCE9]/60">
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
