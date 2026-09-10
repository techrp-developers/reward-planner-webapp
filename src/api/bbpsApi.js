// src/api/bbpsApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';

export const fetchBbpsCategories = async () => {
  const res = await api.get(ENDPOINTS.bbps.categories);
  return res.data?.data || res.data || [];
};

export const fetchBbpsOperators = async (categoryId) => {
  const res = await api.get(ENDPOINTS.bbps.operators, {
    params: { category_id: categoryId },
  });
  return res.data?.data || res.data || [];
};

export const fetchBbpsOperatorDetails = async (operatorId) => {
  const res = await api.get(ENDPOINTS.bbps.operatorDetails(operatorId));
  return res.data?.data || res.data;
};

export const fetchBbpsBill = async ({ operator_id, params }) => {
  const res = await api.post(ENDPOINTS.bbps.fetchBill, {
    operator_id,
    params,
  });
  return res.data?.data || res.data;
};

export const createBbpsOrder = async (payload) => {
  const res = await api.post(ENDPOINTS.bbps.createOrder, payload);
  return res.data?.data || res.data;
};
