// src/modules/ecommerce/components/EcommerceFlashSale.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { fetchCampaignProducts } from '../../../api/campaignApi';
import flashSaleTitleImg from '../../../assets/ecommerce/flash_sale_title.png';
import flashSaleBgSvg from '../../../assets/ecommerce/Flash_Sale_Bg.svg';

export const EcommerceFlashSale = ({ campaignId = 4 }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchCampaignProducts(campaignId)
      .then((data) => {
        if (!isMounted) return;
        setProducts(data || []);
      })
      .catch((err) => console.error('Failed to load flash sale products:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [campaignId]);


  if (loading && products.length === 0) {
    return (
      <div className="h-72 w-full rounded-3xl bg-amber-50 animate-pulse border border-amber-200" />
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden rounded-3xl p-5 sm:p-7 shadow-lg bg-gradient-to-r from-[#FFD885] via-[#FDBA44] to-[#F59E0B]">
      {/* Background SVG Overlay */}
      <img
        src={flashSaleBgSvg}
        alt="Flash Sale Pattern"
        className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay pointer-events-none"
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* Left 3D Flash Sale Hero Title & Timer */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left shrink-0 space-y-3">
          <img
            src={flashSaleTitleImg}
            alt="FLASH SALE"
            className="h-20 sm:h-24 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform"
          />

          <div className="bg-white/85 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-xs flex items-center gap-1.5 border border-white/60">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Ends in:</span>
            <span className="text-rose-600 font-extrabold tracking-wider">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>

        {/* Right Scrollable Product Cards */}
        <div
          ref={scrollRef}
          className="w-full flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 scroll-smooth"
        >
          {products.map((item) => {
            const prodId = item.product_id || item.id;
            return (
              <div
                key={prodId}
                onClick={() => navigate(`/product/${prodId}`)}
                className="group w-48 sm:w-56 shrink-0 bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer border border-amber-100 hover:border-amber-300"
              >
                {/* Image & Discount Badge */}
                <div className="relative w-full aspect-square bg-[#FAFAFA] rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2">
                  {Boolean(item.discount) && (
                    <span className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 rounded-md bg-[#FDE68A] text-amber-900 text-[10px] font-black tracking-wide shadow-2xs">
                      {item.discount}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-gray-400 hover:text-rose-500 shadow-2xs"
                  >
                    <Heart size={13} />
                  </button>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {item.brand || 'PREMIUM'}
                  </span>
                  <h4 className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-sm font-black text-gray-900">
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default React.memo(EcommerceFlashSale);
