// src/api/fitnessApi.js
import api from './client';
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
  const res = await api.get(ENDPOINTS.fitness.stats);
  return res.data?.data || res.data;
};

export const fetchAchievements = async () => {
  const res = await api.get(ENDPOINTS.fitness.achievements);
  return res.data?.data || res.data || [];
};

export const fetchWalletStatement = async () => {
  const res = await api.get(ENDPOINTS.fitness.statement);
  return res.data?.data || res.data || [];
};
