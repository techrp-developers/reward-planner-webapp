import axios from 'axios';
import type { FamilyPremiumPayload, InsuranceFormData, InsurancePageType, MemberConfig } from '../types/insurance.types';
import { COVER_AMOUNTS, PA_COVER_AMOUNTS, SUPER_COVER_AMOUNTS, SUPER_TOPUP_DEDUCTIBLE } from '../constant/InsuranceConstants';
import { getAgeFromDateOfBirth, getCategoryFromNatureOfWork } from './insuranceUtils';

export type FieldErrors = Record<string, string>;

export const getAgeMembers = (form: InsuranceFormData): MemberConfig[] => form.members.flatMap((member) => {
  const relation = member as MemberConfig['relation'];
  const count = member === 'son' || member === 'daughter' ? Math.max(1, form.memberCounts[member] || 1) : 1;
  return Array.from({ length: count }, (_, index) => ({
    id: count > 1 ? `${member}_${index + 1}` : member,
    label: `${member === 'self' ? 'Self' : member[0].toUpperCase() + member.slice(1)}${count > 1 ? ` ${index + 1}` : ''}`,
    relation,
  }));
});

export const getCoverOptions = (type: InsurancePageType) => type === 'supertopup' ? SUPER_COVER_AMOUNTS : type === 'personal_accident' ? PA_COVER_AMOUNTS : COVER_AMOUNTS;

export function validateMembers(form: InsuranceFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.gender) errors.gender = 'Select your gender.';
  if (!form.members.length) errors.members = 'Select at least one member.';
  if (getAgeMembers(form).filter((member) => ['son', 'daughter'].includes(member.relation)).length > 4) {
    errors.members = 'The available premium APIs support up to four children in total.';
  }
  return errors;
}

export function validateMemberAges(form: InsuranceFormData): FieldErrors {
  const errors: FieldErrors = {};
  for (const member of getAgeMembers(form)) {
    const age = Number(form.ages[member.id]);
    if (!Number.isInteger(age) || age < 1 || age > 100) errors[member.id] = `Select an age from 1 to 100 for ${member.label}.`;
  }
  return errors;
}

export function validateContact(form: InsuranceFormData, type: InsurancePageType): FieldErrors {
  const errors: FieldErrors = {};
  const details = form.details;
  if (!details.firstName?.trim()) errors.firstName = 'Enter your first name.';
  if (!details.lastName?.trim()) errors.lastName = 'Enter your last name.';
  if (!/^[6-9]\d{9}$/.test(details.mobileNumber || '')) errors.mobileNumber = 'Enter a valid 10-digit mobile number starting with 6–9.';
  if (!/^\d{6}$/.test(details.pincode || '')) errors.pincode = 'Enter a valid 6-digit PIN code.';
  if (!details.city?.trim()) errors.city = 'Select or enter your city.';
  if (type === 'personal_accident') {
    const age = getAgeFromDateOfBirth(details.dob || '');
    if (age === null || age < 1 || age > 100) errors.dob = 'Enter a valid date of birth with an insured age from 1 to 100.';
  }
  return errors;
}

export function validateFinal(form: InsuranceFormData, type: InsurancePageType): FieldErrors {
  const errors = { ...validateMembers(form), ...validateContact(form, type), ...(type !== 'personal_accident' ? validateMemberAges(form) : {}) };
  if (!getCoverOptions(type).some((option) => option.label === form.details.coverAmount)) errors.coverAmount = 'Select a valid cover amount.';
  if (!form.details.agreeToTerms) errors.agreeToTerms = 'Accept the terms to request quotes.';
  if (type === 'supertopup' && Number(form.details.deductible) !== SUPER_TOPUP_DEDUCTIBLE) errors.deductible = 'Use the deductible supported by the current plan set.';
  if (type === 'personal_accident') {
    if (!form.details.occupation) errors.occupation = 'Select your occupation.';
    if (!form.details.annualIncomeRange) errors.annualIncomeRange = 'Select your annual income range.';
    if (!getCategoryFromNatureOfWork(form.details.natureOfWork)) errors.natureOfWork = 'Select your nature of work.';
  }
  return errors;
}

export function buildFamilyPremiumPayload(form: InsuranceFormData, coverAmount: number): FamilyPremiumPayload {
  const members = getAgeMembers(form);
  const primary = members.find((member) => member.relation === 'self') || members.find((member) => member.relation === 'spouse') || members[0];
  const children = members.filter((member) => ['son', 'daughter'].includes(member.relation));
  if (!primary || children.length > 4 || Object.keys(validateMemberAges(form)).length) throw new Error('Check the selected members and their ages.');
  // A child-only selection uses the first child as the primary insured exactly once.
  const dependants = children.filter((member) => member.id !== primary.id);
  const ages = dependants.map((member) => Number(form.ages[member.id]));
  return {
    coverAmount, zone: Number(form.details.zone) || 3, age: Number(form.ages[primary.id]),
    sage: primary.relation === 'self' && form.members.includes('spouse') ? Number(form.ages.spouse) : null,
    c1age: ages[0] ?? null, c2age: ages[1] ?? null, c3age: ages[2] ?? null, c4age: ages[3] ?? null,
  };
}

export function getInsuranceError(error: unknown, fallback = 'Unable to save your insurance request. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401 || error.response?.status === 403) return 'Your session expired or access was denied. Please sign in again.';
    const data = error.response?.data;
    if (data && typeof data.message === 'string') return data.message;
    if (data && typeof data.error === 'string') return data.error;
    if (!error.response) return 'The insurance service could not be reached. Check your connection and try again.';
  }
  return error instanceof Error ? error.message : fallback;
}
