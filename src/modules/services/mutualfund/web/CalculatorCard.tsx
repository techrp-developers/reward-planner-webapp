import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Wallet from '@mui/icons-material/AccountBalanceWalletOutlined';
import Palmtree from '@mui/icons-material/BeachAccessOutlined';
import TrendingUp from '@mui/icons-material/TrendingUp';
import ArrowDownUp from '@mui/icons-material/SwapVert';
import Calculator from '@mui/icons-material/CalculateOutlined';
import type SvgIcon from '@mui/material/SvgIcon';
import type { CalculatorItem } from './calculatorItems';

interface CalculatorCardProps {
  item: CalculatorItem;
  onPress: () => void;
}

const FALLBACK_ICONS: Record<string, typeof SvgIcon> = {
  lumpsum: Wallet,
  retirement: Palmtree,
  stepup_sip: TrendingUp,
  swp: ArrowDownUp,
};

export default function CalculatorCard({ item, onPress }: CalculatorCardProps) {
  const FallbackIcon = FALLBACK_ICONS[item.id] || Calculator;

  return (
    <button
      type="button"
      onClick={onPress}
      className="mf-calculator-card group relative flex h-full min-h-[150px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#E9E4FB] bg-white p-5 text-left shadow-[0_2px_10px_rgba(80,60,160,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9BDF7] hover:shadow-[0_10px_24px_rgba(80,60,160,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C56F0] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 pr-1">
          <h3 className="text-[15px] sm:text-base font-bold leading-6 text-[#14123A]">
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-[#6B6880]">
            {item.subtitle}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mf-calculator-icon relative flex h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 items-center justify-center rounded-full p-2"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-contain select-none"
            />
          ) : (
            <FallbackIcon sx={{ fontSize: 34 }} className="mf-calculator-cta" />
          )}
        </div>
      </div>

      <span className="mt-4 flex items-center justify-between">
        <span className="mf-calculator-cta text-sm font-bold group-hover:underline">
          Calculate Now
        </span>
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#B9A6FF] to-[#7C66F2] text-white shadow-[0_2px_6px_rgba(124,102,242,0.35)] transition-transform duration-300 group-hover:translate-x-1"
        >
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </span>
      </span>
    </button>
  );
}
