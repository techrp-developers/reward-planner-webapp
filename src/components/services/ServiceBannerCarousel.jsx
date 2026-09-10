// src/components/services/ServiceBannerCarousel.jsx
// Senior UI/UX Designer Service Promotional Banner Carousel
// Preserves exact previous banner card UI, same background images, same content with razor-sharp HD clarity

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../api/client';

// Material UI Icons
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// High-Resolution Local HD Banner Assets (Exact same graphics & content, 3x sharp resolution)
import bannerCarHD from '../../assets/servicescards/car-hd.png';
import bannerTaxHD from '../../assets/servicescards/tax-hd.png';
import bannerBikeHD from '../../assets/servicescards/bike-hd.png';
import bannerPanHD from '../../assets/servicescards/pan-hd.png';
import bannerRentHD from '../../assets/servicescards/rent-hd.png';
import bannerHealthHD from '../../assets/servicescards/health-hd.png';
import bannerTwoWheelerHD from '../../assets/servicescards/two_wheeler-hd.png';

// Helper to resolve the matching crystal-clear banner for any service
export const getServiceBanner = (serviceId, serviceName = '') => {
  const sName = String(serviceName || '').toLowerCase();
  const sId = Number(serviceId);

  if (sId === 10 || sName.includes('car')) return bannerCarHD;
  if (sId === 7 || sId === 13 || sName.includes('tax') || sName.includes('itr') || sName.includes('income')) return bannerTaxHD;
  if (sId === 6 || sId === 11 || sName.includes('bike')) return bannerBikeHD;
  if (sId === 1 || sId === 9 || sName.includes('pan')) return bannerPanHD;
  if (sId === 8 || sName.includes('rent') || sName.includes('agreement')) return bannerRentHD;
  if (sId === 3 || sId === 12 || sName.includes('health') || sName.includes('mediclaim')) return bannerHealthHD;
  if (sId === 4 || sId === 16 || sName.includes('two') || sName.includes('mseb') || sName.includes('license')) return bannerTwoWheelerHD;

  return bannerCarHD;
};

export const DUMMY_SERVICE_BANNERS = [
  {
    id: 10,
    title: 'Car Insurance',
    subtitle: 'Car',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/1780257163812-w92w2y-car insurance.png?v=2026-06-01%2001%3A22%3A44',
    hd_image: bannerCarHD,
    fallback_image: bannerCarHD,
    redirect: { type: 'service', id: 10, url: null },
  },
  {
    id: 7,
    title: 'ITR Filing',
    subtitle: 'Income Tax',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/1780256921789-ygcnql-Income Tax.png?v=2026-06-01%2001%3A18%3A42',
    hd_image: bannerTaxHD,
    fallback_image: bannerTaxHD,
    redirect: { type: 'service', id: 13, url: null },
  },
  {
    id: 6,
    title: 'Bike Insurance',
    subtitle: 'Bike',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/1780256860323-2dl4o4-Bike insurance.png?v=2026-06-01%2001%3A17%3A41',
    hd_image: bannerBikeHD,
    fallback_image: bannerBikeHD,
    redirect: { type: 'service', id: 11, url: null },
  },
  {
    id: 9,
    title: 'Pan Card Service',
    subtitle: 'Pan Card',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/1780257049156-2m1dig-Pan card.png?v=2026-06-01%2001%3A21%3A56',
    hd_image: bannerPanHD,
    fallback_image: bannerPanHD,
    redirect: { type: 'service', id: 1, url: null },
  },
  {
    id: 8,
    title: 'Rent Agreement',
    subtitle: 'Rent',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/1780256972078-mya2g9-Rent agreement.png?v=2026-06-01%2001%3A19%3A32',
    hd_image: bannerRentHD,
    fallback_image: bannerRentHD,
    redirect: { type: 'service', id: 9, url: null },
  },
  {
    id: 3,
    title: 'Health Insurance',
    subtitle: 'Health',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/3/1780253035033-byjzb6.png?v=2026-06-01%2000%3A13%3A55',
    hd_image: bannerHealthHD,
    fallback_image: bannerHealthHD,
    redirect: { type: 'service', id: 12, url: null },
  },
  {
    id: 4,
    title: 'Two wheeler Insurance',
    subtitle: 'Two wheeler',
    image_url: 'https://cdn.rewardplanners.com/public/service-banners/4/1780253044733-ll0xwy.png?v=2026-06-01%2000%3A14%3A05',
    hd_image: bannerTwoWheelerHD,
    fallback_image: bannerTwoWheelerHD,
    redirect: { type: 'service', id: 11, url: null },
  },
];

export const ServiceBannerCarousel = ({ banners: propBanners }) => {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const displayBanners = Array.isArray(propBanners) && propBanners.length > 0
    ? propBanners
    : DUMMY_SERVICE_BANNERS;

  const totalSlides = displayBanners.length;

  // Auto rotate every 3.5 seconds
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % totalSlides);
    }, 3500);

    return () => clearInterval(timerRef.current);
  }, [isPaused, totalSlides]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % totalSlides);
  };

  const handleBannerClick = (banner) => {
    if (banner?.redirect?.type === 'service' && banner?.redirect?.id) {
      navigate(`/services/detail/${banner.redirect.id}`);
    } else if (banner?.redirect?.url) {
      window.open(banner.redirect.url, '_blank');
    }
  };

  if (!displayBanners || displayBanners.length === 0) return null;

  return (
    <div
      className="w-full relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-76 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-gray-200/80 bg-gradient-to-r from-[#F8F9FD] via-[#F4F5FA] to-[#EEF0F8] group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Uniform Sliding Track - Every Banner Slide Has Exactly Identical Dimensions */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out cursor-pointer"
        style={{ transform: `translateX(-${activeIdx * 100}%)` }}
      >
        {displayBanners.map((banner, i) => {
          // Prefer high-definition local asset for crispness; fallback to API or default
          const imgSrc = banner.hd_image || banner.fallback_image || (banner.image_url ? getImageUrl(banner.image_url) : bannerCarHD);
          return (
            <div
              key={banner.id || i}
              onClick={() => handleBannerClick(banner)}
              className="w-full h-full shrink-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none bg-gradient-to-r from-[#F8F9FD] via-[#F4F5FA] to-[#EEF0F8]"
              title={banner.title || 'Service Banner'}
            >
              <img
                src={imgSrc}
                alt={banner.title || 'Service Banner'}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01] drop-shadow-xs"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
                onError={(e) => {
                  if (banner.fallback_image && e.target.src !== banner.fallback_image) {
                    e.target.src = banner.fallback_image;
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Left / Right Carousel Controls */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 hover:scale-105"
            aria-label="Previous banner"
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 hover:scale-105"
            aria-label="Next banner"
          >
            <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
          </button>
        </>
      )}

      {/* Carousel Dots */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {displayBanners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(i);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === activeIdx ? 'w-6 bg-[#FC8BAD]' : 'w-2 bg-white/70 hover:bg-white'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceBannerCarousel;
