// src/modules/bus/components/BusSearchCard.tsx
// From / To / Date / Women search form. Stacks vertically on phones (mirrors the app),
// becomes a single horizontal search bar on desktop.
import React, { useState } from 'react';
import { ArrowUpDown, CalendarDays, ChevronRight, MapPin, Navigation, Search } from 'lucide-react';
import Woman2Icon from '@mui/icons-material/Woman2';
import { addDaysISO, formatJourneyDate, getCity, todayISO } from '../busService';
import CityPickerDialog from './CityPickerDialog';
import DatePickerDialog from './DatePickerDialog';
import { Toggle } from './BusUI';

export interface BusSearchValues {
  from: string;
  to: string;
  date: string;
  women: boolean;
}

interface Props {
  initial?: Partial<BusSearchValues>;
  onSearch: (values: BusSearchValues) => void;
  submitLabel?: string;
}

export const BusSearchCard: React.FC<Props> = ({ initial, onSearch, submitLabel = 'Search Buses' }) => {
  const today = todayISO();
  const [values, setValues] = useState<BusSearchValues>({
    from: initial?.from ?? '',
    to: initial?.to ?? '',
    date: initial?.date && initial.date >= today ? initial.date : today,
    women: initial?.women ?? false,
  });
  const [picker, setPicker] = useState<'from' | 'to' | 'date' | null>(null);
  const [error, setError] = useState('');
  const [swapSpin, setSwapSpin] = useState(false);

  const fromCity = getCity(values.from);
  const toCity = getCity(values.to);
  const tomorrow = addDaysISO(today, 1);

  const update = (patch: Partial<BusSearchValues>) => {
    setValues((v) => ({ ...v, ...patch }));
    setError('');
  };

  const swap = () => {
    setSwapSpin((s) => !s);
    update({ from: values.to, to: values.from });
  };

  const submit = () => {
    if (!values.from) return setError('Please select a source city');
    if (!values.to) return setError('Please select a destination city');
    onSearch(values);
  };

  const cityField = (kind: 'from' | 'to') => {
    const city = kind === 'from' ? fromCity : toCity;
    const Icon = kind === 'from' ? MapPin : Navigation;
    return (
      <button
        type="button"
        onClick={() => setPicker(kind)}
        className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FBF7FA] sm:py-5 lg:px-6 ${kind === 'to' ? 'lg:pl-12' : ''}`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEC] text-[#D62839] transition group-hover:bg-[#1C0E28] group-hover:text-white">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 pr-12 lg:pr-6">
          <span className="bus-eyebrow block">{kind === 'from' ? 'From' : 'To'}</span>
          <span className={`mt-0.5 block truncate tracking-tight ${city ? 'text-[22px] font-extrabold text-[#1C0E28]' : 'text-lg font-semibold text-[#A295A6]'}`}>
            {city ? city.name : kind === 'from' ? 'Select source city' : 'Select destination city'}
          </span>
          {city && <span className="block truncate text-xs text-[#8D8092]">{city.state}</span>}
        </span>
      </button>
    );
  };

  const dayChip = (iso: string, label: string, className = '') => {
    const active = values.date === iso;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => update({ date: iso })}
        className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
          active ? 'bg-[#1C0E28] text-white' : 'bg-[#F4EFF3] text-[#5B4D66] hover:bg-[#E9E1E8]'
        } ${className}`}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <div className="bus-card overflow-hidden !rounded-[30px] shadow-[0_30px_70px_-30px_rgba(28,14,40,0.45)]">
        <div className="grid lg:grid-cols-[1fr_1fr_1.15fr]">
          {/* From / To with swap */}
          <div className="relative grid divide-y divide-[#F3EDF1] lg:col-span-2 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {cityField('from')}
            {cityField('to')}
            <button
              type="button"
              onClick={swap}
              aria-label="Swap source and destination"
              className="absolute top-1/2 right-5 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#1C0E28] text-white shadow-[0_10px_22px_-8px_rgba(28,14,40,0.8)] ring-4 ring-white transition hover:bg-[#D62839] active:scale-95 lg:right-auto lg:left-1/2 lg:-translate-x-1/2"
            >
              <ArrowUpDown
                className={`h-[18px] w-[18px] transition-transform duration-300 lg:rotate-90 ${swapSpin ? 'rotate-180 lg:rotate-[270deg]' : ''}`}
                strokeWidth={2.4}
              />
            </button>
          </div>

          {/* Date */}
          <div className="flex w-full items-center gap-2 border-t border-[#F3EDF1] pr-3 transition hover:bg-[#FBF7FA] lg:border-t-0 lg:border-l">
            <button type="button" onClick={() => setPicker('date')} className="group flex min-w-0 flex-1 items-center gap-4 py-4 pl-5 text-left sm:py-5 lg:pl-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEC] text-[#D62839] transition group-hover:bg-[#1C0E28] group-hover:text-white">
                <CalendarDays className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="bus-eyebrow block">Date of Journey</span>
                <span className="mt-0.5 block truncate text-[22px] font-extrabold tracking-tight text-[#1C0E28]">{formatJourneyDate(values.date)}</span>
                <span className="block truncate text-[11px] text-[#A295A6]">Tap to choose travel date</span>
              </span>
            </button>
            {dayChip(today, 'Today')}
            {dayChip(tomorrow, 'Tomorrow', 'hidden sm:inline-flex lg:hidden xl:inline-flex')}
            <button
              type="button"
              onClick={() => setPicker('date')}
              aria-label="Choose travel date"
              className="flex h-9 w-7 shrink-0 items-center justify-center text-[#8D8092]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Women + submit */}
        <div className="flex flex-col gap-3 border-t border-[#F3EDF1] bg-[#FDFAFB] p-4 sm:flex-row sm:items-center sm:px-5 lg:px-6">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#EFE8EE] bg-white px-4 py-3 sm:border-0 sm:bg-transparent sm:p-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FDE9EF] text-[#BE185D]">
              <Woman2Icon sx={{ fontSize: 22 }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-[#1C0E28]">Booking for Women</span>
              <span className="block text-xs text-[#8D8092]">Highlights women-friendly buses &amp; reserved seats</span>
            </span>
            <Toggle checked={values.women} onChange={(women) => update({ women })} label="Booking for women" />
          </div>
          <button type="button" onClick={submit} className="bus-cta bus-focus inline-flex items-center justify-center gap-2 rounded-2xl px-9 py-4 text-[15px] font-extrabold sm:min-w-[230px]">
            <Search className="h-[18px] w-[18px]" strokeWidth={2.6} />
            {submitLabel}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="bus-fade mt-3 rounded-2xl border border-[#F8CFCF] bg-[#FEF4F4] px-4 py-3 text-sm font-semibold text-[#B3123A]">
          {error}
        </p>
      )}

      <CityPickerDialog
        open={picker === 'from' || picker === 'to'}
        title={picker === 'to' ? 'Select destination city' : 'Select source city'}
        excludeId={picker === 'to' ? values.from : values.to}
        onClose={() => setPicker(null)}
        onSelect={(city) => {
          update(picker === 'to' ? { to: city.id } : { from: city.id });
          setPicker(picker === 'from' && !values.to ? 'to' : null);
        }}
      />
      <DatePickerDialog
        open={picker === 'date'}
        value={values.date}
        onClose={() => setPicker(null)}
        onSelect={(date) => {
          update({ date });
          setPicker(null);
        }}
      />
    </>
  );
};

export default BusSearchCard;
