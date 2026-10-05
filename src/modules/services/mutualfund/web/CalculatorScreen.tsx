import { useState } from 'react';
import { calculate, currency, type CalculatorKind } from './calculations';
import { CALCULATORS } from './CalculatorCard';

function Slider({ label, value, onChange, min, max, step = 1, unit }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number; unit: string }) {
  return <label className="block space-y-3"><span className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium"><span>{label}</span><span className="mf-input-value flex items-center gap-1 rounded-lg px-3 py-2"><input aria-label={`${label} value`} className="w-24 bg-transparent text-right outline-none" type="number" min={min} max={max} step={step} value={value} onChange={event => { const next = Number(event.target.value); if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next))); }} />{unit}</span></span><input aria-label={label} type="range" className="w-full accent-[#3545A3]" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /><span className="mf-muted flex justify-between text-xs"><span>{min.toLocaleString('en-IN')} {unit}</span><span>{max.toLocaleString('en-IN')} {unit}</span></span></label>;
}

export default function CalculatorScreen({ kind }: { kind: CalculatorKind }) {
  const goal = kind === 'goal_sip' || kind === 'smart_goal';
  const capital = kind === 'lumpsum' || kind === 'inflation' || kind === 'swp';
  const [amount, setAmount] = useState(goal ? 1000000 : capital ? 100000 : 5000);
  const [rate, setRate] = useState(kind === 'inflation' ? 6 : 12);
  const [years, setYears] = useState(10);
  const [extra, setExtra] = useState(kind === 'swp' ? 5000 : kind === 'stepup_sip' ? 10 : 2);
  const [existing, setExisting] = useState(0);
  const result = calculate(kind, { amount, rate, years, extra: kind === 'cost_delay' ? Math.min(extra, years) : extra, existing });
  return <div className="space-y-7"><p className="mf-muted text-sm">{CALCULATORS.find(item => item.id === kind)?.subtitle}</p><div className="grid gap-8 md:grid-cols-2"><div className="space-y-6">
    <Slider label={goal ? 'Target amount' : kind === 'inflation' ? 'Current expense' : kind === 'retirement' ? 'Monthly living expense' : capital ? 'Investment amount' : 'Monthly investment'} value={amount} onChange={setAmount} min={500} max={goal ? 100000000 : capital ? 10000000 : 100000} step={500} unit="₹" />
    <Slider label={kind === 'inflation' ? 'Annual inflation' : 'Expected annual return'} value={rate} onChange={setRate} min={0} max={30} step={0.5} unit="%" />
    <Slider label={kind === 'retirement' ? 'Years until retirement' : 'Time period'} value={years} onChange={setYears} min={1} max={40} unit="years" />
    {kind === 'cost_delay' && <Slider label="Delay in starting" value={Math.min(extra, years)} onChange={setExtra} min={0} max={years} unit="years" />}
    {kind === 'stepup_sip' && <Slider label="Annual SIP increase" value={extra} onChange={setExtra} min={0} max={50} unit="%" />}
    {kind === 'swp' && <Slider label="Monthly withdrawal" value={extra} onChange={setExtra} min={0} max={100000} step={500} unit="₹" />}
    {(kind === 'smart_goal' || kind === 'retirement') && <Slider label="Existing investments" value={existing} onChange={setExisting} min={0} max={10000000} step={1000} unit="₹" />}
  </div><div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-[#3545A3] to-[#080B26] p-7 text-white"><span className="text-sm text-white/75">{result.label}</span><output aria-live="polite" className="my-4 break-words text-3xl font-bold">{currency(result.value)}</output><p className="text-sm leading-7 text-white/80">{result.detail}</p></div></div><p className="mf-muted text-xs leading-6">Illustrative estimates using a constant rate. Actual returns vary; taxes, fees and market changes are excluded. SIP contributions occur at the start of each month; SWP withdrawals occur at the end.</p></div>;
}
