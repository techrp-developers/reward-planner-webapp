// src/components/home/HeroBannerCarousel.jsx
// High-Resolution 4-Slide Hero Banner Carousel matching Reward Planners reference design
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// High-Res Banner Images
import banner1 from '../../assets/banners/banner1.jpeg';
import banner2 from '../../assets/banners/banner2.png';
import banner3 from '../../assets/banners/banner3.png';
import banner4 from '../../assets/banners/banner4.png';

// Material UI Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const BANNER_SLIDES = [
  {
    id: 1,
    image: banner1,
    alt: 'Everyday Actions. Bigger Rewards.',
    ctaText: 'Get Started',
    ctaLink: '#services',
  },
  {
    id: 2,
    image: banner2,
    alt: 'Payments Made Simple.',
    ctaText: 'Pay Bills Now',
    ctaLink: '/bbps',
  },
  {
    id: 3,
    image: banner3,
    alt: 'Services for Every Need.',
    ctaText: 'Explore Services',
    ctaLink: '/services',
  },
  {
    id: 4,
    image: banner4,
    alt: 'Rewards on Everything You Do.',
    ctaText: 'Explore Store',
    ctaLink: '/store',
  },
];

export const HeroBannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  }, []);

  // Auto-play every 4.5 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const handleCtaClick = (e, link) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Card Container with 8:3 Aspect Ratio so only services title shows below on initial load */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-gray-100 aspect-[8/3] max-h-[540px] bg-slate-50">
        {BANNER_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />

            {/* Overlaid CTA Button positioned at the end row of the banner below all text content */}
            <div className="absolute bottom-[4%] sm:bottom-[4.5%] md:bottom-[5%] left-[6%] sm:left-[7%] md:left-[8%] z-20">
              <Link
                to={slide.ctaLink}
                onClick={(e) => handleCtaClick(e, slide.ctaLink)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 rounded-full bg-[#5222E8] hover:bg-[#4318D6] text-white font-bold text-[10px] sm:text-xs md:text-sm shadow-md sm:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowForwardIcon sx={{ fontSize: { xs: 13, sm: 15, md: 16 } }} />
              </Link>
            </div>
          </div>
        ))}

        {/* Floating Left Arrow */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/95 hover:bg-white shadow-md border border-purple-100 text-purple-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
        </button>

        {/* Floating Right Arrow */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/95 hover:bg-white shadow-md border border-purple-100 text-purple-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRightIcon sx={{ fontSize: 20 }} />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2 py-1 rounded-full">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-4 sm:w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBannerCarousel;
