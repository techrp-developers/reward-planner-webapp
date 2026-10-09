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
