// src/api/logisticsApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';

export const checkPincodeServiceability = async ({ pickup_postcode = '400001', delivery_postcode, weight = 0.5, cod = 0 }) => {
  try {
    const res = await api.post(ENDPOINTS.logistics.checkServiceability, {
      pickup_postcode,
      delivery_postcode,
      weight,
      cod,
    });
    return res.data?.data || res.data;
  } catch (error) {
    return { serviceable: false, message: error?.response?.data?.message || 'Pincode check unavailable' };
  }
};

export const fetchTrackingStatus = async (orderId) => {
  const res = await api.get(ENDPOINTS.logistics.trackStatus(orderId));
  return res.data?.data || res.data;
};
