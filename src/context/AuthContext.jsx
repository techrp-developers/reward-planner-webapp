// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchUserInfo, checkTermsStatus, acceptTerms } from '../api/authApi';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('rp_access_token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('rp_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return Boolean(localStorage.getItem('rp_access_token'));
    } catch {
      return false;
    }
  });
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'register' | 'otp' | 'forgot' | 'terms'

  const hydrateUser = useCallback(async () => {
    let storedToken = null;
    try {
      storedToken = localStorage.getItem('rp_access_token');
    } catch {
      storedToken = null;
    }

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Set auth header in client
      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

      // 3.5-second timeout for session hydration to avoid hanging on cold/slow API
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session hydration timeout')), 3500)
      );
      const res = await Promise.race([fetchUserInfo(), timeoutPromise]);

      if (res?.success || res?.data) {
        const userData = res.data || res.user || res;
        setUser(userData);
        try {
          localStorage.setItem('rp_user_profile', JSON.stringify(userData));
        } catch {}

        // Check terms
        try {
          const termsRes = await checkTermsStatus();
          if (termsRes && termsRes.terms_accepted === false) {
            setTermsAccepted(false);
            setAuthModalView('terms');
            setAuthModalOpen(true);
          } else {
            setTermsAccepted(true);
          }
        } catch {
          setTermsAccepted(true);
        }
      }
    } catch (err) {
      console.warn('Session hydration warning:', err);
      // ONLY purge token if the server explicitly responded with 401 Unauthorized
      if (err?.response?.status === 401) {
        try {
          localStorage.removeItem('rp_access_token');
          localStorage.removeItem('rp_refresh_token');
          localStorage.removeItem('rp_user_profile');
        } catch {}
        delete api.defaults.headers.common.Authorization;
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();

    const handleSessionExpired = () => {
      try {
        localStorage.removeItem('rp_access_token');
        localStorage.removeItem('rp_refresh_token');
        localStorage.removeItem('rp_user_profile');
      } catch {}
      delete api.defaults.headers.common.Authorization;
      setToken(null);
      setUser(null);
      setAuthModalView('login');
      setAuthModalOpen(true);
    };

    window.addEventListener('rp_session_expired', handleSessionExpired);
    return () => window.removeEventListener('rp_session_expired', handleSessionExpired);
  }, [hydrateUser]);

  const login = async (identifier, password) => {
    const res = await loginUser({ identifier, password });
    const accessToken = res.accessToken || res.token || res.data?.accessToken || res.data?.token;
    const refreshToken = res.refreshToken || res.data?.refreshToken;

    if (!accessToken && (res.success === false || res.status === false)) {
      throw new Error(res.message || 'Invalid email/phone or password. Please try again.');
    }

    if (accessToken) {
      try {
        localStorage.setItem('rp_access_token', accessToken);
      } catch {}
      setToken(accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      try {
        localStorage.setItem('rp_refresh_token', refreshToken);
      } catch {}
    }

    // Set immediate basic fallback user profile while hydration completes
    const cleanId = String(identifier || '').trim();
    const fallbackUser = {
      name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: cleanId.includes('@') ? cleanId : undefined,
      phone: !cleanId.includes('@') ? cleanId : undefined,
    };
    setUser((prev) => prev || fallbackUser);

    await hydrateUser();
    setAuthModalOpen(false);
    return res;
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    return res;
  };

  const logout = () => {
    try {
      localStorage.removeItem('rp_access_token');
      localStorage.removeItem('rp_refresh_token');
      localStorage.removeItem('rp_user_profile');
    } catch {}
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const handleAcceptTerms = async () => {
    try {
      await acceptTerms();
      setTermsAccepted(true);
      setAuthModalOpen(false);
    } catch (err) {
      console.error('Failed to accept terms', err);
    }
  };

  const openAuth = (view = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    if (!termsAccepted && token) return; // Prevent closing if terms must be accepted
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        termsAccepted,
        authModalOpen,
        authModalView,
        login,
        register,
        logout,
        hydrateUser,
        handleAcceptTerms,
        openAuth,
        closeAuth,
        setAuthModalView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
