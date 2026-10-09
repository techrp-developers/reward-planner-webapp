// src/components/services/ServiceBannerCarousel.tsx
// Senior UI/UX Designer Service Promotional Banner Carousel
// High-Resolution Local HD Banner Assets matching exact service offerings

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../api/client';

// Material UI Icons
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// High-Resolution Local HD Banner Assets (Exact 7 banner graphics provided by user)
import bannerItrNew from '../../assets/servicescards/banner-itr-new.png';
import bannerPanUpdate from '../../assets/servicescards/banner-pan-update.png';
import bannerCarNew from '../../assets/servicescards/banner-car-new.png';
import bannerPanService from '../../assets/servicescards/banner-pan-service.png';
import bannerBikeNew from '../../assets/servicescards/banner-bike-new.png';
import bannerHealthNew from '../../assets/servicescards/banner-health-new.png';
import bannerCarOffer from '../../assets/servicescards/banner-car-offer.png';

export interface ServiceBannerRedirect {
  type?: string;
  id?: number | string | null;
  url?: string | null;
}

export interface ServiceBannerItem {
  id: number | string;
  title: string;
  subtitle?: string;
  image_url?: string;
  hd_image?: string;
  fallback_image?: string;
  redirect?: ServiceBannerRedirect;
}

export interface ServiceBannerCarouselProps {
  banners?: ServiceBannerItem[];
}

// Helper to resolve the matching crystal-clear banner for any service
export const getServiceBanner = (serviceId: string | number | undefined, serviceName = ''): string => {
  const sName = String(serviceName || '').toLowerCase();
  const sId = Number(serviceId);

  if (sId === 10 || sName.includes('car')) return bannerCarNew;
  if (sId === 7 || sId === 13 || sName.includes('tax') || sName.includes('itr') || sName.includes('income')) return bannerItrNew;
  if (sId === 6 || sId === 11 || sName.includes('bike') || sName.includes('two')) return bannerBikeNew;
  if (sId === 1 || sId === 9 || sName.includes('pan')) return bannerPanUpdate;
  if (sId === 3 || sId === 12 || sName.includes('health') || sName.includes('mediclaim')) return bannerHealthNew;

  return bannerCarNew;
};

export const DUMMY_SERVICE_BANNERS: ServiceBannerItem[] = [
  {
    id: 13,
    title: 'Income Tax Return Filing',
    subtitle: 'File Your ITR Without Stress',
    hd_image: bannerItrNew,
    fallback_image: bannerItrNew,
    redirect: { type: 'service', id: 13, url: null },
  },
  {
    id: 1,
    title: 'PAN Card Update',
    subtitle: 'PAN Card Update Made Simple',
    hd_image: bannerPanUpdate,
    fallback_image: bannerPanUpdate,
    redirect: { type: 'service', id: 1, url: null },
  },
  {
    id: 10,
    title: 'Car Insurance',
    subtitle: 'Save up to ₹600 on new or renewal',
    hd_image: bannerCarNew,
    fallback_image: bannerCarNew,
    redirect: { type: 'service', id: 10, url: null },
  },
  {
    id: 9,
    title: 'PAN Card Services',
    subtitle: 'PAN Card Services Made Easy',
    hd_image: bannerPanService,
    fallback_image: bannerPanService,
    redirect: { type: 'service', id: 1, url: null },
  },
  {
    id: 11,
    title: 'Two-Wheeler Insurance',
    subtitle: 'Flat ₹200 OFF on renewals',
    hd_image: bannerBikeNew,
    fallback_image: bannerBikeNew,
    redirect: { type: 'service', id: 11, url: null },
  },
  {
    id: 12,
    title: 'Health Insurance',
    subtitle: 'Extra 5% OFF on first purchase',
    hd_image: bannerHealthNew,
    fallback_image: bannerHealthNew,
    redirect: { type: 'service', id: 12, url: null },
  },
  {
    id: 101,
    title: 'Car Insurance Offer',
    subtitle: 'Get up to ₹600 off On Car Insurance!',
    hd_image: bannerCarOffer,
    fallback_image: bannerCarOffer,
    redirect: { type: 'service', id: 10, url: null },
  },
];

export const ServiceBannerCarousel: React.FC<ServiceBannerCarouselProps> = ({ banners: propBanners }) => {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // If propBanners is empty or contains items without hd_image, use high quality local banners
  const displayBanners = Array.isArray(propBanners) && propBanners.length > 0 && propBanners.some((b) => b.hd_image)
    ? propBanners
    : DUMMY_SERVICE_BANNERS;

  const totalSlides = displayBanners.length;

  // Auto rotate every 3.5 seconds
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % totalSlides);
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % totalSlides);
  };

  const handleBannerClick = (banner: ServiceBannerItem) => {
    if (banner?.redirect?.type === 'service' && banner?.redirect?.id) {
      navigate(`/services/detail/${banner.redirect.id}`);
    } else if (banner?.redirect?.url) {
      window.open(banner.redirect.url, '_blank');
    }
  };

  if (!displayBanners || displayBanners.length === 0) return null;

  return (
    <div
      className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden select-none group shadow-sm"
      style={{ aspectRatio: '1024 / 395' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Track - Direct full-width image slides */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out cursor-pointer"
        style={{ transform: `translateX(-${activeIdx * 100}%)` }}
      >
        {displayBanners.map((banner, i) => {
          // Prefer high-definition local asset for crispness; fallback to API or default
          const imgSrc = banner.hd_image || banner.fallback_image || (banner.image_url ? getImageUrl(banner.image_url) : bannerCarNew);

          return (
            <div
              key={banner.id || i}
              onClick={() => handleBannerClick(banner)}
              className="w-full h-full shrink-0 relative select-none"
              title={banner.title || 'Service Banner'}
            >
              <img
                src={imgSrc}
                alt={banner.title || 'Service Banner'}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  if (banner.fallback_image && (e.target as HTMLImageElement).src !== banner.fallback_image) {
                    (e.target as HTMLImageElement).src = banner.fallback_image;
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
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setActiveIdx(i);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === activeIdx ? 'w-6 bg-[#8b3ab5]' : 'w-2 bg-white/70 hover:bg-white'
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
