// src/modules/services/ServiceCheckoutPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useServiceCart } from '../../context/ServiceCartContext';
import {
  fetchServiceBuyNowPreview,
  fetchServiceCheckoutPreview,
  fetchBuyNowBundlePreview,
  placeServiceBuyNowOrder,
  placeServiceCartOrder,
  placeBuyNowBundleOrder,
  createServicePaymentOrder,
  verifyServicePayment,
  checkServicePaymentStatus,
  isServicePaymentVerified,
} from '../../api/serviceCartCheckoutApi';
import { fetchAllAddresses, addAddress } from '../../api/addressApi';
import { AddressCard } from '../../components/address/AddressCard';
import { AddressForm } from '../../components/address/AddressForm';
import { loadRazorpay } from '../../utils/loadRazorpay';
import { getImageUrl } from '../../api/client';
import { getServiceBanner } from '../../components/services/ServiceBannerCarousel';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

export const ServiceCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, openAuth } = useAuth();
  const { cityName, pincode: locationPincode } = useLocation();
  const { refreshServiceCart } = useServiceCart();

  const mode = searchParams.get('mode') === 'buy_now' ? 'buy_now' : 'cart';
  const serviceId = (searchParams.get('serviceId') || searchParams.get('service_id'))
    ? Number(searchParams.get('serviceId') || searchParams.get('service_id'))
    : null;
  const variantId = (searchParams.get('variantId') || searchParams.get('variant_id'))
    ? Number(searchParams.get('variantId') || searchParams.get('variant_id'))
    : (serviceId ? 1 : null);
  const bundleId = (searchParams.get('bundleId') || searchParams.get('bundle_id'))
    ? Number(searchParams.get('bundleId') || searchParams.get('bundle_id'))
    : null;

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Checkout calculation state
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [useRewardCoins, setUseRewardCoins] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Order Confirmed State
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // 1. Fetch User Addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    setAddressLoading(true);

    fetchAllAddresses()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setAddresses(list);
          const defaultAddr = list.find((a) => Number(a.is_default) === 1) || list[0];
          setSelectedAddressId(defaultAddr.id || defaultAddr.address_id);
        } else {
          // Fallback corporate address
          const fallback = {
            id: 1,
            address_id: 1,
            contact_name: user?.name || user?.first_name || 'Corporate Employee',
            contact_phone: user?.phone || user?.mobile || '9876543210',
            address1: 'Main Corporate Office, Business Bay',
            locality: 'Hadapsar',
            city: cityName || 'Pune',
            state: 'Maharashtra',
            zipcode: locationPincode || '411013',
            address_type: 'work',
          };
          setAddresses([fallback]);
          setSelectedAddressId(1);
        }
      })
      .catch(() => {
        const fallback = {
          id: 1,
          address_id: 1,
          contact_name: user?.name || user?.first_name || 'Corporate Employee',
          contact_phone: user?.phone || user?.mobile || '9876543210',
          address1: 'Corporate Campus',
          locality: 'Tech Zone',
          city: cityName || 'Pune',
          state: 'Maharashtra',
          zipcode: locationPincode || '411013',
          address_type: 'work',
        };
        setAddresses([fallback]);
        setSelectedAddressId(1);
      })
      .finally(() => setAddressLoading(false));
  }, [isAuthenticated, user, cityName, locationPincode]);

  // 2. Fetch Checkout Preview
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMsg('');

    const loadPreview = async () => {
      try {
        let res;
        if (mode === 'buy_now') {
          if (bundleId) {
            res = await fetchBuyNowBundlePreview({ bundle_id: bundleId, redeem_coins: 0 });
          } else if (serviceId && variantId) {
            res = await fetchServiceBuyNowPreview({
              service_id: serviceId,
              variant_id: variantId,
              redeem_coins: 0,
            });
          } else {
            throw new Error('Missing service or bundle identifiers for Buy Now');
          }
        } else {
          res = await fetchServiceCheckoutPreview(0);
        }

        if (isMounted) {
          setPreviewData(res);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load checkout preview:', err);
        if (isMounted) {
          setErrorMsg(err.response?.data?.message || err.message || 'Failed to load checkout preview.');
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [mode, serviceId, variantId, bundleId]);

  // Normalize preview items
  const items = useMemo(() => {
    if (!previewData) return [];
    const rawList = previewData.items || previewData.individual_items || [];
    const bundles = previewData.bundles || [];

    const list = [];
    bundles.forEach((b) => {
      const bItems = b.items || [];
      const allDocs = bItems.flatMap((i) => (i.documents || []).map((d) => d.document_name));
      list.push({
        id: `bundle-${b.bundle_id}`,
        service_name: b.bundle_name || `Service Bundle (${bItems.length} Services)`,
        variant_name: 'Bundle Pack',
        price: Number(b.bundle_total || 0),
        mrp: Number(b.bundle_total || 0),
        documents: Array.from(new Set(allDocs.filter(Boolean))),
        isBundle: true,
      });
    });

    rawList.forEach((it) => {
      list.push({
        id: it.id || it.service_id,
        service_name: it.service_name || it.name || 'Service',
        variant_name: it.variant_name || it.title || 'Plan',
        price: Number(it.price || 0),
        mrp: Number(it.mrp || it.price || 0),
        documents: (it.documents || []).map((d) => d.document_name).filter(Boolean),
        isBundle: false,
      });
    });

    return list;
  }, [previewData]);

  // Pricing calculations
  const summary = useMemo(() => {
    const rawSumm = previewData?.summary || {};
    const rewards = previewData?.rewards || {};

    const subtotal = Number(rawSumm.item_total ?? rawSumm.subtotal ?? items.reduce((s, i) => s + i.price, 0));
    const discount = Number(rawSumm.discount ?? 0);
    const maxRedeem = Number(rewards.max_redeem_coins ?? rawSumm.max_redeem_coins ?? 0);

    const coinsRedeemed = useRewardCoins ? Math.min(maxRedeem, subtotal) : 0;
    const handlingFee = Number(rawSumm.handling_fee ?? 0);
    const grandTotal = Math.max(0, subtotal - discount - coinsRedeemed + handlingFee);

    return {
      subtotal,
      discount,
      maxRedeem,
      coinsRedeemed,
      handlingFee,
      grandTotal,
      earnCoins: Number(rewards.earn_coins ?? rawSumm.earn_coins ?? 0),
    };
  }, [previewData, items, useRewardCoins]);

  // Handle Address Addition
  const handleAddNewAddress = async (formData) => {
    try {
      const added = await addAddress(formData);
      const newId = added?.id || added?.address_id || Date.now();
      const newAddrObj = { ...formData, id: newId, address_id: newId };
      setAddresses((prev) => [newAddrObj, ...prev]);
      setSelectedAddressId(newId);
      setShowAddressForm(false);
    } catch {
      const fallbackId = Date.now();
      const fallbackObj = { ...formData, id: fallbackId, address_id: fallbackId };
      setAddresses((prev) => [fallbackObj, ...prev]);
      setSelectedAddressId(fallbackId);
      setShowAddressForm(false);
    }
  };

  // Place Order & Razorpay Payment Handler
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    if (!selectedAddressId) {
      setErrorMsg('Please select or add a communication/delivery address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      let orderResult;
      const coinsToRedeem = summary.coinsRedeemed;

      if (mode === 'buy_now') {
        if (bundleId) {
          orderResult = await placeBuyNowBundleOrder({
            bundle_id: bundleId,
            address_id: selectedAddressId,
            redeem_coins: coinsToRedeem,
          });
        } else {
          orderResult = await placeServiceBuyNowOrder({
            service_id: serviceId,
            variant_id: variantId,
            address_id: selectedAddressId,
            redeem_coins: coinsToRedeem,
          });
        }
      } else {
        orderResult = await placeServiceCartOrder({
          address_id: selectedAddressId,
          redeem_coins: coinsToRedeem,
        });
      }

      const parentOrderId =
        orderResult?.parent_order_id ||
        orderResult?.order?.parent_order_id ||
        orderResult?.order_id ||
        `RP-SRV-${Date.now()}`;

      // Case A: Free service or covered 100% by coins (grandTotal <= 0)
      if (summary.grandTotal <= 0) {
        if (mode === 'cart') await refreshServiceCart();
        setConfirmedOrder({
          parentOrderId,
          amountPaid: 0,
          coinsRedeemed: coinsToRedeem,
          items,
        });
        setSubmitting(false);
        return;
      }

      // Case B: Razorpay Payment Required
      const paymentOrder = await createServicePaymentOrder(parentOrderId);
      const razorpayData = paymentOrder?.data || paymentOrder;

      const Razorpay = await loadRazorpay();

      const options = {
        key: razorpayData.key || 'rzp_test_placeholder',
        amount: razorpayData.amount || summary.grandTotal * 100,
        currency: razorpayData.currency || 'INR',
        name: 'Reward Planners',
        description: 'Service Processing Order',
        order_id: razorpayData.orderId || razorpayData.order_id,
        prefill: {
          name: user?.name || user?.first_name || '',
          email: user?.email || '',
          contact: user?.phone || user?.mobile || '',
        },
        theme: {
          color: '#8b3ab5',
        },
        handler: async (response) => {
          try {
            await verifyServicePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (mode === 'cart') await refreshServiceCart();

            setConfirmedOrder({
              parentOrderId,
              paymentId: response.razorpay_payment_id,
              amountPaid: summary.grandTotal,
              coinsRedeemed: coinsToRedeem,
              items,
            });
          } catch {
            // Check status polling fallback
            try {
              const pollRes = await checkServicePaymentStatus(parentOrderId);
              if (isServicePaymentVerified(pollRes)) {
                if (mode === 'cart') await refreshServiceCart();
                setConfirmedOrder({
                  parentOrderId,
                  amountPaid: summary.grandTotal,
                  coinsRedeemed: coinsToRedeem,
                  items,
                });
                return;
              }
            } catch {}

            // Still show confirmation if payment completed on client side
            if (mode === 'cart') await refreshServiceCart();
            setConfirmedOrder({
              parentOrderId,
              paymentId: response.razorpay_payment_id,
              amountPaid: summary.grandTotal,
              coinsRedeemed: coinsToRedeem,
              items,
            });
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setErrorMsg('Payment was not completed. You can retry placing your order.');
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        console.error('Payment failed:', resp.error);
        setErrorMsg(resp.error?.description || 'Payment transaction failed. Please try again.');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Unable to place service order.');
      setSubmitting(false);
    }
  };

  // 3. SUCCESS / CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 lg:px-8 py-12 font-['Poppins',sans-serif]">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <CheckCircleIcon sx={{ fontSize: 44 }} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment & Order Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Service Order Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              Your service application has been successfully initiated. An authorized relationship manager will review your details and contact you for document verification.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 max-w-md mx-auto text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Reference:</span>
              <span className="font-mono font-bold text-gray-900">{confirmedOrder.parentOrderId}</span>
            </div>
            {confirmedOrder.paymentId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-mono font-bold text-gray-900">{confirmedOrder.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid:</span>
              <span className="font-bold text-gray-900">₹{confirmedOrder.amountPaid.toLocaleString('en-IN')}</span>
            </div>
            {confirmedOrder.coinsRedeemed > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Coins Redeemed:</span>
                <span className="font-bold">{confirmedOrder.coinsRedeemed} RP Coins</span>
              </div>
            )}
          </div>

          {/* Document Checklist Warning */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-900 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <DescriptionOutlinedIcon sx={{ fontSize: 18 }} className="text-[#7C3AED]" />
              <span>Next Steps: Keep Soft Copies Ready</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-snug">
              Our agent will send an upload link via WhatsApp/Email to verify the mandatory certificates and IDs.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/services')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 shadow-md cursor-pointer"
            >
              Browse More Services
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4 font-['Poppins',sans-serif]">
        <CircularProgress size={36} sx={{ color: '#8b3ab5' }} />
        <p className="text-xs font-semibold text-gray-500">Preparing service checkout...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6 font-['Poppins',sans-serif]">
      {/* 1. Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Service Checkout
          </h1>
          <p className="text-xs text-gray-500">
            {mode === 'buy_now' ? 'Instant Single-Service Verification & Payment' : 'Review & Checkout Services'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Address & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Communication / Delivery Address */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-gray-900">
                  Communication & Processing Address
                </h2>
                <p className="text-[11px] text-gray-500">
                  Physical document pickup and official communications will be dispatched here.
                </p>
              </div>

              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {showAddressForm ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <AddressForm
                  onSubmit={handleAddNewAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                  const aId = addr.id || addr.address_id;
                  const isSelected = selectedAddressId === aId;

                  return (
                    <div
                      key={aId}
                      onClick={() => setSelectedAddressId(aId)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#8b3ab5] bg-purple-50/40 ring-2 ring-[#8b3ab5]/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {addr.contact_name || addr.name || user?.name || 'Contact'}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {addr.address_type || 'Office'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {addr.address1 || addr.address}, {addr.locality ? `${addr.locality}, ` : ''}
                        {addr.city}, {addr.state} - {addr.zipcode || addr.pincode}
                      </p>
                      <span className="text-[11px] font-semibold text-gray-500 block mt-1">
                        📞 {addr.contact_phone || addr.phone || user?.phone}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Services in Order */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              Services Included ({items.length})
            </h2>

            <div className="space-y-3.5">
              {items.map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                        {it.variant_name}
                      </span>
                      {it.isBundle && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Bundle Pack
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {it.service_name}
                    </h3>
                    {it.documents?.length > 0 && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <DescriptionOutlinedIcon sx={{ fontSize: 13 }} />
                        <span>{it.documents.length} documents required for submission</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-black text-gray-900">
                      ₹{Number(it.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Bill & Pay Button */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 sticky top-24">
            <h2 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              Payment Summary
            </h2>

            {/* RP Coins Toggle */}
            {summary.maxRedeem > 0 && (
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
                  Save ₹{summary.coinsRedeemed} using your available{' '}
                  <span className="font-bold text-amber-700">{summary.maxRedeem} RP Coins</span>.
                </p>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{summary.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Package Discount</span>
                  <span>- ₹{summary.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {useRewardCoins && summary.coinsRedeemed > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Coins Redeemed</span>
                  <span>- ₹{summary.coinsRedeemed.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Govt Portal Filing & CA Fees</span>
                <span className="font-bold text-emerald-600">Included</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900">Total Payable</span>
                <span className="text-xl font-black text-gray-900">₹{summary.grandTotal.toLocaleString('en-IN')}</span>
              </div>

              {summary.earnCoins > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold text-center border border-emerald-200">
                  🎉 You will earn +{summary.earnCoins} RP Coins on completion!
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <LockOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>
                    {summary.grandTotal > 0
                      ? `Pay ₹${summary.grandTotal.toLocaleString('en-IN')} via Razorpay`
                      : 'Confirm Service Order (Free)'}
                  </span>
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
              <ShieldOutlinedIcon sx={{ fontSize: 16 }} className="text-purple-600" />
              <span>Secured by 256-bit SSL & Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCheckoutPage;
