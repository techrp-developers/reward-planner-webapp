import axios from 'axios';
import api from '../../../../api/client';
import { ENDPOINTS } from '../../../../api/endpoints';
import type { CrmInsuranceType } from '../types/insurance.types';
import { getInsuranceError } from '../utils/insuranceValidation';

export const API = api;
export type InsuranceType = CrmInsuranceType;

export const startInsurance = async (insurance_type: InsuranceType): Promise<{ enquiry_id: number; enquiryId: number; [key: string]: unknown }> => {
  try {
    const res = await API.post(ENDPOINTS.services.insurance.start, { insurance_type });
    const payload = (res.data?.data || res.data) as Record<string, unknown>;
    const enquiryId = Number(payload?.enquiry_id ?? payload?.enquiryId ?? payload?.id);
    if (!Number.isInteger(enquiryId) || enquiryId <= 0) throw new Error('The insurance service returned an invalid enquiry ID. Please try again.');
    return { ...payload, enquiry_id: enquiryId, enquiryId };
  } catch (error: unknown) { throw new Error(getInsuranceError(error)); }
};

export const saveStep = async (enquiry_id: number, step: number, section: string, data: unknown): Promise<unknown> => {
  const res = await API.post(ENDPOINTS.services.insurance.saveStep, { enquiry_id, step, section, data });
  return res.data;
};

export const completeInsurance = async (enquiry_id: number): Promise<unknown> => {
  const res = await API.post(ENDPOINTS.services.insurance.complete, { enquiry_id });
  return res.data;
};

const sleep = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal?.aborted) { reject(signal.reason); return; }
  const abort = () => { clearTimeout(timer); reject(signal?.reason); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
  signal?.addEventListener('abort', abort, { once: true });
});
const messageOf = (error: unknown): string => {
  if (axios.isAxiosError(error)) return String(error.response?.data?.message || error.message).toLowerCase();
  return error instanceof Error ? error.message.toLowerCase() : '';
};

// Preserve POST/GET compatibility and the existing exponential backoff for pending enquiries.
export const getQuotes = async (enquiry_id: number, retries = 8, signal?: AbortSignal): Promise<unknown> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    signal?.throwIfAborted();
    try {
      const res = await API.post(ENDPOINTS.services.insurance.getQuotes, { enquiry_id }, { signal });
      return res.data;
    } catch (error: unknown) {
      signal?.throwIfAborted();
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const message = messageOf(error);
      const routeIssue = status === 404 || status === 405 || message.includes('route') || message.includes('method not allowed');
      if (routeIssue) {
        try {
          const res = await API.get(ENDPOINTS.services.insurance.getQuotes, { params: { enquiry_id }, signal });
          return res.data;
        } catch (getError: unknown) { lastError = getError; }
      } else lastError = error;
      const pending = messageOf(lastError);
      const enquiryPending = ['enquiry not found', 'enquiry id not found', 'not found', 'not fount', 'not ready', 'processing', 'try again'].some((part) => pending.includes(part));
      if (!enquiryPending || attempt >= retries) throw lastError;
      await sleep(Math.min(12000, Math.round(1000 * Math.pow(1.5, attempt - 1))), signal);
    }
  }
  throw lastError || new Error('Unable to fetch quotes');
};

export const selectPlan = async (enquiry_id: number, plan: unknown): Promise<unknown> => {
  const res = await API.post(ENDPOINTS.services.insurance.selectPlan, { enquiry_id, plan });
  return res.data;
};
