// src/modules/bbps/components/BbpsReceiptModal.jsx
import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Printer, X, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const BbpsReceiptModal = ({
  statusData,
  operator,
  billData,
  onClose,
}) => {
  const isSuccess =
    statusData?.final_status === 'SUCCESS' ||
    statusData?.bbps_status === 'PAID' ||
    statusData?.success === true;

  const isPending =
    statusData?.final_status === 'PENDING' ||
    statusData?.final_status === 'RETRYING' ||
    statusData?.bbps_status === 'INIT';

  const transactionId = statusData?.transaction_id || statusData?.data?.transaction_id || '—';
  const amount = Number(statusData?.amount || statusData?.data?.amount || billData?.amount || billData?.bill?.amount || 0);
  const operatorName = operator?.name || statusData?.operator_name || 'Bharat BillPay';
  const consumerNumber =
    billData?.customer?.consumerNumber ||
    statusData?.utility_acc_no ||
    statusData?.data?.utility_acc_no ||
    '—';

  const customerName =
    billData?.customer?.customerName ||
    statusData?.sender_name ||
    'Consumer';

  const razorpayPaymentId =
    statusData?.razorpay?.payment_id ||
    statusData?.data?.razorpay?.payment_id ||
    '—';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] print:shadow-none print:border-none print:max-w-full">
        {/* Header Ribbon */}
        <div
          className={`p-6 text-center text-white relative ${
            isSuccess
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
              : isPending
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : 'bg-gradient-to-br from-rose-600 to-red-700'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer print:hidden"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 shadow-inner">
            {isSuccess ? (
              <CheckCircle2 size={36} className="text-white drop-shadow-sm" />
            ) : isPending ? (
              <Clock size={36} className="text-white drop-shadow-sm animate-pulse" />
            ) : (
              <AlertCircle size={36} className="text-white drop-shadow-sm" />
            )}
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {isSuccess
              ? 'Payment Successful!'
              : isPending
              ? 'Processing Payment...'
              : 'Payment Not Completed'}
          </h3>

          <p className="text-xs text-white/90 mt-1 max-w-xs mx-auto">
            {isSuccess
              ? `Your payment to ${operatorName} was confirmed by Bharat BillPay.`
              : isPending
              ? 'Your payment is being confirmed by the operator. Please wait a moment.'
              : 'The transaction could not be completed. Any deducted amount will be refunded.'}
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Amount Box */}
          <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Amount Paid
            </span>
            <div className="text-3xl font-black text-gray-900">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            {isSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <Sparkles size={12} />
                <span>+Bonus RP Coins Credited</span>
              </div>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Biller / Operator</span>
              <span className="font-bold text-gray-900">{operatorName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Customer Name</span>
              <span className="font-bold text-gray-900">{customerName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Account / Mobile Number</span>
              <span className="font-bold text-gray-900 font-mono">{consumerNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-bold text-gray-900 font-mono">#{transactionId}</span>
            </div>

            {razorpayPaymentId !== '—' && (
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Payment Reference ID</span>
                <span className="font-bold text-gray-900 font-mono">{razorpayPaymentId}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-bold text-gray-900">
                {new Date().toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-500">Payment Status</span>
              <span
                className={`font-black uppercase tracking-wider text-[11px] ${
                  isSuccess ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-rose-600'
                }`}
              >
                {statusData?.final_status || statusData?.bbps_status || (isSuccess ? 'SUCCESS' : 'PENDING')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-white text-xs font-bold text-gray-700 transition-colors cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <span>Done</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BbpsReceiptModal;
