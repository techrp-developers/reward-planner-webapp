import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, ShieldCheck } from 'lucide-react';
import { fetchUserInfo } from '../../../api/authApi';
import { saveStep, startInsurance } from './api/InsuranceCrmApi';
import { submitInsuranceQuote } from './api/insuranceFlow';
import InsuranceQuoteResults from './components/InsuranceQuoteResults';
import { BasicDetailsStep, MemberAgeStep, MemberSelectionStep, PersonalAccidentDetailsStep } from './components/InsuranceFormSteps';
import { SUPER_TOPUP_DEDUCTIBLE } from './constant/InsuranceConstants';
import { mapBasicDetails, mapMembersAges, mapMembersConfig } from './insurancePayloadMappers';
import type { InsuranceFormData, InsurancePageType, QuoteResponse } from './types/insurance.types';
import { getAgeMembers, getCoverOptions, getInsuranceError, validateContact, validateFinal, validateMemberAges, validateMembers, type FieldErrors } from './utils/insuranceValidation';
import { getAgeFromDateOfBirth, getZoneFromCity, normalizeDateOfBirth } from './utils/insuranceUtils';

import { INSURANCE_PRODUCTS as PRODUCTS } from './insuranceProducts';

const createInitialForm = (type: InsurancePageType): InsuranceFormData => ({
  gender: '', members: type === 'personal_accident' ? ['self'] : [], memberCounts: {}, ages: {},
  details: { zone: '3', deductible: String(SUPER_TOPUP_DEDUCTIBLE) },
});


const getPrefillUser = (response: unknown): Record<string, unknown> => {
  const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const root = record(response);
  const data = record(root.data);
  return record(root.user || data.user || root.data || response);
};

export default function InsuranceQuotePageFlow({ insuranceType }: { insuranceType: InsurancePageType }) {
  return <InsuranceFlow key={insuranceType} insuranceType={insuranceType} />;
}

