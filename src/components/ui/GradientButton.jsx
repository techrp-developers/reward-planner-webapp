// src/components/ui/GradientButton.jsx
// Exact mobile gradient button ported to Web with Tailwind CSS
import React from 'react';
import { Loader2 } from 'lucide-react';

export const GradientButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-semibold text-white px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: 'linear-gradient(90deg, #8b3ab5 0%, #a855f7 100%)',
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 size={18} className="animate-spin text-white" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default React.memo(GradientButton);
