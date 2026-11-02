// src/modules/bus/BusHomePage.tsx
// Bus Booking landing: hero + search, offers, recent searches and popular routes.
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  Bus,
  Clock,
  Headphones,
  Navigation,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
} from 'lucide-react';
import Woman2Icon from '@mui/icons-material/Woman2';
import busHero from '../../assets/bus/bus-hero.webp';
import busHeroMobile from '../../assets/bus/bus-hero-mobile.webp';
import BusSearchCard, { type BusSearchValues } from './components/BusSearchCard';
import { BusPageShell } from './components/BusUI';
import { POPULAR_ROUTES, formatINR, formatJourneyDate, getCity, todayISO } from './busService';

const RECENT_KEY = 'rp_bus_recent_searches';

export const readRecentSearches = (): BusSearchValues[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((s) => getCity(s?.from) && getCity(s?.to)) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearch = (values: BusSearchValues) => {
  try {
    const next = [values, ...readRecentSearches().filter((s) => !(s.from === values.from && s.to === values.to))].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — recent searches are a convenience only
  }
};

export const buildResultsUrl = (v: BusSearchValues) =>
  `/bus/results?${new URLSearchParams({ from: v.from, to: v.to, date: v.date, ...(v.women ? { women: '1' } : {}) })}`;

const OFFERS = [
  {
    code: 'RPBUS150',
    title: 'Flat ₹150 off',
    body: 'On your first bus booking above ₹799',
    icon: <BadgePercent className="h-5 w-5" />,
    tone: 'from-[#E8483F] via-[#C51F3A] to-[#7A1036]',
  },
  {
    code: '2X POINTS',
    title: 'Earn 2x RP Points',
    body: 'On every overnight sleeper journey this month',
    icon: <Sparkles className="h-5 w-5" />,
    tone: 'from-[#6952C6] via-[#3C2A78] to-[#1C0E28]',
  },
  {
    code: 'SAFE HER',
    title: 'Women-first seating',
    body: 'Reserved berths & verified women-friendly operators',
    icon: <Woman2Icon sx={{ fontSize: 22 }} />,
    tone: 'from-[#D93A7C] via-[#A61C63] to-[#5C1A4B]',
  },
];

const FEATURES = [
  { icon: Navigation, title: 'Live bus tracking', body: 'Share your live location with family' },
  { icon: RotateCcw, title: 'Easy cancellation', body: 'Instant refunds to your original mode' },
  { icon: ShieldCheck, title: 'Verified operators', body: 'Rated by 2 lakh+ corporate travellers' },
  { icon: Headphones, title: '24×7 support', body: 'Dedicated help for every journey' },
];

export const BusHomePage = () => {
  const navigate = useNavigate();
  const recent = useMemo(readRecentSearches, []);

  const go = (values: BusSearchValues) => {
    saveRecentSearch(values);
    navigate(buildResultsUrl(values));
  };

  return (
    <div className="bus-page min-h-full w-full">
      {/* HERO: the banner artwork carries its own headline, so the live copy is phone-only (and for screen readers) */}
      <section className="relative overflow-hidden bg-[#1C0E28]">
        <div className="bg-gradient-to-b from-[#1C0E28] to-[#3F2B56] px-4 pt-6 pb-3 sm:px-6 md:sr-only">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-white/90 uppercase">
            <Bus className="h-3.5 w-3.5" /> Bus Booking
          </span>
          <h1 className="mt-3 text-[27px] leading-tight font-extrabold tracking-tight text-white sm:text-4xl">
            Travel <span className="text-[#FB8A7E]">smarter</span>, book faster, earn <span className="text-[#FB8A7E]">rewards</span> on every ride.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Choose from 3,500+ operators across 1 lakh+ routes. Book AC sleeper, seater and Volvo buses with ease — and pay using RP Points.
          </p>
        </div>
        <picture className="relative block aspect-[941/724] w-full sm:aspect-[16/9] md:aspect-[3/1] md:max-h-[640px]">
          <source media="(min-width: 768px)" srcSet={busHero} />
          <img
            src={busHeroMobile}
            alt="Red Reward Planners coach on a highway at sunset"
            width={941}
            height={724}
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#3F2B56] to-transparent md:hidden" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FAF8FC] to-transparent md:h-20" aria-hidden="true" />
        </picture>
      </section>

      <BusPageShell>
        {/* SEARCH */}
        <div className="relative z-10 -mt-8 md:-mt-10 lg:-mt-14 xl:-mt-20 2xl:-mt-10">
          <BusSearchCard initial={recent[0] ? { ...recent[0], date: todayISO() } : undefined} onSearch={go} />
        </div>

        {/* RECENT */}
        {recent.length > 0 && (
          <section className="mt-9">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#D62839]" />
              <h2 className="text-lg font-extrabold tracking-tight text-[#1C0E28]">Pick up where you left off</h2>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
              {recent.map((r) => (
                <button
                  key={`${r.from}-${r.to}`}
                  type="button"
                  onClick={() => go({ ...r, date: r.date >= todayISO() ? r.date : todayISO() })}
                  className="bus-card bus-lift flex shrink-0 items-center gap-3 !rounded-2xl px-4 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold whitespace-nowrap text-[#1C0E28]">
                      {getCity(r.from)?.name} <span className="text-[#D62839]">→</span> {getCity(r.to)?.name}
                    </span>
                    <span className="block text-xs text-[#8D8092]">
                      {formatJourneyDate(r.date >= todayISO() ? r.date : todayISO())}
                      {r.women ? ' · Women' : ''}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#C9BFCC]" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* OFFERS */}
        <section className="mt-10 sm:mt-12">
          <p className="bus-eyebrow">Exclusive</p>
          <h2 className="mt-1 mb-4 text-2xl font-extrabold tracking-tight text-[#1C0E28]">Offers made for you</h2>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {OFFERS.map(({ code, title, body, icon, tone }) => (
              <article key={code} className={`bus-lift relative flex w-[80%] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-gradient-to-br p-6 text-white sm:w-auto ${tone}`}>
                <span className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-white/10 blur-sm" />
                <span className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">{icon}</span>
                <p className="relative text-[22px] leading-tight font-extrabold tracking-tight">{title}</p>
                <p className="relative mt-1.5 flex-1 text-[13px] leading-snug text-white/80">{body}</p>
                <span className="relative mt-5 self-start rounded-lg border border-dashed border-white/50 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.14em]">{code}</span>
              </article>
            ))}
          </div>
        </section>

        {/* POPULAR ROUTES */}
        <section className="mt-10 sm:mt-12">
          <p className="bus-eyebrow">Most travelled</p>
          <h2 className="mt-1 mb-4 text-2xl font-extrabold tracking-tight text-[#1C0E28]">Popular routes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_ROUTES.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => go({ from: r.from, to: r.to, date: todayISO(), women: false })}
                className="bus-card bus-lift group block p-5 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="min-w-0 truncate text-base font-extrabold text-[#1C0E28]">{getCity(r.from)?.name}</span>
                  <span className="relative h-0.5 min-w-6 flex-1 rounded-full bg-gradient-to-r from-[#E2DAE5] to-[#D62839]">
                    <span className="absolute -top-[3px] right-0 h-2 w-2 rounded-full bg-[#D62839]" />
                  </span>
                  <span className="min-w-0 truncate text-base font-extrabold text-[#1C0E28]">{getCity(r.to)?.name}</span>
                </span>
                <span className="mt-4 flex items-end justify-between">
                  <span>
                    <span className="bus-eyebrow block">From</span>
                    <span className="bus-num text-xl font-extrabold text-[#1C0E28]">{formatINR(r.fareFrom)}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#8D8092]">
                    {r.buses} buses daily
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4EFF3] text-[#1C0E28] transition group-hover:bg-[#D62839] group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* WHY BOOK */}
        <section className="bus-band mt-10 mb-4 rounded-[30px] p-6 sm:mt-12 sm:p-9">
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold tracking-tight">Why book with Reward Planners</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <span className="bus-glass flex h-11 w-11 items-center justify-center rounded-2xl text-[#F7DEA4]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 block text-sm font-extrabold">{title}</span>
                  <span className="mt-1 block text-xs leading-snug text-white/65">{body}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </BusPageShell>
    </div>
  );
};

export default BusHomePage;
