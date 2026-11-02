// src/modules/bus/components/DatePickerDialog.tsx
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDaysISO, fromISODate, toISODate, todayISO } from '../busService';
import { BusSheet } from './BusUI';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const MAX_ADVANCE_DAYS = 90;

interface Props {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (iso: string) => void;
}

export const DatePickerDialog: React.FC<Props> = ({ open, value, onClose, onSelect }) => {
  const today = todayISO();
  const maxDate = addDaysISO(today, MAX_ADVANCE_DAYS);
  const [cursor, setCursor] = useState(() => fromISODate(value));

  useEffect(() => {
    if (open) setCursor(fromISODate(value));
  }, [open, value]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = fromISODate(today);
  const canPrev = year > todayDate.getFullYear() || month > todayDate.getMonth();
  const maxD = fromISODate(maxDate);
  const canNext = year < maxD.getFullYear() || month < maxD.getMonth();

  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ];

  return (
    <BusSheet open={open} onClose={onClose} title="Date of Journey">
      <div className="px-5 pt-4 pb-6">
        <div className="mb-4 flex gap-2">
          {[0, 1, 2].map((offset) => {
            const iso = addDaysISO(today, offset);
            const active = iso === value;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelect(iso)}
                className={`flex-1 rounded-2xl border px-2 py-2.5 text-center transition ${
                  active ? 'border-[#1C0E28] bg-[#1C0E28] text-white' : 'border-[#EFE8EE] text-[#1C0E28] hover:border-[#1C0E28]/40'
                }`}
              >
                <span className={`block text-[11px] font-semibold ${active ? 'text-white/70' : 'text-[#8D8092]'}`}>
                  {offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : 'Day after'}
                </span>
                <span className="block text-sm font-extrabold">
                  {fromISODate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCE9] text-[#1C0E28] hover:bg-[#F6F2F8] disabled:opacity-30"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-extrabold text-[#1C0E28]">
            {cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCE9] text-[#1C0E28] hover:bg-[#F6F2F8] disabled:opacity-30"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1.5 text-[11px] font-bold text-[#9B8FA5]">
              {d}
            </span>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <span key={`e${i}`} />;
            const disabled = iso < today || iso > maxDate;
            const selected = iso === value;
            const isToday = iso === today;
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(iso)}
                aria-pressed={selected}
                className={`relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-xl text-sm font-bold transition ${
                  selected
                    ? 'bus-cta'
                    : disabled
                      ? 'cursor-not-allowed text-[#D4CCDA]'
                      : 'text-[#1C0E28] hover:bg-[#F4EFF3]'
                }`}
              >
                {Number(iso.slice(-2))}
                {isToday && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#DC2626]" />}
              </button>
            );
          })}
        </div>
      </div>
    </BusSheet>
  );
};

export default DatePickerDialog;
