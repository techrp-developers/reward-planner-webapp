import type { NormalizedQuote, QuoteResponse } from '../types/insurance.types';

type RecordValue = Record<string, unknown>;

const asRecord = (value: unknown): RecordValue =>
  value !== null && typeof value === 'object' ? value as RecordValue : {};

const asText = (value: unknown): string => typeof value === 'string' ? value.trim() : '';

export const isUnavailableQuoteMessage = (message: string): boolean =>
  /no premium (found|available)|no matching premium|premium not found|not eligible/i.test(message);

export const getCompanyName = (value: unknown, url: string): string => {
  const data = asRecord(value);
  const company = asRecord(data.company);
  const name = asText(data.company) || asText(data.companyName) || asText(data.insurerName) || asText(company.company_name) ||
    asText(company.companyName) || asText(company.name) || asText(company.insurerName);
  if (name) return name;
  return /\/health-insurance\/([^/]+)/.exec(url)?.[1].toUpperCase() || 'Insurance provider';
};

export const getPlanName = (value: unknown, fallback: string): string => {
  const data = asRecord(value);
  const plan = asRecord(data.plan);
  return asText(data.planName) || asText(data.plan_name) || asText(data.plan) ||
    asText(plan.plan_name) || asText(plan.planName) || asText(plan.name) || asText(plan.title) || fallback;
};

export const getPremiumAmount = (value: unknown): number | undefined => {
  const data = asRecord(value);
  const premiums = Array.isArray(data.premiums) ? asRecord(data.premiums[0]) : {};
  for (const value of [premiums.premium, premiums.value, data.totalPayablePremium, data.totalBasePremium, data.premium, data.total_premium]) {
    const amount = Number(typeof value === 'string' ? value.replace(/[₹,\s]/g, '') : value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return undefined;
};

export const getCompanyLogo = (value: unknown, url: string): string | undefined => {
  const data = asRecord(value);
  const company = asRecord(data.company);
  const supplied = asText(data.logoUrl) || asText(company.logo);
  if (supplied.startsWith('https://') || supplied.startsWith('http://')) return supplied;
  if (supplied.toLowerCase().endsWith('.svg')) return undefined;
  const companyKey = /\/health-insurance\/([^/]+)/.exec(url)?.[1].toLowerCase() || 'general';
  const logo = supplied || `${companyKey}.png`;
  const base = asText(data.logoUrl)
    ? 'https://policyplanner.com/super-top-up/assets/quote/'
    : 'https://policyplanner.com/assets/quote/';
  return `${base}${encodeURIComponent(logo)}`;
};

export const getPlanFeatures = (value: unknown): string[] => {
  const data = asRecord(value);
  if (!Array.isArray(data.features)) return [];
  return data.features.flatMap((item) => {
    const feature = asRecord(item);
    const text = asText(feature.includes) || asText(feature.addons) || asText(item);
    return text.length > 2 ? [text] : [];
  }).slice(0, 3);
};

export const normalizeQuoteForDisplay = (
  quote: QuoteResponse,
  fallbackCoverAmount: number,
  defaultPlanName: string,
): NormalizedQuote => {
  const data = asRecord(quote.data);
  const premiums = Array.isArray(data.premiums) ? asRecord(data.premiums[0]) : {};
  const coverAmount = Number(data.coverAmount ?? data.sum_insured ?? fallbackCoverAmount);
  const deductible = Number(premiums.deductible ?? data.deductible);
  return {
    ...quote,
    companyName: getCompanyName(quote.data, quote.url),
    companyLogo: getCompanyLogo(quote.data, quote.url),
    planName: getPlanName(quote.data, defaultPlanName),
    premium: getPremiumAmount(quote.data),
    coverAmount: Number.isFinite(coverAmount) && coverAmount > 0 ? coverAmount : fallbackCoverAmount,
    deductible: Number.isFinite(deductible) && deductible > 0 ? deductible : undefined,
    features: getPlanFeatures(quote.data),
  };
};

export const buildSelectedPlanPayload = (quote: NormalizedQuote) => {
  const data = asRecord(quote.data);
  const company = asRecord(data.company);
  const plan = asRecord(data.plan);
  const premiums = Array.isArray(data.premiums) ? asRecord(data.premiums[0]) : {};
  // PA responses use plain company/plan names; their numeric IDs live in the source URL.
  const sourceIds = /\/health-insurance\/[^/]+\/(\d+)\/(\d+)\//.exec(quote.url);
  return {
    companyId: String(data.companyId ?? data.company_id ?? company.company_id ?? company.companyId ?? company.id ?? sourceIds?.[1] ?? ''),
    planId: String(data.planId ?? data.plan_id ?? plan.plan_id ?? plan.planId ?? plan.id ?? sourceIds?.[2] ?? ''),
    planName: quote.planName,
    sum_insured: Number(data.sum_insured ?? data.coverAmount ?? quote.coverAmount),
    selectedPremium: quote.premium,
    selectedDeductible: Number(premiums.deductible ?? data.deductible) || 0,
  };
};