function InsuranceFlow({ insuranceType }: { insuranceType: InsurancePageType }) {
  const product = PRODUCTS[insuranceType];
  const isPA = insuranceType === 'personal_accident';
  const [form, setForm] = useState<InsuranceFormData>(() => createInitialForm(insuranceType));
  const [step, setStep] = useState(0);
  const [quotes, setQuotes] = useState<QuoteResponse[] | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const stepLock = useRef(false);
  const submitLock = useRef(false);
  const quoteRequest = useRef<AbortController | null>(null);
  const formVersion = useRef(0);
  useEffect(() => {
    formVersion.current += 1;
    quoteRequest.current?.abort();
    setQuotes(null);
  }, [form]);
  useEffect(() => () => quoteRequest.current?.abort(), []);
  const ageMembers = useMemo(() => getAgeMembers(form), [form.members, form.memberCounts]);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!sessionStorage.getItem('rp_access_token') && !localStorage.getItem('rp_access_token')) return;
      try {
        let response: unknown;
        try { response = await fetchUserInfo(); } catch { const cached = sessionStorage.getItem('rp_user_profile'); response = cached ? JSON.parse(cached) : {}; }
        if (!mounted) return;
        const profile = getPrefillUser(response);
        const city = String(profile?.city || '');
        const dob = String(profile?.date_of_birth || profile?.dob || profile?.birth_date || '');
        setForm((current) => ({
          ...current,
          details: {
            ...current.details,
            firstName: current.details.firstName || String(profile?.first_name || ''),
            lastName: current.details.lastName || String(profile?.last_name || ''),
            mobileNumber: current.details.mobileNumber || String(profile?.phone || profile?.mobile || '').replace(/\D/g, '').slice(-10),
            city: current.details.city || city,
            pincode: current.details.pincode || String(profile?.pincode || '').replace(/\D/g, '').slice(0, 6),
            zone: current.details.city ? current.details.zone : getZoneFromCity(city),
            dob: current.details.dob || normalizeDateOfBirth(dob),
          },
        }));
      } catch (prefillError) {
        console.warn('Insurance profile prefill failed:', prefillError);
      }
    };
    void loadProfile();
    return () => { mounted = false; };
  }, []);

  const updateDetails = (field: keyof InsuranceFormData['details'], value: string | boolean) => {
    setForm((current) => ({
      ...current,
      details: {
        ...current.details,
        [field]: value,
        ...(field === 'city' && typeof value === 'string' ? { zone: getZoneFromCity(value) } : {}),
      },
    }));
  };
  const updateAge = (memberId: string, age: string) => setForm((current) => ({ ...current, ages: { ...current.ages, [memberId]: age } }));
  const toggleMember = (member: string) => setForm((current) => {
    const selected = current.members.includes(member);
    const counts = { ...current.memberCounts };
    if (!selected && (member === 'son' || member === 'daughter') && !counts[member]) counts[member] = 1;
    return { ...current, members: selected ? current.members.filter((item) => item !== member) : [...current.members, member], memberCounts: counts };
  });
  const updateMemberCount = (member: 'son' | 'daughter', amount: number) => setForm((current) => {
    const previousCount = Math.max(1, current.memberCounts[member] || 1);
    const nextCount = Math.min(4, Math.max(1, previousCount + amount));
    const ages = { ...current.ages };
    if (previousCount === 1 && nextCount > 1) {
      ages[`${member}_1`] = ages[member] ?? '';
      delete ages[member];
    } else if (previousCount > 1 && nextCount === 1) {
      ages[member] = ages[`${member}_1`] ?? '';
      delete ages[`${member}_1`];
    }
    return { ...current, ages, memberCounts: { ...current.memberCounts, [member]: nextCount } };
  });

  const ensureEnquiryId = async () => {
    const existing = Number(form.details.enquiryId);
    if (Number.isInteger(existing) && existing > 0) return existing;
    setBusy('Preparing your insurance application...');
    const crmType = insuranceType === 'supertopup' ? 'super_topup' : insuranceType;
    const response = await startInsurance(crmType);
    const enquiryId = Number(response?.enquiry_id ?? response?.enquiryId ?? response?.id);
    if (!Number.isInteger(enquiryId) || enquiryId <= 0) throw new Error('The insurance service did not return a valid enquiry ID. Please try again.');
    setForm((current) => ({ ...current, details: { ...current.details, enquiryId } }));
    return enquiryId;
  };

  const showErrors = (errors: FieldErrors) => {
    setFieldErrors(errors);
    setError(Object.values(errors)[0] || '');
    return Object.keys(errors).length > 0;
  };

  const handleNext = async () => {
    if (stepLock.current) return;
    stepLock.current = true;
    setError('');
    setFieldErrors({});
    try {
      if (step === 0) {
        if (showErrors(validateMembers(form))) return;
        const enquiryId = await ensureEnquiryId();
        setBusy('Saving selected members...');
        const memberForm = isPA ? { ...form, members: ['self'], memberCounts: {} } : form;
        await saveStep(enquiryId, 1, 'members_config', mapMembersConfig(memberForm));
        setForm((current) => ({ ...current, members: memberForm.members, memberCounts: memberForm.memberCounts, details: { ...current.details, enquiryId } }));
        setStep(1);
        return;
      }
      if (step === 1 && isPA) {
        if (showErrors(validateContact(form, insuranceType))) return;
        const age = getAgeFromDateOfBirth(form.details.dob || '')!;
        const updated = { ...form, members: ['self'], ages: { ...form.ages, self: age } };
        const enquiryId = await ensureEnquiryId();
        setBusy('Saving personal details...');
        await saveStep(enquiryId, 2, 'members', mapMembersAges(updated));
        await saveStep(enquiryId, 3, 'basic', mapBasicDetails(updated));
        setForm(updated);
        setStep(2);
        return;
      }
      if (step === 1) {
        if (showErrors(validateMemberAges(form))) return;
        const enquiryId = Number(form.details.enquiryId);
        if (!Number.isInteger(enquiryId) || enquiryId <= 0) throw new Error('Your enquiry has expired. Go back and restart this quote.');
        setBusy('Saving member ages...');
        await saveStep(enquiryId, 2, 'members', mapMembersAges(form));
        setStep(2);
      }
    } catch (stepError: unknown) {
      setError(getInsuranceError(stepError));
    } finally {
      stepLock.current = false;
      setBusy('');
    }
  };

  const handleSubmit = async () => {
    if (submitLock.current || busy) return;
    const validationErrors = validateFinal(form, insuranceType);
    if (showErrors(validationErrors)) {
      if (isPA && Object.keys(validateContact(form, insuranceType)).length) setStep(1);
      return;
    }
    const enquiryId = Number(form.details.enquiryId);
    if (!Number.isInteger(enquiryId) || enquiryId <= 0) { setError('Your enquiry is missing or expired. Start again from the first step.'); setStep(0); return; }
    const coverOptions = getCoverOptions(insuranceType);
    const coverAmount = coverOptions.find((item) => item.label === form.details.coverAmount)?.value;
    if (!coverAmount) { setError('Select a valid cover amount.'); return; }

    submitLock.current = true;
    const controller = new AbortController();
    quoteRequest.current?.abort();
    quoteRequest.current = controller;
    const version = formVersion.current;
    setError('');
    setNotice('');
    try {
      const result = await submitInsuranceQuote(form, insuranceType, coverAmount, message => { if (!controller.signal.aborted) setBusy(message); }, controller.signal);
      if (controller.signal.aborted || formVersion.current !== version) return;
      setNotice(result.notice);
      setQuotes(result.quotes);
    } catch (submitError: unknown) {
      if (!controller.signal.aborted) setError(getInsuranceError(submitError));
    } finally {
      submitLock.current = false;
      setBusy('');
    }
  };

  const editDetails = () => { setQuotes(null); setNotice(''); setError(''); setStep(2); };
  const resultCover = getCoverOptions(insuranceType).find((item) => item.label === form.details.coverAmount)?.value || 0;
  if (quotes) return <InsuranceQuoteResults quotes={quotes} insuranceType={insuranceType} enquiryId={form.details.enquiryId} coverAmount={resultCover} onEdit={editDetails} notice={notice} />;

  const steps = isPA ? ['Select Self', 'Basic Details', 'Additional Details'] : ['Select Member', 'Select Age of Members', 'Basic Details'];
  return <div className="min-h-full bg-slate-50 px-3 py-6 sm:px-6 lg:px-8 lg:py-10">
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="mb-1 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-purple"><ShieldCheck size={15} /> RewardPlanners Insurance</p><h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{product.title}</h1><p className="mt-1 text-sm text-slate-600">{product.subtitle}</p></div>
        <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"><Check size={15} className="text-emerald-600" />Compare plans from leading insurers</div>
      </header>
      <nav aria-label="Insurance type" className="mb-4 grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-white p-1">{(Object.entries(PRODUCTS) as Array<[InsurancePageType, typeof product]>).map(([type, item]) => <Link key={type} to={item.href} aria-current={type === insuranceType ? 'page' : undefined} className={`flex min-h-10 items-center justify-center rounded px-1 text-center text-xs font-bold transition sm:px-3 sm:text-sm ${type === insuranceType ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>{item.title}</Link>)}</nav>

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.8fr)]">
        <aside className="hidden flex-col justify-between bg-[#31214b] p-7 text-white lg:flex xl:p-9"><div><div className="mb-6 grid h-14 w-14 place-items-center rounded-md bg-white/10"><ShieldCheck size={31} className="text-[#f4b7d2]" /></div><p className="text-xs font-bold uppercase tracking-wider text-[#e4c8f0]">Your cover, your call</p><h2 className="mt-3 text-2xl font-extrabold leading-tight">A clearer way to compare insurance.</h2><p className="mt-3 text-sm leading-6 text-purple-100">Share a few details. We’ll check available insurer plans and show you the quotes.</p></div><div className="space-y-3 border-t border-white/15 pt-5 text-xs text-purple-100"><p className="flex items-center gap-2"><Check size={15} className="text-pink-200" /> No commitment to buy</p><p className="flex items-center gap-2"><Check size={15} className="text-pink-200" /> Your enquiry stays connected to your quote</p></div></aside>

        <section className="min-w-0 p-4 sm:p-7 lg:p-8" aria-label={steps[step]}>
          <ol className="mb-7 grid grid-cols-3" aria-label={`Step ${step + 1} of 3`}>{steps.map((name, index) => <li key={name} aria-current={index === step ? 'step' : undefined} className="relative flex items-center gap-2 text-xs sm:gap-2.5">{index < 2 && <span aria-hidden="true" className={`absolute left-8 right-0 top-4 h-px sm:left-9 ${index < step ? 'bg-brand-purple' : 'bg-slate-200'}`} />}<span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${index < step ? 'border-brand-purple bg-brand-purple text-white' : index === step ? 'border-brand-purple bg-white text-brand-purple ring-2 ring-brand-purple/10' : 'border-slate-200 bg-white text-slate-400'}`}>{index < step ? <Check size={14} /> : index + 1}</span><span className={`relative z-10 max-w-[calc(100%-2.5rem)] bg-white pr-1 font-semibold leading-tight ${index === step ? 'text-slate-900' : 'text-slate-500'}`}>{name}</span></li>)}</ol>
          <form noValidate onSubmit={(event) => { event.preventDefault(); if (step < 2) void handleNext(); else void handleSubmit(); }}>
            <fieldset disabled={Boolean(busy)} className="min-w-0 border-0 p-0">
            {step === 0 && <MemberSelectionStep form={form} errors={fieldErrors} insuranceType={insuranceType} onGenderChange={(gender) => setForm((current) => ({ ...current, gender, members: isPA ? ['self'] : current.members }))} onMemberToggle={toggleMember} onMemberCountChange={updateMemberCount} />}
            {step === 1 && (isPA ? <BasicDetailsStep form={form} errors={fieldErrors} insuranceType={insuranceType} onDetailsChange={updateDetails} /> : <MemberAgeStep form={form} errors={fieldErrors} ageMembers={ageMembers} onAgeChange={updateAge} />)}
            {step === 2 && (isPA ? <PersonalAccidentDetailsStep form={form} errors={fieldErrors} onDetailsChange={updateDetails} /> : <BasicDetailsStep form={form} errors={fieldErrors} insuranceType={insuranceType} onDetailsChange={updateDetails} />)}
            </fieldset>
            {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><CircleAlert size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
            {busy && <p role="status" aria-live="polite" className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-dark"><LoaderCircle size={17} className="animate-spin" />{busy}</p>}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">{step > 0 ? <button type="button" disabled={Boolean(busy)} onClick={() => { setError(''); setStep((current) => Math.max(0, current - 1)); }} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><ArrowLeft size={17} />Back</button> : <span className="text-xs text-slate-500">Step {step + 1} of 3</span>}<button type="submit" disabled={Boolean(busy)} className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-purple px-5 text-sm font-bold text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/30 disabled:cursor-wait disabled:opacity-70">{busy ? <><LoaderCircle size={16} className="animate-spin" />{step === 2 ? 'Processing...' : 'Saving...'}</> : <>{step < 2 ? 'Continue' : 'Compare quotes'}<ArrowRight size={17} /></>}</button></div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500"><ShieldCheck size={14} className="text-brand-purple" />Your details are used to prepare and manage your insurance enquiry.</p>
          </form>
        </section>
      </div>
    </div>
  </div>;
}
