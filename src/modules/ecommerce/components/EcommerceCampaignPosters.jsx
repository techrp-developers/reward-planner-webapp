// src/modules/ecommerce/components/EcommerceCampaignPosters.jsx
import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCampaignHome } from '../../../api/campaignApi';

export const EcommerceCampaignPosters = ({ onSelectCategory }) => {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetchCampaignHome()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data?.posters) ? data.posters : [];
        setPosters(list);
      })
      .catch((err) => console.error('Failed to load campaign posters:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading && posters.length === 0) {
    return (
      <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-hidden py-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-[176px] min-w-[176px] h-[319px] sm:w-[210px] sm:min-w-[210px] sm:h-[380px] md:w-[240px] md:min-w-[240px] md:h-[435px] lg:w-[260px] lg:min-w-[260px] lg:h-[470px] shrink-0 bg-gray-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (posters.length === 0) return null;

  const handlePosterClick = (poster) => {
    if (poster.redirect_type === 'category' && poster.redirect_id) {
      onSelectCategory(poster.redirect_id);
    } else if (poster.redirect_url) {
      window.open(poster.redirect_url, '_blank');
    }
  };

  return (
    <section className="relative w-full group/carousel">
      {/* Desktop Navigation Chevrons */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-md items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-md items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>

      {/* Horizontal Scroll Track matching app screen proportions */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 lg:justify-center"
      >
        {posters.map((poster) => (
          <div
            key={poster.campaign_id}
            onClick={() => handlePosterClick(poster)}
            className="group relative overflow-hidden rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer border border-black/5 hover:-translate-y-1 w-[176px] min-w-[176px] h-[319px] sm:w-[210px] sm:min-w-[210px] sm:h-[380px] md:w-[240px] md:min-w-[240px] md:h-[435px] lg:w-[280px] lg:min-w-[280px] lg:h-[507px] shrink-0"
          >
            <img
              src={poster.banner_image}
              alt={poster.title}
              loading="lazy"
              className="w-full h-full object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(EcommerceCampaignPosters);
