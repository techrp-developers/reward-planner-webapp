// src/api/authApi.js
import api from './client';
import { ENDPOINTS, API_BASE_URL } from './endpoints';
import axios from 'axios';
import { isCompanyMatch } from '../services/celebrationService';
import { findEmployeeDirectoryInfo, getDeterministicUpcomingDob } from '../data/companyEmployeesData';

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

// Development customer token for User 37 (Sakshi Chavan, MPS Global) to query live database seamlessly
const DEV_FALLBACK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

export const fetchCompanyBirthdays = async (params?: {
  company_id?: string | number;
  user_id?: string | number;
  companyId?: string | number;
  userId?: string | number;
  company_name?: string;
  companyName?: string;
}) => {
  const compId = params?.company_id || params?.companyId;
  const uId = params?.user_id || params?.userId;
  const targetCompany = params?.company_name || params?.companyName;
  const currentToken =
    sessionStorage.getItem('rp_access_token') ||
    localStorage.getItem('rp_access_token') ||
    DEV_FALLBACK_TOKEN;

  // 1. Direct query to live local backend on port 5000 (connects directly to rewardplanners_db)
  const candidateUrls = [
    'http://localhost:5000/v1/auth/birthdays',
    '/v1/auth/birthdays',
  ];

  for (const url of candidateUrls) {
    try {
      const res = await axios.get(url, {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
        timeout: 5000,
      });
      const data = res?.data?.data || res?.data;
      if (
        data &&
        (Array.isArray(data)
          ? data.length > 0
          : (data.all?.length > 0 || data.today?.length > 0 || data.upcoming?.length > 0))
      ) {
        return {
          companyId: data.companyId || compId,
          companyName: data.companyName || targetCompany || null,
          all: data.all || [...(data.today || []), ...(data.upcoming || [])],
          today: Array.isArray(data.today) ? data.today : [],
          upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
          todayCount: data.todayCount ?? (Array.isArray(data.today) ? data.today.length : 0),
          upcomingCount: data.upcomingCount ?? (Array.isArray(data.upcoming) ? data.upcoming.length : 0),
        };
      }
    } catch {}
  }

  // 2. Fetch user-info directly from live backend API
  const userInfoUrls = [
    'http://localhost:5000/v1/auth/user-info',
    '/v1/auth/user-info',
  ];

  for (const url of userInfoUrls) {
    try {
      const infoRes = await axios.get(url, {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
        timeout: 5000,
      });
      const infoData = infoRes?.data?.data || infoRes?.data?.user || infoRes?.data;
      if (infoData) {
        let birthdayEmployees =
          Array.isArray(infoData.birthday_employees) && infoData.birthday_employees.length > 0
            ? infoData.birthday_employees
            : [];

        if (birthdayEmployees.length === 0) {
          birthdayEmployees = [
            ...(Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays : []),
            ...(Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays : []),
            ...(Array.isArray(infoData.company_users) ? infoData.company_users : []),
            ...(Array.isArray(infoData.employees) ? infoData.employees : []),
            ...(Array.isArray(infoData.company?.employees) ? infoData.company.employees : []),
          ];
        }

        if (birthdayEmployees.length > 0 || Array.isArray(infoData.today_birthdays)) {
          return {
            companyId: infoData.company_id || infoData.company?.id || compId,
            companyName: infoData.company_name || infoData.company?.name || null,
            all: birthdayEmployees,
            today: Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays : [],
            upcoming: Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays : [],
            todayCount:
              infoData.today_birthday_count ??
              (Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays.length : 0),
            upcomingCount:
              infoData.upcoming_birthday_count ??
              (Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays.length : 0),
          };
        }
      }
    } catch {}
  }

  // 3. Try standard api instance with configured endpoints
  try {
    const infoRes = await api.get(ENDPOINTS.auth.userInfo);
    const infoData = infoRes?.data?.data || infoRes?.data?.user || infoRes?.data;
    if (infoData) {
      const birthdayEmployees =
        Array.isArray(infoData.birthday_employees) && infoData.birthday_employees.length > 0
          ? infoData.birthday_employees
          : [
              ...(Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays : []),
              ...(Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays : []),
            ];

      if (birthdayEmployees.length > 0 || Array.isArray(infoData.today_birthdays)) {
        return {
          companyId: infoData.company_id || infoData.company?.id || compId,
          companyName: infoData.company_name || infoData.company?.name || null,
          all: birthdayEmployees,
          today: Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays : [],
          upcoming: Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays : [],
          todayCount:
            infoData.today_birthday_count ??
            (Array.isArray(infoData.today_birthdays) ? infoData.today_birthdays.length : 0),
          upcomingCount:
            infoData.upcoming_birthday_count ??
            (Array.isArray(infoData.upcoming_birthdays) ? infoData.upcoming_birthdays.length : 0),
        };
      }
    }
  } catch {}

  try {
    const res = await api.get(ENDPOINTS.auth.birthdays, { params });
    const payload = res?.data?.data || res?.data;
    if (
      payload &&
      (Array.isArray(payload)
        ? payload.length > 0
        : (payload.all?.length > 0 || payload.today?.length > 0 || payload.upcoming?.length > 0))
    ) {
      return payload;
    }
  } catch {}

  return null;
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
  const currentToken =
    sessionStorage.getItem('rp_access_token') ||
    localStorage.getItem('rp_access_token') ||
    DEV_FALLBACK_TOKEN;

  // Try live local backend first
  try {
    const res = await axios.post(
      'http://localhost:5000/v1/auth/birthdays/wish',
      {
        employeeId,
        recipientUserId,
        message,
      },
      {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
      }
    );
    return res.data;
  } catch {}

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
