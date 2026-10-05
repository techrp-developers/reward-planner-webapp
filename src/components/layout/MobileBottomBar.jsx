// src/components/layout/MobileBottomBar.jsx
// Mobile-Responsive Bottom Navigation Bar matching the reference designs
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PersonIcon from '@mui/icons-material/Person';

export const MobileBottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isHome = currentPath === '/';
  const isServices = currentPath.startsWith('/services') || currentPath.startsWith('/insurance') || currentPath.startsWith('/tax');
  const isOrders = currentPath.startsWith('/orders');
  const isProfile = currentPath.startsWith('/profile');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 font-['Poppins',sans-serif] select-none">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isHome ? 'text-[#7C3AED] font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isHome ? <HomeIcon sx={{ fontSize: 22 }} /> : <HomeOutlinedIcon sx={{ fontSize: 22 }} />}
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </NavLink>

        {/* 2. Categories / Services */}
        <NavLink
          to="/services"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isServices ? 'text-[#7C3AED] font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isServices ? <GridViewIcon sx={{ fontSize: 22 }} /> : <GridViewOutlinedIcon sx={{ fontSize: 22 }} />}
          <span className="text-[10px] mt-0.5 tracking-tight">Services</span>
        </NavLink>

        {/* 3. Center Elevated Floating Rewards/Gift Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={() => navigate('/services')}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#8B3AB5] via-[#A855F7] to-[#D946EF] text-white flex items-center justify-center shadow-lg shadow-purple-500/40 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-4 border-white"
            title="Rewards & Services"
            aria-label="Rewards & Services"
          >
            <CardGiftcardIcon sx={{ fontSize: 24 }} />
          </button>
        </div>

        {/* 4. Orders */}
        <NavLink
          to="/orders"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isOrders ? 'text-[#7C3AED] font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isOrders ? <ReceiptLongIcon sx={{ fontSize: 22 }} /> : <ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
          <span className="text-[10px] mt-0.5 tracking-tight">Orders</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            isProfile ? 'text-[#7C3AED] font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isProfile ? <PersonIcon sx={{ fontSize: 22 }} /> : <PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileBottomBar;
