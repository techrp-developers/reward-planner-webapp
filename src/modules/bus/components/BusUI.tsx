// src/modules/bus/components/BusUI.tsx
// Small shared building blocks for the Bus Booking screens.
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wifi,
  Plug,
  Droplets,
  BedDouble,
  Tv,
  Lamp,
  Navigation,
  Coffee,
  Star,
  X,
  Check,
} from 'lucide-react';
import type { Amenity } from '../busTypes';
import '../bus.css';

export const BUS_ACCENT = '#DC2626';

export const AMENITY_ICONS: Record<Amenity, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  charging: Plug,
  water: Droplets,
  blanket: BedDouble,
  tv: Tv,
  readingLight: Lamp,
  tracking: Navigation,
  snacks: Coffee,
};

export const BusPageShell: React.FC<{ children: React.ReactNode; bottomPad?: string; header?: React.ReactNode }> = ({
  children,
  bottomPad = 'pb-28 md:pb-14', // clears the fixed mobile bottom bar
  header,
}) => (
  <div className={`bus-page min-h-full w-full ${bottomPad}`}>
    {header}
    <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">{children}</div>
  </div>
);

export const BusCard: React.FC<{ children: React.ReactNode; className?: string; as?: 'div' | 'section' }> = ({
  children,
  className = '',
  as = 'div',
}) => {
  const Tag = as;
  return <Tag className={`bus-card ${className}`}>{children}</Tag>;
};

// Full-bleed dark band that opens every inner screen and carries the banner's sunset mood.
export const BusFlowHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  to?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, subtitle, to, onBack, right, children }) => {
  const btnClass =
    'bus-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white';
  return (
    <header className="bus-band print:hidden">
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 pt-5 pb-5 sm:px-6 sm:pt-7 sm:pb-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          {onBack ? (
            <button type="button" onClick={onBack} className={btnClass} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : to ? (
            <Link to={to} className={btnClass} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-[28px] sm:leading-tight">{title}</h1>
            {subtitle && <div className="mt-0.5 truncate text-xs font-medium text-white/65 sm:text-sm">{subtitle}</div>}
          </div>
          {right}
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </header>
  );
};

export const RatingBadge: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => (
  <span className="inline-flex shrink-0 items-center gap-1.5">
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#1C0E28] px-2 py-1 text-[11px] font-extrabold text-white">
      <Star className="h-3 w-3 fill-[#F4C95D] text-[#F4C95D]" />
      {rating.toFixed(1)}
    </span>
    {count != null && <span className="hidden text-[11px] font-medium text-[#8D8092] sm:inline">{count.toLocaleString('en-IN')} ratings</span>}
  </span>
);

export const SteeringWheelIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.2" />
    <path d="M3.4 10.2c3 .9 5.8.9 8.6.9s5.6 0 8.6-.9M10.2 13.9 7.6 20.2M13.8 13.9l2.6 6.3" strokeLinecap="round" />
  </svg>
);

const STEPS = [
  { full: 'Select Seats', short: 'Seats' },
  { full: 'Boarding & Dropping', short: 'Stops' },
  { full: 'Passenger Details', short: 'Travellers' },
  { full: 'Review & Pay', short: 'Pay' },
];

export const BookingStepper: React.FC<{ current: number; onStepClick?: (i: number) => void }> = ({ current, onStepClick }) => (
  <ol className="flex items-start" aria-label="Booking progress">
    {STEPS.map(({ full, short }, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li key={full} className={`relative flex min-w-0 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          <button
            type="button"
            disabled={!done || !onStepClick}
            onClick={() => onStepClick?.(i)}
            aria-current={active ? 'step' : undefined}
            aria-label={full}
            className="group relative z-10 flex flex-col items-start gap-1.5 disabled:cursor-default sm:flex-row sm:items-center sm:gap-2.5"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition ${
                active
                  ? 'bg-white text-[#1C0E28] shadow-[0_0_0_5px_rgba(255,255,255,0.14)]'
                  : done
                    ? 'bus-cta'
                    : 'border border-white/25 text-white/55'
              }`}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={`whitespace-nowrap text-[11px] font-bold sm:text-[13px] ${
                active ? 'text-white' : done ? 'text-white/85 group-hover:text-white' : 'text-white/50'
              }`}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{full}</span>
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <span className="mx-2 mt-4 h-0.5 flex-1 rounded-full bg-white/15 sm:mx-4" aria-hidden="true">
              <span className={`block h-full rounded-full bg-gradient-to-r from-[#F0534A] to-[#F4C95D] transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
            </span>
          )}
        </li>
      );
    })}
  </ol>
);

// Accessible modal that is a bottom sheet on phones and a centred dialog from sm up.
// Portalled to body so a positioned parent can't trap it under the header or bottom bar.
export const BusSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}> = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="bus-fade absolute inset-0 cursor-default bg-[#170B22]/60 backdrop-blur-[3px]" />
      <div
        className={`bus-sheet relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[30px] bg-white shadow-[0_40px_90px_-30px_rgba(23,11,34,0.7)] sm:rounded-[30px] ${
          size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-md'
        }`}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[#E4DCE9] sm:hidden" />
        <div className="flex items-center justify-between px-6 pt-4 pb-3 sm:pt-5">
          <h2 className="text-lg font-extrabold tracking-tight text-[#1C0E28]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4EFF3] text-[#1C0E28] transition hover:bg-[#E9E1E8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-[#F1ECF4] p-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`bus-focus relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-gradient-to-r from-[#F0534A] to-[#B3123A]' : 'bg-[#DDD3DE]'}`}
  >
    <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
  </button>
);

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { full?: boolean }> = ({
  className = '',
  full,
  children,
  ...rest
}) => (
  <button
    type="button"
    {...rest}
    className={`bus-cta bus-focus inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold ${full ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);
