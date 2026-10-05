// src/modules/bbps/components/BbpsQuickPay.jsx
import React from 'react';
import { CreditCard, Smartphone, PhoneCall } from 'lucide-react';

const QUICK_PAY_ITEMS = [
  {
    id: 7,
    title: 'Credit Card',
    icon: CreditCard,
    cardBg: 'from-[#FFFFFF] to-[#F5F0FC]',
    iconGradient: 'from-[#8D5ED1] to-[#704096]',
    accentColor: '#704096',
  },
  {
    id: 5,
    title: 'Mobile Prepaid',
    icon: Smartphone,
    cardBg: 'from-[#FFFFFF] to-[#F7F3FC]',
    iconGradient: 'from-[#A884E1] to-[#7950B6]',
    accentColor: '#8D5ED1',
  },
  {
    id: 10,
    title: 'Mobile Postpaid',
    icon: PhoneCall,
    cardBg: 'from-[#FFFFFF] to-[#F5F0FC]',
    iconGradient: 'from-[#DB83B2] to-[#AA477D]',
    accentColor: '#C05A91',
  },
];

export const BbpsQuickPay = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full space-y-3.5">
      {/* Section Header with Purple Accent Bar */}
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-6 bg-[#704096] rounded-full shrink-0" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17131D] tracking-tight">
          Quick pay
        </h2>
      </div>

      {/* 3 Quick Pay Cards - Full width responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {QUICK_PAY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = Number(selectedCategory) === Number(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(item.id)}
              className={`relative overflow-hidden rounded-3xl border transition-all duration-200 p-5 sm:p-6 lg:p-7 text-left cursor-pointer flex flex-col justify-between min-h-[140px] ${
                isSelected
                  ? 'border-[#704096] shadow-md ring-2 ring-[#704096]/20 bg-gradient-to-b ' + item.cardBg
                  : 'border-[#E7E1F0] hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-b ' + item.cardBg
              }`}
            >
              <div>
                {/* Purple Squircle Icon */}
                <div
                  className={`w-12 h-12 lg:w-13 lg:h-13 rounded-2xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center text-white shadow-sm mb-4`}
                >
                  <Icon size={24} className="drop-shadow-xs" />
                </div>

                {/* Card Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#17131D] leading-snug">
                  {item.title}
                </h3>
              </div>

              {/* Bottom Color Accent Line (Matching mobile app) */}
              <div
                className="w-full h-[4px] rounded-t-sm mt-4"
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
