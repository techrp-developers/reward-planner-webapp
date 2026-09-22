// src/api/cartCheckoutApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';

export const fetchCartItems = async () => {
  try {
    const res = await api.get(ENDPOINTS.cart.items);
    return res.data || { items: [] };
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 503 || error?.response?.status === 401) {
      return { items: [] };
    }
    throw error;
  }
};

export const fetchCartSummary = async (useRewards = true) => {
  try {
    const res = await api.get(ENDPOINTS.cart.summary, {
      params: { use_rewards: useRewards },
    });
    return res.data?.data || res.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const addToCart = async ({ product_id, variant_id, quantity = 1 }) => {
  const payload = {
    product_id: Number(product_id),
    variant_id: Number(variant_id),
    quantity: Number(quantity),
  };
  const res = await api.post(ENDPOINTS.cart.item, payload);
  return res.data;
};

export const updateCartItemQty = async (cartItemId, quantity) => {
  const res = await api.put(ENDPOINTS.cart.updateItem(cartItemId), {
    quantity: Number(quantity),
  });
  return res.data;
};

export const deleteCartItem = async (cartItemId) => {
  const res = await api.delete(ENDPOINTS.cart.deleteItem(cartItemId));
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete(ENDPOINTS.cart.items);
  return res.data;
};

export const checkVariantStock = async (variantId) => {
  try {
    const res = await api.get(ENDPOINTS.cart.checkStock(variantId));
    return res.data;
  } catch (err) {
    return { inStock: true, stock: 99 };
  }
};

export const fetchCheckoutCartPreview = async (useRewards = true, addressId = null) => {
  try {
    const res = await api.get(ENDPOINTS.checkout.getCart, {
      params: { use_rewards: useRewards, address_id: addressId },
    });
    return res.data?.data || res.data;
  } catch (error) {
    if (error?.response?.status === 400 || error?.response?.status === 401) {
      return { items: [], total: 0 };
    }
    throw error;
  }
};

export const placeCartOrder = async (payload) => {
  const res = await api.post(ENDPOINTS.checkout.cart, payload);
  return res.data;
};

export const fetchBuyNowPreview = async ({ product_id, variant_id, qty = 1, use_rewards = true, address_id }) => {
  const res = await api.get(ENDPOINTS.checkout.getBuyNow, {
    params: { product_id, variant_id, qty, use_rewards, address_id },
  });
  return res.data?.data || res.data;
};

export const placeBuyNowOrder = async (payload) => {
  const res = await api.post(ENDPOINTS.checkout.buyNow, payload);
  return res.data;
};

export const createRazorpayPaymentOrder = async (orderId) => {
  const res = await api.post(ENDPOINTS.payment.createOrder, { orderId: Number(orderId) });
  const raw = res.data?.data || res.data || {};
  const rzpOrderId =
    raw.orderId ??
    raw.order_id ??
    raw.razorpayOrderId ??
    raw.razorpay_order_id ??
    raw.id;

  const amount = Number(raw.amount ?? 0);

  return {
    ...raw,
    key: raw.key || raw.razorpay_key,
    orderId: rzpOrderId,
    amount,
    currency: raw.currency || 'INR',
  };
};

export const verifyRazorpayPayment = async (payload) => {
  const res = await api.post(ENDPOINTS.payment.verifyPayment, {
    razorpay_order_id: payload.razorpay_order_id,
    razorpay_payment_id: payload.razorpay_payment_id,
    razorpay_signature: payload.razorpay_signature,
  });
  return res.data;
};

export const checkPaymentStatus = async (orderId) => {
  const res = await api.get(ENDPOINTS.payment.paymentStatus(orderId));
  return res.data;
};

export const cancelPendingPaymentOrder = async (orderId) => {
  const res = await api.post(ENDPOINTS.payment.cancelOrder(orderId));
  return res.data;
};

export const fetchOrderReceipt = async (orderId) => {
  const res = await api.get(ENDPOINTS.orders.receipt(orderId));
  return res.data?.receipt || res.data?.data || res.data;
};

export const fetchMyOrders = async (params = {}) => {
  const res = await api.get(ENDPOINTS.orders.myOrders, { params });
  const raw = res.data?.orders || res.data?.data?.orders || res.data?.data || res.data || [];
  return Array.isArray(raw) ? raw : (raw.orders || []);
};

export const fetchOrderDetails = async (orderId) => {
  const res = await api.get(ENDPOINTS.orders.details(orderId));
  return res.data?.data || res.data;
};

export const fetchCancellationReasons = async () => {
  const res = await api.get(ENDPOINTS.orders.cancellationReasons);
  return res.data?.reasons || res.data?.data || res.data || [];
};

export const cancelOrder = async (orderId, payload) => {
  const res = await api.post(ENDPOINTS.orders.cancel(orderId), payload);
  return res.data;
};

export const getOrderInvoice = async (orderId) => {
  const res = await api.get(ENDPOINTS.orders.invoice(orderId));
  return res.data;
};

export default {
  fetchCartItems,
  fetchCartSummary,
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
  checkVariantStock,
  fetchCheckoutCartPreview,
  placeCartOrder,
  fetchBuyNowPreview,
  placeBuyNowOrder,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
  checkPaymentStatus,
  cancelPendingPaymentOrder,
  fetchOrderReceipt,
  fetchMyOrders,
  fetchOrderDetails,
  fetchCancellationReasons,
  cancelOrder,
  getOrderInvoice,
};
