// src/modules/bus/components/BusResultCard.tsx
// Each result is a ticket: journey on the left, a perforated fare stub on the right.
import React, { useEffect, useState } from 'react';
import { BusFront, ChevronDown, MapPin, Navigation } from 'lucide-react';
import Woman2Icon from '@mui/icons-material/Woman2';
import type { BusTrip, BusTripDetails } from '../busTypes';
import { AMENITY_LABELS, formatDuration, formatINR, getCity, getTripDetails, getTripDetailsSync } from '../busService';
import { AMENITY_ICONS, RatingBadge } from './BusUI';

interface Props {
  trip: BusTrip;
  highlightWomen?: boolean;
  onViewSeats: (trip: BusTrip) => void;
}

const TABS = ['Amenities', 'Boarding & Dropping', 'Cancellation'] as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const BusResultCard: React.FC<Props> = ({ trip, highlightWomen, onViewSeats }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Amenities');
  const [details, setDetails] = useState<BusTripDetails | null>(() => (open ? getTripDetailsSync(trip.id) : null));

  useEffect(() => {
    if (open) {
      const sync = getTripDetailsSync(trip.id);
      if (sync) setDetails(sync);
      getTripDetails(trip.id).then((d) => {
        if (d) setDetails(d);
      });
    }
  }, [open, trip.id]);
  const fromCity = getCity(trip.fromCityId);
  const toCity = getCity(trip.toCityId);
  const lowSeats = trip.seatsLeft <= 10;

  return (
    <article className="bus-card bus-lift bus-rise">
      <div className="grid md:grid-cols-[minmax(0,1fr)_232px]">
        {/* Journey */}
        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2B1740] to-[#5C1A35] text-[13px] font-extrabold tracking-wide text-white">
              {initials(trip.operator)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-extrabold tracking-tight text-[#1C0E28] sm:text-[17px]">{trip.operator}</h3>
              <p className="mt-0.5 truncate text-xs font-medium text-[#8D8092]">{trip.busType}</p>
            </div>
            <RatingBadge rating={trip.rating} count={trip.ratingsCount} />
          </div>

          <div className="mt-5 flex items-center gap-3 sm:gap-5">
            <div>
              <p className="bus-num text-2xl font-extrabold text-[#1C0E28] sm:text-[30px] sm:leading-none">{trip.departure}</p>
              <p className="mt-1 text-xs font-semibold text-[#8D8092]">{fromCity?.name}</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <span className="text-[11px] font-bold text-[#5B4D66]">{formatDuration(trip.durationMins)}</span>
              <span className="relative my-3.5 block h-0.5 w-full rounded-full bg-gradient-to-r from-[#E2DAE5] via-[#F0A58F] to-[#D62839]">
                <span className="absolute -top-[3px] left-0 h-2 w-2 rounded-full border-2 border-[#CFC4D3] bg-white" />
                <span className="absolute top-1/2 left-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#D62839] shadow-[0_2px_8px_rgba(28,14,40,0.18)]">
                  <BusFront className="h-3.5 w-3.5" />
                </span>
                <span className="absolute -top-[3px] right-0 h-2 w-2 rounded-full bg-[#D62839]" />
              </span>
              <span className="text-[10.5px] font-semibold text-[#A295A6]">{trip.ac ? 'A/C' : 'Non A/C'}</span>
            </div>
            <div className="text-right">
              <p className="bus-num text-2xl font-extrabold text-[#1C0E28] sm:text-[30px] sm:leading-none">
                {trip.arrival}
                {trip.arrivalDayOffset > 0 && <sup className="ml-0.5 text-[10px] font-extrabold text-[#D62839]">+{trip.arrivalDayOffset}</sup>}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#8D8092]">{toCity?.name}</p>
            </div>
          </div>

          {(trip.tags.length > 0 || (highlightWomen && trip.womenFriendly)) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {highlightWomen && trip.womenFriendly && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#FDE9EF] px-2 py-1 text-[10.5px] font-bold text-[#BE185D]">
                  <Woman2Icon sx={{ fontSize: 12 }} /> Women friendly
                </span>
              )}
              {trip.tags
                .filter((t) => !(highlightWomen && t === 'Women Friendly'))
                .map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-bold ${
                      t === 'Primo' ? 'bg-gradient-to-r from-[#F7DEA4] to-[#EFC56B] text-[#5F3B0C]' : t === 'Live Tracking' ? 'bg-[#EEF3FF] text-[#2B4FCB]' : 'bg-[#F4EFF3] text-[#6B4F7A]'
                    }`}
                  >
                    {t === 'Live Tracking' && <Navigation className="h-2.5 w-2.5" />}
                    {t}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Fare stub */}
        <div className="bus-perf-x flex items-center justify-between gap-4 rounded-b-[24px] bg-[#FFFAF7] p-4 sm:px-6 md:hidden">
          <div>
            <p className="bus-eyebrow">From</p>
            <p className="bus-num text-[22px] leading-tight font-extrabold text-[#1C0E28]">{formatINR(trip.fare)}</p>
            <p className={`text-[10.5px] font-extrabold ${lowSeats ? 'text-[#D62839]' : 'text-[#15803D]'}`}>{trip.seatsLeft} seats left</p>
          </div>
          <button type="button" onClick={() => onViewSeats(trip)} className="bus-cta bus-focus rounded-2xl px-6 py-3 text-sm font-extrabold">
            View Seats
          </button>
        </div>
        <div className="bus-perf-y hidden flex-col justify-center rounded-tr-[24px] bg-[#FFFAF7] p-6 md:flex">
          <p className="bus-eyebrow">Starts from</p>
          <p className="bus-num mt-1 text-[32px] leading-none font-extrabold text-[#1C0E28]">{formatINR(trip.fare)}</p>
          <p className={`mt-2 text-[11px] font-extrabold ${lowSeats ? 'text-[#D62839]' : 'text-[#15803D]'}`}>{trip.seatsLeft} seats left</p>
          <button type="button" onClick={() => onViewSeats(trip)} className="bus-cta bus-focus mt-4 w-full rounded-2xl px-4 py-3 text-sm font-extrabold">
            View Seats
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-b-[24px] border-t border-[#F3EDF1] px-4 py-3 text-left text-[13px] font-bold text-[#5B3A78] transition hover:bg-[#FBF7FA] sm:px-6"
      >
        <span>About Bus</span>
        <span className="flex items-center gap-3">
          <span className="hidden gap-2.5 text-[#B3A7B8] sm:flex">
            {trip.amenities.slice(0, 6).map((a) => {
              const Icon = AMENITY_ICONS[a];
              return <Icon key={a} className="h-3.5 w-3.5" aria-label={AMENITY_LABELS[a]} />;
            })}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && details && (
        <div className="bus-fade border-t border-[#F3EDF1] px-4 pt-4 pb-5 sm:px-6">
          <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#F4EFF3] p-1 no-scrollbar" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${tab === t ? 'bg-white text-[#1C0E28] shadow-sm' : 'text-[#6F6175] hover:text-[#1C0E28]'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Amenities' && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {trip.amenities.map((a) => {
                const Icon = AMENITY_ICONS[a];
                return (
                  <span key={a} className="flex items-center gap-2 rounded-xl border border-[#F1EAF0] px-3 py-2.5 text-xs font-semibold text-[#1C0E28]">
                    <Icon className="h-4 w-4 text-[#D62839]" /> {AMENITY_LABELS[a]}
                  </span>
                );
              })}
            </div>
          )}

          {tab === 'Boarding & Dropping' && (
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {[
                { label: `Boarding in ${fromCity?.name}`, points: details.boardingPoints },
                { label: `Dropping in ${toCity?.name}`, points: details.droppingPoints },
              ].map((g) => (
                <div key={g.label}>
                  <p className="bus-eyebrow mb-2">{g.label}</p>
                  <ul className="space-y-2">
                    {g.points.slice(0, 4).map((p) => (
                      <li key={p.id} className="flex gap-2.5 text-xs">
                        <span className="bus-num w-10 shrink-0 font-bold text-[#1C0E28]">{p.time}</span>
                        <span className="flex min-w-0 items-start gap-1 text-[#5B4D66]">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#D62839]" />
                          <span className="truncate">{p.name}</span>
                        </span>
                      </li>
                    ))}
                    {g.points.length > 4 && <li className="text-xs font-semibold text-[#9A8C9F]">+{g.points.length - 4} more</li>}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {tab === 'Cancellation' && (
            <table className="mt-3 w-full text-left text-xs">
              <tbody>
                {details.cancellationPolicy.map((c) => (
                  <tr key={c.window} className="border-b border-[#F3EDF1] last:border-0">
                    <td className="py-2.5 pr-3 text-[#5B4D66]">{c.window}</td>
                    <td className="py-2.5 text-right font-bold text-[#1C0E28]">{c.charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </article>
  );
};

export const BusResultCardSkeleton = () => (
  <div className="bus-card animate-pulse p-6">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-2xl bg-[#F1ECF2]" />
      <div>
        <div className="h-4 w-40 rounded bg-[#F1ECF2]" />
        <div className="mt-2 h-3 w-28 rounded bg-[#F6F2F5]" />
      </div>
    </div>
    <div className="mt-6 flex items-center gap-4">
      <div className="h-8 w-20 rounded bg-[#F1ECF2]" />
      <div className="h-0.5 flex-1 bg-[#F1ECF2]" />
      <div className="h-8 w-20 rounded bg-[#F1ECF2]" />
    </div>
  </div>
);

export default BusResultCard;
