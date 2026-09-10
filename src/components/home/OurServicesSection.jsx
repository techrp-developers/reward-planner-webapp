// src/components/home/OurServicesSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';

import productImg from '../../assets/servicescards/banner-product-3d.png';
import servicesImg from '../../assets/servicescards/banner-services-3d.png';
import paymentsImg from '../../assets/servicescards/banner-payments-3d.png';
import busbookingImg from '../../assets/servicescards/banner-busbooking-3d.png';
import healthImg from '../../assets/servicescards/banner-health-3d.png';
import gamesImg from '../../assets/servicescards/banner-games-3d.png';
import dineoutImg from '../../assets/servicescards/banner-dineout-3d.png';
import communityImg from '../../assets/servicescards/banner-community-3d.png';

const MODULE_TILES = [
  { id: 'product', label: 'Product', img: productImg, link: '/store', isAvailable: true },
  { id: 'services', label: 'Services', img: servicesImg, link: '/services', isAvailable: true },
  { id: 'payments', label: 'Payments', img: paymentsImg, link: '/bbps', isAvailable: true },
  { id: 'busbooking', label: 'Bus Booking', img: busbookingImg, isAvailable: false },
  { id: 'health', label: 'Health', img: healthImg, isAvailable: false },
  { id: 'games', label: 'Games', img: gamesImg, isAvailable: false },
  { id: 'dineout', label: 'Dineout', img: dineoutImg, isAvailable: false },
  { id: 'community', label: 'Community', img: communityImg, isAvailable: false },
];

export const OurServicesSection = () => {
  return (
    <section className="space-y-3">
      {/* Standard Section Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
            <GridViewOutlinedIcon sx={{ fontSize: 22 }} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              Our Services
            </h3>
          </div>
        </div>
      </div>

      {/* Grid of 8 Service Card Images (Square Box Type: same height & same width) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {MODULE_TILES.map((tile) => {
          if (tile.isAvailable) {
            return (
              <Link
                key={tile.id}
                to={tile.link}
                className="group relative block aspect-square w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={tile.img}
                  alt={tile.label}
                  className="w-full h-full object-cover object-[center_56%] transition-transform duration-300 group-hover:scale-108"
                />
                <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 font-bold text-xs sm:text-sm text-gray-900 z-10 leading-tight">
                  {tile.label}
                </span>
              </Link>
            );
          }

          {/* Upcoming Service Card (Square Box Type) */}
          return (
            <div
              key={tile.id}
              className="relative block aspect-square w-full rounded-2xl overflow-hidden shadow-xs cursor-not-allowed select-none transition-all duration-200"
              title={`${tile.label} (Coming Soon)`}
            >
              <img
                src={tile.img}
                alt={tile.label}
                className="w-full h-full object-cover object-[center_56%]"
              />
              <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 font-bold text-xs sm:text-sm text-gray-900 z-10 leading-tight">
                {tile.label}
              </span>

              {/* Disabled Coming Soon Pill Overlay */}
              <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none z-10">
                <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  <LockOutlinedIcon sx={{ fontSize: 10 }} />
                  <span>Coming Soon</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OurServicesSection;
