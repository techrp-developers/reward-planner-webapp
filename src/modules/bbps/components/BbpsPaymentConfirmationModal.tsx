import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Zap, Calendar, User, Hash, Sparkles, ArrowRight, Lock } from 'lucide-react';

const formatBillDate = (val) => {
  if (!val) return '—';
  const str = String(val).trim();
  const match = str.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) {
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return str;
};

export const BbpsPaymentConfirmationModal = ({
  operator,
  billData,
  onProceedToPay,
  processing,
  onClose,
}) => {
  const customer = billData?.customer || billData?.data?.customer || {};
  const bill = billData?.bill || billData?.data?.bill || {};

  const customerName = customer.customerName || 'Consumer';
  const consumerNumber = customer.consumerNumber || '—';
  const amount = Number(bill.amount || billData?.amount || 0);
  const dueDate = formatBillDate(bill.dueDate);
  const billNumber = bill.billNumber || billData?.billNumber || '—';
  const isPrepaid = Number(operator?.operator_category) === 5;

  // Reward points calculation (e.g. 1% cashback as RP coins)
  const bonusCoins = Math.max(Math.round(amount * 0.05), 5);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1C0E28] via-[#2A1338] to-[#4A206A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 font-bold text-sm border border-white/10">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Confirm {isPrepaid ? 'Recharge' : 'Bill Payment'}
              </h3>
              <p className="text-xs text-purple-200">{operator.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Amount Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border border-purple-100/90 text-center space-y-1.5 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Total Amount Payable
            </span>
            <div className="text-3xl sm:text-4xl font-black text-gray-900">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold">
              <Sparkles size={14} className="text-amber-600" />
              <span>Earn +{bonusCoins} RP Coins on completion</span>
            </div>
          </div>

          {/* Consumer & Bill Details Card */}
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-500">
              Consumer Information
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <User size={14} className="text-purple-600" />
                  <span>Customer Name</span>
                </span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">
                  {customerName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Hash size={14} className="text-purple-600" />
                  <span>Consumer Number / ID</span>
                </span>
                <span className="font-bold text-gray-900 font-mono">
                  {consumerNumber}
                </span>
              </div>

              {!isPrepaid && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar size={14} className="text-purple-600" />
                      <span>Due Date</span>
                    </span>
                    <span className="font-bold text-gray-900">{dueDate}</span>
                  </div>

                  {billNumber !== '—' && (
                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500">Bill Number</span>
                      <span className="font-bold text-gray-900 font-mono">{billNumber}</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Biller Operator</span>
                <span className="font-bold text-purple-900">{operator.name}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Lock size={16} />
              </div>
              <div>
                <p className="font-bold text-gray-900">Razorpay Secure Checkout</p>
                <p className="text-[11px] text-gray-500">UPI, Cards, Netbanking & Wallets</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <ShieldCheck size={14} />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onProceedToPay}
            disabled={processing || amount <= 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Launching Payment Gateway...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{amount.toLocaleString('en-IN')} Now</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BbpsPaymentConfirmationModal;
