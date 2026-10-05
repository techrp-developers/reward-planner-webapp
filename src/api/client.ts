// src/api/client.js
import axios from 'axios';
import { API_BASE_URL, IMAGE_BASE_URL, ENDPOINTS } from './endpoints';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('rp_access_token') || localStorage.getItem('rp_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || '';
      if (url.includes(ENDPOINTS.auth.login) || url.includes(ENDPOINTS.auth.refresh)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem('rp_refresh_token') || localStorage.getItem('rp_refresh_token');
      if (!refreshToken) {
        sessionStorage.removeItem('rp_access_token');
        sessionStorage.removeItem('rp_refresh_token');
        localStorage.removeItem('rp_access_token');
        localStorage.removeItem('rp_refresh_token');
        processQueue(new Error('Missing refresh token'), null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
          refreshToken,
        });

        const newToken = res.data?.accessToken || res.data?.data?.accessToken;
        if (!newToken) throw new Error('No new token in refresh response');

        sessionStorage.setItem('rp_access_token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        sessionStorage.removeItem('rp_access_token');
        sessionStorage.removeItem('rp_refresh_token');
        localStorage.removeItem('rp_access_token');
        localStorage.removeItem('rp_refresh_token');
        window.dispatchEvent(new CustomEvent('rp_session_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const getImageUrl = (imagePath: unknown): string => {
  if (!imagePath || typeof imagePath !== 'string') return '/placeholder.svg';
  const trimmed = imagePath.trim();
  if (!trimmed) return '/placeholder.svg';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^\/+/, '');
  return `${IMAGE_BASE_URL}/${encodeURI(clean)}`;
};

export default api;
