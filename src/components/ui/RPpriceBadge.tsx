// src/components/ui/RPpriceBadge.tsx
// Ported directly from mobile app RPpriceBadge.tsx
import React from 'react';

interface Props {
  value: string | number;
  className?: string;
}

export const RPpriceBadge: React.FC<Props> = ({ value, className = '' }) => {
  if (!value && value !== 0) return null;

  // Extract clean number to format decimals cleanly (e.g. ₹487.03999999999996 -> ₹487.04)
  const cleanNumber = (val: string | number) => {
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const str = String(val).replace(/[^0-9.]/g, '');
    const num = Number(str);
    return isNaN(num) ? null : num;
  };

  const num = cleanNumber(value);
  const formattedValue = num !== null
    ? `₹${num.toLocaleString('en-IN', {
        minimumFractionDigits: num % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}`
    : String(value);

  return (
    <div
      className={`inline-flex items-center rounded-lg px-1.5 py-0.5 border shadow-2xs ${className}`}
      style={{
        backgroundColor: '#F6D58B',
        borderColor: '#D69A33',
      }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-wider mr-1 select-none leading-none"
        style={{ color: '#5F341A' }}
      >
        RP
      </span>
      <span className="text-[11px] font-extrabold text-[#111827] leading-none">
        {formattedValue}
      </span>
    </div>
  );
};

export default React.memo(RPpriceBadge);
