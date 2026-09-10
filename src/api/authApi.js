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

export const activateAccount = async ({ email, phone }) => {
  const clean = String(email || phone || '').trim();
  const isEmail = clean.includes('@');
  const res = await api.post(ENDPOINTS.auth.activateAccount, {
    email: isEmail ? clean : undefined,
    phone: !isEmail ? clean : undefined,
  });
  return res.data;
};

export const verifyActivationOtp = async ({ email, phone, otp }) => {
  const clean = String(email || phone || '').trim();
  const isEmail = clean.includes('@');
  const res = await api.post(ENDPOINTS.auth.verifyActivationOtp, {
    email: isEmail ? clean : undefined,
    phone: !isEmail ? clean : undefined,
    otp,
  });
  return res.data;
};

export const setPassword = async ({ email, phone, password }) => {
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

export const checkTermsStatus = async () => {
  try {
    const res = await api.get(ENDPOINTS.terms.status);
    return res.data;
  } catch {
    return { terms_accepted: true };
  }
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
