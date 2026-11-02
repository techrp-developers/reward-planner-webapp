// src/modules/bus/BusConfirmationPage.tsx
// Booking success + e-ticket styled as a boarding pass. Reads the booking from navigation state (sample flow only).
import React, { useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, BusFront, Check, Download, Headphones, Navigation, Share2, Sparkles } from 'lucide-react';
import type { BusBookingConfirmation } from './busTypes';
import { formatDuration, formatJourneyDate, getCity } from './busService';
import { BusPageShell } from './components/BusUI';
import { FareLines, JourneyTimeline } from './components/TripSummary';

const CONFETTI = ['#F0534A', '#F4C95D', '#8665FF', '#FFFFFF', '#FB8A7E'];

// Decorative barcode derived from the PNR so each pass looks unique
const Barcode: React.FC<{ value: string }> = ({ value }) => {
  const bars = useMemo(
    () => Array.from({ length: 34 }, (_, i) => 1 + ((value.charCodeAt(i % value.length) * (i + 3)) % 3)),
    [value],
  );
  return (
    <div className="flex h-12 items-stretch justify-center gap-[2px]" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className="bg-[#1C0E28]" style={{ width: w }} />
      ))}
    </div>
  );
};

export const BusConfirmationPage = () => {
  const { state } = useLocation() as { state: BusBookingConfirmation | null };
  const [copied, setCopied] = useState(false);
  if (!state?.pnr) return <Navigate to="/bus" replace />;

  const { trip, seats, passengers, boarding, dropping, contact, totals, pnr, ticketNo } = state;
  const fromName = getCity(trip.fromCityId)?.name;
  const toName = getCity(trip.toCityId)?.name;

  const share = async () => {
    const text = `Bus ticket ${pnr}: ${fromName} → ${toName}, ${formatJourneyDate(trip.date)} ${boarding.time} from ${boarding.name}. Seats ${seats
      .map((s) => s.label)
      .join(', ')}.`;
    try {
      if (navigator.share) await navigator.share({ title: 'My bus ticket', text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share sheet
    }
  };

  const actionClass =
    'bus-lift flex flex-col items-center gap-2 rounded-2xl border border-[#EFE8EE] bg-white py-4 text-xs font-bold text-[#1C0E28] disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <BusPageShell
      header={
        <section className="bus-band pb-32 print:hidden">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 22 }, (_, i) => (
              <span
                key={i}
                className="bus-confetti"
                style={{ left: `${(i * 4.6 + 2) % 100}%`, background: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 7) * 0.13}s` }}
              />
            ))}
          </div>
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-10 text-center sm:pt-14">
            <span className="bus-rise flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#4ADE80] to-[#15803D] text-white shadow-[0_0_0_10px_rgba(74,222,128,0.14),0_18px_40px_-10px_rgba(21,128,61,0.8)]">
              <Check className="h-9 w-9" strokeWidth={3} />
            </span>
            <h1 className="mt-6 text-[28px] font-extrabold tracking-tight sm:text-[40px] sm:leading-tight">Booking confirmed!</h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Your e-ticket has been sent to <strong className="text-white">{contact.email}</strong>. Have a safe journey!
            </p>
            <span className="bus-glass mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-[#F7DEA4]">
              <Sparkles className="h-3.5 w-3.5" /> You earned {Math.round(totals.total * 0.02)} RP Points
            </span>
          </div>
        </section>
      }
    >
      <div className="relative z-10 mx-auto -mt-24 max-w-3xl pb-6 print:mt-0">
        {/* Boarding pass */}
        <article className="bus-card bus-rise overflow-visible shadow-[0_34px_70px_-34px_rgba(28,14,40,0.5)] print:shadow-none">
          <div className="grid md:grid-cols-[minmax(0,1fr)_216px]">
            <div className="min-w-0 p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="bus-eyebrow">Operator</p>
                  <p className="truncate text-sm font-extrabold text-[#1C0E28]">{trip.operator}</p>
                </div>
                <span className="rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-extrabold text-[#166534]">Confirmed</span>
              </div>

              <div className="mt-6 flex items-center gap-3 sm:gap-5">
                <div>
                  <p className="bus-num text-[30px] leading-none font-extrabold text-[#1C0E28] sm:text-[38px]">{boarding.time}</p>
                  <p className="mt-1.5 text-sm font-bold text-[#5B4D66]">{fromName}</p>
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-center">
                  <span className="relative my-2 block h-0.5 w-full rounded-full bg-gradient-to-r from-[#E2DAE5] via-[#F0A58F] to-[#D62839]">
                    <span className="absolute top-1/2 left-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#D62839] shadow-[0_2px_8px_rgba(28,14,40,0.2)]">
                      <BusFront className="h-4 w-4" />
                    </span>
                  </span>
                  <span className="mt-2 text-[11px] font-bold text-[#8D8092]">{formatDuration(trip.durationMins)}</span>
                </div>
                <div className="text-right">
                  <p className="bus-num text-[30px] leading-none font-extrabold text-[#1C0E28] sm:text-[38px]">{dropping.time}</p>
                  <p className="mt-1.5 text-sm font-bold text-[#5B4D66]">{toName}</p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { k: 'Date', v: formatJourneyDate(trip.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
                  { k: 'Seats', v: seats.map((s) => s.label).join(', ') },
                  { k: 'Bus', v: trip.busType },
                ].map((x) => (
                  <div key={x.k} className={x.k === 'Bus' ? 'col-span-2 min-w-0 sm:col-span-1' : 'min-w-0'}>
                    <dt className="bus-eyebrow">{x.k}</dt>
                    <dd className="mt-0.5 truncate text-sm font-extrabold text-[#1C0E28]">{x.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bus-perf-x flex flex-col items-center justify-center bg-[#FFFAF7] p-5 text-center md:hidden">
              <p className="bus-eyebrow">PNR</p>
              <p className="bus-num mb-3 text-xl font-extrabold tracking-wider text-[#1C0E28]">{pnr}</p>
              <Barcode value={pnr} />
              <p className="mt-2 text-[11px] font-semibold text-[#8D8092]">{ticketNo}</p>
            </div>
            <div className="bus-perf-y hidden flex-col items-center justify-center rounded-tr-[24px] bg-[#FFFAF7] p-5 text-center md:flex">
              <p className="bus-eyebrow">PNR</p>
              <p className="bus-num mb-4 text-xl font-extrabold tracking-wider text-[#1C0E28]">{pnr}</p>
              <Barcode value={pnr} />
              <p className="mt-3 bus-eyebrow">Ticket no.</p>
              <p className="text-xs font-bold text-[#1C0E28]">{ticketNo}</p>
            </div>
          </div>

          <div className="bus-perf-x grid gap-7 p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <p className="bus-eyebrow mb-3">Journey</p>
              <JourneyTimeline trip={trip} boarding={boarding} dropping={dropping} />
            </div>
            <div>
              <p className="bus-eyebrow mb-3">Travellers</p>
              <ul className="space-y-3">
                {passengers.map((p) => (
                  <li key={p.seatId} className="flex items-center gap-3 text-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2B1740] to-[#5C1A35] text-[11px] font-extrabold text-white">
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-[#1C0E28]">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-xs text-[#8D8092]">
                        {p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-[#FDECEC] px-2 py-1 text-xs font-extrabold text-[#B3123A]">
                      {seats.find((s) => s.id === p.seatId)?.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl bg-[#FBF7FA] p-4">
                <FareLines seats={seats} fare={totals} totalLabel="Total paid" />
              </div>
            </div>
          </div>
        </article>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
          {[
            { label: 'Download', icon: Download, onClick: () => window.print() },
            { label: copied ? 'Copied!' : 'Share', icon: Share2, onClick: share },
            { label: 'Track bus', icon: Navigation, onClick: undefined },
            { label: 'Help', icon: Headphones, to: '/customer-support' },
          ].map(({ label, icon: Icon, onClick, to }) =>
            to ? (
              <Link key={label} to={to} className={actionClass}>
                <Icon className="h-5 w-5 text-[#D62839]" /> {label}
              </Link>
            ) : (
              <button
                key={label}
                type="button"
                onClick={onClick}
                disabled={!onClick}
                title={!onClick ? 'Live tracking activates 1 hour before departure' : undefined}
                className={actionClass}
              >
                <Icon className="h-5 w-5 text-[#D62839]" /> {label}
              </button>
            ),
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row print:hidden">
          <Link to="/bus" className="bus-cta bus-focus flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold">
            Book another bus <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/" className="flex-1 rounded-2xl border border-[#E7DFE9] bg-white py-4 text-center text-sm font-extrabold text-[#1C0E28] transition hover:bg-[#F7F2F6]">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </BusPageShell>
  );
};

export default BusConfirmationPage;
