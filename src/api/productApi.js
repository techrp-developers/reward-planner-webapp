// src/api/productApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';
import { normalizeProduct } from '../modules/ecommerce/utils/normalizeProduct';

const extractProductList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.products)) return resData.products;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

const wrapNormalizedList = (resData) => {
  const rawList = extractProductList(resData);
  const normalized = rawList.map(normalizeProduct).filter(Boolean);
  normalized.total = resData?.total ?? normalized.length;
  normalized.totalPages = resData?.totalPages ?? 1;
  normalized.currentPage = resData?.currentPage ?? 1;
  normalized.hasMore = Boolean(resData?.hasMore);
  if (resData?.category_name) normalized.category_name = resData.category_name;
  if (resData?.subcategory_name) normalized.subcategory_name = resData.subcategory_name;
  return normalized;
};

export const fetchCategoriesWithSub = async () => {
  try {
    const res = await api.get(ENDPOINTS.products.categoriesWithSub);
    return res.data?.data || res.data?.categories || res.data || [];
  } catch {
    return [];
  }
};

export const fetchAllCategories = async () => {
  try {
    const res = await api.get(ENDPOINTS.products.categories);
    return res.data?.data || res.data?.categories || res.data || [];
  } catch {
    return [];
  }
};

export const fetchAllProducts = async (params = {}) => {
  try {
    const queryParams = {
      limit: params.limit || 50,
      page: params.page || 1,
      ...params,
    };
    const res = await api.get(ENDPOINTS.products.all, { params: queryParams });
    return wrapNormalizedList(res.data);
  } catch (err) {
    console.error('Failed to fetch all products:', err);
    return [];
  }
};

export const fetchProductsByCategory = async (categoryId, params = {}) => {
  try {
    const queryParams = {
      limit: params.limit || 50,
      page: params.page || 1,
      ...params,
    };
    const res = await api.get(ENDPOINTS.products.byCategory(categoryId), { params: queryParams });
    return wrapNormalizedList(res.data);
  } catch (err) {
    console.error(`Failed to fetch products for category ${categoryId}:`, err);
    return [];
  }
};

export const fetchProductsBySubcategory = async (subcategoryId, params = {}) => {
  try {
    const queryParams = {
      limit: params.limit || 50,
      page: params.page || 1,
      ...params,
    };
    const res = await api.get(ENDPOINTS.products.bySubcategory(subcategoryId), { params: queryParams });
    return wrapNormalizedList(res.data);
  } catch (err) {
    console.error(`Failed to fetch products for subcategory ${subcategoryId}:`, err);
    return [];
  }
};

export const fetchProductDetails = async (id) => {
  try {
    const res = await api.get(ENDPOINTS.products.details(id));
    const raw = res.data?.product || res.data?.data || res.data;
    return raw ? normalizeProduct(raw) : null;
  } catch (err) {
    console.error(`Failed to fetch product details for ${id}:`, err);
    return null;
  }
};

export const fetchSimilarProducts = async (id, params = {}) => {
  try {
    const res = await api.get(ENDPOINTS.products.similar(id), { params });
    return wrapNormalizedList(res.data);
  } catch {
    return [];
  }
};

export const fetchNewArrivals = async () => {
  try {
    const res = await api.get(ENDPOINTS.products.newArrivals);
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('new-arrivals endpoint failed, falling back to all-products', err);
  }
  return fetchAllProducts({ page: 1, limit: 12 });
};

export const fetchBestSellers = async () => {
  try {
    const res = await api.get(ENDPOINTS.products.bestSellers);
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('best-sellers endpoint empty/failed, falling back to all-products', err);
  }
  return fetchAllProducts({ page: 1, limit: 12 });
};

export const fetchTrending = async () => {
  try {
    const res = await api.get(ENDPOINTS.products.trending);
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('trending endpoint empty/failed, falling back to all-products', err);
  }
  return fetchAllProducts({ page: 2, limit: 12 });
};

export const fetchTopRated = async () => {
  try {
    const res = await api.get(ENDPOINTS.products.topRated);
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('top-rated endpoint empty/failed, falling back to all-products', err);
  }
  return fetchAllProducts({ page: 1, limit: 10 });
};

export const fetchMostViewedProducts = async (limit = 10) => {
  try {
    const res = await api.get(ENDPOINTS.products.mostViewed, { params: { limit } });
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('most-viewed endpoint empty/failed, falling back to all-products', err);
  }
  return fetchAllProducts({ page: 1, limit });
};

export const fetchRecentProducts = async (limit = 10) => {
  try {
    const res = await api.get(ENDPOINTS.products.recentProducts, { params: { limit } });
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('recent-products endpoint empty/failed', err);
  }
  return [];
};

export const fetchRecommendations = async (limit = 10) => {
  try {
    const res = await api.get(ENDPOINTS.products.recommendations, { params: { limit } });
    const list = wrapNormalizedList(res.data);
    if (list.length > 0) return list;
  } catch (err) {
    console.warn('recommendations endpoint empty/failed, falling back to all-products', err);
  }
  return fetchAllProducts({ page: 2, limit });
};

export const fetchGlobalSearchSuggestions = async (q, signal) => {
  if (!q || !q.trim()) return { products: [], services: [] };
  try {
    const res = await api.get(ENDPOINTS.global.suggestions, {
      params: { q },
      signal,
    });
    return res.data?.data || res.data || { products: [], services: [] };
  } catch {
    return { products: [], services: [] };
  }
};

export default {
  fetchCategoriesWithSub,
  fetchAllCategories,
  fetchAllProducts,
  fetchProductsByCategory,
  fetchProductsBySubcategory,
  fetchProductDetails,
  fetchSimilarProducts,
  fetchNewArrivals,
  fetchBestSellers,
  fetchTrending,
  fetchTopRated,
  fetchMostViewedProducts,
  fetchRecentProducts,
  fetchRecommendations,
  fetchGlobalSearchSuggestions,
};
