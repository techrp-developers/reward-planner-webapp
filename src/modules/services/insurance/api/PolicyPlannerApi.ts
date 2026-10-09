import axios, { type RawAxiosRequestHeaders } from 'axios';
import type { FamilyPremiumPayload, QuoteResponse } from '../types/insurance.types';
import { getInsuranceError } from '../utils/insuranceValidation';
import { isUnavailableQuoteMessage } from '../utils/insuranceQuoteUtils';

// Public insurer endpoints must not receive RewardPlanners bearer tokens.
const api = axios.create({ timeout: 10000 });
const POLICY_ORIGIN = 'https://policyplanner.com';
const configuredBase = import.meta.env.VITE_POLICYPLANNER_BASE_URL?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? '/api/policyplanner' : POLICY_ORIGIN);
const requestUrl = (source: string) => {
  const url = new URL(source, POLICY_ORIGIN);
  if (url.origin !== POLICY_ORIGIN) throw new Error('Unexpected PolicyPlanner endpoint returned by the plan service.');
  return `${configuredBase}${url.pathname}${url.search}`;
};

type Plan = { api_type: string } & Record<string, unknown>;
type Headers = RawAxiosRequestHeaders;
export type PAPremiumPayload = { coverAmount: number; category: number; age: number };
export type SuperTopupPremiumPayload = FamilyPremiumPayload & { deductible: number };

async function fetchPlanList(policy: string, headers?: Headers, healthFallback = false): Promise<Plan[]> {
  let lastError: unknown;
  const paths = healthFallback ? ['companies/plans', '/companies/plans'] : ['companies/plans'];
  for (const path of paths) {
    try {
      const res = await api.get(requestUrl(`/health-insurance/${path}?policy=${policy}`), { headers });
      if (res.data?.success === false) throw new Error(res.data.message || 'The insurer plan service rejected this request.');
      if (!Array.isArray(res.data?.data)) throw new Error('The insurer plan service returned an unexpected response.');
      return res.data.data.filter((value: unknown): value is Plan =>
        Boolean(value && typeof value === 'object' && typeof (value as Plan).api_type === 'string'));
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

export const fetchPlans = (headers?: Headers) => fetchPlanList('Health', headers, true);
export const fetchSuperTopUpPlans = (headers?: Headers) => fetchPlanList('super_top_up', headers);
export const fetchPAPlans = (headers?: Headers) => fetchPlanList('pa', headers);

const getCompanyFromUrl = (url: string) => new URL(url, POLICY_ORIGIN).pathname.split('/').filter(Boolean)[1] || 'general';

// Keep the existing insurer-specific payload contract.
const buildHealthPayload = (company: string, payload: FamilyPremiumPayload) => {
  const base = { coverAmount: Number(payload.coverAmount) || 0, zone: String(payload.zone || '1'), age: Number(payload.age) || 30 };
  switch (company) {
    case 'nic': case 'bajaj': case 'hdfc': case 'icici': case 'tata':
      return { ...base, sage: payload.sage ?? null, c1age: payload.c1age ?? null, c2age: payload.c2age ?? null, c3age: payload.c3age ?? null, c4age: payload.c4age ?? null };
    default: return base;
  }
};

async function postPremium(url: string, payload: unknown, headers?: Headers): Promise<unknown> {
  if (!url) throw new Error('The insurer premium API URL is missing.');
  const res = await api.post(requestUrl(url), payload, { headers: { 'Content-Type': 'application/json', ...headers } });
  return res.data;
}

export const getPremium = (url: string, payload: FamilyPremiumPayload, headers?: Headers) =>
  postPremium(url, buildHealthPayload(getCompanyFromUrl(url), payload), headers);

export const getSuperTopUpPremium = (url: string, payload: SuperTopupPremiumPayload, headers?: Headers) =>
  postPremium(url, {
    coverAmount: payload.coverAmount, deductible: payload.deductible || 500000, age: payload.age,
    sage: payload.sage ?? null, c1age: payload.c1age ?? null, c2age: payload.c2age ?? null, c3age: payload.c3age ?? null, c4age: payload.c4age ?? null,
  }, headers);

export const getPAPremium = (url: string, payload: PAPremiumPayload, headers?: Headers) => {
  if (!payload.coverAmount || !payload.category || !payload.age) throw new Error('coverAmount, category, and age are required');
  return postPremium(url, payload, headers);
};

async function collectPremiums(plans: Plan[], premium: (url: string) => Promise<unknown>): Promise<QuoteResponse[]> {
  const responses = await Promise.allSettled(plans.map((plan) => premium(plan.api_type)));
  return responses.map((res, index) => {
    const error = res.status === 'rejected' ? getInsuranceError(res.reason, 'This insurer could not provide a quote.') : undefined;
    return {
      id: `${plans[index].api_type}_${index}`, url: plans[index].api_type,
      success: res.status === 'fulfilled',
      data: res.status === 'fulfilled' ? res.value : undefined,
      error,
      unavailable: Boolean(error && isUnavailableQuoteMessage(error)),
      status: res.status === 'rejected' && axios.isAxiosError(res.reason) ? res.reason.response?.status : undefined,
    };
  });
}

export const getAllPremiums = async (payload: FamilyPremiumPayload) => collectPremiums(await fetchPlans(), (url) => getPremium(url, payload));
export const getAllSuperTopUpPremiums = async (payload: SuperTopupPremiumPayload) => collectPremiums(await fetchSuperTopUpPlans(), (url) => getSuperTopUpPremium(url, payload));
export const getAllPAPremiums = async (payload: PAPremiumPayload) => collectPremiums(await fetchPAPlans(), (url) => getPAPremium(url, payload));
