import type { ServiceBannerItem } from './ServiceBannerCarousel';
import carInsurance from '../../assets/servicescards/carousel/car-insurance.webp';
import taxFiling from '../../assets/servicescards/carousel/tax-filing.webp';
import panCard from '../../assets/servicescards/carousel/pan-card.webp';
import motorcycleInsurance from '../../assets/servicescards/carousel/motorcycle-insurance.webp';
import carInsuranceOffer from '../../assets/servicescards/carousel/car-insurance-offer.webp';
import healthInsurance from '../../assets/servicescards/carousel/health-insurance.webp';

export const SERVICE_PAGE_BANNERS: ServiceBannerItem[] = [
  { id: 'car-insurance', title: 'Car Insurance', hd_image: carInsurance, redirect: { type: 'service', id: 10 } },
  { id: 'tax-filing', title: 'Income Tax Return Filing', hd_image: taxFiling, redirect: { type: 'service', id: 13 } },
  { id: 'pan-card', title: 'PAN Card Services', hd_image: panCard, redirect: { type: 'service', id: 1 } },
  { id: 'motorcycle-insurance', title: 'Two-Wheeler Insurance', hd_image: motorcycleInsurance, redirect: { type: 'service', id: 11 } },
  { id: 'car-insurance-offer', title: 'Car Insurance Offer', hd_image: carInsuranceOffer, redirect: { type: 'service', id: 10 } },
  { id: 'health-insurance', title: 'Health Insurance', hd_image: healthInsurance, redirect: { type: 'service', id: 12 } },
];
