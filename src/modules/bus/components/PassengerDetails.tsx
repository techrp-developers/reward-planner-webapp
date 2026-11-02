// src/modules/bus/components/PassengerDetails.tsx
import React from 'react';
import { Mail, Phone, UserRound, UsersRound } from 'lucide-react';
import type { BusSeat, ContactDraft, PassengerDraft, PassengerGender, SavedTraveller } from '../busTypes';

export type PassengerErrors = Record<string, string>;

export const validatePassengers = (passengers: PassengerDraft[], seats: BusSeat[], contact: ContactDraft): PassengerErrors => {
  const errors: PassengerErrors = {};
  passengers.forEach((p, i) => {
    const seat = seats.find((s) => s.id === p.seatId);
    if (!p.firstName.trim()) errors[`${i}.firstName`] = 'Enter first name';
    else if (!/^[a-zA-Z .'-]{2,}$/.test(p.firstName.trim())) errors[`${i}.firstName`] = 'Use letters only';
    if (!p.lastName.trim()) errors[`${i}.lastName`] = 'Enter last name';
    const age = Number(p.age);
    if (!p.age) errors[`${i}.age`] = 'Enter age';
    else if (!Number.isInteger(age) || age < 1 || age > 110) errors[`${i}.age`] = 'Enter a valid age';
    if (!p.gender) errors[`${i}.gender`] = 'Select gender';
    else if (seat?.reservedFor === 'female' && p.gender !== 'F') errors[`${i}.gender`] = 'This seat is reserved for women';
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) errors['contact.email'] = 'Enter a valid email address';
  if (!/^[6-9]\d{9}$/.test(contact.phone.trim())) errors['contact.phone'] = 'Enter a valid 10-digit mobile number';
  return errors;
};

interface Props {
  seats: BusSeat[];
  passengers: PassengerDraft[];
  onPassengersChange: (next: PassengerDraft[]) => void;
  contact: ContactDraft;
  onContactChange: (next: ContactDraft) => void;
  activeIndex: number;
  onActiveIndexChange: (i: number) => void;
  savedTravellers: SavedTraveller[];
  errors: PassengerErrors;
}

const inputBase =
  'w-full rounded-2xl border bg-[#FDFBFC] px-4 py-3.5 text-sm font-semibold text-[#1C0E28] outline-none transition placeholder:font-medium placeholder:text-[#B3A8BB] focus:border-[#D62839] focus:bg-white focus:ring-4 focus:ring-[#D62839]/10';

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode; htmlFor: string }> = ({ label, error, children, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-[#3D3047]">
      <span className="text-[#D62839]">*</span>
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs font-semibold text-[#D62839]">{error}</p>}
  </div>
);

export const PassengerDetails: React.FC<Props> = ({
  seats,
  passengers,
  onPassengersChange,
  contact,
  onContactChange,
  activeIndex,
  onActiveIndexChange,
  savedTravellers,
  errors,
}) => {
  const update = (i: number, patch: Partial<PassengerDraft>) =>
    onPassengersChange(passengers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const quickSelect = (t: SavedTraveller) => {
    const seat = seats.find((s) => s.id === passengers[activeIndex]?.seatId);
    update(activeIndex, {
      firstName: t.firstName,
      lastName: t.lastName,
      age: t.age,
      gender: seat?.reservedFor === 'female' ? 'F' : t.gender,
    });
    if (activeIndex < passengers.length - 1) onActiveIndexChange(activeIndex + 1);
  };

  const usedNames = new Set(passengers.map((p) => `${p.firstName} ${p.lastName}`.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Quick reuse */}
      <div className="bus-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FDECEC] text-[#D62839]">
            <UsersRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-snug text-[#5B4D66]">
              Travellers you enter in this booking will appear here for quick reuse.
            </p>
            {savedTravellers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {savedTravellers.map((t) => {
                  const used = usedNames.has(`${t.firstName} ${t.lastName}`.toLowerCase());
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={used}
                      onClick={() => quickSelect(t)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#E7DFE9] bg-white py-1.5 pr-3 pl-1.5 text-xs font-bold text-[#1C0E28] transition hover:border-[#1C0E28] disabled:cursor-default disabled:opacity-45 disabled:hover:border-[#ECE6F0]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#2B1740] to-[#5C1A35] text-[9px] font-extrabold text-white">
                        {t.firstName[0]}
                        {t.lastName[0]}
                      </span>
                      {t.firstName} {t.lastName}
                      <span className="font-medium text-[#9B8FA5]">
                        {t.age}, {t.gender}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {passengers.map((p, i) => {
        const seat = seats.find((s) => s.id === p.seatId);
        const active = i === activeIndex;
        const ladiesOnly = seat?.reservedFor === 'female';
        const id = (f: string) => `pax-${i}-${f}`;
        return (
          <section key={p.seatId} aria-labelledby={id('title')}>
            <div className="mb-3 flex items-center justify-between">
              <h3 id={id('title')} className="text-base font-extrabold text-[#1C0E28] sm:text-lg">
                Passenger {i + 1}
              </h3>
              <span className="rounded-xl bg-[#1C0E28] px-3 py-1.5 text-xs font-extrabold text-white">Seat {seat?.label}</span>
            </div>
            <div
              onFocusCapture={() => onActiveIndexChange(i)}
              onClick={() => onActiveIndexChange(i)}
              className={`bus-card p-4 transition sm:p-6 ${active ? '!border-[#D62839]/40 ring-4 ring-[#D62839]/[0.06]' : 'cursor-pointer'}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#1C0E28]">{i === 0 ? 'Lead passenger' : `Co-passenger`}</p>
                  <p className="text-xs text-[#776B80]">
                    {active ? 'Quick Select will update this traveller.' : 'Tap to make this traveller active.'}
                  </p>
                </div>
                {active && <span className="rounded-lg bg-[#FDECEC] px-2.5 py-1 text-[11px] font-extrabold text-[#B3123A]">Active</span>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name" htmlFor={id('first')} error={errors[`${i}.firstName`]}>
                  <div className="relative">
                    <input
                      id={id('first')}
                      value={p.firstName}
                      onChange={(e) => update(i, { firstName: e.target.value })}
                      placeholder="Enter first name"
                      autoComplete={i === 0 ? 'given-name' : 'off'}
                      className={`${inputBase} pr-11 ${errors[`${i}.firstName`] ? 'border-[#F87171]' : 'border-[#E4DCE9]'}`}
                    />
                    <UserRound className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#B3A8BB]" />
                  </div>
                </Field>
                <Field label="Last Name" htmlFor={id('last')} error={errors[`${i}.lastName`]}>
                  <div className="relative">
                    <input
                      id={id('last')}
                      value={p.lastName}
                      onChange={(e) => update(i, { lastName: e.target.value })}
                      placeholder="Enter last name"
                      autoComplete={i === 0 ? 'family-name' : 'off'}
                      className={`${inputBase} pr-11 ${errors[`${i}.lastName`] ? 'border-[#F87171]' : 'border-[#E4DCE9]'}`}
                    />
                    <UserRound className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#B3A8BB]" />
                  </div>
                </Field>
                <Field label="Age" htmlFor={id('age')} error={errors[`${i}.age`]}>
                  <input
                    id={id('age')}
                    inputMode="numeric"
                    value={p.age}
                    onChange={(e) => update(i, { age: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    placeholder="Enter your age"
                    className={`${inputBase} ${errors[`${i}.age`] ? 'border-[#F87171]' : 'border-[#E4DCE9]'}`}
                  />
                </Field>
                <div>
                  <p id={id('gender')} className="mb-1.5 block text-[13px] font-semibold text-[#3D3047]">
                    <span className="text-[#D62839]">*</span>Gender
                  </p>
                  <div role="radiogroup" aria-labelledby={id('gender')} className="flex gap-2.5">
                    {(['M', 'F', 'O'] as PassengerGender[]).map((g) => {
                      const selected = p.gender === g;
                      const disabled = ladiesOnly && g !== 'F';
                      return (
                        <button
                          key={g}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                          disabled={disabled}
                          onClick={() => update(i, { gender: g })}
                          className={`h-[50px] w-14 rounded-2xl border text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                            selected
                              ? 'bus-cta border-transparent'
                              : 'border-[#E4DCE9] bg-white text-[#3D3047] hover:border-[#DC2626]/50'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                  {errors[`${i}.gender`] ? (
                    <p className="mt-1 text-xs font-semibold text-[#D62839]">{errors[`${i}.gender`]}</p>
                  ) : (
                    ladiesOnly && <p className="mt-1 text-xs font-semibold text-[#BE185D]">Seat reserved for women travellers</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Contact */}
      <section aria-labelledby="bus-contact-title">
        <h3 id="bus-contact-title" className="mb-3 text-base font-extrabold text-[#1C0E28] sm:text-lg">
          Contact details
        </h3>
        <div className="bus-card p-4 sm:p-6">
          <p className="mb-4 text-xs text-[#776B80]">Your ticket and trip updates will be sent here.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email ID" htmlFor="bus-contact-email" error={errors['contact.email']}>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#B3A8BB]" />
                <input
                  id="bus-contact-email"
                  type="email"
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
                  placeholder="name@company.com"
                  className={`${inputBase} pl-11 ${errors['contact.email'] ? 'border-[#F87171]' : 'border-[#E4DCE9]'}`}
                />
              </div>
            </Field>
            <Field label="Mobile Number" htmlFor="bus-contact-phone" error={errors['contact.phone']}>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#B3A8BB]" />
                <span className="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-sm font-bold text-[#3D3047]">+91</span>
                <input
                  id="bus-contact-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={contact.phone}
                  onChange={(e) => onContactChange({ ...contact, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="98765 43210"
                  className={`${inputBase} pl-[4.6rem] ${errors['contact.phone'] ? 'border-[#F87171]' : 'border-[#E4DCE9]'}`}
                />
              </div>
            </Field>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PassengerDetails;
