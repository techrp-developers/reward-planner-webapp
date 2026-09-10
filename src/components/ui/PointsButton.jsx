// src/components/ui/PointsButton.jsx
// Exact mobile component ported to Web with Tailwind CSS
import React from 'react';
import { Coins } from 'lucide-react';

export const PointsButton = ({ rewardCoins = 0, redeemCoins = 0, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full rounded-lg overflow-hidden shadow-xs hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer border-none text-left p-0 ${className}`}
      style={{ backgroundColor: '#6952C6' }}
    >
      <div className="flex items-center justify-between h-9 px-3 text-white">
        {/* Left: Earn */}
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[9px] font-semibold text-white/80 leading-none mb-0.5">
            Earn
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold leading-none">
              {Number(rewardCoins).toLocaleString('en-IN')}
            </span>
            <Coins size={11} className="text-amber-300" />
          </div>
        </div>

        {/* Center Divider */}
        <div className="w-[1px] h-5 bg-white/30" />

        {/* Right: Redeem */}
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[9px] font-semibold text-white/80 leading-none mb-0.5">
            Redeem
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold leading-none">
              {Number(redeemCoins).toLocaleString('en-IN')}
            </span>
            <Coins size={11} className="text-amber-300" />
          </div>
        </div>
      </div>
    </button>
  );
};

export default React.memo(PointsButton);
