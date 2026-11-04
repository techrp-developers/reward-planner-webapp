// src/modules/bus/BusBookingPage.tsx
// Booking flow for one trip: seats → boarding/dropping → passengers → review & pay.
// The current step lives in the URL (?step=) so browser back/forward walks the flow.
import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Info, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  blockBusSeatApi,
  createBusPaymentOrderApi,
  verifyBusPaymentApi,
  bookBusTicketApi,
} from '../../api/busApi';
import { loadRazorpay } from '../../utils/loadRazorpay';
import type { BusBookingConfirmation, BusSeat, ContactDraft, PassengerDraft, BusTripDetails } from './busTypes';
import {
  POINT_VALUE,
  calculateFare,
  formatINR,
  formatJourneyDate,
  getCity,
  getTripDetails,
  getTripDetailsSync,
  todayISO,
} from './busService';
import { BookingStepper, BusCard, BusFlowHeader, BusPageShell, PrimaryButton, Toggle } from './components/BusUI';
import SeatLayout, { MAX_SEATS } from './components/SeatLayout';
import PointsSelector from './components/PointsSelector';
import PassengerDetails, { type PassengerErrors, validatePassengers } from './components/PassengerDetails';
import { FareLines, JourneyTimeline, TripSummaryCard } from './components/TripSummary';
import { buildResultsUrl } from './BusHomePage';

const STEPS = ['seats', 'points', 'passengers', 'review'] as const;
type Step = (typeof STEPS)[number];

const CTA_LABELS: Record<Step, string> = {
  seats: 'Select Boarding & Dropping',
  points: 'Enter Passenger Details',
  passengers: 'Review Booking',
  review: 'Proceed to Pay',
};

const StepTitle: React.FC<{ title: string; hint?: React.ReactNode }> = ({ title, hint }) => (
  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
    <h2 className="text-lg font-extrabold tracking-tight text-[#1C0E28] sm:text-xl">{title}</h2>
    {hint && <span className="text-xs font-semibold text-[#776B80]">{hint}</span>}
  </div>
);

