// src/api/authApi.js
import api from './client';
import { ENDPOINTS, API_BASE_URL } from './endpoints';
import axios from 'axios';

export const loginUser = async ({ identifier, password }) => {
  const cleanId = String(identifier || '').trim();
  const isEmail = cleanId.includes('@');
  const payload = {
    email: isEmail ? cleanId : undefined,
    phone: !isEmail ? cleanId : undefined,
    login: cleanId,
    identifier: cleanId,
    password,
  };
  const res = await api.post(ENDPOINTS.auth.login, payload);
  return res.data;
};

export const registerUser = async (payload) => {
  const res = await api.post(ENDPOINTS.auth.register, payload);
  return res.data;
};

export const fetchUserInfo = async () => {
  const res = await api.get(ENDPOINTS.auth.userInfo);
  return res.data;
};

export const activateAccount = async ({ email, phone }: { email?: string; phone?: string } = {}) => {
  const clean = String(email || phone || '').trim();
  const isEmail = clean.includes('@');
  const res = await api.post(ENDPOINTS.auth.activateAccount, {
    email: isEmail ? clean : undefined,
    phone: !isEmail ? clean : undefined,
  });
  return res.data;
};

export const verifyActivationOtp = async ({
  email,
  phone,
  otp,
}: {
  email?: string;
  phone?: string;
  otp: string;
}) => {
  const clean = String(email || phone || '').trim();
  const isEmail = clean.includes('@');
  const res = await api.post(ENDPOINTS.auth.verifyActivationOtp, {
    email: isEmail ? clean : undefined,
    phone: !isEmail ? clean : undefined,
    otp,
  });
  return res.data;
};

export const setPassword = async ({
  email,
  phone,
  password,
}: {
  email?: string;
  phone?: string;
  password: string;
}) => {
  const clean = String(email || phone || '').trim();
  const isEmail = clean.includes('@');
  const res = await api.post(ENDPOINTS.auth.setPassword, {
    email: isEmail ? clean : undefined,
    phone: !isEmail ? clean : undefined,
    password,
  });
  return res.data;
};

export const forgotPassword = async ({ email }) => {
  const res = await api.post(ENDPOINTS.auth.forgotPassword, {
    email: String(email || '').trim(),
  });
  return res.data;
};

export const verifyForgotPasswordOtp = async ({ email, otp }) => {
  const res = await api.post(ENDPOINTS.auth.verifyForgotPasswordOtp, {
    email: String(email || '').trim(),
    otp,
  });
  return res.data;
};

export const resetPassword = async ({ email, newPassword }) => {
  const res = await api.post(ENDPOINTS.auth.resetPassword, {
    email: String(email || '').trim(),
    newPassword,
  });
  return res.data;
};

let termsStatusUnavailable = false;
let pendingTermsStatus: Promise<unknown> | null = null;

export const checkTermsStatus = async (profile?: { terms_accepted?: unknown }) => {
  if (typeof profile?.terms_accepted === 'boolean') return { terms_accepted: profile.terms_accepted };
  // Retain the existing compatibility fallback for backends without this route.
  // Share concurrent checks (including StrictMode hydration) and stop rechecking a missing route.
  if (termsStatusUnavailable) return { terms_accepted: true };
  if (!pendingTermsStatus) {
    pendingTermsStatus = api.get(ENDPOINTS.terms.status)
      .then((res) => res.data)
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) termsStatusUnavailable = true;
        return { terms_accepted: true };
      })
      .finally(() => { pendingTermsStatus = null; });
  }
  return pendingTermsStatus as Promise<{ terms_accepted?: boolean }>;
};

export const acceptTerms = async () => {
  const res = await api.post(ENDPOINTS.terms.accept);
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await api.put(ENDPOINTS.auth.profile, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteCustomer = async () => {
  const res = await api.delete('/v1/auth/delete-customer');
  return res.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api.put(ENDPOINTS.auth.changePassword, {
    currentPassword,
    newPassword,
  });
  return res.data;
};

export const fetchUserAddresses = async () => {
  try {
    const res = await api.get(ENDPOINTS.auth.addresses);
    return res.data;
  } catch (err) {
    return { success: false, data: [] };
  }
};

export const fetchCompanyBirthdays = async (params?: {
  company_id?: string | number;
  user_id?: string | number;
  companyId?: string | number;
  userId?: string | number;
  company_name?: string;
  companyName?: string;
}) => {
  // 1. Direct query to live database via /v1/auth/birthdays on live API server
  try {
    const res = await api.get(ENDPOINTS.auth.birthdays, { params });
    const payload = res?.data?.data || res?.data;
    if (payload && (Array.isArray(payload) || payload.all || payload.upcoming || payload.today)) {
      const today = Array.isArray(payload.today) ? payload.today : [];
      const upcoming = Array.isArray(payload.upcoming) ? payload.upcoming : [];
      const all = Array.isArray(payload.all) ? payload.all : (Array.isArray(payload) ? payload : [...today, ...upcoming]);
      return {
        companyId: payload.companyId || params?.company_id || params?.companyId || null,
        companyName: payload.companyName || params?.company_name || params?.companyName || null,
        today,
        upcoming,
        all,
        todayCount: payload.todayCount ?? today.length,
        upcomingCount: payload.upcomingCount ?? upcoming.length,
      };
    }
  } catch (err) {
    console.warn('Could not fetch from /v1/auth/birthdays:', err);
  }

  // 2. Mobile App Parity: Fetch from /v1/auth/user-info (which returns birthday_employees, today_birthdays, upcoming_birthdays)
  try {
    const infoRes = await api.get(ENDPOINTS.auth.userInfo);
    const infoData = infoRes?.data?.data || infoRes?.data?.user || infoRes?.data;
    if (infoData) {
      const today = Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays : [];
      const upcoming = Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays : [];
      const all = Array.isArray(infoData.birthday_employees)
        ? infoData.birthday_employees
        : [...today, ...upcoming];

      return {
        companyId: infoData.company_id || infoData.company?.id || params?.company_id || null,
        companyName: infoData.company_name || infoData.company?.name || params?.company_name || null,
        today,
        upcoming,
        all,
        todayCount: infoData.today_birthday_count ?? today.length,
        upcomingCount: infoData.upcoming_birthday_count ?? upcoming.length,
      };
    }
  } catch (err) {
    console.warn('Could not fetch birthdays from /v1/auth/user-info:', err);
  }

  return {
    companyId: null,
    companyName: null,
    today: [],
    upcoming: [],
    all: [],
    todayCount: 0,
    upcomingCount: 0,
  };
};

export const sendBirthdayWishApi = async ({
  employeeId,
  recipientUserId,
  message,
}: {
  employeeId?: string | number;
  recipientUserId?: string | number;
  message?: string;
}) => {
  try {
    const res = await api.post(ENDPOINTS.auth.sendBirthdayWish, {
      employeeId,
      recipientUserId,
      message,
    });
    return res.data;
  } catch (err) {
    console.warn('Could not post birthday wish to endpoint:', err);
    return { success: false };
  }
};
