// src/api/addressApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';

export const fetchAllAddresses = async () => {
  try {
    const res = await api.get(ENDPOINTS.auth.addresses);
    return res.data?.data || res.data || [];
  } catch {
    return [];
  }
};

export const addAddress = async (payload) => {
  const res = await api.post(ENDPOINTS.auth.address, payload);
  return res.data;
};

export const updateAddress = async (id, payload) => {
  const res = await api.put(ENDPOINTS.auth.addressById(id), payload);
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await api.delete(ENDPOINTS.auth.addressById(id));
  return res.data;
};

export const fetchCountries = async () => {
  const res = await api.get(ENDPOINTS.auth.countries);
  return res.data?.data || res.data || [];
};

export const fetchStates = async (countryId) => {
  const res = await api.get(ENDPOINTS.auth.states(countryId));
  return res.data?.data || res.data || [];
};
