// src/modules/bus/components/PointsSelector.tsx
// Boarding / dropping picker. Tabs on phones and tablets, side-by-side columns on desktop.
import React, { useState } from 'react';
import type { BusPoint } from '../busTypes';

interface Props {
  fromName: string;
  toName: string;
  boardingPoints: BusPoint[];
  droppingPoints: BusPoint[];
  boardingId: string | null;
  droppingId: string | null;
  onBoarding: (id: string) => void;
  onDropping: (id: string) => void;
}

const PointList: React.FC<{
  heading: string;
  name: string;
  points: BusPoint[];
  value: string | null;
  onChange: (id: string) => void;
}> = ({ heading, name, points, value, onChange }) => (
  <div className="bus-card overflow-hidden">
    <p className="border-b border-[#F3EDF1] px-5 py-4 text-[13px] font-bold text-[#1C0E28]">{heading}</p>
    <ul role="radiogroup" aria-label={heading} className="py-1">
      {points.map((p, i) => {
        const checked = value === p.id;
        return (
          <li key={p.id} className="relative">
            {i < points.length - 1 && <span className="absolute top-8 bottom-[-8px] left-[85px] z-0 w-px bg-[#E7DFE9]" aria-hidden="true" />}
            <label className={`relative flex cursor-pointer items-start gap-3 px-5 py-3.5 transition ${checked ? 'bg-[#FEF5F3]' : 'hover:bg-[#FBF7FA]'}`}>
              <span className="bus-num w-11 shrink-0 pt-px text-[15px] font-extrabold text-[#1C0E28]">{p.time}</span>
              <input type="radio" name={name} checked={checked} onChange={() => onChange(p.id)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white transition peer-focus-visible:ring-4 peer-focus-visible:ring-[#D62839]/20 ${
                  checked ? 'border-[#D62839]' : 'border-[#CFC4D3]'
                }`}
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#D62839]" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-[#1C0E28]">{p.name}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-[#7D6F84]">{p.address}</span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  </div>
);

export const PointsSelector: React.FC<Props> = ({
  fromName,
  toName,
  boardingPoints,
  droppingPoints,
  boardingId,
  droppingId,
  onBoarding,
  onDropping,
}) => {
  const [tab, setTab] = useState<'boarding' | 'dropping'>(boardingId && !droppingId ? 'dropping' : 'boarding');

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-[#F1EBF1] p-1 lg:hidden" role="tablist">
        {[
          { key: 'boarding' as const, label: 'Boarding points', city: fromName, done: !!boardingId },
          { key: 'dropping' as const, label: 'Dropping points', city: toName, done: !!droppingId },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl py-2.5 text-center transition ${tab === t.key ? 'bg-white text-[#1C0E28] shadow-sm' : 'text-[#7D6F84]'}`}
          >
            <span className="block text-sm font-extrabold sm:text-[15px]">
              {t.label}
              {t.done && <span className="ml-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-[#16A34A]" />}
            </span>
            <span className="block text-xs font-medium text-[#9B8FA5]">{t.city}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={tab === 'boarding' ? '' : 'hidden lg:block'}>
          <h3 className="mb-3 hidden text-sm font-extrabold text-[#1C0E28] lg:block">
            Boarding point <span className="font-medium text-[#9B8FA5]">· {fromName}</span>
          </h3>
          <PointList
            heading={`All boarding points in ${fromName}`}
            name="boarding"
            points={boardingPoints}
            value={boardingId}
            onChange={(id) => {
              onBoarding(id);
              if (!droppingId) setTab('dropping');
            }}
          />
        </div>
        <div className={tab === 'dropping' ? '' : 'hidden lg:block'}>
          <h3 className="mb-3 hidden text-sm font-extrabold text-[#1C0E28] lg:block">
            Dropping point <span className="font-medium text-[#9B8FA5]">· {toName}</span>
          </h3>
          <PointList
            heading={`All dropping points in ${toName}`}
            name="dropping"
            points={droppingPoints}
            value={droppingId}
            onChange={onDropping}
          />
        </div>
      </div>
    </div>
  );
};

export default PointsSelector;
