// src/context/ServiceCartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchServiceCartItems,
  addServiceToCart as apiAddServiceToCart,
  removeServiceCartItem as apiRemoveServiceCartItem,
  clearServiceCart as apiClearServiceCart,
  addBundleToCart as apiAddBundleToCart,
} from '../api/serviceCartCheckoutApi';
import { useAuth } from './AuthContext';

const ServiceCartContext = createContext(null);

export const ServiceCartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartData, setCartData] = useState({
    bundles: [],
    individual_items: [],
    total: 0,
    rewards: { earn_coins: 0, max_redeem_coins: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const refreshServiceCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartData({
        bundles: [],
        individual_items: [],
        total: 0,
        rewards: { earn_coins: 0, max_redeem_coins: 0 },
      });
      return;
    }

    try {
      setLoading(true);
      const data = await fetchServiceCartItems();
      setCartData(data);
    } catch (err) {
      console.warn('Failed to load service cart items:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshServiceCart();
  }, [refreshServiceCart]);

  // Normalized items combining bundles & individual items for UI display
  const serviceCartItems = useMemo(() => {
    const list = [];

    // 1. Process Bundles
    (cartData.bundles || []).forEach((bundle) => {
      const bItems = bundle.items || [];
      const allDocs = bItems.flatMap((i) => (i.documents || []).map((d) => d.document_name));
      const uniqueDocs = Array.from(new Set(allDocs.filter(Boolean)));

      const totalBundlePrice = bItems.reduce((sum, item) => sum + Number(item.price || 0), 0) || Number(bundle.bundle_total || 0);
      const totalBundleMrp = bItems.reduce((sum, item) => sum + Number(item.individual_price || item.mrp || item.price || 0), 0) || totalBundlePrice;

      list.push({
        id: `bundle-${bundle.bundle_id}`,
        rawId: bundle.bundle_id,
        isBundle: true,
        service_id: null,
        variant_id: null,
        bundle_id: bundle.bundle_id,
        bundle_items: bItems,
        service_name: bundle.bundle_name || `Bundle (${bItems.length} Services)`,
        variant_name: 'Bundle Pack',
        description: bundle.bundle_description || `${bItems.length} services included in pack`,
        price: totalBundlePrice,
        mrp: Math.max(totalBundleMrp, totalBundlePrice),
        imageUrl: bundle.bundle_image || null,
        documents: uniqueDocs,
      });
    });

    // 2. Process Individual Items
    (cartData.individual_items || []).forEach((item) => {
      const itemDocs = (item.documents || []).map((d) => d.document_name).filter(Boolean);

      list.push({
        id: item.id,
        rawId: item.id,
        isBundle: false,
        service_id: Number(item.service_id),
        variant_id: Number(item.variant_id),
        service_name: item.service_name || 'Service',
        variant_name: item.variant_name || 'Plan',
        description: item.title || item.description || '',
        price: Number(item.price || 0),
        mrp: Number(item.mrp || item.price || 0),
        imageUrl: item.image_url || item.variant_image || null,
        documents: itemDocs,
      });
    });

    return list;
  }, [cartData]);

  const serviceCartCount = useMemo(() => {
    let count = 0;
    count += (cartData.individual_items || []).length;
    count += (cartData.bundles || []).length;
    return count;
  }, [cartData]);

  const addToCart = useCallback(
    async ({ service_id, variant_id, serviceName = 'Service' }) => {
      try {
        const res = await apiAddServiceToCart({ service_id, variant_id });
        await refreshServiceCart();
        showToast(`✓ "${serviceName}" added to Services Cart!`, 'success');
        return res;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to add service to cart';
        showToast(msg, 'error');
        throw err;
      }
    },
    [refreshServiceCart, showToast]
  );

  const addBundle = useCallback(
    async (bundle_id, selected_items = [], bundleName = 'Pack') => {
      try {
        const res = await apiAddBundleToCart(bundle_id, selected_items);
        await refreshServiceCart();
        showToast(`✓ "${bundleName}" added to Services Cart!`, 'success');
        return res;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to add bundle to cart';
        showToast(msg, 'error');
        throw err;
      }
    },
    [refreshServiceCart, showToast]
  );

  const removeFromCart = useCallback(
    async (item) => {
      try {
        if (item.isBundle && item.bundle_items?.length > 0) {
          // Deleting first item removes whole bundle in backend
          await apiRemoveServiceCartItem(item.bundle_items[0].id);
        } else {
          await apiRemoveServiceCartItem(item.id || item.rawId);
        }
        await refreshServiceCart();
        showToast('Item removed from Services Cart', 'info');
      } catch (err) {
        console.error('Failed to remove cart item:', err);
        await refreshServiceCart();
      }
    },
    [refreshServiceCart, showToast]
  );

  const clearCart = useCallback(async () => {
    try {
      await apiClearServiceCart();
      await refreshServiceCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  }, [refreshServiceCart]);

  const value = {
    serviceCartData: cartData,
    serviceCartItems,
    serviceCartCount,
    cartRewards: cartData.rewards || { earn_coins: 0, max_redeem_coins: 0 },
    loading,
    toastMessage,
    addToCart,
    addBundle,
    removeFromCart,
    clearCart,
    refreshServiceCart,
    dismissToast: () => setToastMessage(null),
  };

  return (
    <ServiceCartContext.Provider value={value}>
      {children}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold text-white border ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 border-rose-400 shadow-rose-600/30'
                : toastMessage.type === 'info'
                ? 'bg-gray-800 border-gray-700 shadow-gray-900/30'
                : 'bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] border-purple-400 shadow-purple-600/30'
            }`}
          >
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}
    </ServiceCartContext.Provider>
  );
};

export const useServiceCart = () => {
  const context = useContext(ServiceCartContext);
  if (!context) {
    throw new Error('useServiceCart must be used within a ServiceCartProvider');
  }
  return context;
};

export default ServiceCartContext;
