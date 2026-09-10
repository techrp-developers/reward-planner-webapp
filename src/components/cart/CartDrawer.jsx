// src/components/cart/CartDrawer.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Drawer } from '../ui/Drawer';
import { GradientButton } from '../ui/GradientButton';
import { getImageUrl } from '../../api/client';

// Material UI Icons
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

export const CartDrawer = () => {
  const {
    items,
    totalQuantity,
    subtotal,
    totalMrp,
    totalSavings,
    estimatedCoins,
    isDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
    emptyCart,
    loading,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const handleItemClick = (productId) => {
    if (productId) {
      closeCartDrawer();
      navigate(`/product/${productId}`);
    }
  };

  const freeDeliveryThreshold = 999;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold || items.length > 0;

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeCartDrawer}
      title={`Shopping Cart (${totalQuantity} items)`}
      footer={
        items.length > 0 ? (
          <div className="space-y-3.5 pt-2">
            {/* Price Summary Breakdown */}
            <div className="space-y-1.5 text-xs">
              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-gray-500">
                  <span>Total MRP</span>
                  <span className="line-through font-medium">₹{totalMrp.toLocaleString('en-IN')}</span>
                </div>
              )}
              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Discount / Savings</span>
                  <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold border-t border-gray-100 pt-2">
                <span className="text-gray-800">Subtotal</span>
                <span className="text-lg font-black text-gray-950">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* RP Coins Perks Banner */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-violet-900 bg-linear-to-r from-violet-50 to-pink-50 p-2.5 rounded-xl border border-violet-100">
              <span className="flex items-center gap-1.5">
                <span>🪙</span>
                <span>Perks to Earn on Delivery:</span>
              </span>
              <strong className="text-[#7C3AED] font-black">+{estimatedCoins} RP Coins</strong>
            </div>

            {/* Proceed to Checkout CTA */}
            <GradientButton
              onClick={handleCheckoutClick}
              className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowForwardIcon sx={{ fontSize: 17 }} />
            </GradientButton>

            {/* View Shopping Cart Full Page */}
            <button
              type="button"
              onClick={() => {
                closeCartDrawer();
                navigate('/cart');
              }}
              className="w-full py-2 rounded-xl border border-violet-200 text-[#7C3AED] hover:bg-violet-50 font-bold text-xs cursor-pointer transition-colors text-center"
            >
              View Shopping Cart
            </button>

            <button
              onClick={closeCartDrawer}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800 py-1 cursor-pointer"
            >
              or Continue Shopping
            </button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
          <div className="w-20 h-20 rounded-3xl bg-violet-50 border border-violet-100 text-[#7C3AED] flex items-center justify-center shadow-xs">
            <ShoppingBagOutlinedIcon sx={{ fontSize: 38 }} />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-base">Your Cart is Empty</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
              Explore 880+ products with corporate discounts and coins redemption to start filling your bag!
            </p>
          </div>
          <button
            onClick={() => {
              closeCartDrawer();
              navigate('/store');
            }}
            className="px-5 py-2.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:bg-[#6D28D9] transition-colors shadow-sm cursor-pointer"
          >
            Explore Store Catalog →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Free Express Delivery Progress Notification */}
          <div className="bg-emerald-50/80 border border-emerald-200/70 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
            <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-bold">Free Express Delivery Unlocked!</span>
              <p className="text-[11px] text-emerald-600">All orders delivered safely via verified logistics.</p>
            </div>
          </div>

          {/* Cart Header Row */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-wider">
              {items.length} {items.length === 1 ? 'Product' : 'Products'} in Bag
            </span>
            <button
              onClick={emptyCart}
              className="font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          </div>

          {/* Cart Items Stream */}
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const itemId = item.cart_item_id || item.id;
              const title = item.title || item.product_name || 'Product';
              const image = item.image || '/placeholder.svg';
              const price = Number(item.price || 0);
              const mrp = Number(item.mrp || price);
              const qty = Number(item.quantity || 1);

              return (
                <div key={itemId} className="py-3.5 flex gap-3.5 items-start group">
                  {/* Thumbnail */}
                  <div
                    onClick={() => handleItemClick(item.product_id)}
                    className="w-18 h-18 rounded-2xl border border-gray-200 overflow-hidden shrink-0 bg-[#F9FAFB] p-1.5 flex items-center justify-center cursor-pointer group-hover:border-violet-300 transition-colors"
                  >
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h5
                      onClick={() => handleItemClick(item.product_id)}
                      className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug cursor-pointer hover:text-[#7C3AED] transition-colors"
                    >
                      {title}
                    </h5>

                    {/* Price and Savings Row */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-black text-gray-900">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {mrp > price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                      {mrp > price && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {Math.round(((mrp - price) / mrp) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex items-center justify-between mt-2.5">
                      {/* Interactive Quantity Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(itemId, qty - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer transition-colors"
                          title="Decrease quantity"
                        >
                          <RemoveIcon sx={{ fontSize: 13 }} />
                        </button>
                        <span className="px-3 text-xs font-black text-gray-900 select-none">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(itemId, qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 cursor-pointer transition-colors"
                          title="Increase quantity"
                        >
                          <AddIcon sx={{ fontSize: 13 }} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(itemId)}
                        className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
