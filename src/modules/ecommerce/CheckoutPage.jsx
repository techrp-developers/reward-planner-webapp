// src/modules/ecommerce/CheckoutPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import {
  placeCartOrder,
  fetchCheckoutCartPreview,
  fetchBuyNowPreview,
  placeBuyNowOrder,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
  checkPaymentStatus,
  cancelPendingPaymentOrder,
} from '../../api/cartCheckoutApi';
import {
  fetchAllAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../../api/addressApi';
import { AddressCard } from '../../components/address/AddressCard';
import { AddressForm } from '../../components/address/AddressForm';
import { formatFullAddress, toBackendAddressPayload } from '../../constants/addressConstants';
import { GradientButton } from '../../components/ui/GradientButton';
import { loadRazorpay } from '../../utils/loadRazorpay';
import { getImageUrl } from '../../api/client';

// Material UI Icons
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';

const ADDRESS_STORAGE_KEY = 'rp_saved_addresses_v1';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, openAuth } = useAuth();
  const { pincode, cityName } = useLocation();
  const { items: cartItems, subtotal: cartSubtotal, emptyCart } = useCart();

  // Mode detection: 'buy_now' or 'cart'
  const mode = searchParams.get('mode') === 'buy_now' ? 'buy_now' : 'cart';
  const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : null;
  const variantId = searchParams.get('variantId') ? Number(searchParams.get('variantId')) : null;
  const qty = searchParams.get('qty') ? Math.max(1, Number(searchParams.get('qty'))) : 1;

  // Saved addresses
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Checkout calculation state
  const [useRewards, setUseRewards] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const persistAddresses = (newList) => {
    setAddresses(newList);
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(newList));
    } catch {}
  };

  // 1. Fetch User Addresses
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAddresses()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            persistAddresses(list);
            setSelectedAddressId((prev) => prev || list[0].id || list[0].address_id);
            setIsAddressConfirmed(true);
          } else {
            const fallbackAddr = {
              id: 1,
              address_id: 1,
              contact_name: user?.name || 'Corporate Employee',
              contact_phone: user?.phone || '9876543210',
              address1: 'Main Corporate Office, Business Bay',
              locality: 'Hadapsar',
              city: cityName || 'Pune',
              state: 'Maharashtra',
              zipcode: pincode || '411013',
              address_type: 'work',
            };
            persistAddresses([fallbackAddr]);
            setSelectedAddressId(1);
            setIsAddressConfirmed(true);
          }
        })
        .catch(() => {
          const fallbackAddr = {
            id: 1,
            address_id: 1,
            contact_name: user?.name || 'Corporate Employee',
            contact_phone: user?.phone || '9876543210',
            address1: 'Main Corporate Office, Business Bay',
            locality: 'Hadapsar',
            city: cityName || 'Pune',
            state: 'Maharashtra',
            zipcode: pincode || '411013',
            address_type: 'work',
          };
          persistAddresses([fallbackAddr]);
          setSelectedAddressId(1);
          setIsAddressConfirmed(true);
        });
    }
  }, [isAuthenticated, user, cityName, pincode]);

  const selectedAddress = useMemo(() => {
    return (
      addresses.find((a) => (a.id || a.address_id) === selectedAddressId) ||
      addresses[0] ||
      null
    );
  }, [addresses, selectedAddressId]);

  // 2. Fetch Server Checkout Preview (Anti-tamper quotes)
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const loadServerPreview = async () => {
      setPreviewLoading(true);
      setErrorMsg('');

      try {
        if (mode === 'buy_now') {
          if (!productId || !variantId) return;
          const res = await fetchBuyNowPreview({
            product_id: productId,
            variant_id: variantId,
            qty,
            use_rewards: useRewards,
            address_id: selectedAddressId,
          });
          if (isMounted && res) {
            setCheckoutData(res);
          }
        } else {
          if (cartItems.length === 0) return;
          const res = await fetchCheckoutCartPreview(useRewards, selectedAddressId);
          if (isMounted && res) {
            setCheckoutData(res);
          }
        }
      } catch (err) {
        console.error('Checkout preview error:', err);
        if (isMounted) {
          setErrorMsg(
            err?.response?.data?.message ||
            'Failed to calculate server checkout summary. Please check your connection.'
          );
        }
      } finally {
        if (isMounted) setPreviewLoading(false);
      }
    };

    loadServerPreview();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, mode, productId, variantId, qty, useRewards, selectedAddressId, cartItems.length]);

  // 3. Normalise Display Items
  const displayItems = useMemo(() => {
    if (Array.isArray(checkoutData?.items) && checkoutData.items.length > 0) {
      return checkoutData.items;
    }
    if (Array.isArray(checkoutData?.data?.items) && checkoutData.data.items.length > 0) {
      return checkoutData.data.items;
    }
    const singleItem = checkoutData?.item || checkoutData?.data?.item;
    if (singleItem) {
      return [singleItem];
    }
    if (mode === 'cart') {
      return cartItems;
    }
    return [];
  }, [mode, checkoutData, cartItems]);

  // 4. Extract Server-Calculated Totals
  const rawSummary = checkoutData?.summary || checkoutData?.data?.summary || checkoutData?.data || checkoutData || {};
  const rawReward = rawSummary?.reward || checkoutData?.reward || {};

  const subtotal = Number(
    rawSummary?.productTotal ??
    rawSummary?.cartTotal ??
    (displayItems.reduce((acc, i) => acc + Number(i.sale_price || i.price || 0) * Number(i.quantity || 1), 0))
  );

  const shippingCharges = Number(rawSummary?.shippingTotal ?? 0);
  const coinsDiscount = Number(rawReward?.redeemCoins ?? rawReward?.redeemedCoins ?? rawSummary?.totalDiscount ?? 0);
  const coinsEarned = Number(rawReward?.earnCoins ?? rawSummary?.totalRewardEarn ?? 0);
  const finalPayable = Number(
    rawSummary?.payableAmount ??
    rawSummary?.finalPayable ??
    Math.max(0, subtotal - (useRewards ? coinsDiscount : 0) + shippingCharges)
  );
  const availableCoins = Number(user?.reward_points ?? user?.coins ?? user?.wallet_balance ?? 500);

  // Address Handlers
  const handleSaveAddress = async (data) => {
    setAddressSubmitting(true);
    try {
      const backendPayload = toBackendAddressPayload(data);
      if (editingAddress) {
        const addrId = editingAddress.id || editingAddress.address_id;
        try {
          await updateAddress(addrId, backendPayload);
        } catch {}

        const updated = addresses.map((a) =>
          (a.id === addrId || a.address_id === addrId) ? { ...a, ...data, ...backendPayload } : a
        );
        persistAddresses(updated);
        setEditingAddress(null);
        setSelectedAddressId(addrId);
        setIsAddressConfirmed(true);
      } else {
        let newId = Date.now();
        try {
          const res = await addAddress(backendPayload);
          if (res?.address_id) newId = res.address_id;
          else if (res?.data?.address_id) newId = res.data.address_id;
        } catch {}

        const created = {
          ...data,
          ...backendPayload,
          id: newId,
          address_id: newId,
        };
        const updated = [created, ...addresses];
        persistAddresses(updated);
        setSelectedAddressId(newId);
        setShowNewAddressForm(false);
        setIsAddressConfirmed(true);
      }
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await deleteAddress(addrId);
    } catch {}

    const remaining = addresses.filter((a) => (a.id || a.address_id) !== addrId);
    persistAddresses(remaining);
    if (selectedAddressId === addrId) {
      const next = remaining[0];
      if (next) {
        setSelectedAddressId(next.id || next.address_id);
      } else {
        setSelectedAddressId(null);
        setIsAddressConfirmed(false);
      }
    }
  };

  // 5. Order Placement & Payment Flow
  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    if (!selectedAddressId) {
      setErrorMsg('Please select or enter a delivery address to place your order.');
      return;
    }

    if (mode === 'cart' && cartItems.length === 0) {
      navigate('/store');
      return;
    }

    if (mode === 'buy_now' && (!productId || !variantId)) {
      navigate('/store');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Refresh anti-tamper quote immediately before placement
      let latestData;
      if (mode === 'buy_now') {
        latestData = await fetchBuyNowPreview({
          product_id: productId,
          variant_id: variantId,
          qty,
          use_rewards: useRewards,
          address_id: selectedAddressId,
        });
      } else {
        latestData = await fetchCheckoutCartPreview(useRewards, selectedAddressId);
      }

      const sum = latestData?.summary || latestData?.data?.summary || latestData || {};
      const rew = sum?.reward || latestData?.reward || {};
      const latestPayable = Number(sum?.payableAmount ?? sum?.finalPayable ?? finalPayable);
      const latestRedeemable = useRewards ? Number(rew?.redeemCoins ?? coinsDiscount) : 0;

      // 2. Place Order on Backend
      let orderRes;
      if (mode === 'buy_now') {
        orderRes = await placeBuyNowOrder({
          product_id: Number(productId),
          variant_id: Number(variantId),
          quantity: Number(qty),
          address_id: Number(selectedAddressId),
          expected_total: latestPayable,
          expected_redeemable: latestRedeemable,
          use_rewards: useRewards,
        });
      } else {
        orderRes = await placeCartOrder({
          address_id: Number(selectedAddressId),
          expected_total: latestPayable,
          expected_redeemable: latestRedeemable,
          use_rewards: useRewards,
        });
      }

      if (orderRes?.success === false) {
        throw new Error(orderRes?.message || 'Order creation failed');
      }

      const orderId = Number(
        orderRes?.order_id ??
        orderRes?.orderId ??
        orderRes?.data?.order_id ??
        orderRes?.data?.orderId
      );

      if (!orderId) {
        throw new Error('Order confirmation ID was not returned by server');
      }

      // 3. If 100% coin payment (0 payable), bypass payment gateway
      if (latestPayable <= 0) {
        if (mode !== 'buy_now') await emptyCart();
        navigate(`/profile?tab=orders&orderId=${orderId}&status=success`);
        return;
      }

      // 4. Create Razorpay Payment Order
      const paymentOrderData = await createRazorpayPaymentOrder(orderId);
      await loadRazorpay();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }

      const options = {
        key: paymentOrderData.key,
        amount: paymentOrderData.amount,
        currency: paymentOrderData.currency || 'INR',
        name: 'Reward Planners',
        description: `Order #${orderId} Corporate Perks Payment`,
        order_id: paymentOrderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#7C3AED' },
        handler: async (response) => {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            if (verifyRes?.success !== false) {
              if (mode !== 'buy_now') await emptyCart();
              navigate(`/profile?tab=orders&orderId=${orderId}&status=success`);
              return;
            }
          } catch (vErr) {
            console.warn('Signature verification check error:', vErr);
          }

          // Verification fallback: poll backend payment status
          try {
            const statusRes = await checkPaymentStatus(orderId);
            const st = String(statusRes?.status ?? statusRes?.payment_status ?? '').toLowerCase();
            if (st === 'paid' || st === 'captured' || st === 'success' || statusRes?.success === true) {
              if (mode !== 'buy_now') await emptyCart();
              navigate(`/profile?tab=orders&orderId=${orderId}&status=success`);
              return;
            }
          } catch {}

          navigate(`/profile?tab=orders&orderId=${orderId}&status=pending`);
        },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            try {
              await cancelPendingPaymentOrder(orderId);
            } catch {}
            setErrorMsg('Payment cancelled. You can retry anytime.');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', async (failedResponse) => {
        setLoading(false);
        try {
          await cancelPendingPaymentOrder(orderId);
        } catch {}
        setErrorMsg(failedResponse?.error?.description || 'Payment transaction failed.');
      });
      rzpInstance.open();
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Could not complete checkout. Please review your order and try again.'
      );
      setLoading(false);
    }
  };

  // If cart is empty and not in buy_now mode, show empty state
  if (mode === 'cart' && cartItems.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-50 text-[#7C3AED] flex items-center justify-center border border-violet-100 shadow-xs">
          <ShoppingBagOutlinedIcon sx={{ fontSize: 36 }} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any products yet. Browse our corporate catalog to find perks, gadgets, and office essentials.
        </p>
        <button
          onClick={() => navigate('/store')}
          className="px-6 py-3 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:bg-[#6D28D9] transition-colors shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <span>Explore Products Catalog</span>
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>/</span>
        <Link to="/store" className="hover:text-gray-900">
          Store
        </Link>
        <span>/</span>
        <span className="font-bold text-gray-900">
          {mode === 'buy_now' ? 'Express Checkout' : 'Secure Checkout'}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {mode === 'buy_now' ? 'Instant Order Checkout' : 'Checkout & Order Confirmation'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Confirm delivery address and redeem corporate RP Coins for instant discounts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 w-fit">
          <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
          <span>256-Bit SSL Encrypted Razorpay Checkout</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-semibold animate-shake">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 20 }} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-COLUMN CHECKOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: STEPS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          {isAddressConfirmed && selectedAddress ? (
            <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs transition-all animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 sm:mt-0">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-gray-500">
                        1. Delivery Address
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:inline" />
                      <span className="font-extrabold text-sm text-gray-900">
                        {selectedAddress.contact_name || selectedAddress.name || 'Customer'}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-gray-100 text-gray-700">
                        {(selectedAddress.address_type || selectedAddress.type || 'WORK').toUpperCase()}
                      </span>
                      {(selectedAddress.contact_phone || selectedAddress.phone) && (
                        <span className="font-bold text-xs text-gray-800">
                          {selectedAddress.contact_phone || selectedAddress.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate max-w-md sm:max-w-xl mt-0.5">
                      {formatFullAddress(selectedAddress)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddressConfirmed(false);
                    setShowNewAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="w-fit px-4 py-1.5 rounded-xl border border-[#A654CD]/40 text-[#A654CD] hover:bg-purple-50 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer self-end sm:self-center shrink-0"
                >
                  Change
                </button>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FC8BAD] via-[#EA4988] to-[#A654CD] text-white flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <h3 className="font-black text-base text-gray-900">Delivery Address</h3>
                </div>

                {!showNewAddressForm && !editingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setEditingAddress(null);
                    }}
                    className="text-xs font-bold text-[#A654CD] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Inline Form */}
              {(showNewAddressForm || editingAddress) && (
                <div className="mb-4">
                  <AddressForm
                    initialData={editingAddress}
                    onSave={handleSaveAddress}
                    onCancel={() => {
                      setShowNewAddressForm(false);
                      setEditingAddress(null);
                    }}
                    saveButtonText={editingAddress ? 'SAVE ADDRESS' : 'SAVE AND DELIVER HERE'}
                    isSubmitting={addressSubmitting}
                  />
                </div>
              )}

              {/* Address Cards List */}
              <div className="space-y-3">
                {addresses.length === 0 && !showNewAddressForm ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                    <p className="text-xs text-gray-500 font-medium">
                      No delivery address found. Please add a shipping address to proceed.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FC8BAD] via-[#EA4988] to-[#A654CD] text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      <span>Add Address Now</span>
                    </button>
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const addrId = addr.id || addr.address_id;
                    const isSelected = selectedAddressId === addrId;
                    return (
                      <AddressCard
                        key={addrId}
                        address={addr}
                        isSelected={isSelected}
                        onSelect={(id) => setSelectedAddressId(id)}
                        onDeliverHere={(addrObj) => {
                          setSelectedAddressId(addrObj.id || addrObj.address_id);
                          setIsAddressConfirmed(true);
                        }}
                        onEdit={(addrObj) => {
                          setEditingAddress(addrObj);
                          setShowNewAddressForm(false);
                        }}
                        onDelete={(id) => handleDeleteAddress(id)}
                        showDeliverHereButton={true}
                        showRadio={true}
                      />
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-black">
                2
              </div>
              <h3 className="font-black text-base text-gray-900">Payment Option</h3>
            </div>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#7C3AED] bg-violet-50/40 ring-2 ring-[#7C3AED]/20 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-[#7C3AED]"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">
                      Online Payment (UPI, Cards, NetBanking, Wallets)
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Instant secure checkout with Razorpay payment gateway
                    </p>
                  </div>
                </div>
                <CreditCardOutlinedIcon sx={{ fontSize: 22 }} className="text-[#7C3AED]" />
              </label>

              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-[#7C3AED] bg-violet-50/40 ring-2 ring-[#7C3AED]/20 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="accent-[#7C3AED]"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">
                      Corporate Flexi-Perks Wallet
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Direct deduction from your approved company perks allowance
                    </p>
                  </div>
                </div>
                <ApartmentOutlinedIcon sx={{ fontSize: 22 }} className="text-gray-400" />
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY (5 Cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              {previewLoading ? (
                <CircularProgress size={16} sx={{ color: '#7C3AED' }} />
              ) : (
                <span className="text-xs font-semibold text-gray-500">
                  {displayItems.length} {displayItems.length === 1 ? 'Item' : 'Items'}
                </span>
              )}
            </h3>

            {/* Items Stream */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-1">
              {displayItems.map((item, idx) => {
                const title = item.product_name || item.title || item.name || 'Product';
                const image = getImageUrl(item.image || item.image_url || item.thumbnail);
                const itemPrice = Number(item.sale_price ?? item.price ?? item.final_price ?? 0);
                const itemQty = Number(item.quantity || qty || 1);

                return (
                  <div key={item.cart_item_id || item.variant_id || idx} className="py-2.5 flex items-center gap-3">
                    <img
                      src={image}
                      alt={title}
                      className="w-12 h-12 rounded-xl object-contain border border-gray-200 shrink-0 bg-gray-50 p-1"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-gray-900 truncate">{title}</p>
                      <p className="text-gray-500 mt-0.5">
                        Qty: {itemQty} × ₹{itemPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-xs font-black text-gray-900 shrink-0">
                      ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* RP Coins Perks Redemption Banner */}
            <div className="p-4 rounded-xl bg-linear-to-r from-amber-50 to-violet-50 border border-amber-200/80 space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useRewards}
                  onChange={(e) => setUseRewards(e.target.checked)}
                  className="mt-0.5 accent-[#7C3AED] h-4 w-4 rounded cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-black text-gray-900 flex items-center gap-1">
                    <MonetizationOnIcon sx={{ fontSize: 16 }} className="text-amber-600" /> Apply Corporate RP Coins
                  </span>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">
                    Redeem <strong className="text-amber-800 font-bold">{coinsDiscount} RP Coins</strong> to save{' '}
                    <strong className="text-emerald-700 font-bold">₹{coinsDiscount}</strong> on this order.
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Wallet Balance: {availableCoins} Coins
                  </span>
                </div>
              </label>
            </div>

            {/* Price Details Breakdown */}
            <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Courier & Logistics (ExpressBees)</span>
                <span className="font-bold text-emerald-700">
                  {shippingCharges > 0 ? `₹${shippingCharges.toLocaleString('en-IN')}` : 'FREE'}
                </span>
              </div>
              {useRewards && coinsDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>RP Coins Discount</span>
                  <span>- ₹{coinsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {coinsEarned > 0 && (
                <div className="flex justify-between text-violet-700 font-bold">
                  <span>Bonus Coins on Delivery</span>
                  <span>+ {coinsEarned} Coins</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Amount Payable</span>
                <span className="text-xl text-[#7C3AED]">₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <GradientButton
              onClick={handleProceedToPayment}
              loading={loading}
              className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <LockOutlinedIcon sx={{ fontSize: 16 }} />
              <span>
                {loading
                  ? 'Processing Order...'
                  : `Pay ₹${finalPayable.toLocaleString('en-IN')} & Place Order`}
              </span>
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
