// src/components/layout/MegaMenuStrip.jsx
// Row 3: Sub Categories Navigation Strip in Sleek Black Theme
// Displays sub categories as before (All Products, Electronics, Fashion, Home, Services, BBPS, Deals of the Day)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategoriesWithSub } from '../../api/productApi';

// Material UI Icons
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Category Specific Material Icons
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export const MegaMenuStrip = () => {
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchCategoriesWithSub()
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const serviceCategories = [
    {
      title: 'Tax Filing',
      icon: AccountBalanceOutlinedIcon,
      link: '/services/category/1',
      items: [
        { name: 'Income Tax Return Filing', link: '/services/detail/13' },
        { name: 'Property Tax Name Change', link: '/services/detail/14' },
        { name: 'Reply to IT Notice', link: '/services/detail/15' },
      ],
    },
    {
      title: 'Insurance',
      icon: ShieldOutlinedIcon,
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
      title: 'Govt Documents',
      icon: BadgeOutlinedIcon,
      link: '/services/category/3',
      items: [
        { name: 'PAN Card Services', link: '/services/detail/1' },
        { name: 'Aadhaar Correction', link: '/services/detail/2' },
        { name: 'Passport Assistance', link: '/services/detail/6' },
        { name: 'Driving License', link: '/services/detail/5' },
        { name: 'Rent Agreement', link: '/services/detail/9' },
      ],
    },
    {
      title: 'Wealth & Utilities',
      icon: GavelOutlinedIcon,
      link: '/services',
      items: [
        { name: 'Mutual Fund Hub & SIP', link: '/services/mutual-funds' },
        { name: 'MSEB Name Change', link: '/services/detail/16' },
        { name: 'All-in-One Packs', link: '/services' },
      ],
    },
  ];

  const bbpsCategories = [
    { title: 'Electricity Bills', icon: LightbulbOutlinedIcon, desc: 'All State Boards', color: 'text-amber-600 bg-amber-100' },
    { title: 'Mobile Recharge', icon: PhoneAndroidOutlinedIcon, desc: 'Prepaid & Postpaid', color: 'text-blue-600 bg-blue-100' },
    { title: 'DTH Recharge', icon: TvOutlinedIcon, desc: 'Tata Play, Airtel, Dish', color: 'text-purple-600 bg-purple-100' },
    { title: 'FASTag Recharge', icon: DirectionsCarOutlinedIcon, desc: 'Instant Toll Recharge', color: 'text-emerald-600 bg-emerald-100' },
    { title: 'Piped Gas & LPG', icon: LocalFireDepartmentOutlinedIcon, desc: 'IGL, MGL, Adani, HP', color: 'text-rose-600 bg-rose-100' },
    { title: 'Water Taxes', icon: WaterDropOutlinedIcon, desc: 'Municipal Authorities', color: 'text-cyan-600 bg-cyan-100' },
    { title: 'Broadband / Wifi', icon: WifiOutlinedIcon, desc: 'Airtel, JioFiber, ACT', color: 'text-indigo-600 bg-indigo-100' },
    { title: 'Loan EMI & Credit', icon: CreditCardOutlinedIcon, desc: 'Banks & NBFCs', color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <nav className="hidden lg:block w-full bg-[#180d26] text-white border-b border-white/10 shadow-md relative z-20 select-none">
      {/* Subtle background effects isolated with overflow-hidden */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle radial ambient glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(168,85,247,0.18),transparent_40%),radial-gradient(circle_at_85%_50%,rgba(252,63,120,0.15),transparent_40%)]" />

        {/* Subtle micro-grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:36px_36px]" />

        {/* Glossy top reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex items-center justify-between text-[13.5px] font-medium text-purple-100 h-10 overflow-x-auto no-scrollbar">
          {/* 1. All Products with Mega Menu */}
          <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={() => setActiveMenu('products')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/store"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-white font-semibold hover:text-purple-200 hover:bg-white/10 transition-colors"
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 16 }} className="text-[#d8b4fe]" />
              <span className="font-semibold text-white hover:text-purple-200">All Products</span>
              <KeyboardArrowDownIcon sx={{ fontSize: 15 }} className="text-purple-300/80" />
            </Link>

            {/* Products Dropdown */}
            {activeMenu === 'products' && (
              <div className="hidden lg:grid absolute left-0 top-11 w-[750px] bg-[#1a0f2b] text-white rounded-b-2xl shadow-2xl border border-white/15 p-6 z-50 animate-fade-in grid-cols-3 gap-6 backdrop-blur-xl">
                {categories.length > 0 ? (
                  categories.slice(0, 6).map((cat) => (
                    <div key={cat.id || cat.category_id} className="space-y-2">
                      <Link
                        to={`/store?category=${cat.id || cat.category_id}`}
                        onClick={() => setActiveMenu(null)}
                        className="font-bold text-xs uppercase tracking-wider text-purple-200 hover:text-white block border-b border-white/10 pb-1 transition-colors"
                      >
                        {cat.name || cat.category_name}
                      </Link>
                      <ul className="space-y-1.5 text-xs text-purple-200/70">
                        {(cat.subcategories || cat.children || []).slice(0, 4).map((sub) => (
                          <li key={sub.id || sub.subcategory_id}>
                            <Link
                              to={`/store?category=${cat.id || cat.category_id}&sub=${sub.id || sub.subcategory_id}`}
                              onClick={() => setActiveMenu(null)}
                              className="hover:text-white transition-colors block py-0.5"
                            >
                              {sub.name || sub.subcategory_name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4 text-purple-300/60">
                    Loading categories...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Electronics & Gadgets */}
          <Link
            to="/store?category=1"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-purple-100 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <SmartphoneOutlinedIcon sx={{ fontSize: 16 }} className="text-[#c084fc]" />
            <span>Electronics & Gadgets</span>
          </Link>

          {/* 3. Corporate Fashion */}
          <Link
            to="/store?category=7"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-purple-100 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <CheckroomOutlinedIcon sx={{ fontSize: 16 }} className="text-[#f472b6]" />
            <span>Corporate Fashion</span>
          </Link>

          {/* 4. Home & Kitchen */}
          <Link
            to="/store?category=4"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-purple-100 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <WeekendOutlinedIcon sx={{ fontSize: 16 }} className="text-[#c084fc]" />
            <span>Home & Kitchen</span>
          </Link>

          {/* 5. Services & Docs Dropdown */}
          <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={() => setActiveMenu('services')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/services"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <BuildOutlinedIcon sx={{ fontSize: 15 }} className="text-[#38bdf8]" />
              <span>Services & Docs</span>
              <KeyboardArrowDownIcon sx={{ fontSize: 14 }} className="text-purple-300/80" />
            </Link>

            {/* Services Dropdown */}
            {activeMenu === 'services' && (
              <div className="hidden lg:grid absolute left-0 top-10 w-[800px] bg-[#1a0f2b] text-white rounded-b-2xl shadow-2xl border border-white/15 p-6 z-50 animate-fade-in grid-cols-4 gap-6 backdrop-blur-xl">
                {serviceCategories.map((group, idx) => {
                  const SrvIcon = group.icon;
                  return (
                    <div key={idx} className="space-y-3">
                      <Link
                        to={group.link || '/services'}
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center gap-1.5 border-b border-white/10 pb-1 group/hdr"
                      >
                        <SrvIcon sx={{ fontSize: 16 }} className="text-[#d8b4fe]" />
                        <span className="font-bold text-xs uppercase tracking-wider text-purple-200 group-hover/hdr:text-white transition-colors block">
                          {group.title}
                        </span>
                      </Link>
                      <ul className="space-y-2 text-xs text-purple-200/70">
                        {group.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              to={item.link || '/services'}
                              onClick={() => setActiveMenu(null)}
                              className="hover:text-white transition-colors block py-0.5"
                            >
                              {item.name || item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. BBPS Bill Pay Dropdown */}
          <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={() => setActiveMenu('bbps')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/bbps"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-purple-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <BoltOutlinedIcon sx={{ fontSize: 16 }} className="text-[#fbbf24]" />
              <span>Bill Pay (BBPS)</span>
              <KeyboardArrowDownIcon sx={{ fontSize: 14 }} className="text-purple-300/80" />
            </Link>

            {/* BBPS Quick Dropdown */}
            {activeMenu === 'bbps' && (
              <div className="hidden lg:grid absolute left-0 top-10 w-[640px] bg-[#1a0f2b] text-white rounded-b-2xl shadow-2xl border border-white/15 p-5 z-50 animate-fade-in grid-cols-2 gap-3 backdrop-blur-xl">
                {bbpsCategories.map((biller, idx) => {
                  const CategoryIcon = biller.icon;
                  return (
                    <Link
                      key={idx}
                      to="/bbps"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all group"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${biller.color}`}>
                        <CategoryIcon sx={{ fontSize: 20 }} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs text-white group-hover:text-purple-200 transition-colors">
                          {biller.title}
                        </p>
                        <p className="text-[11px] text-purple-300/70">{biller.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Deals of the Day */}
          <Link
            to="/deals"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 transition-all shrink-0 font-semibold shadow-xs hover:scale-102"
          >
            <WhatshotIcon sx={{ fontSize: 15 }} className="text-[#fb7185]" />
            <span>Deals of the Day</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MegaMenuStrip;
