import { ArrowRight, Calculator, Target, Flag, Percent, Clock, Wallet, Palmtree, TrendingUp, ArrowDownUp, type LucideIcon } from 'lucide-react';
import type { CalculatorKind } from './calculations';

export interface CalculatorItem { id: CalculatorKind; title: string; subtitle: string; icon: LucideIcon }
export const CALCULATORS: CalculatorItem[] = [
  { id: 'sip', title: 'SIP Calculator', subtitle: 'Estimate the future value of your monthly SIP investment.', icon: Calculator },
  { id: 'goal_sip', title: 'Target SIP Calculator', subtitle: 'Know the monthly SIP investment required to reach your goals.', icon: Target },
  { id: 'inflation', title: 'Inflation Calculator', subtitle: 'Understand the impact of inflation on current expenses and future goals.', icon: Percent },
  { id: 'smart_goal', title: 'Smart Goal Calculator', subtitle: 'Plan goals through SIP or a lump sum, keeping existing investments in mind.', icon: Flag },
  { id: 'cost_delay', title: 'Cost of Delay Calculator', subtitle: 'See how postponing your investment can affect your future wealth.', icon: Clock },
  { id: 'lumpsum', title: 'Lump Sum Calculator', subtitle: 'Calculate potential returns on a one-time investment.', icon: Wallet },
  { id: 'retirement', title: 'Retirement Calculator', subtitle: 'Estimate your retirement corpus and the monthly SIP needed.', icon: Palmtree },
  { id: 'stepup_sip', title: 'Step-Up SIP Calculator', subtitle: 'Explore returns when you increase your SIP each year.', icon: TrendingUp },
  { id: 'swp', title: 'SWP Calculator', subtitle: 'Plan regular withdrawals and estimate your remaining investment.', icon: ArrowDownUp },
];

export default function CalculatorCard({ item, featured, onClick }: { item: CalculatorItem; featured?: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button onClick={onClick} className={`mf-calculator-card group flex rounded-3xl border p-6 text-left transition hover:-translate-y-1 hover:shadow-lg ${featured ? 'flex-col lg:row-span-2' : 'items-center gap-4'}`}>
    <div aria-hidden="true" className={`mf-calculator-art relative flex shrink-0 items-center justify-center rounded-3xl ${featured ? 'mb-7 min-h-48 w-full' : 'order-2 ml-auto h-24 w-24'}`}>
      <div className="absolute h-3/4 w-3/4 rounded-full bg-[#8665FF]/10" /><Icon size={featured ? 112 : 52} strokeWidth={1.3} className="relative text-[#3545A3]" />
      {featured && <span className="absolute bottom-3 right-4 rounded-xl bg-[#F6D58B] px-4 py-1 text-lg font-bold text-[#5F341A]">SIP</span>}
    </div><div className={featured ? 'mt-auto' : ''}><h3 className="text-lg font-semibold leading-snug">{item.title}</h3><p className="mf-muted mt-3 text-sm leading-6">{item.subtitle}</p><span className="mf-accent mt-4 inline-flex items-center gap-2 text-sm font-semibold">Calculate <ArrowRight size={16} /></span></div>
  </button>;
}
