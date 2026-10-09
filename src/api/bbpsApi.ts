// src/api/bbpsApi.js
import api from './client';
import { ENDPOINTS } from './endpoints';
import { normalizeBbpsOperatorDetails } from './bbpsOperatorDetails';

// 1. Fetch Categories
export const fetchBbpsCategories = async () => {
  try {
    const res = await api.get(ENDPOINTS.bbps.categories);
    return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Failed to fetch BBPS categories:', error);
    throw error;
  }
};

// 2. Fetch Locations / Circles (for mobile / DTH recharge)
export const fetchBbpsLocations = async () => {
  try {
    const res = await api.get(ENDPOINTS.bbps.locations);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('Failed to fetch BBPS locations:', error);
    return [];
  }
};

// 3. Fetch Operators by Category (or all operators)
export const fetchBbpsOperators = async (categoryId) => {
  try {
    const params = categoryId ? { category_id: categoryId } : {};
    const res = await api.get(ENDPOINTS.bbps.operators, { params });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('Failed to fetch BBPS operators:', error);
    throw error;
  }
};

// 4. Search Operators across all categories
export const searchBbpsOperators = async (query) => {
  try {
    const res = await api.get(ENDPOINTS.bbps.searchOperators, {
      params: { query },
    });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('Failed to search BBPS operators:', error);
    return [];
  }
};

// 5. Fetch Operator Dynamic Details & Input Fields
export const fetchBbpsOperatorDetails = async (operatorId) => {
  try {
    const res = await api.get(ENDPOINTS.bbps.operatorDetails(operatorId));
    return normalizeBbpsOperatorDetails(res.data, operatorId);
  } catch (error) {
    console.error(`Failed to fetch details for operator ${operatorId}:`, error);
    throw error;
  }
};

// 6. Fetch Recharge Plans (Prepaid Mobile)
export const fetchBbpsRechargePlans = async ({ mobile, operatorId, circleId }) => {
  try {
    const res = await api.get(ENDPOINTS.bbps.rechargePlans, {
      params: {
        mobile,
        operator_id: operatorId,
        circle_id: circleId || '',
      },
    });
    const plansData = res.data?.data ?? res.data;
    return {
      success: res.data?.success ?? true,
      message: res.data?.message || '',
      data: {
        status: plansData?.status ?? 0,
        count: plansData?.count ?? 0,
        groups: Array.isArray(plansData?.groups) ? plansData.groups : [],
        plans: Array.isArray(plansData) ? plansData : Array.isArray(plansData?.plans) ? plansData.plans : [],
      },
    };
  } catch (error) {
    console.error('Failed to fetch recharge plans:', error);
    throw error;
  }
};

// 7. Fetch Live Bill Details from Eko / BBPS
export const fetchBbpsBill = async (payload) => {
  try {
    const res = await api.post(ENDPOINTS.bbps.fetchBill, payload);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch BBPS bill:', error);
    throw error?.response?.data || error;
  }
};

// 8. Create Bill Pay / Recharge Order
export const createBbpsOrder = async (payload) => {
  try {
    const res = await api.post(ENDPOINTS.bbps.createOrder, payload);
    return res.data;
  } catch (error) {
    console.error('Failed to create BBPS order:', error);
    throw error?.response?.data || error;
  }
};

// 9. Verify Razorpay Payment and Settle BBPS
export const verifyBbpsPayment = async (payload) => {
  try {
    const res = await api.post(ENDPOINTS.bbps.verifyPayment, payload);
    return res.data;
  } catch (error) {
    console.error('Failed to verify BBPS payment:', error);
    throw error?.response?.data || error;
  }
};

// 10. Check Transaction Live Status
export const checkBbpsTransactionStatus = async (transactionId) => {
  try {
    const res = await api.get(ENDPOINTS.bbps.checkStatus(transactionId));
    return res.data;
  } catch (error) {
    console.error('Failed to check BBPS transaction status:', error);
    throw error?.response?.data || error;
  }
};

// 11. Cancel Unpaid Order
export const cancelUnpaidBbpsOrder = async (transactionId) => {
  try {
    const res = await api.post(ENDPOINTS.bbps.cancelOrder, {
      transaction_id: transactionId,
    });
    return res.data;
  } catch (error) {
    console.error('Failed to cancel unpaid BBPS order:', error);
    return null;
  }
};

// 12. Fetch Order History (Past bill payments & recharges)
export const fetchBbpsOrderHistory = async (params = {}) => {
  try {
    const res = await api.get(ENDPOINTS.bbps.orderHistory, { params });
    return {
      success: res.data?.success ?? true,
      orders: Array.isArray(res.data?.orders) ? res.data.orders : [],
      total: res.data?.total ?? 0,
      totalPages: res.data?.totalPages ?? 1,
      currentPage: res.data?.currentPage ?? 1,
    };
  } catch (error) {
    console.error('Failed to fetch BBPS order history:', error);
    return {
      success: false,
      orders: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
};