export const BusBookingPage = () => {
  const { tripId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuth } = useAuth() as { user: any; openAuth?: (v?: string) => void };
  const women = params.get('women') === '1';

  const [details, setDetails] = useState<BusTripDetails | null>(() => {
    try {
      return getTripDetailsSync(decodeURIComponent(tripId));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    getTripDetails(decodeURIComponent(tripId))
      .then((d) => {
        if (!cancelled && d) {
          setDetails(d);
        }
      })
      .catch((err) => {
        console.warn('Live trip details fetch error:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [boardingId, setBoardingId] = useState<string | null>(null);
  const [droppingId, setDroppingId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([]);
  const [activePax, setActivePax] = useState(0);
  const [contact, setContact] = useState<ContactDraft>(() => ({
    email: user?.email ?? '',
    phone: String(user?.phone ?? user?.mobile ?? '').replace(/\D/g, '').slice(-10),
  }));
  const [errors, setErrors] = useState<PassengerErrors>({});
  const [usePoints, setUsePoints] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [notice, setNotice] = useState('');
  const [paying, setPaying] = useState(false);

  const savedTravellers = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('rp_bus_saved_travellers') : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const stepParam = params.get('step') as Step | null;
  const requested = Math.max(0, STEPS.indexOf(stepParam ?? 'seats'));

  const seats: BusSeat[] = useMemo(
    () => (details ? selectedIds.map((id) => details.seats.find((s) => s.id === id)!).filter(Boolean) : []),
    [details, selectedIds],
  );
  const boarding = details?.boardingPoints.find((p) => p.id === boardingId) ?? null;
  const dropping = details?.droppingPoints.find((p) => p.id === droppingId) ?? null;
  const passengersValid = passengers.length === seats.length && Object.keys(validatePassengers(passengers, seats, contact)).length === 0;

  const maxReachable = !seats.length ? 0 : !boarding || !dropping ? 1 : !passengersValid ? 2 : 3;
  const stepIndex = Math.min(requested, maxReachable);
  const step = STEPS[stepIndex];

  const rawPoints = Number(user?.rewardPoints ?? user?.wallet_points ?? user?.points ?? user?.steps?.coins);
  const pointsBalance = Number.isFinite(rawPoints) && rawPoints > 0 ? rawPoints : 0;
  const baseFare = calculateFare(seats);
  const maxPointsValue = Math.min(Math.floor(pointsBalance * POINT_VALUE), Math.floor((baseFare.baseFare + baseFare.gst - baseFare.discount) * 0.5));
  const fare = calculateFare(seats, usePoints ? maxPointsValue / POINT_VALUE : 0);
  const earnPoints = Math.round(fare.total * 0.02);

  // Keep the URL honest if someone deep-links or refreshes into a later step
  useEffect(() => {
    if (details && requested !== stepIndex) {
      setParams((p) => {
        p.set('step', STEPS[stepIndex]);
        return p;
      }, { replace: true });
    }
  }, [details, requested, stepIndex, setParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  useEffect(() => {
    if (details?.boardingPoints?.length && !boardingId) {
      setBoardingId(details.boardingPoints[0].id);
    }
    if (details?.droppingPoints?.length && !droppingId) {
      setDroppingId(details.droppingPoints[0].id);
    }
  }, [details, boardingId, droppingId]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  if (!details) {
    return (
      <BusPageShell>
        <div className="bus-card mx-auto max-w-lg p-8 text-center my-12">
          <p className="text-base font-extrabold text-[#1C0E28]">Unable to load bus details</p>
          <p className="mt-2 text-xs text-[#776B80]">This bus or seat layout is no longer available. Please choose another bus.</p>
          <button
            type="button"
            onClick={() => navigate('/bus')}
            className="mt-6 rounded-xl bg-[#D62839] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#b5202f]"
          >
            Back to Bus Search
          </button>
        </div>
      </BusPageShell>
    );
  }
  const { trip } = details;
  const fromName = getCity(trip.fromCityId)?.name || trip.fromCityId;
  const toName = getCity(trip.toCityId)?.name || trip.toCityId;
  const resultsUrl = buildResultsUrl({ from: trip.fromCityId, to: trip.toCityId, date: trip.date, women });

  const goStep = (i: number, replace = false) =>
    setParams(
      (p) => {
        p.set('step', STEPS[i]);
        return p;
      },
      { replace },
    );

  const toggleSeat = (seat: BusSeat) => {
    if (selectedIds.includes(seat.id)) return setSelectedIds(selectedIds.filter((id) => id !== seat.id));
    if (selectedIds.length >= MAX_SEATS) return setNotice(`You can book up to ${MAX_SEATS} seats in one booking`);
    if (seat.reservedFor === 'female') setNotice(`Seat ${seat.label} is reserved for a woman traveller`);
    setSelectedIds([...selectedIds, seat.id]);
  };

  const syncPassengers = () => {
    setPassengers((prev) =>
      seats.map(
        (s) =>
          prev.find((p) => p.seatId === s.id) ?? {
            seatId: s.id,
            firstName: '',
            lastName: '',
            age: '',
            gender: s.reservedFor === 'female' ? 'F' : '',
          },
      ),
    );
    setActivePax(0);
  };

  const pay = async () => {
    const activeUser =
      user ||
      (() => {
        try {
          const raw = typeof window !== 'undefined' ? sessionStorage.getItem('rp_user_profile') : null;
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

    if (!activeUser) {
      setNotice('Please log in to complete your bus booking');
      if (openAuth) openAuth('login');
      return;
    }
    if (!agreed) return setNotice('Please accept the booking terms to continue');
    setPaying(true);

    // If live backend trip with traceId and resultIndex
    if (trip.traceId && trip.resultIndex && boarding && dropping) {
      try {
        const passengersPayload = passengers.map((p, idx) => ({
          Title: p.gender === 'F' ? 'Ms' : 'Mr',
          FirstName: p.firstName.trim() || 'Passenger',
          LastName: p.lastName.trim() || 'Traveler',
          Gender: (p.gender === 'F' ? '2' : '1') as '1' | '2',
          Age: Math.max(1, Math.min(120, Number(p.age) || 28)),
          Email: contact.email.trim() || activeUser?.email || 'customer@rewardplanners.com',
          PhoneNo: contact.phone.trim().slice(-10) || String(activeUser?.phone || '9999999999').slice(-10),
          Address: 'India',
          SeatName: p.seatId,
          LeadPassenger: idx === 0,
          IdType: (p as any).idType || 'PanCard',
          IdNumber: (p as any).idNumber || 'ABCDE1234F',
        }));

        const blockRes = await blockBusSeatApi({
          traceId: trip.traceId,
          resultIndex: trip.resultIndex,
          srdvIndex: trip.srdvIndex || trip.resultIndex,
          boardingPointId: String(boarding.id),
          droppingPointId: String(dropping.id),
          refId: `RPB${Date.now()}`,
          passengers: passengersPayload,
          sourceCity: fromName,
          destinationCity: toName,
        });

        const orderRef = blockRes?.orderRef || blockRes?.data?.orderRef;
        if (!orderRef) {
          throw new Error(blockRes?.message || 'Unable to block bus seat');
        }

        const orderRes = await createBusPaymentOrderApi(orderRef);
        const razorpayData = orderRes?.data;
        if (!razorpayData?.orderId) {
          throw new Error(orderRes?.message || 'Unable to initialize payment');
        }

        const Razorpay = await loadRazorpay();
        const options = {
          key: razorpayData.key,
          amount: razorpayData.amount,
          currency: razorpayData.currency || 'INR',
          name: 'Reward Planners',
          description: `Bus Booking: ${fromName} to ${toName}`,
          order_id: razorpayData.orderId,
          prefill: {
            name: `${passengers[0]?.firstName} ${passengers[0]?.lastName}`,
            email: contact.email,
            contact: contact.phone,
          },
          handler: async (resp: any) => {
            try {
              await verifyBusPaymentApi({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              });

              const bookRes = await bookBusTicketApi(orderRef);
              const confirmation: BusBookingConfirmation = {
                pnr: bookRes?.travelOperatorPNR || bookRes?.ticketNo || orderRef,
                ticketNo: bookRes?.ticketNo || `TK${Date.now()}`,
                trip,
                seats,
                boarding: boarding!,
                dropping: dropping!,
                passengers,
                contact,
                totals: fare,
              };
              navigate('/bus/confirmation', { state: confirmation, replace: true });
            } catch (verifyErr: any) {
              console.error('[BusBooking] Verify/Book error:', verifyErr);
              setPaying(false);
              setNotice(verifyErr?.message || 'Booking confirmation failed. Please contact customer support.');
            }
          },
          modal: {
            ondismiss: () => {
              setPaying(false);
              setNotice('Payment window was closed');
            },
          },
        };

        const rzpInstance = new (Razorpay as any)(options);
        rzpInstance.open();
        return;
      } catch (err: any) {
        console.error('[BusBooking] Live payment error:', err);
        if (err?.code === 'ACCESS_TOKEN_REQUIRED' || err?.message?.toLowerCase().includes('token') || err?.status === 401) {
          setPaying(false);
          setNotice('Please sign in to complete your live bus booking payment.');
          if (openAuth) openAuth('login');
          return;
        }
        setPaying(false);
        setNotice(err?.message || 'Failed to initialize booking with provider. Please try again.');
        return;
      }
    }

    // Fallback confirmation round-trip
    setTimeout(() => {
      const confirmation: BusBookingConfirmation = {
        pnr: `RPB${String(Date.now()).slice(-7)}`,
        ticketNo: `TK${trip.fromCityId.slice(0, 2).toUpperCase()}${trip.toCityId.slice(0, 2).toUpperCase()}${Math.floor(100000 + Math.random() * 899999)}`,
        trip,
        seats,
        boarding: boarding!,
        dropping: dropping!,
        passengers,
        contact,
        totals: fare,
      };
      navigate('/bus/confirmation', { state: confirmation, replace: true });
    }, 1300);
  };

  const next = () => {
    if (step === 'seats') {
      syncPassengers();
      return goStep(1);
    }
    if (step === 'points') {
      if (!boarding || !dropping) return setNotice('Select both a boarding and a dropping point');
      if (passengers.length !== seats.length) syncPassengers();
      return goStep(2);
    }
    if (step === 'passengers') {
      const errs = validatePassengers(passengers, seats, contact);
      setErrors(errs);
      if (Object.keys(errs).length) {
        setNotice('Please fix the highlighted details');
        const first = Object.keys(errs)[0];
        const [idx, field] = first.split('.');
        const elId = idx === 'contact' ? `bus-contact-${field}` : `pax-${idx}-${field === 'firstName' ? 'first' : field === 'lastName' ? 'last' : field}`;
        document.getElementById(elId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      return goStep(3);
    }
    pay();
  };

  const canContinue =
    step === 'seats' ? seats.length > 0 : step === 'points' ? !!boarding && !!dropping : step === 'review' ? agreed && !paying : true;

  const ctaHint =
    step === 'seats'
      ? seats.length
        ? `${seats.length} seat${seats.length > 1 ? 's' : ''}: ${seats.map((s) => s.label).join(', ')}`
        : 'Select at least 1 seat'
      : step === 'points'
        ? boarding && dropping
          ? `${boarding.name} → ${dropping.name}`
          : 'Choose boarding & dropping'
        : `${seats.length} seat${seats.length > 1 ? 's' : ''} · incl. taxes`;

  return (
    <BusPageShell
      bottomPad="pb-32 lg:pb-14"
      header={
        <BusFlowHeader
          onBack={() => (stepIndex > 0 ? goStep(stepIndex - 1, true) : navigate(resultsUrl))}
          title={
            <span className="flex items-center gap-2 sm:gap-3">
              {fromName} <span className="text-[#F0A58F]">→</span> {toName}
            </span>
          }
          subtitle={
            <>
              {trip.operator} · {formatJourneyDate(trip.date)} · {trip.departure}
            </>
          }
        >
          <BookingStepper current={stepIndex} onStepClick={(i) => goStep(i)} />
        </BusFlowHeader>
      }
    >
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_372px]">
        <div key={step} className="bus-rise min-w-0">
          {step === 'seats' && (
            <BusCard className="p-4 sm:p-6">
              <StepTitle title="Select your seats" hint={`${trip.busType} · max ${MAX_SEATS} seats`} />
              {women && (
                <p className="mb-4 flex items-start gap-2 rounded-2xl bg-[#FDEEF3] px-4 py-3 text-xs font-semibold text-[#9D174D]">
                  <Info className="mt-px h-4 w-4 shrink-0" /> Pink berths are reserved for women travellers and can only be booked for a female passenger.
                </p>
              )}
              <SeatLayout seats={details.seats} selectedIds={selectedIds} onToggle={toggleSeat} />
            </BusCard>
          )}

          {step === 'points' && (
            <div>
              <StepTitle title="Boarding & dropping points" />
              <PointsSelector
                fromName={fromName}
                toName={toName}
                boardingPoints={details.boardingPoints}
                droppingPoints={details.droppingPoints}
                boardingId={boardingId}
                droppingId={droppingId}
                onBoarding={setBoardingId}
                onDropping={setDroppingId}
              />
            </div>
          )}

          {step === 'passengers' && (
            <PassengerDetails
              seats={seats}
              passengers={passengers}
              onPassengersChange={(p) => {
                setPassengers(p);
                if (Object.keys(errors).length) setErrors(validatePassengers(p, seats, contact));
              }}
              contact={contact}
              onContactChange={(c) => {
                setContact(c);
                if (Object.keys(errors).length) setErrors(validatePassengers(passengers, seats, c));
              }}
              activeIndex={activePax}
              onActiveIndexChange={setActivePax}
              savedTravellers={savedTravellers}
              errors={errors}
            />
          )}

          {step === 'review' && (
            <div className="space-y-5">
              <BusCard className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-[#1C0E28] sm:text-lg">Journey details</h2>
                    <p className="text-xs text-[#776B80]">
                      {trip.operator} · {trip.busType}
                    </p>
                  </div>
                  <button type="button" onClick={() => goStep(1)} className="text-xs font-bold text-[#D62839] hover:underline">
                    Change
                  </button>
                </div>
                <JourneyTimeline trip={trip} boarding={boarding} dropping={dropping} />
              </BusCard>

              <BusCard className="p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#1C0E28] sm:text-lg">Travellers</h2>
                  <button type="button" onClick={() => goStep(2)} className="text-xs font-bold text-[#D62839] hover:underline">
                    Edit
                  </button>
                </div>
                <ul className="divide-y divide-[#F1ECF4]">
                  {passengers.map((p, i) => {
                    const seat = seats.find((s) => s.id === p.seatId);
                    return (
                      <li key={p.seatId} className="flex items-center gap-3 py-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2B1740] to-[#5C1A35] text-[11px] font-extrabold text-white">
                          {p.firstName[0]}
                          {p.lastName[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-[#1C0E28]">
                            {p.firstName} {p.lastName}
                            {i === 0 && <span className="ml-2 text-[10px] font-bold text-[#9B8FA5] uppercase">Lead</span>}
                          </span>
                          <span className="block text-xs text-[#776B80]">
                            {p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                          </span>
                        </span>
                        <span className="rounded-lg bg-[#1C0E28] px-2.5 py-1 text-xs font-extrabold text-white">{seat?.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 border-t border-dashed border-[#E4DCE9] pt-3 text-xs text-[#776B80]">
                  Ticket will be sent to <strong className="text-[#1C0E28]">{contact.email}</strong> and{' '}
                  <strong className="text-[#1C0E28]">+91 {contact.phone}</strong>
                </p>
              </BusCard>

              <div className="bus-gold rounded-[24px] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D9A441] to-[#9A6A16] text-white">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[#1C0E28]">Pay using RP Points</p>
                    <p className="text-xs text-[#7A5C22]">
                      Balance {pointsBalance.toLocaleString('en-IN')} pts · save up to {formatINR(maxPointsValue)}
                    </p>
                  </div>
                  <Toggle checked={usePoints} onChange={setUsePoints} label="Use RP Points" />
                </div>
              </div>

              <BusCard className="p-5 sm:p-6">
                <h2 className="mb-3 text-base font-extrabold text-[#1C0E28]">Cancellation policy</h2>
                <table className="w-full text-left text-xs">
                  <tbody>
                    {details.cancellationPolicy.map((c) => (
                      <tr key={c.window} className="border-b border-[#F1ECF4] last:border-0">
                        <td className="py-2 pr-3 text-[#5B4D66]">{c.window}</td>
                        <td className="py-2 text-right font-bold text-[#1C0E28]">{c.charge}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ul className="mt-4 space-y-1.5">
                  {details.busPolicies.map((p) => (
                    <li key={p} className="flex gap-2 text-xs text-[#5B4D66]">
                      <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-[#16A34A]" /> {p}
                    </li>
                  ))}
                </ul>
              </BusCard>

              <div className="lg:hidden">
                <BusCard className="p-5">
                  <h2 className="mb-3 text-base font-extrabold text-[#1C0E28]">Fare details</h2>
                  <FareLines seats={seats} fare={fare} />
                </BusCard>
              </div>

              <label className="flex cursor-pointer items-start gap-3 px-1 text-xs text-[#5B4D66]">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#D62839]" />
                <span>
                  I agree to the booking terms, cancellation policy and operator rules. I confirm all travellers carry a valid photo ID.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Desktop summary */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TripSummaryCard
              trip={trip}
              seats={seats}
              fare={fare}
              boarding={boarding}
              dropping={dropping}
              action={
                <div>
                  <PrimaryButton full onClick={next} disabled={!canContinue}>
                    {paying ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing…
                      </>
                    ) : (
                      <>
                        {step === 'review' && <Lock className="h-4 w-4" />}
                        {step === 'review' ? `Pay ${formatINR(fare.total)}` : CTA_LABELS[step]}
                        {step !== 'review' && <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </PrimaryButton>
                  {seats.length > 0 && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#9A6A16]">
                      <Sparkles className="h-3.5 w-3.5" /> Earn {earnPoints} RP Points on this booking
                    </p>
                  )}
                </div>
              }
            />
          </div>
        </aside>
      </div>

      {/* Mobile / tablet action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[24px] border-t border-[#EFE8EE] bg-white/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-18px_40px_-16px_rgba(28,14,40,0.28)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="bus-num text-xl leading-tight font-extrabold text-[#1C0E28]">{seats.length ? formatINR(fare.total) : '—'}</p>
            <p className="truncate text-[11px] font-semibold text-[#776B80]">{ctaHint}</p>
          </div>
          <PrimaryButton onClick={next} disabled={!canContinue} className="shrink-0 px-5 sm:px-8">
            {paying ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing
              </>
            ) : step === 'review' ? (
              <>
                <Lock className="h-4 w-4" /> Pay Now
              </>
            ) : (
              <>
                Continue <ChevronRight className="h-4 w-4" />
              </>
            )}
          </PrimaryButton>
        </div>
      </div>

      {notice && (
        <div role="status" className="bus-sheet fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl bg-[#1C0E28] px-4 py-3 text-center text-[13px] font-semibold text-white shadow-2xl lg:bottom-8">
          {notice}
        </div>
      )}
    </BusPageShell>
  );
};

export default BusBookingPage;
