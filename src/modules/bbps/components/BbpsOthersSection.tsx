import React from 'react';
import { ChevronRight } from 'lucide-react';
import iconRechargeHistory from '../../../assets/payments/icon_recharge_history.png';
import iconHelpSupport from '../../../assets/payments/icon_help_support.png';

export const BbpsOthersSection = ({ onOpenHistory, onOpenSupport }) => {
  return (
    <div className="w-full space-y-3.5">
      {/* Section Header with Purple Accent Bar */}
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-6 bg-[#704096] rounded-full shrink-0" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17131D] tracking-tight">
          Others
        </h2>
      </div>

      {/* Two rows matching mobile app in full-width container */}
      <div className="bg-white rounded-3xl border border-[#E7E1F0] divide-y divide-[#ECE7F2] shadow-xs overflow-hidden">
        {/* Row 1: Recharges & bill payment history */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="w-full p-4 sm:p-5 lg:p-6 flex items-center gap-4 sm:gap-5 hover:bg-purple-50/40 transition-colors cursor-pointer text-left group"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
            <img
              src={iconRechargeHistory}
              alt="Recharges & bill payment history"
              className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
            />
          </div>

          <span className="flex-1 text-base sm:text-lg font-bold text-[#17131D] group-hover:text-[#704096] transition-colors">
            Recharges & bill payment history
          </span>

          <ChevronRight size={22} className="text-[#817989] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Row 2: Help and support */}
        <button
          type="button"
          onClick={onOpenSupport}
          className="w-full p-4 sm:p-5 lg:p-6 flex items-center gap-4 sm:gap-5 hover:bg-purple-50/40 transition-colors cursor-pointer text-left group"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
            <img
              src={iconHelpSupport}
              alt="Help and support"
              className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
            />
          </div>

          <span className="flex-1 text-base sm:text-lg font-bold text-[#17131D] group-hover:text-[#704096] transition-colors">
            Help and support
          </span>

          <ChevronRight size={22} className="text-[#817989] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default BbpsOthersSection;
