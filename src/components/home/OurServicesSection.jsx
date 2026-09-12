// src/components/home/OurServicesSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';

import bgProduct from '../../assets/servicescards/bg-product.jpg';
import bgServices from '../../assets/servicescards/bg-services.jpg';
import bgPayments from '../../assets/servicescards/bg-payments.jpg';
import bgBusBooking from '../../assets/servicescards/bg-busbooking.jpg';
import bgHealth from '../../assets/servicescards/bg-health.jpg';
import bgGames from '../../assets/servicescards/bg-games.jpg';
import bgDineout from '../../assets/servicescards/bg-dineout.jpg';
import bgCommunity from '../../assets/servicescards/bg-community.jpg';

const MODULE_TILES = [
  {
    id: 'product',
    label: 'Product',
    img: bgProduct,
    link: '/store',
    isAvailable: true,
    overlay: 'bg-purple-500/15',
    border: 'border-purple-200/80',
    badgeBg: 'bg-purple-50/90 text-purple-900 border-purple-200',
  },
  {
    id: 'services',
    label: 'Services',
    img: bgServices,
    link: '/services',
    isAvailable: true,
    overlay: 'bg-sky-500/15',
    border: 'border-sky-200/80',
    badgeBg: 'bg-sky-50/90 text-sky-900 border-sky-200',
  },
  {
    id: 'payments',
    label: 'Payments',
    img: bgPayments,
    link: '/bbps',
    isAvailable: true,
    overlay: 'bg-indigo-500/15',
    border: 'border-indigo-200/80',
    badgeBg: 'bg-indigo-50/90 text-indigo-900 border-indigo-200',
  },
  {
    id: 'busbooking',
    label: 'Bus Booking',
    img: bgBusBooking,
    isAvailable: false,
    overlay: 'bg-cyan-500/15',
    border: 'border-cyan-200/80',
    badgeBg: 'bg-cyan-50/90 text-cyan-900 border-cyan-200',
  },
  {
    id: 'health',
    label: 'Health',
    img: bgHealth,
    isAvailable: false,
    overlay: 'bg-emerald-500/15',
    border: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-50/90 text-emerald-900 border-emerald-200',
  },
  {
    id: 'games',
    label: 'Games',
    img: bgGames,
    isAvailable: false,
    overlay: 'bg-pink-500/15',
    border: 'border-pink-200/80',
    badgeBg: 'bg-pink-50/90 text-pink-900 border-pink-200',
  },
  {
    id: 'dineout',
    label: 'Dineout',
    img: bgDineout,
    isAvailable: false,
    overlay: 'bg-orange-500/15',
    border: 'border-orange-200/80',
    badgeBg: 'bg-orange-50/90 text-orange-900 border-orange-200',
  },
  {
    id: 'community',
    label: 'Community',
    img: bgCommunity,
    isAvailable: false,
    overlay: 'bg-teal-500/15',
    border: 'border-teal-200/80',
    badgeBg: 'bg-teal-50/90 text-teal-900 border-teal-200',
  },
];

export const OurServicesSection = () => {
  return (
    <section className="space-y-3">
      {/* Standard Section Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
            <GridViewOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              Our Services
            </h3>
          </div>
        </div>
      </div>

      {/* Grid of 8 Service Card Images (Square Box Type: same height & same width) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4">
        {MODULE_TILES.map((tile) => {
          const CardWrapper = tile.isAvailable ? Link : 'div';
          const wrapperProps = tile.isAvailable
            ? {
                to: tile.link,
                className: `group relative block aspect-square w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer border ${tile.border}`,
              }
            : {
                className: `relative block aspect-square w-full rounded-2xl overflow-hidden shadow-xs cursor-not-allowed select-none transition-all duration-200 border ${tile.border}`,
                title: `${tile.label} (Coming Soon)`,
              };

          return (
            <CardWrapper key={tile.id} {...wrapperProps}>
              {/* 1. Full-Card Background Image */}
              <img
                src={tile.img}
                alt={tile.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* 2. Light Theme Color Tint Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${tile.overlay} group-hover:opacity-80`}
              />

              {/* 3. Subtle Top Vignette for Label Contrast */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />

              {/* 4. Service Label on Top */}
              <span className="absolute top-2 left-2.5 sm:top-2.5 sm:left-3 font-bold text-xs sm:text-sm text-white drop-shadow-md z-10 leading-tight tracking-tight">
                {tile.label}
              </span>

              {/* 4. Disabled Coming Soon Pill Overlay */}
              {!tile.isAvailable && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none z-10">
                  <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    <LockOutlinedIcon sx={{ fontSize: 10 }} />
                    <span>Coming Soon</span>
                  </span>
                </div>
              )}
            </CardWrapper>
          );
        })}
      </div>
    </section>
  );
};

export default OurServicesSection;
