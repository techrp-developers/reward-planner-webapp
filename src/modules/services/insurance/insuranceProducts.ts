import type { InsurancePageType, InsuranceProductConfig } from './types/insurance.types';

export const INSURANCE_PRODUCTS: Record<InsurancePageType, InsuranceProductConfig> = {
  health: { title: 'Health Insurance', subtitle: 'A practical safety net for you and your family.', href: '/services/health-insurance/quote' },
  supertopup: { title: 'Super Top-Up', subtitle: 'Extend your health cover with an additional layer.', href: '/services/super-top-up/quote' },
  personal_accident: { title: 'Personal Accident', subtitle: 'Protection designed around your work and income.', href: '/services/personal-accident/quote' },
};

export function getInsuranceQuotePath(serviceId: string | number | undefined, name = ''): string | undefined {
  const normalized = name.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (normalized.includes('super top up') || normalized.includes('supertopup')) return INSURANCE_PRODUCTS.supertopup.href;
  if (normalized.includes('personal accident')) return INSURANCE_PRODUCTS.personal_accident.href;
  if (normalized.includes('health insurance') || normalized.includes('mediclaim') || Number(serviceId) === 12) return INSURANCE_PRODUCTS.health.href;
  return undefined;
}
