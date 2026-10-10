import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import ServiceImage from '../../components/services/ServiceImage';
// src/modules/services/ServiceCheckoutPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { createSubmissionGate } from './submissionGate';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

export const ServiceCheckoutPage: React.FC = () => {
  const [params] = useSearchParams();
  return <ServiceCheckoutFlow key={params.toString()} />;
};

const ServiceCheckoutFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, isAuthenticated, openAuth } = useAuth();
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

  const privateClient = useMemo(() => new QueryClient(), [token]);
  useEffect(() => () => privateClient.clear(), [privateClient]);
  const addressQuery = useQuery({ queryKey: ['addresses'], enabled: isAuthenticated,
    queryFn: ({ signal }) => fetchAllAddresses(signal, true), staleTime: 0, gcTime: 0, retry: false }, privateClient);
  const previewQuery = useQuery({ queryKey: ['checkout-preview', mode, serviceId, variantId, bundleId], enabled: isAuthenticated,
    queryFn: ({ signal }) => {
      if (mode === 'cart') return fetchServiceCheckoutPreview(0, signal);
      if (bundleId) return fetchBuyNowBundlePreview({ bundle_id: bundleId, redeem_coins: 0 }, signal);
      if (serviceId && variantId) return fetchServiceBuyNowPreview({ service_id: serviceId, variant_id: variantId, redeem_coins: 0 }, signal);
      throw new Error('Missing service or bundle identifiers for Buy Now');
    }, staleTime: 0, gcTime: 0, retry: false }, privateClient);

  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const addressLoading = addressQuery.isPending;

  // Checkout calculation state
  const previewData = previewQuery.data;
  const loading = previewQuery.isPending;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [useRewardCoins, setUseRewardCoins] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const orderGate = useRef(createSubmissionGate());
  const savedOrder = useRef<{ key: string; result: any } | null>(null);
  const uncertainOrder = useRef(false);
  const verifyingPayment = useRef(false);
  const paymentReview = useRef<any>(null);
  const orderMutation = useMutation({
    mutationFn: async ({ kind, payload }: { kind: string; payload: any }) => {
      const result = kind === 'bundle' ? await placeBuyNowBundleOrder(payload) : kind === 'buy_now' ? await placeServiceBuyNowOrder(payload) : await placeServiceCartOrder(payload);
      if (result?.success === false) throw new Error(result.message || 'The order was rejected.');
      return result;
    },
    retry: false,
    gcTime: 0,
  }, privateClient);

  // Order Confirmed State
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Private queries cancel obsolete previews and never persist across sessions.
  useEffect(() => {
    if (addressQuery.data) {
      const list = Array.isArray(addressQuery.data) ? addressQuery.data : [];
      setAddresses(list);
      setSelectedAddressId(current => list.some(address => (address.id || address.address_id) === current) ? current : (list.find(address => Number(address.is_default) === 1) || list[0])?.id || list[0]?.address_id || null);
    }
  }, [addressQuery.data]);
  useEffect(() => {
    if (previewQuery.isError || addressQuery.isError) setErrorMsg('Could not load checkout details. Please try again.');
  }, [previewQuery.isError, addressQuery.isError]);

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
      const newId = added?.data?.id || added?.data?.address_id || added?.id || added?.address_id;
      if (!newId) throw new Error('Address ID missing from response.');
      const newAddrObj = { ...formData, id: newId, address_id: newId };
      setAddresses((prev) => [newAddrObj, ...prev]);
      setSelectedAddressId(newId);
      setShowAddressForm(false);
      void privateClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Could not save your address. Please try again.');
    }
  };

  // Place Order & Razorpay Payment Handler
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    if (loading || previewQuery.isError || addressQuery.isError || confirmedOrder || verifyingPayment.current) return;

    if (!selectedAddressId) {
      setErrorMsg('Please select or add a communication/delivery address.');
      return;
    }

    if (uncertainOrder.current) {
      setErrorMsg('The previous order could not be confirmed. Check your orders before trying again.');
      return;
    }
    if (!orderGate.current.acquire()) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const coinsToRedeem = summary.coinsRedeemed;
      const kind = mode === 'buy_now' ? bundleId ? 'bundle' : 'buy_now' : 'cart';
      const payload = mode === 'buy_now' ? bundleId
        ? { bundle_id: bundleId, address_id: selectedAddressId, redeem_coins: coinsToRedeem }
        : { service_id: serviceId, variant_id: variantId, address_id: selectedAddressId, redeem_coins: coinsToRedeem }
        : { address_id: selectedAddressId, redeem_coins: coinsToRedeem };
      const key = JSON.stringify({ kind, payload });
      let orderResult = savedOrder.current?.key === key ? savedOrder.current.result : null;
      if (!orderResult) {
        try {
          orderResult = await orderMutation.mutateAsync({ kind, payload });
          savedOrder.current = { key, result: orderResult };
        } catch (error) {
          // A dropped response may hide a successful creation: do not create another order.
          if (!error?.response && error?.isAxiosError) uncertainOrder.current = true;
          throw error;
        }
      }

      const parentOrderId =
        orderResult?.parent_order_id ||
        orderResult?.order?.parent_order_id ||
        orderResult?.order_id ||
        null;
      if (!parentOrderId) throw new Error('The service did not return an order reference. Check your orders before retrying.');
      paymentReview.current = { parentOrderId, amountPaid: summary.grandTotal, coinsRedeemed: coinsToRedeem, items };

      // Case A: Free service or covered 100% by coins (grandTotal <= 0)
      if (summary.grandTotal <= 0) {
        if (mode === 'cart') await refreshServiceCart();
        setConfirmedOrder({
          parentOrderId,
          amountPaid: 0,
          coinsRedeemed: coinsToRedeem,
          items,
        });
        orderGate.current.release();
        setSubmitting(false);
        return;
      }

      // Case B: Razorpay Payment Required
      const paymentOrder = await createServicePaymentOrder(parentOrderId);
      const razorpayData = paymentOrder?.data || paymentOrder;

      if (!razorpayData.key || !(razorpayData.orderId || razorpayData.order_id)) throw new Error('Payment details are missing. Please try again.');
      const Razorpay = await loadRazorpay();

      const options = {
        key: razorpayData.key,
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
          if (verifyingPayment.current) return;
          verifyingPayment.current = true;
          try {
            const verification = await verifyServicePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!isServicePaymentVerified(verification)) throw new Error('Payment verification is pending.');

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

            uncertainOrder.current = true;
            setErrorMsg('Payment could not be verified. Check your order status before paying again.');
          } finally {
            verifyingPayment.current = false;
            orderGate.current.release();
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (verifyingPayment.current) return;
            orderGate.current.release();
            setSubmitting(false);
            setErrorMsg('Payment was not completed. You can retry placing your order.');
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        if (verifyingPayment.current) return;
        orderGate.current.release();
        console.error('Payment failed:', resp.error);
        setErrorMsg(resp.error?.description || 'Payment transaction failed. Please try again.');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      orderGate.current.release();
      console.error('Order placement error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Unable to place service order.');
      setSubmitting(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    const review = paymentReview.current;
    if (!review || !orderGate.current.acquire()) return;
    setSubmitting(true);
    try {
      const status = await checkServicePaymentStatus(review.parentOrderId);
      if (isServicePaymentVerified(status)) {
        if (mode === 'cart') await refreshServiceCart();
        setConfirmedOrder(review);
      } else {
        setErrorMsg('Payment is not yet verified. You can check its status again.');
      }
    } catch {
      setErrorMsg('Could not check payment status. Please try again.');
    } finally {
      orderGate.current.release();
      setSubmitting(false);
    }
  };

  if (previewQuery.isError || addressQuery.isError) return <div role="alert" className="p-8 text-center text-sm"><p>{errorMsg || 'Could not load checkout details.'}</p><button type="button" className="mt-3 font-bold text-purple-700" onClick={() => { void previewQuery.refetch(); void addressQuery.refetch(); }}>Retry checkout</button></div>;

  // 3. SUCCESS / CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 lg:px-8 py-12 lg:h-full lg:overflow-y-auto font-['Poppins',sans-serif]">
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
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col font-['Poppins',sans-serif]">
      {/* 1. Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => (mode === 'buy_now' ? navigate(-1) : navigate('/services/cart'))}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer group hover:-translate-x-0.5"
          title="Back"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
          <span>Back</span>
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
        <div className="shrink-0 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start lg:min-h-0 lg:flex-1">
        {/* Left 2 Cols: Address & Items */}
        <div
          role="region"
          aria-label="Checkout address and services"
          tabIndex={0}
          className="lg:col-span-2 space-y-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:pb-1 focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2"
        >
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
                  onSave={handleAddNewAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                  const aId = addr.id || addr.address_id;
                  const isSelected = selectedAddressId === aId;

                  return (
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      key={aId}
                      onClick={() => setSelectedAddressId(aId)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
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
                      <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mt-1">
                        <PhoneOutlinedIcon sx={{ fontSize: 13 }} /> {addr.contact_phone || addr.phone || user?.phone}
                      </span>
                    </button>
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
        <div className="space-y-4 lg:sticky lg:top-0 lg:max-h-full lg:overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
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
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold text-center border border-emerald-200 flex items-center justify-center gap-1">
                  <CelebrationOutlinedIcon sx={{ fontSize: 16 }} /> You will earn +{summary.earnCoins} RP Coins on completion!
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            {uncertainOrder.current && paymentReview.current && <button type="button" disabled={submitting} onClick={handleCheckPaymentStatus} className="w-full rounded-xl border border-purple-200 px-4 py-3 text-sm font-bold text-purple-700 disabled:opacity-50">Check payment status</button>}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting || orderMutation.isPending || !selectedAddressId || uncertainOrder.current}
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
