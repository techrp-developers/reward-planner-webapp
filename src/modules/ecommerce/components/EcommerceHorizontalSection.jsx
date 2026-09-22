// src/modules/ecommerce/components/EcommerceHorizontalSection.jsx
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../../components/product/ProductCard';

export const EcommerceHorizontalSection = ({
  title,
  subtitle,
  actionText = 'Explore More',
  onAction,
  products = [],
  loading = false,
}) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full space-y-3.5">
      {/* Header Row */}
      <div className="flex items-end justify-between border-b border-gray-100 pb-2.5">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Chevrons for Desktop */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Action Link (View All / Explore More) */}
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#7C3AED] flex items-center gap-0.5 transition-colors cursor-pointer group"
            >
              <span>{actionText}</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      {loading ? (
        <div className="flex items-center gap-4 overflow-x-hidden py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-44 sm:w-56 shrink-0 aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
        >
          {products.map((item) => (
            <div key={item.id || item.product_id} className="w-44 sm:w-56 shrink-0">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(EcommerceHorizontalSection);
