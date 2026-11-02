// src/modules/bus/BusResultsPage.tsx
// Search results: date strip, sort, filters (sidebar on desktop, sheet on mobile) and bus cards.
import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, BusFront, Moon, Pencil, SlidersHorizontal, Sun, Sunrise, Sunset } from 'lucide-react';
import Woman2Icon from '@mui/icons-material/Woman2';
import type { BusTrip } from './busTypes';
import { addDaysISO, formatJourneyDate, fromISODate, getCity, searchBuses, timeToMins, todayISO } from './busService';
import { BusFlowHeader, BusPageShell, BusSheet, PrimaryButton } from './components/BusUI';
import BusResultCard, { BusResultCardSkeleton } from './components/BusResultCard';
import BusSearchCard from './components/BusSearchCard';
import { buildResultsUrl, saveRecentSearch } from './BusHomePage';

type SortKey = 'departure' | 'price' | 'duration' | 'rating';
type TypeKey = 'ac' | 'nonac' | 'sleeper' | 'seater';
type SlotKey = 'early' | 'morning' | 'afternoon' | 'night';

interface Filters {
  types: TypeKey[];
  slots: SlotKey[];
  operators: string[];
  womenFriendly: boolean;
  liveTracking: boolean;
}

const EMPTY_FILTERS: Filters = { types: [], slots: [], operators: [], womenFriendly: false, liveTracking: false };

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'departure', label: 'Departure' },
  { key: 'price', label: 'Cheapest' },
  { key: 'duration', label: 'Fastest' },
  { key: 'rating', label: 'Top rated' },
];

const TYPE_OPTS: { key: TypeKey; label: string }[] = [
  { key: 'ac', label: 'A/C' },
  { key: 'nonac', label: 'Non A/C' },
  { key: 'sleeper', label: 'Sleeper' },
  { key: 'seater', label: 'Seater' },
];

const SLOT_OPTS: { key: SlotKey; label: string; range: string; icon: React.ComponentType<{ className?: string }>; from: number; to: number }[] = [
  { key: 'early', label: 'Before 6 AM', range: '00:00 – 06:00', icon: Sunrise, from: 0, to: 360 },
  { key: 'morning', label: '6 AM – 12 PM', range: '06:00 – 12:00', icon: Sun, from: 360, to: 720 },
  { key: 'afternoon', label: '12 PM – 6 PM', range: '12:00 – 18:00', icon: Sunset, from: 720, to: 1080 },
  { key: 'night', label: 'After 6 PM', range: '18:00 – 24:00', icon: Moon, from: 1080, to: 1440 },
];

const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

const applyFilters = (trips: BusTrip[], f: Filters) =>
  trips.filter((t) => {
    if (f.types.length) {
      const acOk = !f.types.some((x) => x === 'ac' || x === 'nonac') || (f.types.includes('ac') && t.ac) || (f.types.includes('nonac') && !t.ac);
      const layoutOk =
        !f.types.some((x) => x === 'sleeper' || x === 'seater') ||
        (f.types.includes('sleeper') && t.layout === 'sleeper') ||
        (f.types.includes('seater') && t.layout === 'seater');
      if (!acOk || !layoutOk) return false;
    }
    if (f.slots.length) {
      const m = timeToMins(t.departure);
      if (!f.slots.some((s) => SLOT_OPTS.find((o) => o.key === s)!.from <= m && m < SLOT_OPTS.find((o) => o.key === s)!.to)) return false;
    }
    if (f.operators.length && !f.operators.includes(t.operator)) return false;
    if (f.womenFriendly && !t.womenFriendly) return false;
    if (f.liveTracking && !t.liveTracking) return false;
    return true;
  });

const sortTrips = (trips: BusTrip[], key: SortKey) =>
  [...trips].sort((a, b) => {
    if (key === 'price') return a.fare - b.fare;
    if (key === 'duration') return a.durationMins - b.durationMins;
    if (key === 'rating') return b.rating - a.rating;
    return timeToMins(a.departure) - timeToMins(b.departure);
  });

