import { useRef, useState } from 'react';
import { ArrowLeft, BadgeCheck, CircleAlert, LoaderCircle, ShieldCheck } from 'lucide-react';
import { getInsuranceError } from '../utils/insuranceValidation';
import { selectPlan } from '../api/InsuranceCrmApi';
import type { InsurancePageType, QuoteResponse } from '../types/insurance.types';
import { buildSelectedPlanPayload, normalizeQuoteForDisplay } from '../utils/insuranceQuoteUtils';

const PRODUCT_TITLES: Record<InsurancePageType, string> = {
  health: 'Health Insurance',
  supertopup: 'Super Top-Up Insurance',
  personal_accident: 'Personal Accident Insurance',
};

type Props = {
  quotes: QuoteResponse[];
  insuranceType: InsurancePageType;
  enquiryId?: number;
  coverAmount: number;
  onEdit: () => void;
  notice?: string;
};

const formatAmount = (amount?: number) => amount
  ? `₹${amount.toLocaleString('en-IN')}`
  : 'Not provided';

export default function InsuranceQuoteResults({ quotes, insuranceType, enquiryId, coverAmount, onEdit, notice }: Props) {
  const selectionLock = useRef(false);
  const [selectingUrl, setSelectingUrl] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectionMessage, setSelectionMessage] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const successfulQuotes = quotes.filter((quote) => quote.success);

  const choosePlan = async (quote: ReturnType<typeof normalizeQuoteForDisplay>) => {
    if (!enquiryId || selectionLock.current || !quote.premium) return;
    selectionLock.current = true;
    setSelectingUrl(quote.id || quote.url);
    setSelectionError('');
    setSelectionMessage('');
    try {
      await selectPlan(enquiryId, buildSelectedPlanPayload(quote));
      setSelectedUrl(quote.id || quote.url);
      setSelectionMessage(`${quote.companyName} · ${quote.planName} selected. Your enquiry is confirmed.`);
    } catch (error: unknown) {
      setSelectionError(getInsuranceError(error, 'Could not select this plan. Please try again.'));
    } finally {
      selectionLock.current = false;
      setSelectingUrl(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10" aria-live="polite">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-purple">Your quote results</p>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{PRODUCT_TITLES[insuranceType]}</h1>
          <p className="mt-1 text-sm text-slate-600">{successfulQuotes.length} successful {successfulQuotes.length === 1 ? 'plan' : 'plans'} found</p>
        </div>
        <button type="button" onClick={onEdit} disabled={Boolean(selectingUrl)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30">
          <ArrowLeft size={16} /> Edit details
        </button>
      </div>

      {selectionMessage && <div role="status" className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><BadgeCheck size={18} />{selectionMessage}</div>}
      {selectionError && <div role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><CircleAlert size={18} />{selectionError}</div>}
      {notice && <div role="status" className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{notice}</div>}

      {quotes.some((quote) => !quote.success) && successfulQuotes.length > 0 && <p role="status" className="mb-4 text-sm text-amber-800">Some insurers could not provide quotes. The available plans are shown below.</p>}
      {successfulQuotes.length ? (
        <section aria-label="Available insurance plans" className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {successfulQuotes.map((quote, index) => {
            const plan = normalizeQuoteForDisplay(quote, coverAmount, PRODUCT_TITLES[insuranceType]);
            const isSelected = selectedUrl === (quote.id || quote.url);
            return (
              <article key={`${quote.url}-${index}`} className={`rounded-lg border bg-white p-4 sm:p-5 ${isSelected ? 'border-emerald-400' : 'border-slate-200'}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    {plan.companyLogo ? <img src={plan.companyLogo} alt={`${plan.companyName} logo`} className="h-full w-full object-contain p-1" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <ShieldCheck size={24} className="text-brand-purple" />}
                  </div>
                  <div className="min-w-0 flex-1 basis-24">
                    <h2 className="truncate text-base font-bold text-slate-900">{plan.companyName}</h2>
                    <p className="mt-0.5 break-words text-sm text-slate-600">{plan.planName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-medium text-slate-500">Premium / year</p>
                    <p className="text-lg font-extrabold text-brand-dark">{formatAmount(plan.premium)}</p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-xs">
                  <div><dt className="text-slate-500">Cover amount</dt><dd className="mt-0.5 font-bold text-slate-800">{formatAmount(plan.coverAmount)}</dd></div>
                  {plan.deductible && <div><dt className="text-slate-500">Deductible</dt><dd className="mt-0.5 font-bold text-slate-800">{formatAmount(plan.deductible)}</dd></div>}
                </dl>
                {plan.features.length > 0 && <ul className="my-3 space-y-1 text-xs text-slate-600">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><span aria-hidden="true" className="text-emerald-600">•</span><span>{feature}</span></li>)}</ul>}
                <button type="button" onClick={() => void choosePlan(plan)} disabled={!enquiryId || !plan.premium || Boolean(selectingUrl) || isSelected} className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-purple px-4 text-sm font-bold text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/40 disabled:cursor-not-allowed disabled:opacity-60">
                  {selectingUrl === (quote.id || quote.url) ? <><LoaderCircle size={16} className="animate-spin" /> Selecting...</> : isSelected ? <><BadgeCheck size={16} /> Selected</> : plan.premium ? 'Choose Plan' : 'Premium unavailable'}
                </button>
                {!enquiryId && <p className="mt-1 text-center text-xs text-red-600">This enquiry has expired. Start a new quote to choose a plan.</p>}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950" role="status">
          <div className="flex flex-wrap items-start gap-3"><CircleAlert size={20} className="mt-0.5 shrink-0" /><div><h2 className="font-bold">No plans available right now</h2><p className="mt-1 text-sm">{quotes.length ? 'The insurers did not return a successful quote for these details.' : 'No quote responses were returned. Please check your connection and try again.'}</p></div></div>
          {quotes.some((quote) => quote.error) && <p className="mt-3 break-words text-xs text-amber-900">{quotes.find((quote) => quote.error)?.error}</p>}
          <button type="button" onClick={onEdit} disabled={Boolean(selectingUrl)} className="mt-4 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-amber-100">Adjust details</button>
        </section>
      )}
    </div>
  );
}