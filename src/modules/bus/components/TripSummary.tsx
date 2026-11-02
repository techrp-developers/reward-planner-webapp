// src/modules/bus/components/TripSummary.tsx
// Journey + fare summary used in the booking sidebar, review step and ticket.
import React from 'react';
import type { BusPoint, BusSeat, BusTrip, FareBreakdown } from '../busTypes';
import { formatDuration, formatINR, formatJourneyDate, getCity } from '../busService';

export const JourneyTimeline: React.FC<{ trip: BusTrip; boarding?: BusPoint | null; dropping?: BusPoint | null; compact?: boolean }> = ({
  trip,
  boarding,
  dropping,
  compact,
}) => {
  const from = getCity(trip.fromCityId)?.name;
  const to = getCity(trip.toCityId)?.name;
  const stops = [
    { time: boarding?.time ?? trip.departure, city: from, point: boarding, label: 'Boarding' },
    { time: dropping?.time ?? trip.arrival, city: to, point: dropping, label: 'Dropping' },
  ];
  return (
    <ol className="relative">
      {stops.map((s, i) => (
        <li key={s.label} className={`relative flex gap-3.5 ${i === 0 ? (compact ? 'pb-4' : 'pb-5') : ''}`}>
          {i === 0 && <span className="absolute top-4 bottom-0 left-[6px] w-px border-l-2 border-dashed border-[#E4DCE9]" aria-hidden="true" />}
          <span
            className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] ${i === 0 ? 'border-[#1C0E28] bg-white' : 'border-[#D62839] bg-white'}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="bus-eyebrow">
              {s.label} · {s.city}
            </p>
            <p className="mt-0.5 flex items-baseline gap-2">
              <span className="bus-num text-[17px] font-extrabold text-[#1C0E28]">{s.time}</span>
              {s.point && <span className="truncate text-sm font-bold text-[#1C0E28]">{s.point.name}</span>}
            </p>
            {s.point && !compact && <p className="text-xs leading-snug text-[#776B80]">{s.point.address}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export const FareLines: React.FC<{ seats: BusSeat[]; fare: FareBreakdown; totalLabel?: string }> = ({ seats, fare, totalLabel = 'Total payable' }) => (
  <dl className="bus-num space-y-2.5 text-[13px]">
    <div className="flex justify-between">
      <dt className="text-[#5B4D66]">
        Base fare <span className="text-[#9B8FA5]">({seats.length} {seats.length === 1 ? 'seat' : 'seats'})</span>
      </dt>
      <dd className="font-bold text-[#1C0E28]">{formatINR(fare.baseFare)}</dd>
    </div>
    <div className="flex justify-between">
      <dt className="text-[#5B4D66]">GST &amp; operator charges</dt>
      <dd className="font-bold text-[#1C0E28]">{formatINR(fare.gst)}</dd>
    </div>
    {fare.discount > 0 && (
      <div className="flex justify-between text-[#16A34A]">
        <dt>Reward Planners discount</dt>
        <dd className="font-bold">− {formatINR(fare.discount)}</dd>
      </div>
    )}
    {fare.pointsUsed > 0 && (
      <div className="flex justify-between text-[#6952C6]">
        <dt>RP Points redeemed</dt>
        <dd className="font-bold">− {formatINR(fare.pointsUsed)}</dd>
      </div>
    )}
    <div className="flex items-baseline justify-between border-t border-dashed border-[#E7DFE9] pt-3 text-lg">
      <dt className="font-extrabold text-[#1C0E28]">{totalLabel}</dt>
      <dd className="font-extrabold text-[#1C0E28]">{formatINR(fare.total)}</dd>
    </div>
  </dl>
);

export const TripSummaryCard: React.FC<{
  trip: BusTrip;
  seats: BusSeat[];
  fare: FareBreakdown;
  boarding: BusPoint | null;
  dropping: BusPoint | null;
  action?: React.ReactNode;
}> = ({ trip, seats, fare, boarding, dropping, action }) => (
  <div className="bus-card shadow-[0_30px_60px_-32px_rgba(28,14,40,0.45)]">
    <div className="bus-band rounded-t-[24px] px-5 py-5">
      <div className="relative z-10">
        <p className="truncate text-[15px] font-extrabold">{trip.operator}</p>
        <p className="truncate text-xs text-white/65">{trip.busType}</p>
        <p className="mt-2.5 text-xs font-semibold text-[#F7DEA4]">
          {formatJourneyDate(trip.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {formatDuration(trip.durationMins)}
        </p>
      </div>
    </div>
    <div className="space-y-5 p-5">
      <JourneyTimeline trip={trip} boarding={boarding} dropping={dropping} compact />
      <div>
        <p className="bus-eyebrow mb-2">Seats</p>
        {seats.length ? (
          <div className="flex flex-wrap gap-1.5">
            {seats.map((s) => (
              <span key={s.id} className="bus-num rounded-lg bg-[#FDECEC] px-2 py-1 text-xs font-extrabold text-[#B3123A]">
                {s.label} · {formatINR(s.price)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9A8C9F]">Choose a seat on the coach to see your fare</p>
        )}
      </div>
    </div>
    {seats.length > 0 && (
      <div className="bus-perf-x p-5">
        <FareLines seats={seats} fare={fare} />
      </div>
    )}
    {action && <div className="px-5 pb-5">{action}</div>}
  </div>
);
