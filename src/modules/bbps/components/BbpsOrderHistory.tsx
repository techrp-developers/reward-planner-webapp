// src/modules/bbps/components/BbpsOrderHistory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { fetchBbpsOrderHistory } from '../../../api/bbpsApi';
import { Search, RefreshCw, CheckCircle2, Clock, AlertCircle, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';

export const BbpsOrderHistory = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchBbpsOrderHistory({ limit: 50 });
      if (res && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (selectedStatus !== 'ALL') {
      result = result.filter(
        (o) =>
          String(o.final_status || o.bbps_status || '').toUpperCase() === selectedStatus
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          String(o.operator_name || '').toLowerCase().includes(q) ||
          String(o.utility_acc_no || '').toLowerCase().includes(q) ||
          String(o.id || '').includes(q)
      );
    }

    return result;
  }, [orders, selectedStatus, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Bill Payment History
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review and download receipts for all your past utility bill payments and recharges
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedStatus === st
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All Payments' : st}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by biller or account..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-purple-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Receipt size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">No payment records found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't made any utility payments matching the selected criteria yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const status = String(order.final_status || order.bbps_status || 'PENDING').toUpperCase();
            const isSuccess = status === 'SUCCESS' || status === 'PAID';
            const isPending = status === 'PENDING' || status === 'INIT' || status === 'RETRYING';
            const amount = Number(order.amount || 0);

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-50 text-emerald-600'
                        : isPending
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 size={22} />
                    ) : isPending ? (
                      <Clock size={22} />
                    ) : (
                      <AlertCircle size={22} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {order.operator_name || 'Utility Bill Payment'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>Acc: {order.utility_acc_no || '—'}</span>
                      <span>•</span>
                      <span>
                        {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="sm:text-right">
                    <div className="text-base font-black text-gray-900">
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        isSuccess
                          ? 'bg-emerald-50 text-emerald-700'
                          : isPending
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="text-purple-700 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BbpsOrderHistory;
