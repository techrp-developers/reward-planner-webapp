// src/components/ui/RPpriceBadge.jsx
// Exact mobile component ported to Web with Tailwind CSS
import React from 'react';

export const RPpriceBadge = ({ value, className = '' }) => {
  if (!value && value !== 0) return null;

  // Extract clean number to format decimals cleanly (e.g. ₹487.03999999999996 -> ₹487.04)
  const cleanNumber = (val) => {
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
      className={`inline-flex items-center rounded-md px-2 py-0.5 border shadow-xs transition-transform duration-150 ${className}`}
      style={{
        backgroundColor: '#F6D58B',
        borderColor: '#D69A33',
      }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-wider mr-1"
        style={{ color: '#5F341A' }}
      >
        RP
      </span>
      <span className="text-xs font-extrabold text-[#111827]">
        {formattedValue}
      </span>
    </div>
  );
};

export default React.memo(RPpriceBadge);
