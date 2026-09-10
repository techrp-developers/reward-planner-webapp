// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScrollToTop from '../components/common/ScrollToTop';
import TopHeader from '../components/layout/TopHeader';
import MegaMenuStrip from '../components/layout/MegaMenuStrip';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import AuthModal from '../modules/auth/AuthModal';
import rpLogo from '../assets/rp_logo.svg';

import LoginPage from '../modules/auth/LoginPage';
import HomePage from '../modules/home/HomePage';
import ProductListingPage from '../modules/ecommerce/ProductListingPage';
import ProductDetailPage from '../modules/ecommerce/ProductDetailPage';
import CartPage from '../modules/ecommerce/CartPage';
import CheckoutPage from '../modules/ecommerce/CheckoutPage';
import BBPSPage from '../modules/bbps/BBPSPage';
import ServicesPage from '../modules/services/ServicesPage';
import ServiceCategoryPage from '../modules/services/ServiceCategoryPage';
import ServiceDetailPage from '../modules/services/ServiceDetailPage';
import MutualFundPage from '../modules/services/MutualFundPage';
import ServiceBundlePage from '../modules/services/ServiceBundlePage';
import ProfilePage from '../modules/profile/ProfilePage';
import PolicyPage from '../modules/policies/PolicyPage';

export const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const isPolicyPage = [
    '/terms',
    '/privacy-policy',
    '/shipping-delivery-policy',
    '/refund-cancellation-policy',
    '/support-policy',
  ].includes(location.pathname.toLowerCase()) || location.pathname.toLowerCase().startsWith('/policies/');

  // 1. Initial Session Hydration Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF8FF] via-[#F4F5FA] to-[#ECEBFF] p-4 font-['Poppins',sans-serif]">
        <div className="p-6 rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col items-center space-y-4 animate-fadeIn">
          <img src={rpLogo} alt="Reward Planners" className="h-12 w-auto animate-pulse" />
          <div className="w-6 h-6 border-2 border-[#A654CD] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Experience: Direct to Login Page (No signup/register options, no header sign in button)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<PolicyPage policyId="terms" />} />
          <Route path="/privacy-policy" element={<PolicyPage policyId="privacy" />} />
          <Route path="/shipping-delivery-policy" element={<PolicyPage policyId="shipping" />} />
          <Route path="/refund-cancellation-policy" element={<PolicyPage policyId="refund" />} />
          <Route path="/support-policy" element={<PolicyPage policyId="support" />} />
          <Route path="/policies/:policyId" element={<PolicyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // 3. Authenticated Experience: Full Web App with Home Screen on root
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#111827]">
      {/* AUTO SCROLL TO TOP ON ALL NAVIGATIONS */}
      <ScrollToTop />

      {/* TWO-TIER FULL-WIDTH HEADER (NO SIGN IN BUTTON) */}
      <TopHeader />
      <MegaMenuStrip />

      {/* FULL-WIDTH MAIN CONTENT OUTLET */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<ProductListingPage />} />
          <Route path="/deals" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/bbps" element={<BBPSPage />} />
          
          {/* SERVICES FULL SUITE */}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/category/:categoryId" element={<ServiceCategoryPage />} />
          <Route path="/services/detail/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/services/mutual-funds" element={<MutualFundPage />} />
          <Route path="/services/bundle/:bundleId" element={<ServiceBundlePage />} />
          <Route path="/insurance" element={<Navigate to="/services/category/2" replace />} />
          <Route path="/tax" element={<Navigate to="/services/category/1" replace />} />

          {/* POLICIES & GOVERNANCE */}
          <Route path="/terms" element={<PolicyPage policyId="terms" />} />
          <Route path="/privacy-policy" element={<PolicyPage policyId="privacy" />} />
          <Route path="/shipping-delivery-policy" element={<PolicyPage policyId="shipping" />} />
          <Route path="/refund-cancellation-policy" element={<PolicyPage policyId="refund" />} />
          <Route path="/support-policy" element={<PolicyPage policyId="support" />} />
          <Route path="/policies/:policyId" element={<PolicyPage />} />

          <Route path="/fitness" element={<Navigate to="/" replace />} />
          <Route path="/coming-soon" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<ProfilePage />} />
          <Route path="/wallet" element={<ProfilePage />} />
          <Route path="/birthdays" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* SLIDE-OVER RIGHT CART DRAWER */}
      <CartDrawer />

      {/* AUTHENTICATION & TERMS MODAL */}
      <AuthModal />

      {/* FULL-WIDTH FOOTER (Hidden on dedicated policy pages per user specification) */}
      {!isPolicyPage && <Footer />}
    </div>
  );
};

export default AppRouter;
