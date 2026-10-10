export type CalculatorKind = 'sip' | 'goal_sip' | 'smart_goal' | 'inflation' | 'cost_delay' | 'lumpsum' | 'retirement' | 'stepup_sip' | 'swp';
export const currency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const sipValue = (monthly: number, rate: number, years: number) => {
  const r = rate / 1200;
  return r === 0 ? monthly * years * 12 : monthly * Math.expm1(years * 12 * Math.log1p(r)) / r * (1 + r);
};
export interface Inputs { amount: number; rate: number; years: number; extra: number; existing: number }
export function calculate(kind: CalculatorKind, { amount, rate, years, extra, existing }: Inputs) {
  const growth = (1 + rate / 100) ** years;
  const sip = sipValue(amount, rate, years);
  switch (kind) {
    case 'goal_sip': return { label: 'Monthly SIP required', value: amount / sipValue(1, rate, years), detail: `To reach your target in ${years} years` };
    case 'smart_goal': {
      const remaining = Math.max(0, amount - existing * growth);
      return { label: 'Monthly SIP required', value: remaining / sipValue(1, rate, years), detail: `Alternatively invest ${currency(remaining / growth)} as a lump sum today, in addition to your existing investments.` };
    }
    case 'inflation': return { label: 'Future expense', value: amount * growth, detail: `Current expense: ${currency(amount)}` };
    case 'cost_delay': return { label: 'Potential cost of delay', value: sip - sipValue(amount, rate, Math.max(0, years - extra)), detail: `Starting ${Math.min(extra, years)} years later, with the same end date` };
    case 'lumpsum': return { label: 'Estimated future value', value: amount * growth, detail: `Invested amount: ${currency(amount)}` };
    case 'retirement': {
      const annualExpense = amount * 12 * 1.06 ** years;
      const corpus = annualExpense * 25;
      const remaining = Math.max(0, corpus - existing * growth);
      return { label: 'Estimated retirement corpus', value: corpus, detail: `Monthly SIP required: ${currency(remaining / sipValue(1, rate, years))}. Assumes 6% inflation and a 4% annual withdrawal rate.` };
    }
    case 'stepup_sip': {
      let balance = 0;
      let invested = 0;
      for (let month = 0; month < years * 12; month++) {
        const payment = amount * (1 + extra / 100) ** Math.floor(month / 12);
        invested += payment;
        balance = (balance + payment) * (1 + rate / 1200);
      }
      return { label: 'Estimated future value', value: balance, detail: `Invested: ${currency(invested)} · Annual SIP increase: ${extra}%` };
    }
    case 'swp': {
      let balance = amount;
      let withdrawn = 0;
      for (let month = 0; month < years * 12; month++) {
        balance *= 1 + rate / 1200;
        const payment = Math.min(extra, balance);
        withdrawn += payment;
        balance -= payment;
      }
      return { label: 'Remaining investment value', value: balance, detail: `Total withdrawals: ${currency(withdrawn)}${balance === 0 ? ' · Your investment is exhausted during this period.' : ''}` };
    }
    default: return { label: 'Estimated future value', value: sip, detail: `Invested: ${currency(amount * years * 12)} · Estimated gain: ${currency(sip - amount * years * 12)}` };
  }
}
