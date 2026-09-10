// src/modules/ecommerce/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { GradientButton } from '../../components/ui/GradientButton';

// Material UI Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

const SAVED_FOR_LATER_KEY = 'rp_saved_for_later_v1';

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    items,
    totalQuantity,
    subtotal,
    totalMrp,
    totalSavings,
    estimatedCoins,
    updateQuantity,
    removeItem,
    emptyCart,
    addItem,
  } = useCart();
  const { pincode, cityName, openLocationModal } = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Saved for Later state (persistent in localStorage)
  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_FOR_LATER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(savedForLater));
    } catch {
      // Ignore
    }
  }, [savedForLater]);

  const handleSaveForLater = (item) => {
    const itemId = item.cart_item_id || item.id;
    setSavedForLater((prev) => [
      ...prev.filter((p) => (p.cart_item_id || p.id) !== itemId),
      { ...item },
    ]);
    removeItem(itemId);
  };

  const handleMoveToCart = async (item) => {
    const itemId = item.cart_item_id || item.id;
    await addItem({
      product_id: item.product_id || item.id,
      variant_id: item.variant_id || 0,
      quantity: item.quantity || 1,
      product: item,
      openDrawer: false,
    });
    setSavedForLater((prev) => prev.filter((p) => (p.cart_item_id || p.id) !== itemId));
  };

  const handleRemoveSavedItem = (itemId) => {
    setSavedForLater((prev) => prev.filter((p) => (p.cart_item_id || p.id) !== itemId));
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // If cart is empty and no saved for later items
  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-violet-50 text-[#7C3AED] flex items-center justify-center border border-violet-100 shadow-xs">
          <ShoppingCartOutlinedIcon sx={{ fontSize: 44 }} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty!</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Explore our corporate store with 880+ verified products, exclusive employee discounts, and instant RP Coins redemption.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => navigate('/store')}
            className="px-8 py-3.5 bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore Store Catalog</span>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* BREADCRUMB STRIP */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-[#7C3AED] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/store" className="hover:text-[#7C3AED] transition-colors">
          Store
        </Link>
        <span>/</span>
        <span className="font-bold text-gray-900">Shopping Cart</span>
      </nav>

      {/* FLIPKART & AMAZON 60/40 TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 60% (~7 of 12 columns) - PRODUCTS STREAM & ACTIONS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. PINCODE / DELIVERY BANNER (FLIPKART STYLE) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div className="text-xs">
                <span className="text-gray-500 block text-[11px]">
                  Deliver to: <strong className="text-gray-900 font-semibold">{isAuthenticated ? (user?.name || 'Valued Employee') : 'Delivery Location'}</strong>
                </span>
                <span className="font-extrabold text-gray-900">
                  {cityName || 'Pune'}, {pincode || '411013'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openLocationModal}
              className="px-3.5 py-1.5 rounded-xl border border-violet-200 text-[#7C3AED] hover:bg-violet-50 font-bold text-xs cursor-pointer transition-all shadow-2xs"
            >
              Change Pincode
            </button>
          </div>

          {/* 2. CART PRODUCTS CONTAINER */}
          {items.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {/* Header Bar */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h1 className="text-base sm:text-lg font-black text-gray-900">
                    RewardPlanners Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
                  </h1>
                  <span className="text-[11px] text-gray-400">
                    All items eligible for Free Express Delivery & RP Perks
                  </span>
                </div>
                <button
                  onClick={emptyCart}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Items Stream */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const itemId = item.cart_item_id || item.id;
                  const title = item.title || item.product_name || 'Product';
                  const image = item.image || '/placeholder.svg';
                  const price = Number(item.price || 0);
                  const mrp = Number(item.mrp || price);
                  const qty = Number(item.quantity || 1);
                  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                  const itemCoins = Math.round(price * 0.08);

                  return (
                    <div key={itemId} className="p-4 sm:p-6 space-y-4 hover:bg-gray-50/40 transition-colors">
                      <div className="flex gap-4 sm:gap-5 items-start">
                        {/* Thumbnail */}
                        <div
                          onClick={() => navigate(`/product/${item.product_id || item.id}`)}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-gray-200 bg-[#F9FAFB] p-2 shrink-0 flex items-center justify-center cursor-pointer group"
                        >
                          <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <h3
                                onClick={() => navigate(`/product/${item.product_id || item.id}`)}
                                className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#7C3AED] transition-colors cursor-pointer line-clamp-2 leading-snug"
                              >
                                {title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-gray-400">Seller:</span>
                                <span className="text-[11px] font-bold text-gray-700">RewardPlanners Verified</span>
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-violet-50 text-[#7C3AED] border border-violet-100">
                                  RP Express
                                </span>
                              </div>
                            </div>

                            {/* Delivery Date Tag (Flipkart Style) */}
                            <div className="sm:text-right shrink-0">
                              <span className="text-[11px] text-gray-700 font-semibold block">
                                Delivery by Tomorrow
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold flex items-center sm:justify-end gap-1">
                                <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} />
                                <span>Free ₹40</span>
                              </span>
                            </div>
                          </div>

                          {/* Price Row */}
                          <div className="flex items-baseline gap-2.5 pt-1">
                            <span className="text-base sm:text-lg font-black text-gray-900">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            {mrp > price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{mrp.toLocaleString('en-IN')}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {discountPct}% OFF
                              </span>
                            )}
                          </div>

                          {/* Coin Earnings Callout */}
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7C3AED]">
                            <MonetizationOnIcon sx={{ fontSize: 14 }} className="text-amber-500" />
                            <span>Earn +{itemCoins} RP Coins on this order</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Controls Bar: Steppers & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                        {/* Stepper */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemId, qty - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                              title="Decrease quantity"
                            >
                              <RemoveIcon sx={{ fontSize: 14 }} />
                            </button>
                            <span className="px-3.5 text-xs font-black text-gray-900 select-none">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemId, qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                              title="Increase quantity"
                            >
                              <AddIcon sx={{ fontSize: 14 }} />
                            </button>
                          </div>

                          <span className="text-[11px] text-gray-400">
                            Subtotal: <strong className="text-gray-900 font-bold">₹{(price * qty).toLocaleString('en-IN')}</strong>
                          </span>
                        </div>

                        {/* Action Buttons: Save for Later & Remove */}
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => handleSaveForLater(item)}
                            className="text-gray-600 hover:text-[#7C3AED] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <BookmarkBorderOutlinedIcon sx={{ fontSize: 16 }} />
                            <span>SAVE FOR LATER</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(itemId)}
                            className="text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                            <span>REMOVE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flipkart-Style Docked Bottom Bar */}
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-bold tracking-wider">
                    Total Payable
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#7C3AED]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <GradientButton
                  onClick={handleProceedToCheckout}
                  className="px-6 sm:px-8 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>PLACE ORDER</span>
                  <ArrowForwardIcon sx={{ fontSize: 17 }} />
                </GradientButton>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3 shadow-xs">
              <h3 className="text-base font-bold text-gray-800">Your Active Cart is Empty</h3>
              <p className="text-xs text-gray-500">You have items saved for later below, or you can explore our catalog.</p>
              <button
                onClick={() => navigate('/store')}
                className="px-5 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:bg-[#6D28D9] cursor-pointer"
              >
                Browse Store
              </button>
            </div>
          )}

          {/* 3. SAVED FOR LATER SECTION (FLIPKART STYLE) */}
          {savedForLater.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-black text-gray-900">
                  Saved For Later ({savedForLater.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {savedForLater.map((sItem) => {
                  const sId = sItem.cart_item_id || sItem.id;
                  const sTitle = sItem.title || sItem.product_name || 'Product';
                  const sImage = sItem.image || '/placeholder.svg';
                  const sPrice = Number(sItem.price || 0);

                  return (
                    <div key={sId} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={sImage}
                          alt={sTitle}
                          className="w-16 h-16 rounded-xl object-contain border border-gray-200 bg-gray-50 p-1 shrink-0"
                          onError={(e) => {
                            e.target.src = '/placeholder.svg';
                          }}
                        />
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-gray-900 truncate">{sTitle}</p>
                          <span className="font-black text-sm text-gray-900 block">
                            ₹{sPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(sItem)}
                          className="px-4 py-2 rounded-xl bg-violet-50 text-[#7C3AED] border border-violet-200 font-bold hover:bg-violet-100 cursor-pointer transition-all"
                        >
                          MOVE TO CART
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSavedItem(sId)}
                          className="p-2 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 40% (~5 of 12 columns) - STICKY PRICE DETAILS & TRUST CARD */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          {/* PRICE DETAILS CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
              PRICE DETAILS
            </h2>

            <div className="space-y-3 text-xs">
              {/* Total MRP */}
              <div className="flex items-center justify-between text-gray-700">
                <span>Price ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-gray-900">
                  ₹{Number(totalMrp || subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Discount / Savings */}
              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>Product Discount</span>
                  <span>− ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Delivery Charges */}
              <div className="flex items-center justify-between text-gray-700">
                <span>Delivery Charges</span>
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-gray-400">₹70</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
              </div>

              {/* Secured Packaging */}
              <div className="flex items-center justify-between text-gray-700">
                <span>Secured Corporate Packaging</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>

              {/* Bonus RP Coins */}
              <div className="flex items-center justify-between text-[#7C3AED] bg-violet-50/60 p-2.5 rounded-xl border border-violet-100">
                <span className="flex items-center gap-1 font-bold">
                  <MonetizationOnIcon sx={{ fontSize: 16 }} className="text-amber-500" />
                  <span>Bonus Perks to Earn</span>
                </span>
                <strong className="font-extrabold text-xs text-[#7C3AED]">
                  +{estimatedCoins} RP Coins
                </strong>
              </div>

              {/* Total Amount Payable */}
              <div className="flex items-center justify-between text-base font-black text-gray-900 pt-3 border-t border-dashed border-gray-200">
                <span>Total Amount</span>
                <span className="text-xl text-[#7C3AED]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Total Savings Highlight Banner */}
              {totalSavings > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
                  <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} className="text-emerald-600 shrink-0" />
                  <span>You will save ₹{totalSavings.toLocaleString('en-IN')} on this order!</span>
                </div>
              )}
            </div>

            {/* PROCEED TO BUY ACTION BUTTON */}
            <GradientButton
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>PROCEED TO BUY</span>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </GradientButton>
          </div>

          {/* FLIPKART/AMAZON SAFE & SECURE TRUST BADGE */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2.5 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
              <VerifiedUserOutlinedIcon sx={{ fontSize: 19 }} className="text-[#7C3AED]" />
              <span>Safe and Secure Payments. 100% Authentic products.</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Every order placed through RewardPlanners is backed by standard verified logistics and official employee perks protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
