// src/modules/home/components/EmployeeSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { HelpCircle, LogOut } from 'lucide-react';
import iconRewards from '../../../assets/icon11.png';
import iconEvents from '../../../assets/icon12.png';
import iconHealth from '../../../assets/icon13.png';
import iconBenefits from '../../../assets/icon14.png';
import iconReports from '../../../assets/icon15.png';

export const EmployeeSidebar = ({ activeItem = '', onItemClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'My Rewards', label: 'My Rewards', icon: iconRewards, route: '/profile?tab=rewards' },
    { id: 'My Events', label: 'My Events', icon: iconEvents, route: '/profile?tab=events' },
    { id: 'Health & Wellness', label: 'Health & Wellness', icon: iconHealth, route: '/services/detail/12' },
    { id: 'My Benefits', label: 'My Benefits', icon: iconBenefits, route: '/profile?tab=benefits' },
    { id: 'Reports', label: 'Reports', icon: iconReports, route: '/profile?tab=reports' },
  ];

  const handleClick = (item) => {
    if (onItemClick) {
      onItemClick(item.id);
    }
    if (item.route) {
      navigate(item.route);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside className="w-56 xl:w-60 shrink-0 h-full flex flex-col justify-between py-4 px-0 bg-white border-r border-slate-100 select-none overflow-hidden">
      {/* Top Navigation Items */}
      <div className="space-y-3.5">
        <nav className="space-y-1" aria-label="Employee Sidebar">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
                className={`w-full flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all duration-200 cursor-pointer text-left border-l-4 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white shadow-xs font-bold border-[#4C1D95]'
                    : 'text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50/70 border-transparent hover:border-[#7C3AED]'
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-6 h-6 sm:w-6.5 sm:h-6.5 object-contain mix-blend-multiply shrink-0 group-hover:scale-110 transition-transform"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Help & Support + Logout + Copyright */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="space-y-1">
          {/* Help & Support */}
          <button
            type="button"
            onClick={() => navigate('/profile?tab=support')}
            className="w-full flex items-center gap-3 px-5 sm:px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50/70 border-l-4 border-transparent hover:border-[#7C3AED] transition-all cursor-pointer text-left"
          >
            <HelpCircle size={18} className="text-slate-500" />
            <span>Help & Support</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 sm:px-6 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 border-l-4 border-transparent hover:border-rose-500 transition-all cursor-pointer text-left group"
          >
            <LogOut size={18} className="text-rose-500 group-hover:text-rose-600" />
            <span>Logout</span>
          </button>
        </div>

        {/* Copyright */}
        <p className="text-[10px] text-slate-400 font-medium px-4 pt-1 leading-tight text-center">
          © 2026 RewardPlanners.
          <br />
          All rights reserved.
        </p>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
