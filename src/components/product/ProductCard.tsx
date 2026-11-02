// src/components/product/ProductCard.tsx
// Exact implementation matching reward-planner-mobileapp ProductCard.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StarRating from '../ui/StarRating';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../api/client';

interface Props {
  item: any;
  onProductPress?: (productId: string | number, item: any) => void;
}

export const ProductCard: React.FC<Props> = ({ item, onProductPress }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState<boolean>(() => {
    const val = item?.is_wishlisted ?? item?.is_wishlist;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    const normalized = String(val ?? '').trim().toLowerCase();
    return ['1', 'true', 'yes', 'y'].includes(normalized);
  });
  const [isAdding, setIsAdding] = useState(false);

  if (!item) return null;

  const id = item.id || item.product_id || item.productId;
  const productNameText = item?.product_name || item?.title || item?.name || 'Product';
  const brandText = item?.brand || item?.brand_name || '';

  const rawImage =
    item?.image ||
    item?.image_url ||
    item?.thumbnail ||
    (Array.isArray(item?.images) ? item.images[0] : null);
  const image = getImageUrl(rawImage);

  const cleanNumber = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : Number(val.toFixed(2));
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  };

  const formatPrice = (val: any) => {
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
    item?.final_price ??
    item?.variant_price
  );

  const rawOriginalPrice =
    item?.originalPrice ??
    item?.original_price ??
    item?.mrp ??
    item?.compare_at_price ??
    item?.regular_price;
  const originalPrice = cleanNumber(rawOriginalPrice);

  // Discount
  const rawDiscount =
    item?.discount ??
    item?.discount_percent ??
    item?.off_percent ??
    item?.discountPercentage;
  let discountText = rawDiscount ? String(rawDiscount).trim() : '';
  if (!discountText && originalPrice > price && price > 0) {
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
    if (pct > 0) discountText = `${pct}%`;
  }
  if (discountText && !discountText.includes('%') && !discountText.toLowerCase().includes('off')) {
    discountText = `${discountText}%`;
  }

  // RP Price: Single source of truth matching mobile - shown only when it's a finite number > 0
  const getRpPriceText = (rpPrice: unknown): string | undefined => {
    if (rpPrice === null || rpPrice === undefined || rpPrice === '') {
      return undefined;
    }
    const numericRpPrice = Number(String(rpPrice).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numericRpPrice) || numericRpPrice <= 0) {
      return undefined;
    }
    return `RP ₹${formatPrice(numericRpPrice)}`;
  };

  const rawRpPrice =
    item?.rp_price ??
    item?.rpPrice ??
    item?.rp_amount ??
    item?.rpAmount ??
    item?.reward_price ??
    item?.rewardPrice ??
    item?.member_price ??
    item?.memberPrice;
  const rpPriceText = getRpPriceText(rawRpPrice);

  const ratingValue = Number(
    item?.rating ??
    item?.avg_rating ??
    item?.average_rating ??
    item?.rating_avg ??
    item?.ratings ??
    4.5
  );
  const safeRating = Number.isFinite(ratingValue)
    ? Math.max(0, Math.min(5, Math.round(ratingValue)))
    : 5;

  const rawReviews =
    item?.reviews ??
    item?.review_count ??
    item?.reviewCount ??
    item?.total_reviews ??
    item?.reviews_count;
  const reviewCount = rawReviews ? Number(rawReviews) : 0;

  const handleCardClick = () => {
    if (onProductPress && id) {
      onProductPress(id, item);
      return;
    }
    if (id) navigate(`/product/${id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem({
        product_id: id,
        variant_id:
          item?.variant_id ||
          item?.default_variant_id ||
          item?.variants?.[0]?.variant_id ||
          item?.id ||
          id ||
          1,
        quantity: 1,
        product: {
          id,
          product_id: id,
          title: productNameText,
          price,
          originalPrice,
          image,
        },
        openDrawer: true,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-[#EEF0F4] hover:border-violet-300 transition-all duration-200 flex flex-col justify-between cursor-pointer p-[7px] shadow-[0_1px_3px_rgba(17,24,39,0.06),0_1px_2px_rgba(17,24,39,0.04)] hover:shadow-lg"
    >
      {/* 1. TOP IMAGE WRAPPER (MATCHING MOBILE styles.imageWrap) */}
      <div className="relative w-full aspect-square bg-[#F9FAFB] rounded-lg sm:rounded-xl border border-[#F1F2F5] overflow-hidden flex items-center justify-center p-2">
        {/* Discount badge: top-left over the image */}
        {Boolean(discountText) && (
          <div className="absolute top-1.5 left-1.5 z-10 flex items-center bg-[#EAF8EF] px-1.5 py-0.5 rounded">
            <span className="text-[#16A34A] font-black text-[9px] sm:text-[10px] leading-none mr-0.5">
              ↓
            </span>
            <span className="text-[#16A34A] font-bold text-[9px] sm:text-[10px] leading-none">
              {discountText}
            </span>
          </div>
        )}

        {/* Wishlist Heart Icon (Top-Right) */}
        <button
          onClick={toggleWishlist}
          type="button"
          aria-label="Wishlist"
          className="absolute top-1.5 right-1.5 z-10 w-[26px] h-[26px] rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-gray-400 hover:text-[#E53935] hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ fontSize: 14 }} className="text-[#E53935]" />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 14 }} className="text-[#9CA3AF] hover:text-[#E53935]" />
          )}
        </button>

        {/* Product Image */}
        <img
          src={image}
          alt={productNameText}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as any).src = '/placeholder.svg';
          }}
        />

        {/* Quick Add to Cart Hover Button (Desktop Convenience) */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="absolute bottom-1.5 inset-x-2 py-1.5 rounded-lg text-white font-bold text-[11px] flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer"
          style={{ background: 'linear-gradient(90deg, #6952C6 0%, #7C3AED 100%)' }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 14 }} />
          <span>{isAdding ? 'Adding...' : 'Quick Add'}</span>
        </button>
      </div>

      {/* 2. DETAILS SECTION (MATCHING MOBILE styles.details) */}
      <div className="mt-2 sm:mt-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title (At top of details, fontWeight 800, color #374151) */}
          <h4
            className="text-[11px] sm:text-xs font-extrabold text-[#374151] line-clamp-2 leading-[17px] min-h-[34px] group-hover:text-[#7C3AED] transition-colors"
            title={productNameText}
          >
            {productNameText}
          </h4>

          {/* Brand below the product name, with rating alongside it */}
          <div className="flex items-center justify-between mt-1 min-w-0">
            <span
              className="text-[10px] sm:text-[11px] text-[#9CA3AF] font-normal truncate mr-1.5 flex-1"
              title={brandText}
            >
              {brandText || '\u00A0'}
            </span>
            <div className="flex items-center shrink-0">
              <StarRating rating={safeRating} />
              {Boolean(reviewCount > 0) && (
                <span className="text-[9px] sm:text-[10px] text-[#9CA3AF] ml-1">
                  ({reviewCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========== RP PRICE + MRP ROW ========== */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mt-2">
          {/* RP price (falls back to the plain price when no RP price exists) */}
          <span
            className={`text-xs sm:text-sm font-extrabold leading-none ${
              rpPriceText ? 'text-[#F2811D]' : 'text-[#111827]'
            }`}
          >
            {rpPriceText || `₹${formatPrice(price)}`}
          </span>

          {/* MRP (strikethrough) */}
          {originalPrice > price && (
            <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] line-through font-normal leading-none">
              ₹{formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
