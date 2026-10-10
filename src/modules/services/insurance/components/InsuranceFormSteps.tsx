import { useId } from 'react';
import type { FieldErrors } from '../utils/insuranceValidation';
import Check from '@mui/icons-material/Check';
import Minus from '@mui/icons-material/Remove';
import Plus from '@mui/icons-material/Add';
import UserRound from '@mui/icons-material/PersonOutlined';
import Husband from '../../../../assets/insurance/Gender (1).png';
import Wife from '../../../../assets/insurance/Gender (2).png';
import Son from '../../../../assets/insurance/Gender (3).png';
import Daughter from '../../../../assets/insurance/Gender (4).png';
import {
  CITIES,
  COVER_AMOUNTS,
  INCOME_RANGES,
  NATURE_OF_WORK,
  OCCUPATIONS,
  PA_COVER_AMOUNTS,
  SUPER_COVER_AMOUNTS,
  SUPER_TOPUP_DEDUCTIBLE,
} from '../constant/InsuranceConstants';
import type { InsuranceFormData, InsurancePageType, MemberConfig } from '../types/insurance.types';
import { getCategoryFromNatureOfWork, getZoneFromCity } from '../utils/insuranceUtils';

const inputClass = 'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15';
const labels: Record<string, string> = { self: 'Self', spouse: 'Spouse', son: 'Son', daughter: 'Daughter' };
const images: Record<string, string> = { self: Husband, spouse: Wife, son: Son, daughter: Daughter };

type Props = {
  form: InsuranceFormData;
  errors?: FieldErrors;
  insuranceType: InsurancePageType;
  ageMembers: MemberConfig[];
  onGenderChange: (gender: 'Male' | 'Female') => void;
  onMemberToggle: (member: string) => void;
  onMemberCountChange: (member: 'son' | 'daughter', amount: number) => void;
  onAgeChange: (memberId: string, age: string) => void;
  onDetailsChange: (field: keyof InsuranceFormData['details'], value: string | boolean) => void;
};

function Field({ label, value, onChange, type = 'text', placeholder, inputMode, maxLength, autoComplete, error }: {
  label: string; value: string; onChange: (value: string) => void; type?: string;
  placeholder?: string; inputMode?: 'text' | 'numeric' | 'tel'; maxLength?: number; autoComplete?: string; error?: string;
}) {
  const errorId = useId();
  return <label className="block min-w-0"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputClass} type={type} value={value} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} />{error && <span id={errorId} className="mt-1 block text-xs text-red-700">{error}</span>}</label>;
}

function SelectField({ label, value, onChange, options, placeholder = 'Select an option', error }: {
  label: string; value: string; onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>; placeholder?: string; error?: string;
}) {
  const errorId = useId();
  return <label className="block min-w-0"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><select aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map((option) => <option key={`${option.value}-${option.label}`} value={option.value}>{option.label}</option>)}</select>{error && <span id={errorId} className="mt-1 block text-xs text-red-700">{error}</span>}</label>;
}

