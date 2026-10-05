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

// Default ordering matching mobile app:
// Mobile Prepaid, FASTag, Electricity, Mobile Postpaid, Credit Card, then others
const PRIMARY_CATEGORY_ORDER = [
  'Mobile Prepaid',
  'FASTag',
  'Electricity',
  'Mobile Postpaid',
  'Credit Card',
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
        { operator_category_id: 5, operator_category_name: 'Mobile Prepaid' },
        { operator_category_id: 22, operator_category_name: 'FASTag' },
        { operator_category_id: 8, operator_category_name: 'Electricity' },
        { operator_category_id: 10, operator_category_name: 'Mobile Postpaid' },
        { operator_category_id: 7, operator_category_name: 'Credit Card' },
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

      {/* Grid of Categories (Full-width responsive squircle grid) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-x-6 gap-y-8 pt-2">
        {displayCategories.map((cat) => {
          const Icon = getIcon(cat.operator_category_name);
          const isSelected = Number(selectedCategory) === Number(cat.operator_category_id);

          return (
            <button
              key={cat.operator_category_id}
              type="button"
              onClick={() => onSelectCategory(cat.operator_category_id)}
              className="group flex flex-col items-center cursor-pointer transition-all duration-200 outline-none"
            >
              {/* Purple Squircle Icon Container */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] rounded-2xl bg-gradient-to-br from-[#7953B5] via-[#68439F] to-[#70479E] flex items-center justify-center text-white shadow-md shadow-purple-900/15 transition-transform duration-200 group-hover:scale-110 group-hover:shadow-lg ${
                  isSelected
                    ? 'ring-3 ring-[#704096] ring-offset-2 scale-105'
                    : ''
                }`}
              >
                <Icon size={26} className="text-white drop-shadow-xs" />
              </div>

              {/* Category Label */}
              <span
                className={`text-xs sm:text-sm font-bold text-center mt-2.5 line-clamp-2 leading-tight max-w-[105px] transition-colors ${
                  isSelected ? 'text-[#704096] font-extrabold' : 'text-[#374151] group-hover:text-[#704096]'
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
