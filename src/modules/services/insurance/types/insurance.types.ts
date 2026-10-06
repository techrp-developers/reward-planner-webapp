export type InsurancePageType = 'health' | 'supertopup' | 'personal_accident';
export type CrmInsuranceType = 'health' | 'super_topup' | 'personal_accident';

export type InsuranceFormData = {
  gender: 'Male' | 'Female' | '';
  members: string[];
  memberCounts: Record<string, number>;
  ages: Record<string, string | number>;
  details: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    mobileNumber?: string;
    pincode?: string;
    city?: string;
    zone?: string;
    coverAmount?: string;
    deductible?: string;
    occupation?: string;
    annualIncomeRange?: string;
    natureOfWork?: string;
    agreeToTerms?: boolean;
    enquiryId?: number;
  };
};

export type QuoteResponse = {
  id?: string;
  url: string;
  success: boolean;
  data?: unknown;
  error?: string;
};

export type NormalizedQuote = QuoteResponse & {
  companyName: string;
  companyLogo?: string;
  planName: string;
  premium?: number;
  coverAmount?: number;
  deductible?: number;
  features: string[];
};

export type MemberConfig = {
  id: string;
  label: string;
  relation: 'self' | 'spouse' | 'son' | 'daughter';
};

export type FamilyPremiumPayload = {
  coverAmount: number;
  zone: number;
  age: number;
  sage: number | null;
  c1age: number | null;
  c2age: number | null;
  c3age: number | null;
  c4age: number | null;
};

export type InsuranceProductConfig = { title: string; subtitle: string; href: string };
