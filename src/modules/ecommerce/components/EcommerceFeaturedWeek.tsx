// src/modules/ecommerce/components/EcommerceFeaturedWeek.jsx
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../../components/product/ProductCard';

export const EcommerceFeaturedWeek = ({
  products = [],
  loading = false,
  onExplore,
}) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="relative w-full rounded-3xl p-5 sm:p-7 shadow-lg overflow-hidden bg-gradient-to-br from-[#F6D58B] via-[#D69A33] to-[#8A531F]">
      {/* Decorative Gold Rings / Shimmer Overlay */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      {/* Header Row */}
      <div className="relative z-10 flex items-center justify-between pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Featured This Week
          </h3>
          <p className="text-xs text-amber-950/80 font-semibold mt-0.5">
            Handpicked premium corporate perks and employee favorites
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Chevrons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="text-xs sm:text-sm font-bold text-gray-900 hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer bg-white/70 hover:bg-white/90 px-3 py-1.5 rounded-full shadow-2xs group"
          >
            <span>Explore More</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Product Row */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex items-center gap-4 overflow-x-hidden py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-48 sm:w-60 shrink-0 aspect-[3/4] bg-white/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
          >
            {products.map((item) => (
              <div key={item.id || item.product_id} className="w-48 sm:w-60 shrink-0">
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(EcommerceFeaturedWeek);
