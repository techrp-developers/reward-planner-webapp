// src/api/logisticsApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';

export const checkPincodeServiceability = async (params = {}) => {
  const pin = params.pincode || params.delivery_postcode;
  const cleanPin = String(pin || '').trim();
  if (!cleanPin || cleanPin.length !== 6) {
    return { serviceable: false, message: 'Valid 6-digit pincode required' };
  }

  try {
    const payload = {
      pincode: cleanPin,
      mode: params.mode || (params.variantId || params.variant_id ? 'buy_now' : 'cart'),
      paymentType: params.paymentType || 'prepaid',
    };
    if (payload.mode === 'buy_now' && (params.variantId || params.variant_id)) {
      payload.variantId = Number(params.variantId || params.variant_id);
      payload.quantity = Number(params.quantity || 1);
    }

    const res = await api.post(ENDPOINTS.logistics.checkServiceability, payload);
    return res.data;
  } catch (error) {
    const errMsg = error?.response?.data?.message;
    return {
      serviceable: error?.response?.status !== 400 && error?.response?.status !== 404,
      fallback: true,
      message: errMsg || 'Standard delivery available to this pincode',
    };
  }
};

export const fetchTrackingStatus = async (orderId) => {
  const res = await api.get(ENDPOINTS.logistics.trackStatus(orderId));
  return res.data?.data || res.data;
};
