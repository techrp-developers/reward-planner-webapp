// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchCartItems,
  fetchCartSummary,
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
} from '../api/cartCheckoutApi';
import { useAuth } from './AuthContext';
import { getImageUrl } from '../api/client';
import { cleanNumber } from '../modules/ecommerce/utils/normalizeProduct';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'rp_guest_cart_v1';

const normalizeCartItem = (item) => {
  const id = item.cart_item_id || item.id || `${item.product_id}_${item.variant_id}`;
  const price = cleanNumber(item.sale_price ?? item.price ?? item.final_price ?? 0);
  const mrp = cleanNumber(item.mrp ?? item.originalPrice ?? item.regular_price ?? price);
  const qty = cleanNumber(item.quantity ?? item.qty ?? 1, 1);
  const title = item.product_name || item.title || item.name || 'Product';

  return {
    id,
    cart_item_id: item.cart_item_id || item.id,
    product_id: item.product_id,
    variant_id: item.variant_id || 0,
    title,
    product_name: title,
    image: getImageUrl(item.image || item.thumbnail || (Array.isArray(item.images) ? item.images[0] : null)),
    price,
    mrp,
    quantity: qty,
    itemTotal: price * qty,
    rewardCoins: cleanNumber(item.rewardCoins ?? item.reward_coins ?? Math.round(price * 0.05)),
    redeemCoins: cleanNumber(item.redeem_coins ?? item.redeemCoins ?? 0),
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Fetch Cart from Backend
  const loadBackendCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [cartRes, summaryRes] = await Promise.allSettled([
        fetchCartItems(),
        fetchCartSummary(true),
      ]);

      if (cartRes.status === 'fulfilled') {
        const rawList =
          cartRes.value?.items ||
          cartRes.value?.data?.items ||
          (Array.isArray(cartRes.value) ? cartRes.value : []);
        setItems(rawList.map(normalizeCartItem));
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setCartSummary(summaryRes.value);
      }
    } catch (err) {
      console.error('Failed to load backend cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 2. Load Local Guest Cart on initial mount if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setItems(parsed.map(normalizeCartItem));
          }
        }
      } catch (err) {
        console.error('Error loading guest cart:', err);
      }
    } else {
      // User logged in: sync guest cart items to backend
      const syncGuestCart = async () => {
        try {
          const saved = localStorage.getItem(GUEST_CART_KEY);
          if (saved) {
            const guestItems = JSON.parse(saved);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              setIsSyncing(true);
              for (const gItem of guestItems) {
                const gVariantId =
                  Number(gItem.variant_id) > 0
                    ? Number(gItem.variant_id)
                    : Number(gItem.product_id) || 1;
                if (gItem.product_id) {
                  try {
                    await addToCart({
                      product_id: Number(gItem.product_id),
                      variant_id: gVariantId,
                      quantity: gItem.quantity || 1,
                    });
                  } catch (e) {
                    console.warn('Could not sync guest item to backend:', gItem, e);
                  }
                }
              }
              localStorage.removeItem(GUEST_CART_KEY);
            }
          }
        } catch (e) {
          console.error('Guest cart sync error:', e);
        } finally {
          setIsSyncing(false);
          loadBackendCart();
        }
      };

      syncGuestCart();
    }
  }, [isAuthenticated, loadBackendCart]);

  // Helper to persist guest cart
  const persistGuestCart = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
    } catch (err) {
      console.error('Failed to save guest cart to localStorage:', err);
    }
  };

  // ADD ITEM TO CART
  const addItem = async ({ product_id, variant_id, quantity = 1, product = null, openDrawer = true }) => {
    try {
      const resolvedVariantId =
        Number(variant_id) > 0
          ? Number(variant_id)
          : Number(product?.variant_id) > 0
          ? Number(product.variant_id)
          : Number(product?.default_variant_id) > 0
          ? Number(product.default_variant_id)
          : Number(product?.variants?.[0]?.id) > 0
          ? Number(product.variants[0].id)
          : Number(product_id) || 1;

      if (isAuthenticated) {
        setLoading(true);
        await addToCart({
          product_id: Number(product_id),
          variant_id: resolvedVariantId,
          quantity: Number(quantity),
        });
        await loadBackendCart();
      } else {
        // Guest Cart in localStorage
        const existingIdx = items.findIndex(
          (i) => String(i.product_id) === String(product_id) && String(i.variant_id) === String(resolvedVariantId)
        );

        let updated;
        if (existingIdx > -1) {
          updated = items.map((item, idx) =>
            idx === existingIdx
              ? { ...item, quantity: item.quantity + Number(quantity), itemTotal: item.price * (item.quantity + Number(quantity)) }
              : item
          );
        } else {
          const newItem = normalizeCartItem({
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            product_id: Number(product_id),
            variant_id: resolvedVariantId,
            quantity: Number(quantity),
            product_name: product?.title || product?.product_name || product?.name || 'Product',
            image: product?.image || (Array.isArray(product?.images) ? product.images[0] : null),
            sale_price: cleanNumber(product?.price || 0),
            mrp: cleanNumber(product?.originalPrice || product?.mrp || product?.price || 0),
          });
          updated = [newItem, ...items];
        }
        persistGuestCart(updated);
      }

      if (openDrawer) {
        setIsDrawerOpen(true);
      }
      return true;
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE QUANTITY
  const updateQuantity = async (itemId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      return removeItem(itemId);
    }

    try {
      if (isAuthenticated) {
        setLoading(true);
        // Optimistic update
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId || item.cart_item_id === itemId
              ? { ...item, quantity: qty, itemTotal: item.price * qty }
              : item
          )
        );
        await updateCartItemQty(itemId, qty);
        await loadBackendCart();
      } else {
        const updated = items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: qty, itemTotal: item.price * qty }
            : item
        );
        persistGuestCart(updated);
      }
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
      if (isAuthenticated) loadBackendCart();
    } finally {
      setLoading(false);
    }
  };

  // REMOVE ITEM
  const removeItem = async (itemId) => {
    try {
      if (isAuthenticated) {
        setLoading(true);
        setItems((prev) => prev.filter((i) => i.id !== itemId && i.cart_item_id !== itemId));
        await deleteCartItem(itemId);
        await loadBackendCart();
      } else {
        const updated = items.filter((i) => i.id !== itemId);
        persistGuestCart(updated);
      }
    } catch (err) {
      console.error('Failed to delete cart item:', err);
      if (isAuthenticated) loadBackendCart();
    } finally {
      setLoading(false);
    }
  };

  // CLEAR ENTIRE CART
  const emptyCart = async () => {
    try {
      if (isAuthenticated) {
        setLoading(true);
        await clearCart();
        setItems([]);
        setCartSummary(null);
      } else {
        persistGuestCart([]);
        setCartSummary(null);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Totals calculations
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  }, [items]);

  const totalMrp = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.mrp || item.price) * (Number(item.quantity) || 1)), 0);
  }, [items]);

  const totalSavings = useMemo(() => {
    return totalMrp > subtotal ? totalMrp - subtotal : 0;
  }, [totalMrp, subtotal]);

  const estimatedCoins = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.rewardCoins || 0) * (Number(item.quantity) || 1)), 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        cartSummary,
        totalQuantity,
        subtotal,
        totalMrp,
        totalSavings,
        estimatedCoins,
        isDrawerOpen,
        loading,
        isSyncing,
        openCartDrawer: () => setIsDrawerOpen(true),
        closeCartDrawer: () => setIsDrawerOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        emptyCart,
        refreshCart: loadBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
