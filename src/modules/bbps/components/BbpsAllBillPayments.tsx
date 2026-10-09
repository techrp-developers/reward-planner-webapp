// src/modules/bbps/components/BbpsAllBillPayments.jsx
import React from 'react';
import {
  Smartphone,
  Car,
  Zap,
  PhoneCall,
  CreditCard,
  Tv,
  Droplets,
  Flame,
  Fuel,
  Wifi,
  Phone,
  Landmark,
  Shield,
  Building2,
  GraduationCap,
  HeartPulse,
  Receipt,
} from 'lucide-react';

import iconAllElectricity from '../../../assets/payments/icon_all_electricity.png';
import iconAllMobilePrepaid from '../../../assets/payments/icon_all_mobile_prepaid.png';
import iconAllCreditCard from '../../../assets/payments/icon_all_credit_card.png';
import iconAllFastag from '../../../assets/payments/icon_all_fastag.png';
import iconAllMobilePostpaid from '../../../assets/payments/icon_all_mobile_postpaid.png';

const CATEGORY_3D_ICON_MAP: Record<string, string> = {
  electricity: iconAllElectricity,
  'mobile prepaid': iconAllMobilePrepaid,
  prepaid: iconAllMobilePrepaid,
  'credit card': iconAllCreditCard,
  'credit cards': iconAllCreditCard,
  fastag: iconAllFastag,
  'fast tag': iconAllFastag,
  'mobile postpaid': iconAllMobilePostpaid,
  postpaid: iconAllMobilePostpaid,
};

const CATEGORY_ICON_MAP = {
  'mobile prepaid': Smartphone,
  fastag: Car,
  electricity: Zap,
  'mobile postpaid': PhoneCall,
  'credit card': CreditCard,
  dth: Tv,
  subscription: Tv,
  water: Droplets,
  gas: Flame,
  'piped gas': Flame,
  'lpg cylinder': Fuel,
  'broadband postpaid': Wifi,
  'landline postpaid': Phone,
  loan: Landmark,
  insurance: Shield,
  tax: Receipt,
  'housing society': Building2,
  'municipal taxes': Building2,
  education: GraduationCap,
  hospital: HeartPulse,
};

// Default ordering requested:
// 1st: Electricity, 2nd: Mobile Prepaid, 3rd: Credit Card, 4th: FASTag, 5th: Mobile Postpaid
const PRIMARY_CATEGORY_ORDER = [
  'Electricity',
  'Mobile Prepaid',
  'Credit Card',
  'FASTag',
  'Mobile Postpaid',
];

export const BbpsAllBillPayments = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) => {
  // Merge live categories with defaults and sort
  const displayCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { operator_category_id: 8, operator_category_name: 'Electricity' },
        { operator_category_id: 5, operator_category_name: 'Mobile Prepaid' },
        { operator_category_id: 7, operator_category_name: 'Credit Card' },
        { operator_category_id: 22, operator_category_name: 'FASTag' },
        { operator_category_id: 10, operator_category_name: 'Mobile Postpaid' },
      ];
    }

    const sorted = [...categories].sort((a, b) => {
      const aName = a.operator_category_name || '';
      const bName = b.operator_category_name || '';
      const aIdx = PRIMARY_CATEGORY_ORDER.indexOf(aName);
      const bIdx = PRIMARY_CATEGORY_ORDER.indexOf(bName);

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return aName.localeCompare(bName);
    });

    return sorted;
  }, [categories]);

  const getIcon = (catName) => {
    const key = String(catName || '').toLowerCase().trim();
    return CATEGORY_ICON_MAP[key] || Zap;
  };

  const isFiveOrFewer = displayCategories.length <= 5;

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E7E1F0] shadow-sm space-y-6">
      {/* Header inside card (Matching mobile screenshot) */}
      <div className="flex items-start gap-2.5">
        <div className="w-1.5 h-6 bg-[#704096] rounded-full shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#17131D] tracking-tight">
            All bill payments
          </h3>
          <p className="text-xs sm:text-sm text-[#716A7A] font-medium mt-0.5">
            Choose a category to continue
          </p>
        </div>
      </div>

      {/* Subtle Horizontal Divider */}
      <div className="border-t border-[#ECE7F2]" />

      {/* Grid of Categories - Spanning full width so no empty white space on right */}
      <div
        className={
          isFiveOrFewer
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 w-full pt-2 items-stretch'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full pt-2 items-stretch'
        }
      >
        {displayCategories.map((cat) => {
          const key = String(cat.operator_category_name || '').toLowerCase().trim();
          const icon3D = CATEGORY_3D_ICON_MAP[key];
          const Icon = getIcon(cat.operator_category_name);
          const isSelected = Number(selectedCategory) === Number(cat.operator_category_id);

          return (
            <button
              key={cat.operator_category_id}
              type="button"
              onClick={() => onSelectCategory(cat.operator_category_id)}
              className={`group flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer outline-none border ${
                isSelected
                  ? 'bg-purple-50/80 border-[#704096] shadow-md ring-2 ring-[#704096]/20 scale-[1.02]'
                  : 'bg-white hover:bg-[#FAF7FE] border-gray-100 hover:border-purple-200/80 hover:shadow-md hover:scale-[1.02]'
              }`}
            >
              {icon3D ? (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center my-auto transition-transform duration-300 group-hover:scale-108 ${
                    isSelected ? 'scale-108 drop-shadow-md' : ''
                  }`}
                >
                  <img
                    src={icon3D}
                    alt={cat.operator_category_name}
                    className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                  />
                </div>
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#7953B5] via-[#68439F] to-[#70479E] flex items-center justify-center text-white shadow-md shadow-purple-900/15 transition-transform duration-300 group-hover:scale-108 group-hover:shadow-lg ${
                    isSelected
                      ? 'ring-3 ring-[#704096] ring-offset-2 scale-105'
                      : ''
                  }`}
                >
                  <Icon size={34} className="text-white drop-shadow-xs" />
                </div>
              )}

              {/* Category Label */}
              <span
                className={`text-sm sm:text-base font-extrabold text-center mt-3 line-clamp-2 leading-snug transition-colors ${
                  isSelected ? 'text-[#704096]' : 'text-[#1F1929] group-hover:text-[#704096]'
                }`}
              >
                {cat.operator_category_name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BbpsAllBillPayments;
