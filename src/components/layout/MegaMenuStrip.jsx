// src/components/layout/MegaMenuStrip.jsx
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
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
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
    { title: 'Electricity Bills', icon: LightbulbOutlinedIcon, desc: 'All State Boards', color: 'text-amber-500 bg-amber-50' },
    { title: 'Mobile Recharge', icon: PhoneAndroidOutlinedIcon, desc: 'Prepaid & Postpaid', color: 'text-blue-500 bg-blue-50' },
    { title: 'DTH Recharge', icon: TvOutlinedIcon, desc: 'Tata Play, Airtel, Dish', color: 'text-purple-500 bg-purple-50' },
    { title: 'FASTag Recharge', icon: DirectionsCarOutlinedIcon, desc: 'Instant Toll Recharge', color: 'text-emerald-500 bg-emerald-50' },
    { title: 'Piped Gas & LPG', icon: LocalFireDepartmentOutlinedIcon, desc: 'IGL, MGL, Adani, HP', color: 'text-rose-500 bg-rose-50' },
    { title: 'Water Taxes', icon: WaterDropOutlinedIcon, desc: 'Municipal Authorities', color: 'text-cyan-500 bg-cyan-50' },
    { title: 'Broadband / Wifi', icon: WifiOutlinedIcon, desc: 'Airtel, JioFiber, ACT', color: 'text-indigo-500 bg-indigo-50' },
    { title: 'Loan EMI & Credit', icon: CreditCardOutlinedIcon, desc: 'Banks & NBFCs', color: 'text-orange-500 bg-orange-50' },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-2xs relative z-30">
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 h-[50px] overflow-x-auto no-scrollbar">
          {/* 1. All Products with Mega Menu */}
          <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={() => setActiveMenu('products')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/store"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#A654CD] hover:bg-pink-50/60 transition-colors"
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 17 }} className="text-[#A654CD]" />
              <span className="font-bold text-gray-900">All Products</span>
              <KeyboardArrowDownIcon sx={{ fontSize: 15 }} className="text-gray-400" />
            </Link>

            {/* Products Dropdown */}
            {activeMenu === 'products' && (
              <div className="absolute left-0 top-[50px] w-[750px] bg-white rounded-b-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-fade-in grid grid-cols-3 gap-6">
                {categories.length > 0 ? (
                  categories.slice(0, 6).map((cat) => (
                    <div key={cat.id || cat.category_id} className="space-y-2">
                      <Link
                        to={`/store?category=${cat.id || cat.category_id}`}
                        onClick={() => setActiveMenu(null)}
                        className="font-bold text-xs uppercase tracking-wider text-gray-900 hover:text-[#A654CD] block border-b border-gray-100 pb-1"
                      >
                        {cat.name || cat.category_name}
                      </Link>
                      <ul className="space-y-1.5 text-xs text-gray-600">
                        {(cat.subcategories || cat.children || []).slice(0, 4).map((sub) => (
                          <li key={sub.id || sub.subcategory_id}>
                            <Link
                              to={`/store?category=${cat.id || cat.category_id}&sub=${sub.id || sub.subcategory_id}`}
                              onClick={() => setActiveMenu(null)}
                              className="hover:text-[#A654CD] transition-colors block py-0.5"
                            >
                              {sub.name || sub.subcategory_name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4 text-gray-500">
                    Loading categories...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Electronics (DB ID 1) */}
          <Link
            to="/store?category=1"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#A654CD] hover:bg-pink-50/60 transition-colors shrink-0"
          >
            <SmartphoneOutlinedIcon sx={{ fontSize: 17 }} className="text-[#A654CD]" />
            <span>Electronics & Gadgets</span>
          </Link>

          {/* 3. Corporate Fashion (DB ID 7) */}
          <Link
            to="/store?category=7"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#A654CD] hover:bg-pink-50/60 transition-colors shrink-0"
          >
            <CheckroomOutlinedIcon sx={{ fontSize: 17 }} className="text-[#FC8BAD]" />
            <span>Corporate Fashion</span>
          </Link>

          {/* 4. Home & Kitchen (DB ID 4) */}
          <Link
            to="/store?category=4"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#A654CD] hover:bg-pink-50/60 transition-colors shrink-0"
          >
            <WeekendOutlinedIcon sx={{ fontSize: 17 }} className="text-[#A654CD]" />
            <span>Home & Kitchen</span>
          </Link>

          {/* 5. Services & Documentation Dropdown */}
          <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={() => setActiveMenu('services')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/services"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#7C3AED] hover:bg-violet-50 transition-colors"
            >
              <BuildOutlinedIcon sx={{ fontSize: 17 }} className="text-[#4F6BFF]" />
              <span>Services & Docs</span>
              <KeyboardArrowDownIcon sx={{ fontSize: 15 }} className="text-gray-400" />
            </Link>

            {/* Services Dropdown */}
            {activeMenu === 'services' && (
              <div className="absolute left-0 top-[50px] w-[800px] bg-white rounded-b-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-fade-in grid grid-cols-4 gap-6">
                {serviceCategories.map((group, idx) => {
                  const SrvIcon = group.icon;
                  return (
                    <div key={idx} className="space-y-3">
                      <Link
                        to={group.link || '/services'}
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center gap-1.5 border-b border-gray-100 pb-1 group/hdr"
                      >
                        <SrvIcon sx={{ fontSize: 16 }} className="text-[#A654CD]" />
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-900 group-hover/hdr:text-[#7C3AED] transition-colors block">
                          {group.title}
                        </span>
                      </Link>
                      <ul className="space-y-2 text-xs text-gray-600">
                        {group.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              to={item.link || '/services'}
                              onClick={() => setActiveMenu(null)}
                              className="hover:text-[#7C3AED] transition-colors block py-0.5"
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

          {/* 6. BBPS Bill Pay Mega Menu */}
          <div
            className="relative h-full flex items-center shrink-0"
            onMouseEnter={() => setActiveMenu('bbps')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/bbps"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#7C3AED] hover:bg-violet-50 transition-colors"
            >
              <BoltOutlinedIcon sx={{ fontSize: 17 }} className="text-[#F59E0B]" />
              <span>Bill Pay (BBPS)</span>
              <KeyboardArrowDownIcon sx={{ fontSize: 15 }} className="text-gray-400" />
            </Link>

            {/* BBPS Quick Dropdown */}
            {activeMenu === 'bbps' && (
              <div className="absolute left-0 top-[50px] w-[640px] bg-white rounded-b-2xl shadow-2xl border border-gray-200 p-5 z-50 animate-fade-in grid grid-cols-2 gap-3">
                {bbpsCategories.map((biller, idx) => {
                  const CategoryIcon = biller.icon;
                  return (
                    <Link
                      key={idx}
                      to="/bbps"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200 transition-all group"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${biller.color}`}>
                        <CategoryIcon sx={{ fontSize: 20 }} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs text-gray-900 group-hover:text-[#7C3AED] transition-colors">{biller.title}</p>
                        <p className="text-[11px] text-gray-500">{biller.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>



          {/* 8. Flash Deals Right-Aligned Accent */}
          <Link
            to="/deals"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0 font-bold"
          >
            <WhatshotIcon sx={{ fontSize: 17 }} className="text-rose-600" />
            <span>Deals of the Day</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MegaMenuStrip;
