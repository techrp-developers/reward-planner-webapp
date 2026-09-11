// src/api/serviceCartCheckoutApi.js
import api from './client';

// ==========================================
// 🛒 SERVICE CART APIs
// ==========================================

export const addServiceToCart = async ({ service_id, variant_id }) => {
  if (!service_id || !variant_id) {
    throw new Error('Invalid service_id or variant_id');
  }
  const res = await api.post('/v1/service-cart/add', {
    service_id: Number(service_id),
    variant_id: Number(variant_id),
  });
  return res.data;
};

export const fetchServiceCartItems = async () => {
  try {
    const res = await api.get('/v1/service-cart/cart-items');
    const data = res.data?.data || res.data || {};
    return {
      bundles: Array.isArray(data.bundles) ? data.bundles : [],
      individual_items: Array.isArray(data.individual_items) ? data.individual_items : [],
      total: Number(data.total || 0),
      rewards: {
        earn_coins: Number(data.rewards?.earn_coins || 0),
        max_redeem_coins: Number(data.rewards?.max_redeem_coins || 0),
      },
    };
  } catch (err) {
    // If cart items endpoint returns 404/empty, try fallback to checkout-preview
    if (err.response?.status === 404) {
      try {
        const previewRes = await api.get('/v1/service-checkout/checkout-preview');
        const data = previewRes.data?.data || previewRes.data || {};
        return {
          bundles: Array.isArray(data.bundles) ? data.bundles : [],
          individual_items: Array.isArray(data.individual_items) ? data.individual_items : [],
          total: Number(data.total || 0),
          rewards: {
            earn_coins: Number(data.rewards?.earn_coins || 0),
            max_redeem_coins: Number(data.rewards?.max_redeem_coins || 0),
          },
        };
      } catch {
        return {
          bundles: [],
          individual_items: [],
          total: 0,
          rewards: { earn_coins: 0, max_redeem_coins: 0 },
        };
      }
    }
    throw err;
  }
};

export const removeServiceCartItem = async (cartItemId) => {
  if (!cartItemId) throw new Error('Missing cartItemId');
  const res = await api.delete(`/v1/service-cart/item/${cartItemId}`);
  return res.data;
};

export const clearServiceCart = async () => {
  const res = await api.delete('/v1/service-cart/clear');
  return res.data;
};

export const addBundleToCart = async (bundle_id, selected_items = []) => {
  if (!bundle_id) throw new Error('Missing bundle_id');
  const res = await api.post(`/v1/service-cart/add-bundle/${bundle_id}`, {
    selected_items: Array.isArray(selected_items) ? selected_items : [],
  });
  return res.data;
};

// ==========================================
// ⚡ SERVICE CHECKOUT APIs
// ==========================================

export const fetchServiceBuyNowPreview = async ({ service_id, variant_id, redeem_coins = 0 }) => {
  if (!service_id || !variant_id) {
    throw new Error('Missing service_id or variant_id');
  }
  const res = await api.get('/v1/service-checkout/buy-now-preview', {
    params: {
      service_id: Number(service_id),
      variant_id: Number(variant_id),
      redeem_coins: Number(redeem_coins || 0),
    },
  });
  return res.data?.data || res.data;
};

export const fetchServiceCheckoutPreview = async (redeem_coins = 0) => {
  const res = await api.get('/v1/service-checkout/checkout-preview', {
    params: { redeem_coins: Number(redeem_coins || 0) },
  });
  return res.data?.data || res.data;
};

export const fetchBuyNowBundlePreview = async ({ bundle_id, selected_items = [], redeem_coins = 0 }) => {
  if (!bundle_id) throw new Error('Missing bundle_id');
  const itemsStr = Array.isArray(selected_items) ? selected_items.join(',') : String(selected_items);
  const res = await api.get('/v1/service-checkout/buy-now-bundle-preview', {
    params: {
      bundle_id: Number(bundle_id),
      selected_items: itemsStr,
      redeem_coins: Number(redeem_coins || 0),
    },
  });
  return res.data?.data || res.data;
};

export const placeServiceBuyNowOrder = async ({ service_id, variant_id, address_id, redeem_coins = 0 }) => {
  if (!service_id || !variant_id) throw new Error('Missing service_id or variant_id');
  if (!address_id) throw new Error('Please select a valid delivery/communication address');

  const res = await api.post('/v1/service-checkout/buy-now', {
    service_id: Number(service_id),
    variant_id: Number(variant_id),
    address_id: Number(address_id),
    redeem_coins: Number(redeem_coins || 0),
  });
  return res.data?.data || res.data;
};

export const placeServiceCartOrder = async ({ address_id, redeem_coins = 0 }) => {
  if (!address_id) throw new Error('Please select a valid delivery/communication address');

  const res = await api.post('/v1/service-checkout/cart', {
    address_id: Number(address_id),
    redeem_coins: Number(redeem_coins || 0),
  });
  return res.data?.data || res.data;
};

export const placeBuyNowBundleOrder = async ({ bundle_id, selected_items = [], address_id, redeem_coins = 0 }) => {
  if (!bundle_id) throw new Error('Missing bundle_id');
  if (!address_id) throw new Error('Please select a valid delivery/communication address');

  const res = await api.post('/v1/service-checkout/buy-now-bundle', {
    bundle_id: Number(bundle_id),
    selected_items: Array.isArray(selected_items) ? selected_items : [],
    address_id: Number(address_id),
    redeem_coins: Number(redeem_coins || 0),
  });
  return res.data?.data || res.data;
};

// ==========================================
// 💳 SERVICE RAZORPAY PAYMENT APIs
// ==========================================

export const createServicePaymentOrder = async (parent_order_id) => {
  if (!parent_order_id) throw new Error('Missing parent_order_id');
  const res = await api.post('/v1/service-orders/create-order', {
    parent_order_id: String(parent_order_id),
  });
  return res.data;
};

export const verifyServicePayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const res = await api.post('/v1/service-orders/verify-payment', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return res.data;
};

export const checkServicePaymentStatus = async (parent_order_id) => {
  if (!parent_order_id) throw new Error('Missing parent_order_id');
  const res = await api.get(`/v1/service-orders/payment-status/${encodeURIComponent(parent_order_id)}`);
  return res.data;
};

export const isServicePaymentVerified = (res) => {
  const status = String(res?.payment_status ?? res?.status ?? '').toLowerCase();
  if (status) {
    return status === 'paid' || status === 'captured' || status === 'success' || status === 'verified';
  }
  return res?.success === true || res?.verified === true;
};
