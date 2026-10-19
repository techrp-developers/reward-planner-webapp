// src/api/fitnessApi.ts
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const fetchFitnessSummary = async () => {
  const res = await api.get(ENDPOINTS.fitness.summary);
  return res.data?.data || res.data;
};

export const fetchWeeklyProgress = async () => {
  const res = await api.get(ENDPOINTS.fitness.weekly);
  return res.data?.data || res.data || [];
};

export const fetchMonthStats = async () => {
  const res = await api.get(ENDPOINTS.fitness.monthStats);
  return res.data?.data || res.data;
};

/**
 * Calls step-counter module's statsRoute (/v1/stats)
 */
export const fetchStepStats = async (range: string = '7days') => {
  const res = await api.get(ENDPOINTS.fitness.stats, { params: { range } });
  return res.data?.data || res.data;
};

export const fetchTodayHourlyStats = async () => {
  const res = await api.get(ENDPOINTS.fitness.todayHourly);
  return res.data?.data || res.data;
};

/**
 * Retrieves today's step count using the backend step-counter module's statsRoute (/v1/stats)
 */
export const getTodayStepCount = async (): Promise<number | null> => {
  try {
    const token = sessionStorage.getItem('rp_access_token') || localStorage.getItem('rp_access_token');
    if (!token) return null;

    const data = await fetchStepStats('7days');
    if (Array.isArray(data) && data.length > 0) {
      const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
      const todayItem = data.find((item: any) => item?.date === todayStr);
      if (todayItem && typeof todayItem.steps === 'number') {
        return todayItem.steps;
      }
      // If date string differs by timezone, the last element represents current day
      const lastItem = data[data.length - 1];
      if (lastItem && typeof lastItem.steps === 'number') {
        return lastItem.steps;
      }
    } else if (data && typeof data.steps === 'number') {
      return data.steps;
    } else if (data && typeof data.todaySteps === 'number') {
      return data.todaySteps;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch today step count from statsRoute:', err);
    return null;
  }
};

export const fetchAchievements = async () => {
  const res = await api.get(ENDPOINTS.fitness.achievements);
  return res.data?.data || res.data || [];
};

export const fetchWalletStatement = async () => {
  const res = await api.get(ENDPOINTS.fitness.statement);
  return res.data?.data || res.data || [];
};
