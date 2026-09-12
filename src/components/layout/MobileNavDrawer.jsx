// src/components/layout/MobileNavDrawer.jsx
// Responsive Mobile Navigation Drawer (Hamburger Menu)
// Displays comprehensive services, subcategories, bill payments, user profile, and policies

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { fetchCategoriesWithSub } from '../../api/productApi';
import rpLogo from '../../assets/rplogo_nobg.svg';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';

// Category & Service Specific Icons
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';

export const MobileNavDrawer = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const { pincode, cityName, openLocationModal } = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [expandedSection, setExpandedSection] = useState('services'); // default open 'services'
  const [expandedServiceCat, setExpandedServiceCat] = useState('Tax Filing & CA Services');
  const [expandedProductCat, setExpandedProductCat] = useState(null);

  useEffect(() => {
    fetchCategoriesWithSub()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  // Lock background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const coinBalance = Number(user?.wallet_points || user?.points || user?.steps?.coins || 2450);
  const firstName = user?.name ? user.name.trim().split(' ')[0] : (user?.first_name || 'Profile');

  const toggleSection = (sectionKey) => {
    setExpandedSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const toggleServiceCat = (title) => {
    setExpandedServiceCat((prev) => (prev === title ? null : title));
  };

  const toggleProductCat = (catId) => {
    setExpandedProductCat((prev) => (prev === catId ? null : catId));
  };

  const handleLinkClick = (path) => {
    onClose();
    if (path) navigate(path);
  };

  const serviceCategories = [
    {
      title: 'Tax Filing & CA Services',
      icon: AccountBalanceOutlinedIcon,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      link: '/services/category/1',
      items: [
        { name: 'Income Tax Return Filing', link: '/services/detail/13' },
        { name: 'Property Tax Name Change', link: '/services/detail/14' },
        { name: 'Reply to IT Notice', link: '/services/detail/15' },
      ],
    },
    {
      title: 'Insurance Solutions',
      icon: ShieldOutlinedIcon,
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      link: '/services/category/2',
      items: [
        { name: 'Car Insurance', link: '/services/detail/10' },
        { name: 'Two-Wheeler Insurance', link: '/services/detail/11' },
        { name: 'Health Insurance', link: '/services/detail/12' },
        { name: 'Super Top-up', link: '/services/detail/18' },
        { name: 'Personal Accident', link: '/services/detail/19' },
      ],
    },
    {
      title: 'Government Documents',
      icon: BadgeOutlinedIcon,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      link: '/services/category/3',
      items: [
        { name: 'PAN Card Services', link: '/services/detail/1' },
        { name: 'Aadhaar Correction', link: '/services/detail/2' },
        { name: 'Passport Assistance', link: '/services/detail/6' },
        { name: 'Driving License', link: '/services/detail/5' },
        { name: 'Rent Agreement Registration', link: '/services/detail/9' },
      ],
    },
    {
      title: 'Wealth & Utility Services',
      icon: GavelOutlinedIcon,
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      link: '/services',
      items: [
        { name: 'Mutual Fund Hub & SIP', link: '/services/mutual-funds' },
        { name: 'MSEB Electricity Name Change', link: '/services/detail/16' },
        { name: 'All-in-One Corporate Packs', link: '/services' },
      ],
    },
  ];

  // Default fallback product categories with rich subcategories
  const defaultProductCategories = [
    {
      id: '1',
      name: 'Electronics & Gadgets',
      icon: SmartphoneOutlinedIcon,
      subcategories: [
        { id: '101', name: 'Smartphones & Accessories' },
        { id: '102', name: 'Smartwatches & Fitness Bands' },
        { id: '103', name: 'Headphones & Bluetooth Audio' },
        { id: '104', name: 'Laptops & Office Tech' },
      ],
    },
    {
      id: '7',
      name: 'Corporate Fashion',
      icon: CheckroomOutlinedIcon,
      subcategories: [
        { id: '201', name: "Men's Formal & Casual Wear" },
        { id: '202', name: "Women's Workwear" },
        { id: '203', name: 'Premium Leather Goods' },
        { id: '204', name: 'Footwear & Accessories' },
      ],
    },
    {
      id: '4',
      name: 'Home & Kitchen',
      icon: WeekendOutlinedIcon,
      subcategories: [
        { id: '301', name: 'Coffee Makers & Small Appliances' },
        { id: '302', name: 'Cookware & Dinnerware' },
        { id: '303', name: 'Desk Lamps & Home Decor' },
        { id: '304', name: 'Ergonomic Office Furniture' },
      ],
    },
  ];

  const productList = categories.length > 0 ? categories : defaultProductCategories;

  const bbpsCategories = [
    { title: 'Electricity Bills', icon: LightbulbOutlinedIcon, color: 'text-amber-400 bg-amber-500/15' },
    { title: 'Mobile Recharge', icon: PhoneAndroidOutlinedIcon, color: 'text-blue-400 bg-blue-500/15' },
    { title: 'DTH Recharge', icon: TvOutlinedIcon, color: 'text-purple-400 bg-purple-500/15' },
    { title: 'FASTag Recharge', icon: DirectionsCarOutlinedIcon, color: 'text-emerald-400 bg-emerald-500/15' },
    { title: 'Piped Gas & LPG', icon: LocalFireDepartmentOutlinedIcon, color: 'text-rose-400 bg-rose-500/15' },
    { title: 'Water Taxes', icon: WaterDropOutlinedIcon, color: 'text-cyan-400 bg-cyan-500/15' },
    { title: 'Broadband / Wifi', icon: WifiOutlinedIcon, color: 'text-indigo-400 bg-indigo-500/15' },
    { title: 'Loan EMI & Credit', icon: CreditCardOutlinedIcon, color: 'text-orange-400 bg-orange-500/15' },
  ];

  return (
    <div className="fixed inset-0 z-[150] lg:hidden flex">
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-out Drawer Panel */}
      <div className="relative w-[88vw] max-w-sm bg-[#150a24] text-white shadow-2xl flex flex-col h-full z-10 overflow-hidden border-r border-white/10 animate-slide-right">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.25),transparent_70%)]" />
        </div>

        {/* ---------------------------------------------------- */}
        {/* DRAWER TOP BAR: BRAND LOGO + CLOSE BUTTON            */}
        {/* ---------------------------------------------------- */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between relative z-10 bg-[#190d2b]">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 text-decoration-none group"
          >
            <img
              src={rpLogo}
              alt="Reward Planners"
              className="h-8 w-8 object-contain drop-shadow-md"
            />
            <span className="font-extrabold text-base leading-tight tracking-tight">
              <span className="text-[#FC8BAD]">Reward</span>
              <span className="text-[#F8A926]">Planners</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* USER BANNER / GREETING & COIN BALANCE                */}
        {/* ---------------------------------------------------- */}
        <div className="p-4 bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-[#fc3f78]/20 border-b border-white/10 relative z-10">
          {isAuthenticated ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fc3f78] to-[#8b3ab5] text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-purple-200">Welcome back,</p>
                    <p className="text-sm font-bold text-white truncate">{user?.name || firstName}</p>
                  </div>
                </div>

                {/* Coin Badge */}
                <Link
                  to="/wallet"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] text-white text-xs font-bold shadow-xs shrink-0"
                >
                  <MonetizationOnIcon sx={{ fontSize: 15 }} className="text-amber-200" />
                  <span>{coinBalance.toLocaleString('en-IN')} RP</span>
                </Link>
              </div>

              {/* Quick Profile / Orders Links */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex-1 py-1.5 text-center rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="flex-1 py-1.5 text-center rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
                >
                  My Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-purple-200">Corporate Perks & Services</p>
                <p className="text-sm font-bold text-white">Sign In to your account</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuth();
                }}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-100 transition-all shadow-md shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Location Delivery Selector */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-purple-200 truncate">
              <LocationOnOutlinedIcon sx={{ fontSize: 15 }} className="text-[#fc3f78] shrink-0" />
              <span className="truncate">Deliver to: <strong className="text-white">{cityName} {pincode}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                openLocationModal();
              }}
              className="text-[11px] font-semibold text-purple-300 hover:text-white underline shrink-0 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SCROLLABLE NAVIGATION CONTENT ACCORDION              */}
        {/* ---------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 relative z-10 divide-y divide-white/10">
          {/* ==================================================== */}
          {/* SECTION 1: CORPORATE SERVICES & SUB CATEGORIES       */}
          {/* ==================================================== */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between py-2 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <BuildOutlinedIcon sx={{ fontSize: 16 }} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-sm text-white block">Corporate Services & Docs</span>
                  <span className="text-[11px] text-purple-200/70">Tax, Insurance, Govt Docs, Wealth</span>
                </div>
              </div>
              <KeyboardArrowDownIcon
                sx={{ fontSize: 18 }}
                className={`text-purple-300 transition-transform duration-200 ${
                  expandedSection === 'services' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'services' && (
              <div className="mt-2 ml-2 pl-3 border-l-2 border-purple-500/30 space-y-2.5 animate-fade-in">
                {serviceCategories.map((group, idx) => {
                  const SrvIcon = group.icon;
                  const isCatOpen = expandedServiceCat === group.title;
                  return (
                    <div key={idx} className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleServiceCat(group.title)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 border ${group.accent}`}>
                            <SrvIcon sx={{ fontSize: 15 }} />
                          </div>
                          <span className="font-semibold text-xs text-purple-100 truncate">
                            {group.title}
                          </span>
                        </div>
                        <KeyboardArrowDownIcon
                          sx={{ fontSize: 16 }}
                          className={`text-purple-300/80 transition-transform duration-200 shrink-0 ${
                            isCatOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isCatOpen && (
                        <ul className="px-3 pb-2 pt-1 space-y-1 bg-black/20 border-t border-white/5 text-xs">
                          {group.items.map((sub, sIdx) => (
                            <li key={sIdx}>
                              <button
                                type="button"
                                onClick={() => handleLinkClick(sub.link)}
                                className="w-full text-left py-1.5 px-2 rounded-md text-purple-200/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between text-xs"
                              >
                                <span>{sub.name}</span>
                                <ChevronRightIcon sx={{ fontSize: 13 }} className="text-purple-400/60" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleLinkClick('/services')}
                  className="w-full py-2 px-3 text-center rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-bold text-xs border border-sky-400/30 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Explore All Services & Packs</span>
                  <ChevronRightIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* SECTION 2: PRODUCT CATEGORIES & SUB CATEGORIES       */}
          {/* ==================================================== */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => toggleSection('products')}
              className="w-full flex items-center justify-between py-2 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShoppingBagOutlinedIcon sx={{ fontSize: 16 }} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-sm text-white block">Products & Sub Categories</span>
                  <span className="text-[11px] text-purple-200/70">Electronics, Fashion, Home, Perks</span>
                </div>
              </div>
              <KeyboardArrowDownIcon
                sx={{ fontSize: 18 }}
                className={`text-purple-300 transition-transform duration-200 ${
                  expandedSection === 'products' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'products' && (
              <div className="mt-2 ml-2 pl-3 border-l-2 border-purple-500/30 space-y-2.5 animate-fade-in">
                {productList.slice(0, 6).map((cat) => {
                  const catId = cat.id || cat.category_id;
                  const catName = cat.name || cat.category_name;
                  const subList = cat.subcategories || cat.children || [];
                  const isCatOpen = expandedProductCat === catId;
                  const CatIcon = cat.icon || Inventory2OutlinedIcon;

                  return (
                    <div key={catId} className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleProductCat(catId)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-lg shrink-0 bg-purple-500/15 text-purple-300 border border-purple-500/20">
                            <CatIcon sx={{ fontSize: 15 }} />
                          </div>
                          <span className="font-semibold text-xs text-purple-100 truncate">
                            {catName}
                          </span>
                        </div>
                        <KeyboardArrowDownIcon
                          sx={{ fontSize: 16 }}
                          className={`text-purple-300/80 transition-transform duration-200 shrink-0 ${
                            isCatOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isCatOpen && (
                        <ul className="px-3 pb-2 pt-1 space-y-1 bg-black/20 border-t border-white/5 text-xs">
                          {subList.length > 0 ? (
                            subList.map((sub) => {
                              const subId = sub.id || sub.subcategory_id;
                              const subName = sub.name || sub.subcategory_name;
                              return (
                                <li key={subId}>
                                  <button
                                    type="button"
                                    onClick={() => handleLinkClick(`/store?category=${catId}&sub=${subId}`)}
                                    className="w-full text-left py-1.5 px-2 rounded-md text-purple-200/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between text-xs"
                                  >
                                    <span>{subName}</span>
                                    <ChevronRightIcon sx={{ fontSize: 13 }} className="text-purple-400/60" />
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li>
                              <button
                                type="button"
                                onClick={() => handleLinkClick(`/store?category=${catId}`)}
                                className="w-full text-left py-1.5 px-2 rounded-md text-purple-200/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between text-xs"
                              >
                                <span>Browse All {catName}</span>
                                <ChevronRightIcon sx={{ fontSize: 13 }} className="text-purple-400/60" />
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleLinkClick('/store')}
                  className="w-full py-2 px-3 text-center rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold text-xs border border-purple-400/30 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Explore Full Products Catalog</span>
                  <ChevronRightIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* SECTION 3: BBPS BILL PAY & RECHARGE                  */}
          {/* ==================================================== */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => toggleSection('bbps')}
              className="w-full flex items-center justify-between py-2 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BoltOutlinedIcon sx={{ fontSize: 16 }} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-sm text-white block">Bill Pay (BBPS) & Recharge</span>
                  <span className="text-[11px] text-purple-200/70">Electricity, Mobile, FASTag, Gas</span>
                </div>
              </div>
              <KeyboardArrowDownIcon
                sx={{ fontSize: 18 }}
                className={`text-purple-300 transition-transform duration-200 ${
                  expandedSection === 'bbps' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'bbps' && (
              <div className="mt-2 ml-2 pl-3 border-l-2 border-purple-500/30 space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  {bbpsCategories.map((biller, idx) => {
                    const BIcon = biller.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLinkClick('/bbps')}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-left transition-colors"
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${biller.color}`}>
                          <BIcon sx={{ fontSize: 15 }} />
                        </div>
                        <span className="text-[11px] font-semibold text-purple-100 leading-tight truncate">
                          {biller.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleLinkClick('/bbps')}
                  className="w-full py-2 px-3 text-center rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs border border-amber-400/30 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open Bharat BillPay Portal</span>
                  <ChevronRightIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* SECTION 4: DEALS OF THE DAY                          */}
          {/* ==================================================== */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleLinkClick('/deals')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/30 text-rose-400 flex items-center justify-center">
                  <WhatshotIcon sx={{ fontSize: 16 }} />
                </div>
                <div>
                  <span className="font-bold text-sm text-rose-200 block">Deals of the Day</span>
                  <span className="text-[11px] text-rose-300/80">Exclusive corporate discounts</span>
                </div>
              </div>
              <ChevronRightIcon sx={{ fontSize: 16 }} className="text-rose-300" />
            </button>
          </div>

          {/* ==================================================== */}
          {/* SECTION 5: ACCOUNT & POLICIES                        */}
          {/* ==================================================== */}
          <div className="pt-2 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 px-2 pb-1">
              Account & Legal
            </p>

            <button
              type="button"
              onClick={() => handleLinkClick('/profile')}
              className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PersonOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-400" />
              <span>My Profile & Saved Addresses</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('/orders')}
              className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-400" />
              <span>Orders & Service Requests</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('/cart')}
              className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-400" />
              <span>Shopping Cart & Services Cart</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('/terms')}
              className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PolicyOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-400" />
              <span>Terms & Policies</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DRAWER FOOTER: CORPORATE BRAND CREDENTIALS           */}
        {/* ---------------------------------------------------- */}
        <div className="p-3 bg-[#11061c] border-t border-white/10 text-center relative z-10">
          <p className="text-[11px] font-bold text-purple-200">Maa Pranaam Pro Planner Pvt. Ltd.</p>
          <p className="text-[10px] text-purple-400/60 mt-0.5">Corporate Rewards & Benefits Platform</p>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
