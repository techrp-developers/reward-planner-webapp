// src/modules/ecommerce/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductDetails, fetchSimilarProducts } from '../../api/productApi';
import { checkPincodeServiceability } from '../../api/logisticsApi';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import RPpriceBadge from '../../components/ui/RPpriceBadge';
import StarRating from '../../components/ui/StarRating';
import ProductCard from '../../components/product/ProductCard';
import RichText from '../../components/common/RichText';
import { GradientButton } from '../../components/ui/GradientButton';
import {
  MapPin,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Coins,
  ShoppingCart,
  Zap,
  Heart,
  Share2,
} from 'lucide-react';
import { getImageUrl } from '../../api/client';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { pincode } = useLocation();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delivery check state
  const [checkPin, setCheckPin] = useState(pincode || '400076');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Wishlist & UI
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductDetails(id)
      .then((data) => {
        if (data) {
          setProduct(data);
          const images = Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || '/placeholder.png'];
          setSelectedImage(images[0]);
          if (Array.isArray(data.variants) && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
            if (data.variants[0].images && data.variants[0].images.length > 0) {
              setSelectedImage(data.variants[0].images[0]);
            }
          }
        } else {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load product details:', err);
        setProduct(null);
      })
      .finally(() => setLoading(false));

    fetchSimilarProducts(id)
      .then((res) => {
        if (Array.isArray(res)) setSimilar(res);
      })
      .catch(() => {});
  }, [id]);

  const handleCheckDelivery = async (e) => {
    if (e) e.preventDefault();
    if (!checkPin || checkPin.length !== 6) return;
    setCheckingPin(true);
    try {
      const res = await checkPincodeServiceability({
        pincode: checkPin,
        mode: 'buy_now',
        variantId: resolveVariantId(),
        quantity: 1,
      });
      setDeliveryResult(res);
    } catch {
      setDeliveryResult({ serviceable: true });
    } finally {
      setCheckingPin(false);
    }
  };

  // Trigger delivery check when product and pincode are available
  useEffect(() => {
    if (product?.id && checkPin && checkPin.length === 6) {
      handleCheckDelivery();
    }
  }, [product?.id, selectedVariant?.variant_id]);

  const resolveVariantId = () => {
    return (
      selectedVariant?.variant_id ||
      selectedVariant?.id ||
      product?.default_variant_id ||
      product?.variants?.[0]?.variant_id ||
      product?.variants?.[0]?.id ||
      product?.id ||
      1
    );
  };

  const handleBuyNow = () => {
    if (!product?.id) return;
    const variantId = resolveVariantId();
    navigate(`/checkout?mode=buy_now&productId=${product.id}&variantId=${variantId}&qty=1`);
  };

  const handleAddToCart = () => {
    if (!product?.id) return;
    const variantId = resolveVariantId();
    addItem({
      product_id: product.id,
      variant_id: variantId,
      quantity: 1,
      openDrawer: true,
      product,
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b3ab5]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Product Not Found</h3>
        <p className="text-xs text-gray-500">The product you are looking for might have been moved or is currently unavailable in the catalog.</p>
        <button
          onClick={() => navigate('/store')}
          className="px-6 py-2.5 bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all cursor-pointer shadow-sm"
        >
          Browse Corporate Store
        </button>
      </div>
    );
  }

  const formatPrice = (val) => {
    const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.]/g, '') || 0);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  };

  const rawPrice = selectedVariant?.price ?? product.price ?? 0;
  const price = Number(Number(String(rawPrice).replace(/[^0-9.]/g, '') || 0).toFixed(2));

  const rawOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice ?? Math.round(price * 1.35);
  const originalPrice = Number(Number(String(rawOriginalPrice).replace(/[^0-9.]/g, '') || 0).toFixed(2));

  const discountText = selectedVariant?.discount || product.discount || (originalPrice > price ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}%` : '');
  const rewardCoins = Number(selectedVariant?.rewardCoins ?? product.rewardCoins ?? Math.round(price * 0.08));
  const redeemCoins = Number(selectedVariant?.redeem_coins ?? product.redeem_coins ?? Math.round(price * 0.25));

  const imageList = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || '/placeholder.png'];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* BREADCRUMBS */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
        <span onClick={() => navigate('/')} className="hover:text-[#8b3ab5] cursor-pointer">
          Home
        </span>
        <span>/</span>
        <span onClick={() => navigate('/store')} className="hover:text-[#8b3ab5] cursor-pointer">
          Store
        </span>
        {product.category && (
          <>
            <span>/</span>
            <span
              onClick={() => navigate(`/store?category=${product.category_id || ''}`)}
              className="hover:text-[#8b3ab5] cursor-pointer"
            >
              {product.category}
            </span>
          </>
        )}
        {product.subcategory && (
          <>
            <span>/</span>
            <span
              onClick={() => navigate(`/store?category=${product.category_id || ''}&sub=${product.subcategory_id || ''}`)}
              className="hover:text-[#8b3ab5] cursor-pointer"
            >
              {product.subcategory}
            </span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-bold truncate max-w-sm">{product.title}</span>
      </nav>

      {/* 2-COLUMN MAIN PRODUCT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: HIGH-RES GALLERY (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-28">
          <div className="relative w-full aspect-square bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden flex items-center justify-center p-6 shadow-xs">
            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-xs shadow-md text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Heart size={20} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
            </button>

            {/* RP Badge: only when rp_price exists */}
            {Boolean(product?.rp_price || product?.rpPrice || product?.reward_price) && (
              <div className="absolute top-4 left-4 z-10">
                <RPpriceBadge value={product?.rp_price || product?.rpPrice || product?.reward_price} />
              </div>
            )}

            <img
              src={getImageUrl(selectedImage)}
              alt={product.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80';
              }}
            />
          </div>

          {/* Thumbnail Strip */}
          {imageList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 bg-gray-50 p-1 shrink-0 transition-all cursor-pointer ${
                    selectedImage === img ? 'border-[#8b3ab5] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS & ACTIONS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8b3ab5]">
                {product.brand || 'Corporate Store'}
              </span>
              {product.category && (
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  {product.category}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <StarRating rating={product.rating || 4.5} count={product.reviews || 120} />
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                In Stock (Ready to Ship)
              </span>
            </div>
          </div>

          {/* VARIANT SELECTOR */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Choose Option ({product.variants.length} Available)
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSel = (selectedVariant?.id || selectedVariant?.variant_id) === (v.id || v.variant_id);
                  const label = v.sku || Object.values(v.attributes || {}).join(' ') || `Option #${v.variant_id}`;
                  return (
                    <button
                      key={v.id || v.variant_id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.images && v.images.length > 0) {
                          setSelectedImage(v.images[0]);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSel
                          ? 'border-[#8b3ab5] bg-purple-50 text-[#8b3ab5] shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {label} · ₹{v.price.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DUAL-CURRENCY PRICING CARD */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-violet-50/70 to-amber-50/70 border border-violet-100 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">
                ₹{formatPrice(price)}
              </span>
              {originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{formatPrice(originalPrice)}
                </span>
              )}
              {discountText && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {discountText.includes('%') ? discountText : `${discountText}%`} OFF
                </span>
              )}
            </div>

            {/* RP Coins Savings Callout */}
            <div className="flex items-center gap-2 text-xs font-bold text-violet-950 pt-1">
              <div className="p-1 rounded-full bg-amber-400 text-amber-950 shrink-0">
                <Coins size={14} />
              </div>
              <span>
                Redeem up to <strong className="text-amber-800 font-black">{redeemCoins} RP Coins</strong> at checkout and pay only{' '}
                <strong className="text-emerald-700 text-sm font-black">₹{formatPrice(Math.max(0, price - redeemCoins))}</strong>!
              </span>
            </div>

            <p className="text-[11px] text-gray-500">
              * Earn <strong>{rewardCoins} bonus RP Coins</strong> immediately credited to your company perks wallet upon delivery.
            </p>
          </div>

          {/* PINCODE DELIVERY CHECKER (AMAZON STYLE) */}
          <div className="p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <Truck size={16} className="text-[#8B5CF6]" />
              <span>Check Delivery Availability & Speeds</span>
            </div>

            <form onSubmit={handleCheckDelivery} className="flex gap-2 max-w-sm">
              <input
                type="text"
                maxLength={6}
                value={checkPin}
                onChange={(e) => setCheckPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#8B5CF6] font-medium"
              />
              <button
                type="submit"
                disabled={checkingPin}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {checkingPin ? 'Checking...' : 'Check'}
              </button>
            </form>

            {deliveryResult && (
              <div className={`flex items-center gap-2 text-xs font-semibold pt-1 ${deliveryResult.serviceable !== false ? 'text-emerald-700' : 'text-rose-600'}`}>
                {deliveryResult.serviceable !== false ? (
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                ) : (
                  <RotateCcw size={15} className="shrink-0 text-rose-500" />
                )}
                <span>
                  {deliveryResult.serviceable !== false
                    ? `Express Delivery available to ${checkPin}${deliveryResult.vendors?.[0]?.options?.[0]?.estimated_delivery_date ? ` by ${new Date(deliveryResult.vendors[0].options[0].estimated_delivery_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}` : ' within 2-4 business days'} | Verified Logistics`
                    : (deliveryResult.message || 'Delivery currently unavailable for this pincode')}
                </span>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS: BUY NOW & ADD TO CART */}
          <div className="flex items-center gap-4 pt-2">
            <GradientButton
              onClick={handleBuyNow}
              className="flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap size={18} />
              <span>Buy Now (Instant Checkout)</span>
            </GradientButton>

            <button
              onClick={handleAddToCart}
              type="button"
              className="flex-1 py-3.5 rounded-lg border-2 border-[#8b3ab5] text-[#8b3ab5] font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* TRUST PILLARS */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-blue-600 shrink-0" />
              <span>7 Days Returnable</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-purple-600 shrink-0" />
              <span>ExpressBees Fast Track</span>
            </div>
          </div>

          {/* DESCRIPTION & SPECIFICATIONS */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-sm text-gray-900">Product Overview</h4>
            <RichText
              content={product.description}
              fallback="Premium corporate gear engineered for high performance, daily comfort, and durability."
              className="text-xs text-gray-600 leading-relaxed"
            />

            {product.specs && (
              <div className="pt-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Technical Specifications</h5>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 p-2.5 bg-white even:bg-gray-50/50">
                      <span className="font-semibold text-gray-500">{key}</span>
                      <span className="col-span-2 text-gray-900 font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS / RECOMMENDATIONS */}
      {similar.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-gray-200">
          <h3 className="text-lg font-black text-gray-900">Customers Also Viewed</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {similar.slice(0, 5).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
