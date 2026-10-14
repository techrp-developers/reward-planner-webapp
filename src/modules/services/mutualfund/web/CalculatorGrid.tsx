import CalculatorCard from './CalculatorCard';
import { CALCULATORS, type CalculatorItem } from './calculatorItems';

interface CalculatorGridProps {
  onOpenCalculator: (item: CalculatorItem) => void;
}

export default function CalculatorGrid({ onOpenCalculator }: CalculatorGridProps) {
  return (
    <section id="mf-calculators" aria-labelledby="calculators-heading" className="mf-calculators-panel mb-14 scroll-mt-8 rounded-3xl p-4 sm:p-6">
      <h2 id="calculators-heading" className="mb-5 text-xl font-bold text-[#14123A] sm:text-2xl">Financial Calculators</h2>
      <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATORS.map(item => (
          <CalculatorCard key={item.id} item={item} onPress={() => onOpenCalculator(item)} />
        ))}
      </div>
    </section>
  );
}
