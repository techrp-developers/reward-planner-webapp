// src/modules/bbps/components/BbpsQuickPay.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import iconCreditCard from '../../../assets/payments/icon_credit_card.png';
import iconMobilePostpaid from '../../../assets/payments/icon_mobile_postpaid.png';
import iconMobilePrepaid from '../../../assets/payments/icon_mobile_prepaid.png';

interface QuickPayItem {
  id: number;
  title: string;
  image: string;
  cardBg: string;
  borderColor: string;
  accentColor: string;
  arrowColor: string;
  arrowBg: string;
}

const QUICK_PAY_ITEMS: QuickPayItem[] = [
  {
    id: 7,
    title: 'Credit Card',
    image: iconCreditCard,
    cardBg: 'from-[#FFFFFF] via-[#FAF7FE] to-[#F3EBFC]',
    borderColor: 'border-[#E9DEF7]',
    accentColor: '#8D5ED1',
    arrowColor: 'text-[#8D5ED1]',
    arrowBg: 'bg-[#F2E7FC]',
  },
  {
    id: 10,
    title: 'Mobile Postpaid',
    image: iconMobilePostpaid,
    cardBg: 'from-[#FFFFFF] via-[#FEF8FA] to-[#FBECF3]',
    borderColor: 'border-[#F8DFEB]',
    accentColor: '#E65D88',
    arrowColor: 'text-[#E65D88]',
    arrowBg: 'bg-[#FCE7F0]',
  },
  {
    id: 5,
    title: 'Mobile Prepaid',
    image: iconMobilePrepaid,
    cardBg: 'from-[#FFFFFF] via-[#F8F7FE] to-[#EFEAFA]',
    borderColor: 'border-[#E5DDF7]',
    accentColor: '#7C4DBF',
    arrowColor: 'text-[#7C4DBF]',
    arrowBg: 'bg-[#EFE8FC]',
  },
];

interface BbpsQuickPayProps {
  selectedCategory: number | string;
  onSelectCategory: (id: number) => void;
}

export const BbpsQuickPay: React.FC<BbpsQuickPayProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full space-y-3.5">
      {/* Section Header with Purple Accent Bar */}
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-6 bg-[#704096] rounded-full shrink-0" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17131D] tracking-tight">
          Quick pay
        </h2>
      </div>

      {/* 3 Quick Pay Cards with exact 3D illustrated assets from mobile mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {QUICK_PAY_ITEMS.map((item) => {
          const isSelected = Number(selectedCategory) === Number(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(item.id)}
              className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-4 sm:p-5 text-left cursor-pointer flex flex-col justify-between items-center min-h-[215px] sm:min-h-[230px] group bg-gradient-to-b ${item.cardBg} ${item.borderColor} ${
                isSelected
                  ? 'border-[#704096] shadow-lg ring-2 ring-[#704096]/25 scale-[1.01]'
                  : 'hover:shadow-lg hover:scale-[1.015] hover:border-purple-300'
              }`}
            >
              {/* 3D Illustration in center - large and prominent */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 max-h-[135px] sm:max-h-[145px] flex-1 flex items-center justify-center my-auto transition-transform duration-300 group-hover:scale-105">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-md"
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                />
              </div>

              {/* Bottom Pill matching mobile app: [Title >] - fully visible and unclipped */}
              <div className="w-full flex items-center justify-start pt-2 pb-0.5 z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-gray-100 shadow-2xs group-hover:shadow-xs transition-shadow">
                  <span className="text-xs sm:text-sm font-bold text-[#17131D]">
                    {item.title}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${item.arrowBg} ${item.arrowColor}`}
                  >
                    <ChevronRight size={11} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* Bottom Color Accent Line matching mobile app */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[4px] rounded-t-sm"
                style={{ backgroundColor: item.accentColor }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BbpsQuickPay;
