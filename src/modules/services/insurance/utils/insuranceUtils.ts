import { CITY_ZONE_MAP, CITIES, NATURE_OF_WORK } from '../constant/InsuranceConstants';

export const getZoneFromCity = (cityName: string): string => {
  if (!cityName) return '3';
  return CITY_ZONE_MAP[cityName.toLowerCase().trim()] || '3';
};

export const filterCities = (searchTerm: string): string[] => {
  const term = searchTerm.toLowerCase().trim();
  return term ? CITIES.filter((city) => city.toLowerCase().includes(term)) : CITIES;
};

export const getCategoryFromNatureOfWork = (natureOfWork?: string): number | null => {
  if (!natureOfWork) return null;
  for (const [category, options] of Object.entries(NATURE_OF_WORK)) {
    if (options.some((option) => option.label === natureOfWork)) return Number(category);
  }
  return null;
};

export const isValidDateOfBirth = (isoDate: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const date = new Date(`${isoDate}T00:00:00`);
  const [year, month, day] = isoDate.split('-').map(Number);
  const today = new Date();
  return Number.isFinite(date.getTime()) && date <= today && year >= 1900 &&
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const normalizeDateOfBirth = (value: string): string => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : value.trim().slice(0, 10);
  return isValidDateOfBirth(iso) ? iso : '';
};

export const getAgeFromDateOfBirth = (isoDate: string): number | null => {
  if (!isValidDateOfBirth(isoDate)) return null;
  const birthDate = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};
