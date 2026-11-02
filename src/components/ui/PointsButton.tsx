// src/components/ui/PointsButton.tsx
// Ported directly from mobile app PointsButton.tsx
import React from 'react';
import { Coins } from 'lucide-react';

interface Props {
  rewardCoins?: number | string;
  redeemCoins?: number | string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const PointsButton: React.FC<Props> = ({
  rewardCoins = 0,
  redeemCoins = 0,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full rounded-[7px] overflow-hidden shadow-2xs hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer border-none text-left p-0 ${className}`}
      style={{ backgroundColor: '#6952C6' }}
    >
      <div className="flex items-center justify-between h-[36px] px-2 text-white">
        {/* Left: Earn */}
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[8px] sm:text-[9px] font-semibold text-white/90 leading-none mb-0.5">
            Earn
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold leading-none">
              {Number(rewardCoins).toLocaleString('en-IN')}
            </span>
            <Coins size={11} className="text-amber-300 shrink-0" />
          </div>
        </div>

        {/* Center Divider (Fixed 22px height matching mobile) */}
        <div className="w-[1px] h-[22px] bg-white/35 shrink-0 self-center" />

        {/* Right: Redeem */}
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[8px] sm:text-[9px] font-semibold text-white/90 leading-none mb-0.5">
            Redeem
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold leading-none">
              {Number(redeemCoins).toLocaleString('en-IN')}
            </span>
            <Coins size={11} className="text-amber-300 shrink-0" />
          </div>
        </div>
      </div>
    </button>
  );
};

export default React.memo(PointsButton);
