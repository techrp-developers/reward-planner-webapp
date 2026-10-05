import type { CalculatorItem } from './calculatorItems';

interface CalculatorCardProps {
  item: CalculatorItem;
  onPress: () => void;
}

export default function CalculatorCard({ item, onPress }: CalculatorCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="mf-calculator-card flex h-full min-h-[184px] w-full flex-col rounded-2xl border border-[#3545A3]/15 bg-gradient-to-br from-white to-[#F7F3FF] p-6 text-left shadow-sm transition hover:border-[#3545A3]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3545A3] focus-visible:ring-offset-2"
    >
      <h3 className="text-base font-extrabold leading-6 text-[#241C3B]">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[#746B86]">{item.subtitle}</p>
      <span className="mt-4 flex items-center justify-between border-t border-[#3545A3]/10 pt-4">
        <span className="text-sm font-bold text-[#3545A3]">Calculate Now</span>
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3545A3] text-white">→</span>
      </span>
    </button>
  );
}
