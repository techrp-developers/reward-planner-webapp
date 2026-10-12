export const getCategoryLayout = (category: { id: string | number; layout?: string; display_type?: string }) =>
  category.layout === 'wide' || Number(category.id) === 4 ? 'wide' : 'standard';

export function filterServices<T extends { name?: string; description?: string; category_name?: string }>(items: T[], search: string, includeCategory = true): T[] {
  const query = search.trim().toLowerCase();
  return items.filter(item => [item.name, item.description, ...(includeCategory ? [item.category_name] : [])].some(value => (value || '').toLowerCase().includes(query)));
}

export function filterServiceCategories<T extends { id: string | number; name?: string; description?: string }>(categories: T[], services: { name?: string; description?: string; category_id?: string | number; category_name?: string }[], search: string): T[] {
  const matchingServices = filterServices(services, search);
  const matchingCategories = new Set(filterServices(categories, search));
  return categories.filter(category => matchingCategories.has(category) || matchingServices.some(service =>
    (service.category_id != null && String(service.category_id) === String(category.id)) ||
    (Boolean(category.name) && service.category_name?.trim().toLowerCase() === category.name?.trim().toLowerCase())
  ));
}
