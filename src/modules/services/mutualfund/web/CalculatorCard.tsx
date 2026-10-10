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
      className="mf-calculator-card group relative flex h-full min-h-[200px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#3545A3]/15 bg-gradient-to-br from-white to-[#F7F3FF] p-5 sm:p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#3545A3]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3545A3] focus-visible:ring-offset-2 dark:border-white/10 dark:from-[#1c1c26] dark:to-[#18112a]"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 pr-1">
          <h3 className="text-base sm:text-lg font-extrabold leading-6 text-[#241C3B] transition-colors group-hover:text-[#3545A3] dark:text-[#f4f0ff] dark:group-hover:text-[#b5bfff]">
            {item.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-5 text-[#746B86] dark:text-[#b9b2ca]">
            {item.subtitle}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="mf-calculator-art relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl border border-[#3545A3]/10 bg-white/90 p-2 shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105 dark:border-white/10 dark:bg-white/5"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-contain select-none"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#8665FF]/15 to-[#3545A3]/15">
              <FallbackIcon sx={{ fontSize: 36 }} className="text-[#3545A3] dark:text-[#b5bfff]" />
            </div>
          )}
        </div>
      </div>

      <span className="mt-5 flex items-center justify-between border-t border-[#3545A3]/10 pt-4 dark:border-white/10">
        <span className="text-sm font-bold text-[#3545A3] transition-colors group-hover:text-[#283685] group-hover:underline dark:text-[#b5bfff]">
          Calculate Now
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3545A3] text-white shadow-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-[#283685] dark:bg-[#3545A3]"
        >
          <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </span>
      </span>
    </button>
  );
}
