// src/modules/home/components/EmployeeSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Gift,
  Calendar,
  Heart,
  FileText,
  BarChart2,
  HelpCircle,
  LogOut,
} from 'lucide-react';

export const EmployeeSidebar = ({ activeItem = '', activeTab = '', onItemClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isSupportActive = activeTab === 'support' || activeItem === 'support' || activeItem === 'Help & Support';

  const menuItems = [
    { id: 'My Rewards', label: 'My Rewards', icon: Gift, route: '/rewards' },
    { id: 'My Events', label: 'My Events', icon: Calendar, route: '/events' },
    { id: 'Health & Wellness', label: 'Health & Wellness', icon: Heart, route: '/wellness' },
    { id: 'My Benefits', label: 'My Benefits', icon: FileText, route: '/benefits' },
    { id: 'Reports', label: 'Reports', icon: BarChart2, route: '/reports' },
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
    <aside className="w-56 xl:w-60 shrink-0 h-full flex flex-col justify-between py-6 px-0 bg-white border-r border-slate-100 select-none overflow-hidden">
      {/* Top Navigation Items */}
      <div>
        <nav className="space-y-3.5 px-3" aria-label="Employee Sidebar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeItem === item.id ||
              activeTab === item.id ||
              (item.id === 'My Rewards' && (activeTab === 'rewards' || activeTab === 'my-rewards' || activeItem === 'rewards' || activeItem === 'my-rewards')) ||
              (item.id === 'My Events' && (activeTab === 'events' || activeTab === 'my-events' || activeItem === 'events' || activeItem === 'my-events')) ||
              (item.id === 'Health & Wellness' && (activeTab === 'wellness' || activeTab === 'health-wellness' || activeItem === 'wellness')) ||
              (item.id === 'My Benefits' && (activeTab === 'benefits' || activeTab === 'my-benefits' || activeItem === 'benefits')) ||
              (item.id === 'Reports' && (activeTab === 'reports' || activeItem === 'reports'));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 text-[14.5px] rounded-2xl transition-all duration-150 cursor-pointer text-left group ${
                  isActive
                    ? 'text-[#6D28D9] font-bold bg-[#F0EBFC]'
                    : 'text-[#0a0a5c] font-medium hover:text-[#6D28D9] hover:bg-purple-50/40'
                }`}
              >
                <Icon
                  size={21}
                  className={`shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-[#6D28D9] stroke-[2.3]' : 'text-[#0a0a5c] stroke-[2.1]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Help & Support + Logout */}
      <div className="pt-2">
        {/* Subtle Horizontal Divider */}
        <div className="w-full px-5 mb-4">
          <div className="border-t border-slate-100 w-full" />
        </div>

        <div className="space-y-2.5">
          {/* Help & Support */}
          <button
            type="button"
            onClick={() => navigate('/customer-support')}
            className={`w-full flex items-center gap-3.5 px-6 py-2.5 text-[14.5px] transition-colors cursor-pointer text-left group ${
              isSupportActive
                ? 'font-bold text-[#6D28D9] bg-purple-50/70 border-r-4 border-[#6D28D9]'
                : 'font-medium text-[#0a0a5c] hover:text-[#6D28D9] hover:bg-purple-50/40'
            }`}
          >
            <HelpCircle
              size={21}
              className={`stroke-[2.1] shrink-0 ${
                isSupportActive
                  ? 'text-[#6D28D9]'
                  : 'text-[#0a0a5c] group-hover:text-[#6D28D9]'
              }`}
            />
            <span>Help & Support</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-6 py-2.5 text-[14.5px] font-medium text-[#EF4444] hover:text-red-700 hover:bg-red-50/50 transition-colors cursor-pointer text-left group"
          >
            <LogOut size={21} className="text-[#EF4444] stroke-[2.1] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
