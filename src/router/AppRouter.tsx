// src/router/AppRouter.jsx
import React, { lazy, Suspense, useEffect } from 'react';
import { preloadServicesHome } from '../modules/services/servicesPreload';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScrollToTop from '../components/common/ScrollToTop';
import TopHeader from '../components/layout/TopHeader';
import MegaMenuStrip from '../components/layout/MegaMenuStrip';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import AuthModal from '../modules/auth/AuthModal';
import rpLogo from '../assets/rp_logo_crisp.png';
import MobileBottomBar from '../components/layout/MobileBottomBar';

import LoginPage from '../modules/auth/LoginPage';
import CinematicModuleStage from '../modules/stage/CinematicModuleStage';
import ProductDetailPage from '../modules/ecommerce/ProductDetailPage';
import CartPage from '../modules/ecommerce/CartPage';
import CheckoutPage from '../modules/ecommerce/CheckoutPage';
const ServiceCategoryPage = lazy(() => import('../modules/services/ServiceCategoryPage'));
const ServiceDetailPage = lazy(() => import('../modules/services/ServiceDetailPage'));
const ServiceCartPage = lazy(() => import('../modules/services/ServiceCartPage'));
const ServiceCheckoutPage = lazy(() => import('../modules/services/ServiceCheckoutPage'));
const MutualFundPage = lazy(() => import('../modules/services/MutualFundPage'));
const ServiceBundlePage = lazy(() => import('../modules/services/ServiceBundlePage'));
const InsuranceQuotePage = lazy(() => import('../modules/services/insurance/InsuranceQuotePageFlow'));
const InsuranceProductsPage = lazy(() => import('../modules/services/insurance/InsuranceProductsPage'));
import ProfilePage from '../modules/profile/ProfilePage';
import PolicyPage from '../modules/policies/PolicyPage';
import MyEventsPage from '../modules/events/MyEventsPage';
import AllEventsPage from '../modules/events/AllEventsPage';
import HealthWellnessPage from '../modules/wellness/HealthWellnessPage';
import MyBenefitsPage from '../modules/benefits/MyBenefitsPage';
import ReportsPage from '../modules/reports/ReportsPage';
import CustomerSupportPage from '../modules/support/CustomerSupportPage';
import MyRewardsPage from '../modules/rewards/MyRewardsPage';
import ExploreRewardsPage from '../modules/rewards/ExploreRewardsPage';