const countFilters = (f: Filters) => f.types.length + f.slots.length + f.operators.length + Number(f.womenFriendly) + Number(f.liveTracking);

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; className?: string }> = ({ active, onClick, children, className = '' }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
      active ? 'border-[#1C0E28] bg-[#1C0E28] text-white' : 'border-[#E7DFE9] bg-white text-[#3D3047] hover:border-[#1C0E28]/40'
    } ${className}`}
  >
    {children}
  </button>
);

const FilterPanel: React.FC<{ filters: Filters; setFilters: (f: Filters) => void; operators: string[] }> = ({ filters, setFilters, operators }) => (
  <div className="space-y-6">
    <div>
      <p className="bus-eyebrow mb-2.5">Bus type</p>
      <div className="grid grid-cols-2 gap-2">
        {TYPE_OPTS.map((o) => (
          <Chip key={o.key} active={filters.types.includes(o.key)} onClick={() => setFilters({ ...filters, types: toggleIn(filters.types, o.key) })}>
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
    <div>
      <p className="bus-eyebrow mb-2.5">Departure time</p>
      <div className="grid grid-cols-2 gap-2">
        {SLOT_OPTS.map(({ key, label, icon: Icon }) => (
          <Chip
            key={key}
            active={filters.slots.includes(key)}
            onClick={() => setFilters({ ...filters, slots: toggleIn(filters.slots, key) })}
            className="flex-col !py-2.5"
          >
            <Icon className="h-4 w-4" />
            <span className="text-[11px]">{label}</span>
          </Chip>
        ))}
      </div>
    </div>
    <div>
      <p className="bus-eyebrow mb-2.5">Preferences</p>
      <div className="space-y-2">
        {[
          { key: 'womenFriendly' as const, label: 'Women friendly' },
          { key: 'liveTracking' as const, label: 'Live tracking' },
        ].map((o) => (
          <label key={o.key} className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1 text-sm font-semibold text-[#1C0E28]">
            <input
              type="checkbox"
              checked={filters[o.key]}
              onChange={() => setFilters({ ...filters, [o.key]: !filters[o.key] })}
              className="h-4 w-4 accent-[#D62839]"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
    <div>
      <p className="bus-eyebrow mb-2.5">Operators</p>
      <div className="space-y-1">
        {operators.map((op) => (
          <label key={op} className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1.5 text-[13px] font-semibold text-[#3D3047]">
            <input
              type="checkbox"
              checked={filters.operators.includes(op)}
              onChange={() => setFilters({ ...filters, operators: toggleIn(filters.operators, op) })}
              className="h-4 w-4 accent-[#D62839]"
            />
            <span className="truncate">{op}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export const BusResultsPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const rawDate = params.get('date') ?? '';
  const women = params.get('women') === '1';
  const today = todayISO();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && rawDate >= today ? rawDate : today;

  const [sort, setSort] = useState<SortKey>('departure');
  const [filters, setFilters] = useState<Filters>(() => ({ ...EMPTY_FILTERS, womenFriendly: women }));
  const [sheet, setSheet] = useState<'filters' | 'modify' | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<BusTrip[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (!getCity(from) || !getCity(to)) {
      setTrips([]);
      setLoading(false);
      return;
    }

    searchBuses(from, to, date)
      .then((res) => {
        if (!cancelled) {
          setTrips(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to search buses:', err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [from, to, date]);
  const operators = useMemo(() => [...new Set(trips.map((t) => t.operator))].sort(), [trips]);
  const visible = useMemo(() => sortTrips(applyFilters(trips, filters), sort), [trips, filters, sort]);
  const activeCount = countFilters(filters);

  if (!getCity(from) || !getCity(to)) return <Navigate to="/bus" replace />;

  const fromName = getCity(from)!.name;
  const toName = getCity(to)!.name;
  const go = (patch: Partial<{ from: string; to: string; date: string; women: boolean }>) =>
    navigate(buildResultsUrl({ from, to, date, women, ...patch }), { replace: true });

  const dates = Array.from({ length: 7 }, (_, i) => addDaysISO(date, i - 2)).filter((d) => d >= today);

  return (
    <BusPageShell
      header={
        <BusFlowHeader
          to="/bus"
          title={
            <span className="flex items-center gap-2 sm:gap-3">
              {fromName} <span className="text-[#F0A58F]">→</span> {toName}
            </span>
          }
          subtitle={`${formatJourneyDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${trips.length} buses`}
          right={
            <button
              type="button"
              onClick={() => setSheet('modify')}
              className="bus-glass inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-3 text-[13px] font-bold text-white transition hover:bg-white/20"
            >
              <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Modify search</span>
              <span className="sr-only sm:hidden">Modify search</span>
            </button>
          }
        >
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
            {dates.map((d) => {
              const active = d === date;
              const dt = fromISODate(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => go({ date: d })}
                  aria-pressed={active}
                  className={`min-w-[76px] shrink-0 rounded-2xl px-3 py-2.5 text-center transition sm:min-w-[104px] ${
                    active ? 'bg-white text-[#1C0E28] shadow-[0_12px_26px_-12px_rgba(0,0,0,0.7)]' : 'bus-glass text-white hover:bg-white/20'
                  }`}
                >
                  <span className={`block text-[11px] font-semibold ${active ? 'text-[#8D8092]' : 'text-white/60'}`}>
                    {d === today ? 'Today' : dt.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </span>
                  <span className="block text-sm font-extrabold">{dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </button>
              );
            })}
          </div>
        </BusFlowHeader>
      }
    >
      {women && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#F9D3E0] bg-gradient-to-r from-[#FDEEF3] to-white px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FCE7F3] text-[#BE185D]">
            <Woman2Icon sx={{ fontSize: 20 }} />
          </span>
          <p className="text-[13px] font-semibold text-[#831843]">
            Booking for women — showing women-friendly buses. Seats reserved for women are highlighted in pink.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[272px_minmax(0,1fr)]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="bus-card sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#1C0E28]">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h2>
              {activeCount > 0 && (
                <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs font-bold text-[#DC2626] hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} operators={operators} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Sort + mobile filter */}
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheet('filters')}
              className="relative inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E7DFE9] bg-white px-3 py-2 text-xs font-bold text-[#1C0E28] lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {activeCount > 0 && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#D62839] px-1 text-[10px] text-white">{activeCount}</span>
              )}
            </button>
            <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-[#776B80] sm:inline-flex">
                <ArrowUpDown className="h-3.5 w-3.5" /> Sort by
              </span>
              {SORTS.map((s) => (
                <Chip key={s.key} active={sort === s.key} onClick={() => setSort(s.key)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          {!loading && (
            <p className="mb-3 text-xs font-semibold text-[#776B80]">
              Showing <strong className="text-[#1C0E28]">{visible.length}</strong> of {trips.length} buses
            </p>
          )}

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }, (_, i) => <BusResultCardSkeleton key={i} />)
            ) : visible.length ? (
              visible.map((trip) => (
                <BusResultCard
                  key={trip.id}
                  trip={trip}
                  highlightWomen={women}
                  onViewSeats={(t) => navigate(`/bus/trip/${encodeURIComponent(t.id)}${women ? '?women=1' : ''}`)}
                />
              ))
            ) : (
              <div className="bus-card bus-rise flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
                  <BusFront className="h-7 w-7" />
                </span>
                <p className="mt-4 text-base font-extrabold text-[#1C0E28]">No buses match these filters</p>
                <p className="mt-1 text-sm text-[#776B80]">Try removing a filter or picking another date.</p>
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="mt-5 rounded-xl border-2 border-[#DC2626] px-5 py-2 text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BusSheet
        open={sheet === 'filters'}
        onClose={() => setSheet(null)}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="flex-1 rounded-2xl border border-[#E4DCE9] py-3.5 text-sm font-bold text-[#1C0E28] hover:bg-[#F6F2F8]"
            >
              Clear all
            </button>
            <PrimaryButton className="flex-[2]" onClick={() => setSheet(null)}>
              Show {visible.length} buses
            </PrimaryButton>
          </div>
        }
      >
        <div className="p-5">
          <FilterPanel filters={filters} setFilters={setFilters} operators={operators} />
        </div>
      </BusSheet>

      <BusSheet open={sheet === 'modify'} onClose={() => setSheet(null)} title="Modify search" size="lg">
        <div className="p-4 pt-1 sm:p-6 sm:pt-1">
          <BusSearchCard
            key={`${from}-${to}-${date}-${women}`}
            initial={{ from, to, date, women }}
            submitLabel="Update Search"
            onSearch={(v) => {
              saveRecentSearch(v);
              setFilters({ ...EMPTY_FILTERS, womenFriendly: v.women });
              setSheet(null);
              navigate(buildResultsUrl(v), { replace: true });
            }}
          />
        </div>
      </BusSheet>
    </BusPageShell>
  );
};

export default BusResultsPage;
