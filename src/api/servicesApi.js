// src/api/servicesApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';

// 1. Fetch All Active Service Categories
export const fetchServiceCategories = async () => {
  try {
    const res = await api.get(ENDPOINTS.services.categories);
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch service categories:', err);
    return [];
  }
};

// 2. Fetch All Services
export const fetchAllServices = async () => {
  try {
    const res = await api.get(ENDPOINTS.services.allServices);
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch all services:', err);
    return [];
  }
};

// 3. Fetch Services By Category ID
export const fetchServicesByCategory = async (categoryId) => {
  try {
    const res = await api.get(ENDPOINTS.services.byCategory(categoryId));
    return res.data || { success: false, data: { services: [] } };
  } catch (err) {
    console.error(`Failed to fetch services for category ${categoryId}:`, err);
    return { success: false, data: { services: [] } };
  }
};

// 4. Fetch Full Aggregated Service Details (Variants, Documents, Enquiries, FAQs)
export const fetchServiceDetails = async (serviceId) => {
  try {
    const res = await api.get(ENDPOINTS.services.details(serviceId));
    return res.data?.data || res.data;
  } catch (err) {
    console.error(`Failed to fetch details for service ${serviceId}:`, err);
    return null;
  }
};

// 5. Fetch Service Promotional Banners
export const fetchServiceBanners = async () => {
  try {
    const res = await api.get(ENDPOINTS.services.banners);
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch service banners:', err);
    return [];
  }
};

// 6. Fetch Service Bundles (Packs)
export const fetchServiceBundles = async () => {
  try {
    const res = await api.get(ENDPOINTS.services.bundles);
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch service bundles:', err);
    return [];
  }
};

// 7. Fetch Bundle Detail
export const fetchServiceBundleDetail = async (bundleId) => {
  try {
    const res = await api.get(ENDPOINTS.services.bundleDetail(bundleId));
    return res.data?.data || res.data;
  } catch (err) {
    console.error(`Failed to fetch bundle detail for ${bundleId}:`, err);
    return null;
  }
};

// 8. Fetch Mutual Fund Educational Tree & Articles
export const fetchMutualFundTree = async (categoryId = 4) => {
  try {
    const res = await api.get(ENDPOINTS.services.mfTree(categoryId));
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch mutual fund tree:', err);
    return [];
  }
};

// 9. Submit Service Enquiry / Booking Form
export const submitServiceEnquiry = async (payload) => {
  const res = await api.post(ENDPOINTS.services.enquiry, payload);
  return res.data;
};

// 10. Create Service Checkout Order
export const createServiceOrder = async (payload) => {
  const res = await api.post(ENDPOINTS.services.checkout, payload);
  return res.data?.data || res.data;
};
