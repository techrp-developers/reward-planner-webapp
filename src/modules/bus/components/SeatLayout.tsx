// src/modules/bus/components/SeatLayout.tsx
// Deck-wise seat map drawn inside a coach outline. Sleeper (2+1) shows lower + upper berths; seater (2+2) a single deck.
import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import WomanIcon from '@mui/icons-material/Woman';
import type { BusSeat } from '../busTypes';
import { formatINR } from '../busService';
import { SteeringWheelIcon } from './BusUI';

export const MAX_SEATS = 6;

interface Props {
  seats: BusSeat[];
  selectedIds: string[];
  onToggle: (seat: BusSeat) => void;
}

const SeatTile: React.FC<{ seat: BusSeat; selected: boolean; dimmed: boolean; onToggle: () => void }> = ({ seat, selected, dimmed, onToggle }) => {
  const sleeper = seat.kind === 'sleeper';
  const ladies = seat.reservedFor === 'female';
  const bookedFemale = seat.booked && seat.bookedBy === 'female';

  let tone = 'border-[#CFC4D3] bg-white text-[#4A3C55] hover:-translate-y-0.5 hover:border-[#D62839] hover:shadow-[0_8px_16px_-8px_rgba(198,32,56,0.5)]';
  if (seat.booked) tone = `bus-seat-sold border-[#E7DFE9] ${bookedFemale ? 'text-[#D79BAA]' : 'text-[#BDB2C1]'}`;
  else if (selected) tone = 'bus-seat-selected border-transparent text-white';
  else if (ladies) tone = 'bus-seat-women border-[#EFA9BC] text-[#9D174D] hover:-translate-y-0.5 hover:border-[#D62839]';

  const status = seat.booked ? 'Booked' : selected ? 'Selected' : ladies ? 'Reserved for women' : 'Available';

  return (
    <div className={`flex flex-col items-center gap-1 transition-opacity ${dimmed ? 'opacity-25' : ''}`}>
      <button
        type="button"
        disabled={seat.booked}
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={`Seat ${seat.label}, ${status}, ${formatINR(seat.price)}`}
        title={`${seat.label} · ${status}`}
        className={`bus-focus relative flex w-full items-center justify-center rounded-xl border-[1.5px] transition-all duration-150 ${
          sleeper ? 'h-[86px] sm:h-[94px]' : 'h-[50px] sm:h-[54px]'
        } ${tone}`}
      >
        {/* pillow on a berth, backrest on a seat */}
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${
            sleeper ? 'top-1.5 h-2.5 w-[62%] rounded-md' : 'bottom-1 h-1.5 w-[66%] rounded-full'
          } ${selected ? 'bg-white/35' : seat.booked ? 'bg-white/70' : 'bg-[#1C0E28]/[0.07]'}`}
        />
        {selected ? (
          <Check className="relative h-4 w-4" strokeWidth={3.2} />
        ) : (ladies && !seat.booked) || bookedFemale ? (
          <WomanIcon className="relative" sx={{ fontSize: sleeper ? 24 : 18 }} />
        ) : (
          <span className="relative text-[10px] font-extrabold">{seat.label}</span>
        )}
      </button>
      <span className={`bus-num text-[10px] leading-none font-bold ${seat.booked ? 'text-[#C9BFCC]' : selected ? 'text-[#D62839]' : 'text-[#5B4D66]'}`}>
        {seat.booked ? 'Sold' : formatINR(seat.price)}
      </span>
    </div>
  );
};

const Deck: React.FC<{
  title: string;
  seats: BusSeat[];
  selectedIds: string[];
  priceFilter: number | null;
  onToggle: (s: BusSeat) => void;
  showDriver?: boolean;
}> = ({ title, seats, selectedIds, priceFilter, onToggle, showDriver }) => {
  if (!seats || seats.length === 0) return null;

  // Distinct bus rows along the length of the bus (front to back)
  const distinctRows = useMemo(() => {
    return [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);
  }, [seats]);

  // Distinct column slots across the width of the bus
  const cols = useMemo(() => {
    const minCol = Math.min(...seats.map((s) => s.col));
    const maxCol = Math.max(...seats.map((s) => s.col));
    const colSpan = maxCol - minCol + 1;

    // Check if seats already include an aisle slot or if it's packed fallback 2+2
    const seatsPerCol = new Map<number, number>();
    seats.forEach((s) => seatsPerCol.set(s.col, (seatsPerCol.get(s.col) || 0) + 1));
    const isPackedFourCols =
      colSpan === 4 &&
      minCol === 0 &&
      [0, 1, 2, 3].every((c) => (seatsPerCol.get(c) || 0) > distinctRows.length * 0.5);

    if (isPackedFourCols) {
      return [0, 1, null, 2, 3];
    }

    return Array.from({ length: colSpan }, (_, k) => minCol + k);
  }, [seats, distinctRows]);

  return (
    <div className={`bus-coach w-full px-3.5 pt-4 pb-4 sm:px-4 ${showDriver ? '' : 'bus-coach-upper'}`}>
      <div className="mb-3 flex items-center justify-between border-b border-dashed border-[#E7DFE9] px-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="bus-eyebrow !text-[#1C0E28]">{title}</span>
          <span className="text-[11px] font-bold text-[#7D6F84]">({seats.length} seats)</span>
        </div>
        {showDriver ? <SteeringWheelIcon className="h-7 w-7 text-[#7D6F84]" /> : <span className="h-7" />}
      </div>
      <div
        className="grid gap-x-2 gap-y-2.5"
        style={{
          gridTemplateColumns: cols
            .map((c) => (c === null ? '0.55fr' : '1fr'))
            .join(' '),
        }}
      >
        {distinctRows.flatMap((row) =>
          cols.map((col, ci) => {
            if (col === null) return <span key={`${row}-aisle-${ci}`} className="h-full w-full" />;
            const seat = seats.find((s) => s.row === row && s.col === col);
            if (!seat) return <span key={`${row}-${col}`} className="h-full w-full" />;
            return (
              <SeatTile
                key={seat.id}
                seat={seat}
                selected={selectedIds.includes(seat.id)}
                dimmed={priceFilter !== null && seat.price !== priceFilter}
                onToggle={() => onToggle(seat)}
              />
            );
          }),
        )}
      </div>
    </div>
  );
};

export const SeatLegend = () => (
  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-[#5B4D66]">
    {[
      { label: 'Available', cls: 'border-[#CFC4D3] bg-white' },
      { label: 'Selected', cls: 'bus-seat-selected border-transparent' },
      { label: 'Sold', cls: 'bus-seat-sold border-[#E7DFE9]' },
      { label: 'Reserved for women', cls: 'bus-seat-women border-[#EFA9BC]' },
    ].map((l) => (
      <span key={l.label} className="inline-flex items-center gap-1.5">
        <span className={`h-4 w-4 rounded-[5px] border-[1.5px] ${l.cls}`} /> {l.label}
      </span>
    ))}
  </div>
);

export const SeatLayout: React.FC<Props> = ({ seats, selectedIds, onToggle }) => {
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [mobileDeck, setMobileDeck] = useState<'lower' | 'upper'>('lower');
  const prices = useMemo(() => [...new Set(seats.filter((s) => !s.booked).map((s) => s.price))].sort((a, b) => a - b), [seats]);
  const lower = useMemo(() => seats.filter((s) => s.deck === 'lower'), [seats]);
  const upper = useMemo(() => seats.filter((s) => s.deck === 'upper'), [seats]);
  const hasUpper = upper.length > 0;
  const countSelected = (deck: BusSeat[]) => deck.filter((s) => selectedIds.includes(s.id)).length;

  return (
    <div>
      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
        {[null, ...prices].map((p) => {
          const active = priceFilter === p;
          return (
            <button
              key={p ?? 'all'}
              type="button"
              onClick={() => setPriceFilter(p)}
              aria-pressed={active}
              className={`bus-num shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                active ? 'border-[#1C0E28] bg-[#1C0E28] text-white' : 'border-[#E7DFE9] bg-white text-[#3D3047] hover:border-[#1C0E28]/40'
              }`}
            >
              {p === null ? 'All prices' : formatINR(p)}
            </button>
          );
        })}
      </div>

      {hasUpper && (
        <div className="mb-5 flex rounded-2xl bg-[#F1EBF1] p-1.5 sm:hidden" role="tablist" aria-label="Deck">
          {(['lower', 'upper'] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={mobileDeck === d}
              onClick={() => setMobileDeck(d)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold capitalize transition ${
                mobileDeck === d ? 'bg-white text-[#1C0E28] shadow-sm' : 'text-[#7D6F84] hover:text-[#1C0E28]'
              }`}
            >
              {d} deck
              <span className="ml-1.5 rounded-full bg-[#E7DFE9] px-2 py-0.5 text-[10px] font-bold text-[#5B4D66]">
                {(d === 'lower' ? lower : upper).length}
              </span>
              {countSelected(d === 'lower' ? lower : upper) > 0 && (
                <span className="ml-1.5 rounded-full bg-[#D62839] px-1.5 py-0.5 text-[10px] text-white">
                  {countSelected(d === 'lower' ? lower : upper)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
        <div className={`w-full max-w-[310px] sm:max-w-[330px] ${hasUpper && mobileDeck !== 'lower' ? 'hidden sm:block' : ''}`}>
          <Deck title={hasUpper ? 'Lower deck' : 'Seats'} seats={lower} selectedIds={selectedIds} priceFilter={priceFilter} onToggle={onToggle} showDriver />
        </div>
        {hasUpper && (
          <div className={`w-full max-w-[310px] sm:max-w-[330px] ${mobileDeck !== 'upper' ? 'hidden sm:block' : ''}`}>
            <Deck title="Upper deck" seats={upper} selectedIds={selectedIds} priceFilter={priceFilter} onToggle={onToggle} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-[#FBF7FA] px-4 py-3.5">
        <SeatLegend />
      </div>
    </div>
  );
};

export default SeatLayout;
