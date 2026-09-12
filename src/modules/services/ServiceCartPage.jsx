// src/modules/services/ServiceCartPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useServiceCart } from '../../context/ServiceCartContext';
import { getImageUrl } from '../../api/client';
import { getServiceBanner } from '../../components/services/ServiceBannerCarousel';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

export const ServiceCartPage = () => {
  const navigate = useNavigate();
  const { serviceCartItems, removeFromCart, cartRewards, loading } = useServiceCart();
  const [openDocsMap, setOpenDocsMap] = useState({});
  const [useRewardCoins, setUseRewardCoins] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);

  const toggleDocs = (id) => {
    setOpenDocsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRemove = async (item) => {
    setBusyItemId(item.id);
    try {
      await removeFromCart(item);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleBuyNowSingle = (item) => {
    if (item.isBundle) {
      navigate(`/services/checkout?mode=buy_now&bundleId=${item.bundle_id}`);
    } else {
      navigate(`/services/checkout?mode=buy_now&serviceId=${item.service_id}&variantId=${item.variant_id}`);
    }
  };

  const totals = useMemo(() => {
    const subtotal = serviceCartItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
    const mrpTotal = serviceCartItems.reduce(
      (acc, item) => acc + Number(item.mrp > 0 ? item.mrp : item.price || 0),
      0
    );
    const discount = Math.max(mrpTotal - subtotal, 0);

    const maxRedeem = Number(cartRewards?.max_redeem_coins || 0);
    const redeemCoins = useRewardCoins ? Math.min(maxRedeem, subtotal) : 0;
    const grandTotal = Math.max(0, subtotal - redeemCoins);

    return {
      subtotal,
      mrpTotal,
      discount,
      redeemCoins,
      grandTotal,
      earnCoins: Number(cartRewards?.earn_coins || 0),
      maxRedeemCoins: maxRedeem,
    };
  }, [serviceCartItems, cartRewards, useRewardCoins]);

  const onProceedToCheckout = () => {
    navigate(`/services/checkout?mode=cart&redeemCoins=${totals.redeemCoins}`);
  };

  if (!loading && serviceCartItems.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-16 text-center font-['Poppins',sans-serif]">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xs space-y-5">
          <div className="w-20 h-20 rounded-full bg-purple-50 text-[#8b3ab5] flex items-center justify-center mx-auto border border-purple-100">
            <ShoppingBagOutlinedIcon sx={{ fontSize: 40 }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Your Services Cart is Empty</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore government documentation, tax filing, insurance, and company registration services with doorstep pickup.
            </p>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Services</span>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6 font-['Poppins',sans-serif]">
      {/* 1. Header & Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/services')}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            title="Back to Services"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Services Cart</span>
              <span className="text-xs font-bold text-[#7C3AED] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {serviceCartItems.length} {serviceCartItems.length === 1 ? 'Service' : 'Services'}
              </span>
            </h1>
            <p className="text-xs text-gray-500">Review selected service packages and required documents before checkout.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/services')}
          className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer hidden sm:block"
        >
          + Add More Services
        </button>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {serviceCartItems.map((item) => {
            const hasDocs = Array.isArray(item.documents) && item.documents.length > 0;
            const isDocsOpen = !!openDocsMap[item.id];
            const isBusy = busyItemId === item.id;
            const fallbackImg = getServiceBanner(item.service_id, item.service_name);
            const imageSrc = item.imageUrl ? getImageUrl(item.imageUrl) : fallbackImg;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs transition-all hover:shadow-md space-y-4"
              >
                {/* Main Card Header */}
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F8F9FD] border border-gray-100 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={item.service_name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = fallbackImg;
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                        {item.variant_name}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Save ₹{(item.mrp - item.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                      {item.service_name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-gray-900">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(item.mrp || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Checklist Accordion */}
                {hasDocs && (
                  <div className="rounded-xl border border-purple-100 bg-purple-50/40 overflow-hidden">
                    <button
                      onClick={() => toggleDocs(item.id)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-purple-900 hover:bg-purple-100/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <DescriptionOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-600" />
                        <span>Documents Required ({item.documents.length})</span>
                      </div>
                      {isDocsOpen ? (
                        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                      )}
                    </button>

                    {isDocsOpen && (
                      <div className="px-3.5 pb-3 pt-1 border-t border-purple-100/60 bg-white/60">
                        <p className="text-[11px] text-gray-500 mb-2">
                          Keep soft copies of these documents ready for verification after order confirmation:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.documents.map((doc, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-2xs"
                            >
                              <CheckCircleOutlineIcon sx={{ fontSize: 14 }} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={isBusy}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer py-1.5"
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    <span>{isBusy ? 'Removing...' : 'Remove'}</span>
                  </button>

                  <button
                    onClick={() => handleBuyNowSingle(item)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 shadow-xs transition-all cursor-pointer"
                  >
                    <BoltIcon sx={{ fontSize: 15 }} />
                    <span>Buy This Item Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Bill Summary & Checkout */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            {/* RP Coins Toggle */}
            {totals.maxRedeemCoins > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MonetizationOnIcon sx={{ fontSize: 20 }} className="text-amber-500" />
                    <span className="text-xs font-bold text-gray-900">Use Reward Coins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useRewardCoins}
                    onChange={(e) => setUseRewardCoins(e.target.checked)}
                    className="w-4 h-4 text-[#7C3AED] rounded border-gray-300 focus:ring-[#7C3AED] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  Redeem up to <span className="font-bold text-amber-700">{totals.maxRedeemCoins} RP Coins</span> (₹{totals.maxRedeemCoins}) on this order.
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({serviceCartItems.length} items)</span>
                <span className="font-bold text-gray-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Package Savings</span>
                  <span>- ₹{totals.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {useRewardCoins && totals.redeemCoins > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>RP Coins Redeemed</span>
                  <span>- ₹{totals.redeemCoins.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Government & Processing Fees</span>
                <span className="font-bold text-emerald-600">Included</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900">Grand Total</span>
                <span className="text-xl font-black text-gray-900">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
              </div>

              {totals.earnCoins > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold text-center border border-emerald-200">
                  🎉 You will earn +{totals.earnCoins} RP Coins on this order!
                </div>
              )}
            </div>

            {/* Primary Proceed CTA */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
              <ShieldOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-600" />
              <span>100% Certified & Govt Authorized Advisory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCartPage;
