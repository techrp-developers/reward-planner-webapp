// src/modules/bus/components/CityPickerDialog.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Search, TrendingUp } from 'lucide-react';
import { BUS_CITIES, loadBusCities } from '../busService';
import type { BusCity } from '../busTypes';
import { BusSheet } from './BusUI';

interface Props {
  open: boolean;
  title: string;
  excludeId?: string;
  onClose: () => void;
  onSelect: (city: BusCity) => void;
}

export const CityPickerDialog: React.FC<Props> = ({ open, title, excludeId, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<BusCity[]>(BUS_CITIES);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCities(BUS_CITIES);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, title]); // the dialog stays open when moving from source to destination

  useEffect(() => {
    if (!open) return;
    const cleanQ = query.trim();
    if (!cleanQ) {
      setCities(BUS_CITIES);
      return;
    }
    const t = setTimeout(() => {
      loadBusCities(cleanQ).then((res) => {
        if (res && res.length) setCities(res);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cities
      .filter((c) => c.id !== excludeId)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [query, excludeId, cities]);

  const popular = results.filter((c) => c.popular);
  const others = (query ? results : results.filter((c) => !c.popular)).slice(0, 30);

  const Row = ({ city }: { city: BusCity }) => (
    <li>
      <button
        type="button"
        onClick={() => onSelect(city)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[#FBF3F2] focus-visible:bg-[#FBF3F2] focus-visible:outline-none"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDECEC] text-[#D62839]">
          <MapPin className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-[#1C0E28]">{city.name}</span>
          <span className="block truncate text-xs text-[#776B80]">{city.state}</span>
        </span>
      </button>
    </li>
  );

  return (
    <BusSheet open={open} onClose={onClose} title={title}>
      <div className="sticky top-0 z-10 bg-white px-5 pt-4 pb-3">
        <label className="flex items-center gap-2.5 rounded-2xl border border-[#E7DFE9] bg-[#FBF7FA] px-4 py-3.5 transition focus-within:border-[#D62839] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#D62839]/10">
          <Search className="h-4 w-4 text-[#776B80]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or state"
            className="w-full bg-transparent text-sm font-semibold text-[#1C0E28] outline-none placeholder:font-medium placeholder:text-[#9B8FA5]"
            aria-label="Search city"
          />
        </label>
      </div>
      <div className="px-3 pb-5">
        {!query && popular.length > 0 && (
          <>
            <p className="flex items-center gap-1.5 px-3 pt-1 pb-2 text-[11px] font-bold tracking-wider text-[#9B8FA5] uppercase">
              <TrendingUp className="h-3.5 w-3.5" /> Popular cities
            </p>
            <div className="grid grid-cols-2 gap-2 px-2 pb-3 sm:grid-cols-4">
              {popular.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c)}
                  className="truncate rounded-xl border border-[#EFE8EE] bg-white px-3 py-2.5 text-[13px] font-bold text-[#1C0E28] transition hover:border-[#1C0E28] hover:bg-[#1C0E28] hover:text-white"
                >
                  {c.name}
                </button>
              ))}
            </div>
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-[#9B8FA5] uppercase">All cities</p>
          </>
        )}
        <ul>
          {others.map((c) => (
            <Row key={c.id} city={c} />
          ))}
        </ul>
        {results.length === 0 && (
          <p className="px-4 py-10 text-center text-sm font-medium text-[#776B80]">No cities match “{query}”.</p>
        )}
      </div>
    </BusSheet>
  );
};

export default CityPickerDialog;
