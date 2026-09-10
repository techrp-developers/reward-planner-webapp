// src/components/product/ProductCard.jsx
// Exact mobile component ported 1:1 from reward-planner-mobileapp ProductCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import RPpriceBadge from '../ui/RPpriceBadge';
import PointsButton from '../ui/PointsButton';
import StarRating from '../ui/StarRating';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../api/client';

export const ProductCard = ({ item }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const val = item?.is_wishlisted ?? item?.is_wishlist;
    return val === true || val === 1 || val === '1' || val === 'true';
  });
  const [isAdding, setIsAdding] = useState(false);

  if (!item) return null;

  const id = item.id || item.product_id || item.productId;
  const productTitle = [
    item?.product_name || item?.title || item?.name,
    item?.brand || item?.brand_name,
  ]
    .filter(Boolean)
    .join(' ') || 'Product';

  const rawImage =
    item?.image ||
    item?.image_url ||
    item?.thumbnail ||
    (Array.isArray(item?.images) ? item.images[0] : null);
  const image = getImageUrl(rawImage);

  const cleanNumber = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : Number(val.toFixed(2));
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  };

  const formatPrice = (val) => {
    const num = cleanNumber(val);
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  };

  const price = cleanNumber(
    item?.price ??
    item?.selling_price ??
    item?.sale_price ??
    item?.final_price
  );

  const rawOriginalPrice =
    item?.originalPrice ??
    item?.original_price ??
    item?.mrp ??
    item?.regular_price;
  const originalPrice = cleanNumber(rawOriginalPrice);

  // Discount
  const rawDiscount = item?.discount ?? item?.discount_percent ?? item?.off_percent;
  let discountText = rawDiscount ? String(rawDiscount).trim() : '';
  if (!discountText && originalPrice > price && price > 0) {
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
    if (pct > 0) discountText = `${pct}%`;
  }
  if (discountText && !discountText.includes('%') && !discountText.toLowerCase().includes('off')) {
    discountText = `${discountText}%`;
  }

  // RP Price: ONLY present if explicitly set on product in backend!
  const rp_price = item?.rp_price ?? item?.rpPrice ?? item?.reward_price ?? '';

  const rating = Number(item?.rating ?? item?.avg_rating ?? 4.5);
  const reviewCount = item?.reviews_count ?? item?.total_reviews ?? item?.reviews ?? 0;

  const rewardCoins = Number(
    item?.rewardCoins ?? item?.reward_coins ?? item?.points ?? Math.round(price * 0.08) ?? 0
  );
  const redeemCoins = Number(
    item?.redeem_coins ?? item?.redeemCoins ?? Math.round(price * 0.25) ?? 0
  );

  const handleCardClick = () => {
    if (id) navigate(`/product/${id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAdding(true);
    await addItem({
      product_id: id,
      variant_id: item?.variant_id || item?.default_variant_id || item?.variants?.[0]?.variant_id || item?.id || id || 1,
      quantity: 1,
      product: {
        id,
        product_id: id,
        title: productTitle,
        price,
        originalPrice,
        image,
      },
      openDrawer: true,
    });
    setIsAdding(false);
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-violet-200 transition-all duration-300 flex flex-col justify-between cursor-pointer p-2 sm:p-2.5"
    >
      {/* 1. TOP IMAGE WRAPPER (MATCHING MOBILE styles.imageWrap) */}
      <div className="relative w-full aspect-square bg-[#F9FAFB] rounded-xl overflow-hidden flex items-center justify-center p-2">
        {/* RP Price Badge: ONLY SHOWN IF rp_price IS EXPLICITLY PRESENT */}
        {Boolean(rp_price) && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <RPpriceBadge value={rp_price} />
          </div>
        )}

        {/* Wishlist Heart Icon (Top-Right) */}
        <button
          onClick={toggleWishlist}
          type="button"
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ fontSize: 14 }} className="text-rose-500" />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 14 }} className="text-gray-400 hover:text-rose-500" />
          )}
        </button>

        {/* Product Image */}
        <img
          src={image}
          alt={productTitle}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/placeholder.svg';
          }}
        />

        {/* Quick Add to Cart Hover Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="absolute bottom-1.5 inset-x-2 py-1.5 rounded-lg text-white font-bold text-[11px] flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer"
          style={{ backgroundColor: '#7C3AED' }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 14 }} />
          <span>{isAdding ? 'Adding...' : 'Quick Add'}</span>
        </button>
      </div>

      {/* 2. DETAILS (MATCHING MOBILE styles.details) */}
      <div className="pt-2 flex flex-col flex-1 justify-between">
        <div>
          {/* Title Row */}
          <h4 className="text-[11px] font-medium text-[#374151] line-clamp-2 leading-[15px] min-h-[30px] group-hover:text-[#7C3AED] transition-colors">
            {productTitle}
          </h4>

          {/* Star Rating Row */}
          <div className="mt-1 flex items-center">
            <StarRating rating={rating} count={reviewCount > 0 ? reviewCount : undefined} />
          </div>

          {/* Price Row (Order matches mobile: Discount Tag -> Strike MRP -> Final Price) */}
          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mt-1.5">
            {/* Discount Indicator */}
            {Boolean(discountText) && (
              <div className="inline-flex items-center bg-[#ECFDF5] px-1.5 py-0.5 rounded text-[10px] font-bold text-[#16A34A] leading-none">
                <span className="font-black mr-0.5">↓</span>
                <span>{discountText}</span>
              </div>
            )}

            {/* Original MRP (Strikethrough) */}
            {originalPrice > price && (
              <span className="text-[11px] text-[#9CA3AF] line-through font-normal leading-none">
                ₹{formatPrice(originalPrice)}
              </span>
            )}

            {/* Final Price */}
            <span className="text-sm font-black text-[#111827] leading-none">
              ₹{formatPrice(price)}
            </span>
          </div>
        </div>

        {/* 3. POINTS BUTTON (MATCHING MOBILE styles.pointsWrap) */}
        <div className="mt-2.5">
          <PointsButton
            rewardCoins={rewardCoins}
            redeemCoins={redeemCoins}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
