// src/modules/ecommerce/components/EcommerceAdBannerCarousel.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import banner1 from '../../../assets/banners/bannerimge1.png';
import banner2 from '../../../assets/banners/bannerimage2.png';
import banner3 from '../../../assets/banners/bannerimage3.png';

const AD_BANNERS = [
  {
    id: 'banner-1',
    image: banner1,
    title: 'Colgate Total - Up to 50% Off',
    subtitle: 'Prevent dental issues • Upgrade to Colgate Total',
    categoryId: 3, // Beauty / Personal Care
    tag: 'Personal Care',
    objectFit: 'object-contain',
    bgColor: 'bg-white',
  },
  {
    id: 'banner-2',
    image: banner2,
    title: 'Lava Virat Curve',
    subtitle: 'Watch now • Launch event is live',
    categoryId: 1, // Electronics
    tag: 'Mobiles',
    objectFit: 'object-cover',
    bgColor: 'bg-[#0f172a]',
  },
  {
    id: 'banner-3',
    image: banner3,
    title: 'Kurta Sets - Min. 75% Off',
    subtitle: 'Top ethnic collection! Early Bird Deals',
    categoryId: 7, // Fashion
    tag: 'Fashion',
    objectFit: 'object-cover',
    bgColor: 'bg-[#581c87]',
  },
];

export const EcommerceAdBannerCarousel = ({ onSelectCategory }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);

  // Scroll smoothly to a specific slide index
  const scrollToSlide = useCallback((index) => {
    const targetIndex = (index + AD_BANNERS.length) % AD_BANNERS.length;
    setActiveIndex(targetIndex);

    const container = scrollRef.current;
    const card = cardRefs.current[targetIndex];
    if (container && card) {
      const containerWidth = container.offsetWidth;
      const cardWidth = card.offsetWidth;
      const cardLeft = card.offsetLeft;
      
      const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  }, []);

  // Detect which slide is currently in the center during manual scroll
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  // Next and Previous Handlers
  const handleNext = () => {
    scrollToSlide(activeIndex + 1);
  };

  const handlePrev = () => {
    scrollToSlide(activeIndex - 1);
  };

  // Autoplay Effect (cycles every 4.5 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      scrollToSlide(activeIndex + 1);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, isPaused, scrollToSlide]);

  const handleBannerClick = (banner) => {
    if (onSelectCategory && banner.categoryId) {
      onSelectCategory(banner.categoryId);
    }
  };

  return (
    <section
      className="relative w-full group/adcarousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional Banners"
    >
      {/* Scrollable Track Container */}
      <div className="relative w-full">
        {/* Previous Navigation Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/adcarousel:opacity-100 transition-all duration-200 cursor-pointer hover:scale-105"
          aria-label="Previous Banner"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Banners Row */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex items-center gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 sm:px-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {AD_BANNERS.map((banner, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={banner.id}
                ref={(el) => (cardRefs.current[index] = el)}
                onClick={() => handleBannerClick(banner)}
                style={{ scrollSnapAlign: 'center' }}
                className={`w-[85vw] sm:w-[440px] md:w-[500px] lg:w-[560px] shrink-0 aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100/80 ${
                  banner.bgColor || 'bg-white'
                } ${
                  isActive
                    ? 'shadow-md scale-[1.01] ring-1 ring-purple-100'
                    : 'shadow-xs hover:shadow-md opacity-95 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  className={`w-full h-full ${
                    banner.objectFit || 'object-cover'
                  } select-none pointer-events-none`}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Next Navigation Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/adcarousel:opacity-100 transition-all duration-200 cursor-pointer hover:scale-105"
          aria-label="Next Banner"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Centered Pagination Dots (Matching exact mobile app indicator) */}
      <div className="flex items-center justify-center gap-1.5 pt-2.5 pb-1">
        {AD_BANNERS.map((banner, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={banner.id}
              type="button"
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to banner ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? 'w-5 bg-gray-700'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          );
        })}
      </div>

      {/* Subtle Purple-Pink Bottom Glow Strip (Inspired by mobile reference) */}
      <div className="w-36 h-0.5 mx-auto rounded-full bg-gradient-to-r from-purple-400/40 via-pink-400/40 to-indigo-400/40 blur-[1px] pointer-events-none" />
    </section>
  );
};

export default EcommerceAdBannerCarousel;
