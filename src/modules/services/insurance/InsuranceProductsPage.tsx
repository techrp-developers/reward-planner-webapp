import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, HeartPulse, ShieldCheck, ShieldPlus } from 'lucide-react';
import { INSURANCE_PRODUCTS } from './insuranceProducts';
import type { InsurancePageType } from './types/insurance.types';

const ICONS = { health: HeartPulse, supertopup: ShieldPlus, personal_accident: ShieldCheck };
const DETAILS = {
  health: 'Choose who needs cover, add each member’s age, and compare available health plans.',
  supertopup: 'Select your family, cover amount and deductible to compare additional health protection.',
  personal_accident: 'Add your personal and work details to compare accident protection for yourself.',
};

export default function InsuranceProductsPage() {
  return <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
    <div className="mx-auto max-w-6xl">
      <Link to="/services" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-purple"><ArrowLeft size={16} />All Services</Link>
      <header className="mb-7 border-b border-slate-200 pb-6">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-purple"><ShieldCheck size={16} />RewardPlanners Insurance</p>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Insurance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose your insurance product to start an enquiry and compare available plans.</p>
      </header>
      <section aria-label="Insurance products" className="grid gap-4 md:grid-cols-3">
        {(Object.keys(INSURANCE_PRODUCTS) as InsurancePageType[]).map((type) => {
          const product = INSURANCE_PRODUCTS[type];
          const Icon = ICONS[type];
          return <article key={type} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-purple-50 text-brand-purple"><Icon size={26} /></span>
            <h2 className="text-lg font-bold text-slate-900">{product.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{DETAILS[type]}</p>
            <Link to={product.href} aria-label={`Compare ${product.title} quotes`} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-purple px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/40">Compare quotes<ArrowRight size={16} /></Link>
          </article>;
        })}
      </section>
    </div>
  </div>;
}
