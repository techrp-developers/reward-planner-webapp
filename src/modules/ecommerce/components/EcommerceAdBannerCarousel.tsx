import React, { useState } from 'react';

import bannerCookwareLight3D from '../../../assets/banners/banner_cookware_light_3d.jpg';
import bannerFashionLight3D from '../../../assets/banners/banner_fashion_light_3d.jpg';
import bannerSmarthomeLight3D from '../../../assets/banners/banner_smarthome_light_3d.jpg';
import bannerSmartwatchLight3D from '../../../assets/banners/banner_smartwatch_light_3d.jpg';
import bannerEarbudsLight3D from '../../../assets/banners/banner_earbuds_light_3d.jpg';
import bannerGreenSuperfoods3D from '../../../assets/banners/banner_green_superfoods_3d.jpg';
import bannerPurplePerfume3D from '../../../assets/banners/banner_purple_perfume_3d.jpg';
import bannerNachosLight3D from '../../../assets/banners/banner_nachos_light_3d.jpg';

const AD_BANNERS = [
  {
    id: 'banner-cookware',
    image: bannerCookwareLight3D,
    title: 'Chef Collection Cookware - Up to 35% Off',
    subtitle: 'Cast Iron Pans • Dutch Pots • Glassware Sets',
    categoryId: 4, // Home & Kitchen
    tag: 'Kitchen & Dining',
    objectFit: 'object-cover',
    bgColor: 'bg-[#f4f8f5]',
    is3D: true,
  },
  {
    id: 'banner-fashion',
    image: bannerFashionLight3D,
    title: 'Soho Socks Gift Sets - Flat 40% Off',
    subtitle: 'Pure Combed Cotton • Luxury Edition Boxes',
    categoryId: 7, // Fashion
    tag: 'Fashion & Style',
    objectFit: 'object-cover',
    bgColor: 'bg-[#fff5f5]',
    is3D: true,
  },
  {
    id: 'banner-smarthome',
    image: bannerSmarthomeLight3D,
    title: 'Smart Home Essentials - Up to 35% Off',
    subtitle: 'Nexlev Garment Steamers • Cordless Cleaners',
    categoryId: 4, // Home & Kitchen
    tag: 'Smart Living',
    objectFit: 'object-cover',
    bgColor: 'bg-[#f0f9ff]',
    is3D: true,
  },
  {
    id: 'banner-smartwatch',
    image: bannerSmartwatchLight3D,
    title: 'Ultra Watch Series - Flat 15% Off',
    subtitle: 'AMOLED Display • Fitness Tracker • Calling',
    categoryId: 1, // Electronics / Wearables
    tag: 'Smart Wearables',
    objectFit: 'object-cover',
    bgColor: 'bg-[#f0f9ff]',
    is3D: true,
  },
  {
    id: 'banner-earbuds',
    image: bannerEarbudsLight3D,
    title: 'Pro Wireless Audio - Up to 20% Off',
    subtitle: 'Active Noise Cancellation • Spatial Sound',
    categoryId: 1, // Electronics / Audio
    tag: 'Wireless Audio',
    objectFit: 'object-cover',
    bgColor: 'bg-[#faf5ff]',
    is3D: true,
  },
  {
    id: 'banner-superfoods',
    image: bannerGreenSuperfoods3D,
    title: 'Organic Superfoods & Nuts - Up to 30% Off',
    subtitle: 'Raw Almonds, Cashews & Royal Dates',
    categoryId: 2, // Food & Beverages
    tag: 'Organic & Healthy',
    objectFit: 'object-cover',
    bgColor: 'bg-[#f0fdf4]',
    is3D: true,
  },
  {
    id: 'banner-perfumes',
    image: bannerPurplePerfume3D,
    title: 'Luxury Fragrance - Flat 25% Off',
    subtitle: 'Designer Eau De Parfum Sets',
    categoryId: 3, // Beauty / Fragrance
    tag: 'Luxury Fragrance',
    objectFit: 'object-cover',
    bgColor: 'bg-[#2e0854]',
    is3D: true,
  },
  {
    id: 'banner-nachos',
    image: bannerNachosLight3D,
    title: 'Gourmet Nacho Crunch - Flat 30% Off',
    subtitle: 'Artisan Cheese, Salsa & Peri Peri Snacks',
    categoryId: 2, // Food & Beverages
    tag: 'Fiesta Snacks',
    objectFit: 'object-cover',
    bgColor: 'bg-[#fef9c3]',
    is3D: true,
  },
];

interface EcommerceAdBannerCarouselProps {
  onSelectCategory?: (categoryId: number) => void;
}

export const EcommerceAdBannerCarousel: React.FC<EcommerceAdBannerCarouselProps> = ({ onSelectCategory }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleBannerClick = (banner: typeof AD_BANNERS[0]) => {
    if (onSelectCategory && banner.categoryId) {
      onSelectCategory(banner.categoryId);
    }
  };

  return (
    <section
      className="relative w-full group/adcarousel overflow-hidden select-none py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      aria-label="Promotional Banners"
    >
      {/* Embedded CSS Keyframes for buttery-smooth GPU accelerated continuous right-to-left slide */}
      <style>{`
        @keyframes bannerMarqueeSlow {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .banner-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: bannerMarqueeSlow 46s linear infinite;
        }
        .banner-marquee-track.is-paused {
          animation-play-state: paused;
        }
        @media (hover: hover) {
          .group\\/adcarousel:hover .banner-marquee-track {
            animation-play-state: paused;
          }
        }
      `}</style>

      {/* Infinite Seamless Scrolling Track */}
      <div className="relative w-full overflow-hidden">
        <div
          className={`banner-marquee-track flex items-center gap-3.5 sm:gap-5 ${
            isHovered ? 'is-paused' : ''
          }`}
        >
          {/* First Complete Sequence */}
          {AD_BANNERS.map((banner, index) => (
            <div
              key={`banner-seq1-${banner.id}-${index}`}
              onClick={() => handleBannerClick(banner)}
              className={`relative w-[78vw] sm:w-[410px] md:w-[460px] lg:w-[500px] shrink-0 aspect-[16/8] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100/80 shadow-xs hover:shadow-xl hover:scale-[1.02] group/card ${
                banner.bgColor || 'bg-white'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                loading={index < 3 ? 'eager' : 'lazy'}
                className={`w-full h-full ${
                  banner.objectFit || 'object-cover'
                } select-none pointer-events-none transition-transform duration-500 group-hover/card:scale-[1.03]`}
                draggable={false}
              />
            </div>
          ))}

          {/* Second Duplicate Sequence (Enables 100% Seamless Infinite Loop) */}
          {AD_BANNERS.map((banner, index) => (
            <div
              key={`banner-seq2-${banner.id}-${index}`}
              onClick={() => handleBannerClick(banner)}
              className={`relative w-[78vw] sm:w-[410px] md:w-[460px] lg:w-[500px] shrink-0 aspect-[16/8] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100/80 shadow-xs hover:shadow-xl hover:scale-[1.02] group/card ${
                banner.bgColor || 'bg-white'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                loading="lazy"
                className={`w-full h-full ${
                  banner.objectFit || 'object-cover'
                } select-none pointer-events-none transition-transform duration-500 group-hover/card:scale-[1.03]`}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Purple-Pink Bottom Glow Strip */}
      <div className="w-36 h-0.5 mx-auto mt-2 rounded-full bg-gradient-to-r from-purple-400/40 via-pink-400/40 to-indigo-400/40 blur-[1px] pointer-events-none" />
    </section>
  );
};

export default EcommerceAdBannerCarousel;
