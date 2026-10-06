import { NATURE_OF_WORK } from '../constant/InsuranceConstants';
import type { InsuranceFormData } from '../types/insurance.types';

const COMPANY_ID_DEFAULT = 'PP739792';

const toStringValue = (value: unknown, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value);

const getAgeValue = (ages: InsuranceFormData['ages'], key: string, fallback = '') =>
  toStringValue(ages[key], fallback);

const getCommon = (formData: InsuranceFormData, companyId?: string) => ({
  companyId: companyId || COMPANY_ID_DEFAULT,
  created_at: new Date().toISOString(),
  cust_fname: toStringValue(formData.details.firstName),
  cust_lname: toStringValue(formData.details.lastName),
  cust_mobile: toStringValue(formData.details.mobileNumber),
  cust_city: toStringValue(formData.details.city),
  cust_Pincode: toStringValue(formData.details.pincode),
  gender: toStringValue(formData.gender || 'Male', 'Male'),
  zone: toStringValue(formData.details.zone),
  __currentStep: 3,
  __savedAt: new Date().toISOString(),
});

const getRiskTabAndCategory = (natureOfWork?: string) => {
  if (!natureOfWork) return { risk_tab: '1', riskcategory: '' };
  for (const [tab, options] of Object.entries(NATURE_OF_WORK)) {
    const match = options.find((option) => option.label === natureOfWork);
    if (match) return { risk_tab: tab, riskcategory: match.label };
  }
  return { risk_tab: '1', riskcategory: natureOfWork };
};

export const buildHealthEnquiryData = (formData: InsuranceFormData, coverAmountValue: number) => {
  const members = formData.members;
  const hasSelf = members.includes('self');
  const hasSpouse = members.includes('spouse');
  const hasSon = members.includes('son');
  const hasDaughter = members.includes('daughter');
  const sonCount = hasSon ? toStringValue(formData.memberCounts.son || 1) : '0';
  const daughterCount = hasDaughter ? toStringValue(formData.memberCounts.daughter || 1) : '0';
  const payload: Record<string, string | number> = {
    ...getCommon(formData), form_name: 'enquiry_form', lead_type: 'health', mobile_verified: '1',
    cover_amount: toStringValue(coverAmountValue), cover_for: `${hasSelf ? '1' : '0'}${hasSpouse ? '1' : '0'}${sonCount}${daughterCount}`,
    Age: getAgeValue(formData.ages, 'self', '30'), SAge: hasSpouse ? getAgeValue(formData.ages, 'spouse') : '',
    sonCount, daughterCount,
  };
  if (hasSelf) payload.self = 'on';
  if (hasSpouse) payload.spouse = 'on';
  if (hasSon) payload.son = 'on';
  if (hasDaughter) payload.daughter = 'on';
  for (let index = 1; index <= Number(sonCount); index += 1) {
    const key = Number(sonCount) === 1 ? 'son' : `son_${index}`;
    payload[`son${index}Age`] = getAgeValue(formData.ages, key);
  }
  for (let index = 1; index <= Number(daughterCount); index += 1) {
    const key = Number(daughterCount) === 1 ? 'daughter' : `daughter_${index}`;
    payload[`daughter${index}Age`] = getAgeValue(formData.ages, key);
  }
  return payload;
};

export const buildSuperTopupEnquiryData = (formData: InsuranceFormData, coverAmountValue: number) => ({
  ...buildHealthEnquiryData(formData, coverAmountValue),
  lead_type: 'super-top-up',
  deductible: toStringValue(formData.details.deductible),
  cover_amount: toStringValue(coverAmountValue),
  Age: getAgeValue(formData.ages, 'self', '30'),
  SAge: formData.members.includes('spouse') ? getAgeValue(formData.ages, 'spouse') : '',
  ...(formData.members.includes('self') ? { self: 'on' } : {}),
});

export const buildPersonalAccidentEnquiryData = (formData: InsuranceFormData, coverAmountValue: number) => {
  const { risk_tab, riskcategory } = getRiskTabAndCategory(formData.details.natureOfWork);
  return {
    ...getCommon(formData),
    lead_type: 'personal-accident',
    plan_type: 'pa',
    dob: toStringValue(formData.details.dob),
    Age: getAgeValue(formData.ages, 'self'),
    self: 'on',
    cover_amount: toStringValue(coverAmountValue),
    income_range: toStringValue(formData.details.annualIncomeRange),
    occupation_of_insured: toStringValue(formData.details.occupation),
    risk_tab,
    riskcategory,
  };
};
