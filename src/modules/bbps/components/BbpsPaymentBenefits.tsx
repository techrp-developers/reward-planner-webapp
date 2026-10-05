// src/modules/bbps/components/BbpsPaymentBenefits.jsx
import React from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';

export const BbpsPaymentBenefits = () => {
  return (
    <div className="w-full space-y-3.5">
      {/* Section Header with Purple Accent Bar */}
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-6 bg-[#704096] rounded-full shrink-0" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17131D] tracking-tight">
          Payment benefits
        </h2>
      </div>

      {/* Lavender Benefit Card (Full width responsive layout matching mobile styling) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#F3E9FA] to-[#E8D8F4] border border-[#D5BCE5] p-5 sm:p-7 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 divide-y md:divide-y-0 md:divide-x divide-purple-900/10">
          {/* Benefit Row 1: Earn Reward Points */}
          <div className="flex items-center gap-4 sm:gap-5 pb-4 md:pb-0 md:pr-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/40 p-1 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#7953B5] to-[#704096] flex items-center justify-center text-white shadow-sm">
                <Gift size={26} className="text-white drop-shadow-xs" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg font-extrabold text-[#33213F] tracking-tight">
                Earn reward points
              </h4>
              <p className="text-xs sm:text-sm text-[#725E7D] font-medium leading-relaxed mt-0.5">
                Points are credited after every successful transaction.
              </p>
            </div>
          </div>

          {/* Benefit Row 2: No Extra Charges */}
          <div className="flex items-center gap-4 sm:gap-5 pt-4 md:pt-0 md:pl-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/40 p-1 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#7953B5] to-[#704096] flex items-center justify-center text-white shadow-sm">
                <CheckCircle2 size={26} className="text-white drop-shadow-xs" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg font-extrabold text-[#33213F] tracking-tight">
                No extra charges
              </h4>
              <p className="text-xs sm:text-sm text-[#725E7D] font-medium leading-relaxed mt-0.5">
                Pay only the bill amount with no additional fee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BbpsPaymentBenefits;