export function MemberSelectionStep({ form, errors = {}, insuranceType, onGenderChange, onMemberToggle, onMemberCountChange }: Pick<Props, 'form' | 'errors' | 'insuranceType' | 'onGenderChange' | 'onMemberToggle' | 'onMemberCountChange'>) {
  const isPersonalAccident = insuranceType === 'personal_accident';
  return <section aria-labelledby="member-step-heading">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-purple">{isPersonalAccident ? 'Select self' : 'Select members'}</p><h2 id="member-step-heading" className="mt-1 text-xl font-extrabold text-slate-900">{isPersonalAccident ? 'Who will be insured?' : 'Who needs cover?'}</h2><p className="mt-1 text-sm text-slate-600">Choose the people you want to include.</p></div>
    <div className="mb-5 inline-flex rounded-md border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Gender">
      {(['Male', 'Female'] as const).map((gender) => <button type="button" key={gender} aria-pressed={form.gender === gender} onClick={() => onGenderChange(gender)} className={`min-h-9 rounded px-5 text-sm font-semibold transition ${form.gender === gender ? 'bg-brand-purple text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}>{gender}</button>)}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {(isPersonalAccident ? ['self'] as const : ['self', 'spouse', 'son', 'daughter'] as const).map((member) => {
        const selected = isPersonalAccident ? member === 'self' : form.members.includes(member);
        const avatar = member === 'self' ? (form.gender === 'Male' ? Husband : Wife) : member === 'spouse' ? (form.gender === 'Male' ? Wife : Husband) : images[member];
        return <div key={member} className="min-w-0">
          <button type="button" disabled={isPersonalAccident && member !== 'self'} aria-pressed={selected} onClick={() => !isPersonalAccident && onMemberToggle(member)} className={`relative flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-md border p-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-purple/25 disabled:cursor-default ${selected ? 'border-brand-purple bg-purple-50/60 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-purple/40'}`}>
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-slate-100"><img src={avatar} alt="" className="h-full w-full object-contain" /></span>
            <span>{labels[member]}</span>
            <span className={`absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full border ${selected ? 'border-brand-purple bg-brand-purple text-white' : 'border-slate-300 bg-white'}`}>{selected && <Check sx={{ fontSize: 13 }} />}</span>
          </button>
          {(member === 'son' || member === 'daughter') && selected && !isPersonalAccident && <div className="mt-2 flex items-center justify-between rounded border border-slate-200 bg-white px-2 py-1"><button type="button" disabled={(form.memberCounts[member] || 1) <= 1} aria-label={`Remove one ${member}`} onClick={() => onMemberCountChange(member, -1)} className="grid h-7 w-7 place-items-center rounded text-brand-purple hover:bg-purple-50"><Minus sx={{ fontSize: 14 }} /></button><span className="text-sm font-bold text-slate-800">{form.memberCounts[member] || 1}</span><button type="button" disabled={(['son', 'daughter'] as const).reduce((total, child) => total + (form.members.includes(child) ? form.memberCounts[child] || 1 : 0), 0) >= 4} aria-label={`Add one ${member}`} onClick={() => onMemberCountChange(member, 1)} className="grid h-7 w-7 place-items-center rounded text-brand-purple hover:bg-purple-50"><Plus sx={{ fontSize: 14 }} /></button></div>}
        </div>;
      })}
    </div>
    {(errors.gender || errors.members) && <p className="mt-3 text-sm text-red-700">{errors.gender || errors.members}</p>}
    {isPersonalAccident && <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><UserRound sx={{ fontSize: 16 }} className="text-brand-purple" />Personal Accident insurance covers the self member only.</p>}
  </section>;
}

export function MemberAgeStep({ form, errors = {}, ageMembers, onAgeChange }: Pick<Props, 'form' | 'errors' | 'ageMembers' | 'onAgeChange'>) {
  return <section aria-labelledby="age-step-heading">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-purple">Member ages</p><h2 id="age-step-heading" className="mt-1 text-xl font-extrabold text-slate-900">How old is everyone?</h2><p className="mt-1 text-sm text-slate-600">Each selected person needs an age from 1 to 100.</p></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ageMembers.map((member) => <label key={member.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100"><img src={member.relation === 'self' ? (form.gender === 'Male' ? Husband : Wife) : member.relation === 'spouse' ? (form.gender === 'Male' ? Wife : Husband) : images[member.relation]} alt="" className="h-full w-full object-contain" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{member.label}</span><span className="text-xs text-slate-500">Age</span></span>
        <span className="flex w-28 shrink-0 items-center rounded border border-slate-300 focus-within:border-brand-purple focus-within:ring-2 focus-within:ring-brand-purple/15"><select aria-label={`${member.label} age`} aria-invalid={Boolean(errors[member.id])} aria-describedby={errors[member.id] ? `age-error-${member.id}` : undefined} className="min-h-10 w-full min-w-0 bg-transparent px-2 text-sm outline-none" value={String(form.ages[member.id] ?? '')} onChange={(event) => onAgeChange(member.id, event.target.value)}><option value="">Age</option>{Array.from({ length: 100 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select><span className="pr-2 text-xs text-slate-500">years</span></span>
        {errors[member.id] && <span id={`age-error-${member.id}`} className="basis-full text-xs text-red-700">{errors[member.id]}</span>}
      </label>)}
    </div>
  </section>;
}

export function BasicDetailsStep({ form, errors = {}, insuranceType, onDetailsChange }: Pick<Props, 'form' | 'errors' | 'insuranceType' | 'onDetailsChange'>) {
  const isPersonalAccident = insuranceType === 'personal_accident';
  const city = form.details.city || '';
  const cityZone = city ? getZoneFromCity(city) : '';
  const coverOptions = insuranceType === 'supertopup' ? SUPER_COVER_AMOUNTS : insuranceType === 'personal_accident' ? PA_COVER_AMOUNTS : COVER_AMOUNTS;
  return <section aria-labelledby="basic-step-heading">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-purple">{isPersonalAccident ? 'Personal details' : 'Contact and cover'}</p><h2 id="basic-step-heading" className="mt-1 text-xl font-extrabold text-slate-900">{isPersonalAccident ? 'Tell us about yourself' : 'Shape your cover'}</h2><p className="mt-1 text-sm text-slate-600">Your details help insurers prepare an accurate quote.</p></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="First name" error={errors.firstName} value={form.details.firstName || ''} autoComplete="given-name" onChange={(value) => onDetailsChange('firstName', value)} />
      <Field label="Last name" error={errors.lastName} value={form.details.lastName || ''} autoComplete="family-name" onChange={(value) => onDetailsChange('lastName', value)} />
      {isPersonalAccident && <Field label="Date of birth" error={errors.dob} type="date" value={form.details.dob || ''} onChange={(value) => onDetailsChange('dob', value)} />}
      <Field label="Mobile number" error={errors.mobileNumber} type="tel" inputMode="tel" maxLength={10} autoComplete="tel-national" value={form.details.mobileNumber || ''} placeholder="10-digit mobile number" onChange={(value) => onDetailsChange('mobileNumber', value.replace(/\D/g, '').slice(0, 10))} />
      <Field label="PIN code" error={errors.pincode} inputMode="numeric" maxLength={6} value={form.details.pincode || ''} placeholder="6-digit PIN code" onChange={(value) => onDetailsChange('pincode', value.replace(/\D/g, '').slice(0, 6))} />
      <label className="block min-w-0"><span className="mb-1.5 block text-sm font-semibold text-slate-700">City</span><input aria-label="City" className={inputClass} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "city-error" : undefined} list="insurance-cities" value={city} autoComplete="address-level2" onChange={(event) => { onDetailsChange('city', event.target.value); }} placeholder="Search or select city" /><datalist id="insurance-cities">{CITIES.map((item) => <option value={item} key={item} />)}</datalist>{errors.city && <span id="city-error" className="mt-1 block text-xs text-red-700">{errors.city}</span>}</label>
      <label className="block min-w-0"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Zone</span><input aria-label="Zone" className={`${inputClass} bg-slate-50 text-slate-600`} value={cityZone ? `Zone ${cityZone}` : 'Auto-filled from city'} readOnly aria-readonly="true" /></label>
      {!isPersonalAccident && <SelectField label="Cover amount" error={errors.coverAmount} value={form.details.coverAmount || ''} onChange={(value) => onDetailsChange('coverAmount', value)} options={coverOptions.map((option) => ({ value: option.label, label: option.label }))} />}
      {insuranceType === 'supertopup' && <label className="block min-w-0"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Deductible</span><input aria-label="Deductible" className={`${inputClass} bg-slate-50 text-slate-700`} value={`₹${SUPER_TOPUP_DEDUCTIBLE.toLocaleString('en-IN')}`} readOnly aria-readonly="true" /><span className="mt-1 block text-xs text-slate-500">Default deductible used by the current Super Top-Up plan set.</span></label>}
    </div>
    {errors.agreeToTerms && <p className="mt-3 text-xs text-red-700">{errors.agreeToTerms}</p>}
    {!isPersonalAccident && <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-600"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-purple" aria-invalid={Boolean(errors.agreeToTerms)} checked={Boolean(form.details.agreeToTerms)} onChange={(event) => onDetailsChange('agreeToTerms', event.target.checked)} /><span>I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-brand-purple underline">Terms &amp; Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-semibold text-brand-purple underline">Privacy Policy</a>.</span></label>}
  </section>;
}

export function PersonalAccidentDetailsStep({ form, errors = {}, onDetailsChange }: Pick<Props, 'form' | 'errors' | 'onDetailsChange'>) {
  const category = getCategoryFromNatureOfWork(form.details.natureOfWork);
  return <section aria-labelledby="pa-step-heading">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-purple">Personal Accident</p><h2 id="pa-step-heading" className="mt-1 text-xl font-extrabold text-slate-900">Additional details</h2><p className="mt-1 text-sm text-slate-600">Occupation and work risk determine your Personal Accident category.</p></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SelectField label="Occupation of insured" error={errors.occupation} value={form.details.occupation || ''} onChange={(value) => onDetailsChange('occupation', value)} options={OCCUPATIONS.map((item) => ({ value: item.label, label: item.label }))} />
      <SelectField label="Annual income range" error={errors.annualIncomeRange} value={form.details.annualIncomeRange || ''} onChange={(value) => onDetailsChange('annualIncomeRange', value)} options={INCOME_RANGES.map((item) => ({ value: item.label, label: item.label }))} />
      <label className="block min-w-0 sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Nature of work / designation</span><select aria-label="Nature of work / designation" aria-invalid={Boolean(errors.natureOfWork)} aria-describedby={errors.natureOfWork ? "work-error" : undefined} className={inputClass} value={form.details.natureOfWork || ''} onChange={(event) => onDetailsChange('natureOfWork', event.target.value)}><option value="">Select nature of work</option>{Object.entries(NATURE_OF_WORK).map(([risk, options]) => <optgroup label={`Category ${risk}`} key={risk}>{options.map((option) => <option value={option.label} key={option.value}>{option.label}</option>)}</optgroup>)}</select>{errors.natureOfWork && <span id="work-error" className="mt-1 block text-xs text-red-700">{errors.natureOfWork}</span>}</label>
      <SelectField label="Cover amount" error={errors.coverAmount} value={form.details.coverAmount || ''} onChange={(value) => onDetailsChange('coverAmount', value)} options={PA_COVER_AMOUNTS.map((option) => ({ value: option.label, label: option.label }))} />
    </div>
    {category && <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-brand-dark"><Check sx={{ fontSize: 16 }} />Mapped to risk category {category}</p>}
    {errors.agreeToTerms && <p className="mt-3 text-xs text-red-700">{errors.agreeToTerms}</p>}
    <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-600"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-purple" aria-invalid={Boolean(errors.agreeToTerms)} checked={Boolean(form.details.agreeToTerms)} onChange={(event) => onDetailsChange('agreeToTerms', event.target.checked)} /><span>I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-brand-purple underline">Terms &amp; Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-semibold text-brand-purple underline">Privacy Policy</a>.</span></label>
  </section>;
}