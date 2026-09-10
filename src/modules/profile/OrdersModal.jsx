// src/modules/profile/OrdersModal.jsx
import React, { useState, useEffect } from 'react';
import {
  fetchMyOrders,
  fetchOrderDetails,
  cancelOrder,
  fetchCancellationReasons,
} from '../../api/cartCheckoutApi';
import { getImageUrl } from '../../api/client';
import { formatFullAddress } from '../../constants/addressConstants';

// Material UI Icons
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

export const OrdersModal = ({ isOpen, onClose, initialOrderId = null, isSuccess = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [cancelComment, setCancelComment] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState({ text: '', type: '' });

  // Load orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      if (initialOrderId) {
        handleSelectOrder(initialOrderId);
      }
    }
  }, [isOpen, initialOrderId]);

  // Load single order details
  const handleSelectOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    setDetailsLoading(true);
    try {
      const res = await fetchOrderDetails(orderId);
      setOrderDetails(res?.order || res?.data || res);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setOrderDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open cancel dialog
  const handleOpenCancel = async () => {
    setCancelModalOpen(true);
    setCancelMsg({ text: '', type: '' });
    try {
      const list = await fetchCancellationReasons();
      setReasons(Array.isArray(list) ? list : []);
      if (list && list.length > 0) {
        setSelectedReasonId(list[0].id || list[0].reason_id || 1);
      }
    } catch {}
  };

  // Submit cancellation
  const handleSubmitCancel = async () => {
    if (!selectedOrderId) return;
    setCancelling(true);
    setCancelMsg({ text: '', type: '' });

    try {
      await cancelOrder(selectedOrderId, {
        reason_id: Number(selectedReasonId),
        reason_comment: cancelComment,
      });
      setCancelMsg({ text: 'Order cancelled successfully.', type: 'success' });
      setTimeout(() => {
        setCancelModalOpen(false);
        handleSelectOrder(selectedOrderId);
        loadOrders();
      }, 1500);
    } catch (err) {
      setCancelMsg({
        text: err?.response?.data?.message || 'Could not cancel order.',
        type: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  // Filter orders by tab
  const filteredOrders = orders.filter((o) => {
    const st = String(o.status || '').toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'placed') return st === 'placed' || st === 'pending_payment' || st === 'processing';
    if (activeTab === 'shipped') return st === 'shipped' || st === 'in_transit';
    if (activeTab === 'delivered') return st === 'delivered' || st === 'completed';
    if (activeTab === 'cancelled') return st === 'cancelled' || st === 'canceled';
    return true;
  });

  const getStatusBadge = (status) => {
    const st = String(status || '').toLowerCase();
    if (st === 'delivered' || st === 'completed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Delivered
        </span>
      );
    }
    if (st === 'shipped' || st === 'in_transit') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          In Transit
        </span>
      );
    }
    if (st === 'cancelled' || st === 'canceled') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        Order Placed
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            {selectedOrderId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderId(null);
                  setOrderDetails(null);
                }}
                className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer mr-1"
                title="Back to all orders"
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#7C3AED] flex items-center justify-center">
              <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                {selectedOrderId ? `Order #ORD-${selectedOrderId}` : 'Your Corporate Orders'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {selectedOrderId ? 'Live shipment tracking & order receipt' : 'View products, services & delivery status'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Success Alert Banner (when redirected from checkout) */}
        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 shrink-0 animate-fadeIn">
            <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-bold block">Order Placed Successfully!</span>
              <span className="text-[11px] text-emerald-700">
                Thank you for your order. A confirmation has been sent to your email.
              </span>
            </div>
          </div>
        )}

        {/* Content Body: Either Order Details or Orders List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {selectedOrderId ? (
            /* ── VIEW SINGLE ORDER DETAILS ── */
            detailsLoading ? (
              <div className="py-16 text-center">
                <CircularProgress size={28} sx={{ color: '#7C3AED' }} />
                <p className="text-xs text-gray-500 mt-2">Loading order details...</p>
              </div>
            ) : orderDetails ? (
              <div className="space-y-4 text-xs">
                {/* Status & Date Bar */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Status</span>
                    <div className="mt-0.5">{getStatusBadge(orderDetails?.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Placed On</span>
                    <span className="font-bold text-gray-900">
                      {orderDetails?.created_at ? new Date(orderDetails.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Recent'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Total Paid</span>
                    <span className="font-black text-sm text-[#7C3AED]">
                      ₹{Number(orderDetails?.total_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Journey */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
                  <span className="font-black text-gray-900 block text-xs uppercase tracking-wider">
                    Tracking Progress
                  </span>
                  <div className="flex items-center justify-between relative pt-2">
                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((stepName, i) => {
                      const st = String(orderDetails?.status || '').toLowerCase();
                      const isComplete =
                        i === 0 ||
                        (i === 1 && ['placed', 'processing', 'shipped', 'delivered'].includes(st)) ||
                        (i === 2 && ['shipped', 'delivered'].includes(st)) ||
                        (i === 3 && st === 'delivered');

                      return (
                        <div key={stepName} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isComplete ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {isComplete ? '✓' : i + 1}
                          </div>
                          <span className="text-[10px] font-semibold text-gray-600 mt-1">{stepName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
                  <span className="font-black text-gray-900 block text-xs uppercase tracking-wider">
                    Ordered Items ({(orderDetails?.items || []).length})
                  </span>
                  <div className="divide-y divide-gray-100">
                    {(orderDetails?.items || []).map((item, idx) => {
                      const image = getImageUrl(item.image || item.image_url || item.thumbnail);
                      return (
                        <div key={idx} className="py-2.5 flex items-center gap-3">
                          <img
                            src={image}
                            alt={item.product_name || 'Item'}
                            className="w-12 h-12 rounded-xl object-contain border border-gray-200 bg-gray-50 p-1 shrink-0"
                            onError={(e) => {
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 truncate">{item.product_name || 'Product Item'}</h5>
                            <span className="text-gray-500 text-[11px] block">
                              Qty: {item.quantity || 1} · ₹{Number(item.price || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="font-black text-gray-900 shrink-0">
                            ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Address */}
                {orderDetails?.address && (
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-indigo-600" />
                      <span>Shipping Address</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-[11px] pt-1">
                      <strong>{orderDetails.address.name || orderDetails.address.contact_name}</strong> ·{' '}
                      {orderDetails.address.phone || orderDetails.address.contact_phone}
                      <br />
                      {formatFullAddress(orderDetails.address)}
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="font-black text-gray-900 block text-xs uppercase tracking-wider">
                    Payment Breakdown
                  </span>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Items Subtotal</span>
                    <span>₹{Number(orderDetails?.product_total || orderDetails?.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>ExpressBees Logistics</span>
                    <span className="text-emerald-700 font-bold">
                      {Number(orderDetails?.shipping_total || 0) > 0 ? `₹${orderDetails.shipping_total}` : 'FREE'}
                    </span>
                  </div>
                  {Number(orderDetails?.reward_discount || orderDetails?.reward_coins_used || 0) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                      <span>RP Coins Redeemed</span>
                      <span>- ₹{Number(orderDetails.reward_discount || orderDetails.reward_coins_used).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-gray-900 text-xs border-t border-gray-200 pt-2">
                    <span>Total Amount Paid</span>
                    <span className="text-[#7C3AED]">₹{Number(orderDetails?.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Cancel Button if eligible */}
                {['placed', 'pending_payment'].includes(String(orderDetails?.status || '').toLowerCase()) && (
                  <button
                    type="button"
                    onClick={handleOpenCancel}
                    className="w-full py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <ErrorOutlineOutlinedIcon sx={{ fontSize: 32 }} className="text-gray-400 mx-auto mb-2" />
                <p>Order details could not be found.</p>
              </div>
            )
          ) : (
            /* ── VIEW ALL ORDERS LIST ── */
            <>
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100">
                {[
                  { key: 'all', label: 'All Orders' },
                  { key: 'placed', label: 'Placed' },
                  { key: 'shipped', label: 'In Transit' },
                  { key: 'delivered', label: 'Delivered' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="py-16 text-center">
                  <CircularProgress size={28} sx={{ color: '#7C3AED' }} />
                  <p className="text-xs text-gray-500 mt-2">Loading your orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />
                  </div>
                  <h4 className="font-black text-gray-900 text-sm">No Orders Found</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    You haven't placed any orders in this category yet. Explore our corporate catalog for exciting perks!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
                    const orderId = ord.order_id || ord.id;
                    const dateStr = ord.created_at
                      ? new Date(ord.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recent';
                    const title = ord.items?.[0]?.product_name || ord.title || ord.product_name || `Corporate Order #${orderId}`;
                    const total = `₹${Number(ord.total_amount || ord.total || 0).toLocaleString('en-IN')}`;

                    return (
                      <div
                        key={orderId}
                        onClick={() => handleSelectOrder(orderId)}
                        className="p-4 rounded-2xl bg-gray-50 hover:bg-violet-50/50 border border-gray-200 hover:border-violet-300 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                              #ORD-{orderId} • {dateStr}
                            </span>
                            {getStatusBadge(ord.status)}
                          </div>
                          <h5 className="font-bold text-gray-900 text-xs truncate max-w-sm">{title}</h5>
                          <span className="text-xs font-black text-[#7C3AED] block">{total}</span>
                        </div>
                        <span className="text-xs font-bold text-[#7C3AED] hover:underline shrink-0">View Details →</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-gray-900 text-white font-bold text-xs cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Cancel Reason Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h4 className="font-black text-gray-900 text-sm">Cancel Order #ORD-{selectedOrderId}</h4>
            <p className="text-xs text-gray-500">
              Please select a reason for cancelling this order. Any redeemed coins will be credited back to your corporate wallet.
            </p>

            {cancelMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  cancelMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {cancelMsg.text}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Reason</label>
                <select
                  value={selectedReasonId}
                  onChange={(e) => setSelectedReasonId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {(reasons.length > 0
                    ? reasons
                    : [
                        { id: 1, reason: 'Ordered by mistake' },
                        { id: 2, reason: 'Found better price elsewhere' },
                        { id: 3, reason: 'Delivery taking too long' },
                      ]
                  ).map((r) => (
                    <option key={r.id || r.reason_id} value={r.id || r.reason_id}>
                      {r.reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Additional Comment (Optional)</label>
                <textarea
                  rows={2}
                  value={cancelComment}
                  onChange={(e) => setCancelComment(e.target.value)}
                  placeholder="Share any feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleSubmitCancel}
                className="py-2 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersModal;
