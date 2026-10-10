import React from 'react';
import iconEarnRewardPoints from '../../../assets/payments/icon_earn_reward_points.png';
import iconNoExtraCharges from '../../../assets/payments/icon_no_extra_charges.png';

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
      <div className="rounded-3xl bg-gradient-to-br from-[#F5EDFB] via-[#EFE3F8] to-[#E6D4F3] border border-[#D8BFEC] p-5 sm:p-7 lg:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 divide-y md:divide-y-0 md:divide-x divide-purple-900/10">
          {/* Benefit Row 1: Earn Reward Points */}
          <div className="flex items-center gap-4 sm:gap-6 pb-4 md:pb-0 md:pr-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 shrink-0 flex items-center justify-center">
              <img
                src={iconEarnRewardPoints}
                alt="Earn reward points"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-md"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#2A1836] tracking-tight">
                Earn reward points
              </h4>
              <p className="text-xs sm:text-sm text-[#665070] font-medium leading-relaxed mt-1">
                Points are credited after every successful transaction.
              </p>
            </div>
          </div>

          {/* Benefit Row 2: No Extra Charges */}
          <div className="flex items-center gap-4 sm:gap-6 pt-4 md:pt-0 md:pl-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 shrink-0 flex items-center justify-center">
              <img
                src={iconNoExtraCharges}
                alt="No extra charges"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-md"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#2A1836] tracking-tight">
                No extra charges
              </h4>
              <p className="text-xs sm:text-sm text-[#665070] font-medium leading-relaxed mt-1">
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