export const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/services') preloadServicesHome();
  }, [isAuthenticated, location.pathname]);

  const isPolicyPage = [
    '/terms',
    '/privacy-policy',
    '/shipping-delivery-policy',
    '/refund-cancellation-policy',
    '/support-policy',
  ].includes(location.pathname.toLowerCase()) || location.pathname.toLowerCase().startsWith('/policies/');

  const isStageRoute =
    location.pathname === '/' ||
    location.pathname === '/store' ||
    location.pathname === '/deals' ||
    location.pathname === '/services' ||
    location.pathname === '/bbps';

  const isHomePage = location.pathname === '/';
  const isEventsPage =
    location.pathname.startsWith('/events') ||
    location.pathname === '/my-events' ||
    location.pathname === '/all-events';
  const isWellnessPage =
    location.pathname.startsWith('/wellness') ||
    location.pathname === '/health-wellness';
  const isBenefitsPage =
    location.pathname.startsWith('/benefits') ||
    location.pathname === '/my-benefits';
  const isReportsPage =
    location.pathname.startsWith('/reports');
  const isRewardsPage =
    location.pathname.startsWith('/rewards') ||
    location.pathname === '/my-rewards';
  const isFixedLayout = isStageRoute || isEventsPage || isWellnessPage || isBenefitsPage || isReportsPage || isRewardsPage;

  const isEcommercePage =
    location.pathname.startsWith('/store') ||
    location.pathname.startsWith('/deals') ||
    location.pathname.startsWith('/product');

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
      <div className="min-h-screen flex flex-col font-['Poppins',sans-serif]">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terms" element={<PolicyPage policyId="terms" />} />
          <Route path="/privacy-policy" element={<PolicyPage policyId="privacy" />} />
          <Route path="/shipping-delivery-policy" element={<PolicyPage policyId="shipping" />} />
          <Route path="/refund-cancellation-policy" element={<PolicyPage policyId="refund" />} />
          <Route path="/support-policy" element={<PolicyPage policyId="support" />} />
          <Route path="/customer-support" element={<CustomerSupportPage />} />
          <Route path="/support" element={<CustomerSupportPage />} />
          <Route path="/help" element={<CustomerSupportPage />} />
          <Route path="/policies/:policyId" element={<PolicyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // 3. Authenticated Experience: Full Web App with Home Screen on root
  return (
    <div className={`min-h-screen flex flex-col bg-[#EFF2EC] text-[#111827] font-['Plus_Jakarta_Sans',sans-serif] ${isFixedLayout ? 'h-screen overflow-hidden' : ''}`}>
      {/* AUTO SCROLL TO TOP ON ALL NAVIGATIONS */}
      <ScrollToTop />

      {/* TWO-TIER FULL-WIDTH HEADER (NO SIGN IN BUTTON) */}
      <TopHeader />
      <MegaMenuStrip />

      {/* FULL-WIDTH MAIN CONTENT OUTLET */}
      <main className={`flex-1 w-full ${isFixedLayout ? 'h-[calc(100vh-4.25rem)] overflow-hidden' : ''}`}>
        <Suspense fallback={<div role="status" className="p-8 text-center text-sm text-gray-500">Loading page...</div>}>
        {isStageRoute ? (
          <CinematicModuleStage />
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/rewards" element={<MyRewardsPage />} />
            <Route path="/rewards/explore" element={<ExploreRewardsPage />} />
            <Route path="/explore-rewards" element={<ExploreRewardsPage />} />
            <Route path="/my-rewards" element={<MyRewardsPage />} />
            <Route path="/events" element={<MyEventsPage />} />
            <Route path="/events/all" element={<AllEventsPage />} />
            <Route path="/all-events" element={<AllEventsPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/wellness" element={<HealthWellnessPage />} />
            <Route path="/health-wellness" element={<HealthWellnessPage />} />
            <Route path="/benefits" element={<MyBenefitsPage />} />
            <Route path="/my-benefits" element={<MyBenefitsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* SERVICES FULL SUITE */}
            <Route path="/services/cart" element={<ServiceCartPage />} />
            <Route path="/services/checkout" element={<ServiceCheckoutPage />} />
            <Route path="/services/category/2" element={<InsuranceProductsPage />} />
            <Route path="/services/category/:categoryId" element={<ServiceCategoryPage />} />
            <Route path="/services/detail/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/services/health-insurance/quote" element={<InsuranceQuotePage key="health" insuranceType="health" />} />
            <Route path="/insurance/quote" element={<InsuranceQuotePage key="health-alias" insuranceType="health" />} />
            <Route path="/services/super-top-up/quote" element={<InsuranceQuotePage key="supertopup" insuranceType="supertopup" />} />
            <Route path="/services/personal-accident/quote" element={<InsuranceQuotePage key="personal-accident" insuranceType="personal_accident" />} />
            <Route path="/insurance/super-top-up/quote" element={<InsuranceQuotePage key="supertopup-alias" insuranceType="supertopup" />} />
            <Route path="/insurance/personal-accident/quote" element={<InsuranceQuotePage key="personal-accident-alias" insuranceType="personal_accident" />} />
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
            
            {/* CUSTOMER SUPPORT & HELP DESK */}
            <Route path="/customer-support" element={<CustomerSupportPage />} />
            <Route path="/support" element={<CustomerSupportPage />} />
            <Route path="/help" element={<CustomerSupportPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<ProfilePage />} />
            <Route path="/wallet" element={<ProfilePage />} />
            <Route path="/birthdays" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
        </Suspense>
      </main>

      {/* SLIDE-OVER RIGHT CART DRAWER */}
      <CartDrawer />

      {/* AUTHENTICATION & TERMS MODAL */}
      <AuthModal />

      {/* FULL-WIDTH FOOTER (Hidden on fixed layout app pages, policy pages, and e-commerce per user specification) */}
      {!isPolicyPage && !isEcommercePage && !isFixedLayout && <Footer />}
      <MobileBottomBar />
    </div>
  );
};

export default AppRouter;
