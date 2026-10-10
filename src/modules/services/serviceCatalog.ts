export const getCategoryLayout = (category: { id: string | number; layout?: string; display_type?: string }) =>
  category.layout === 'wide' || Number(category.id) === 4 ? 'wide' : 'standard';

export function filterServices<T extends { name?: string; description?: string; category_name?: string }>(items: T[], search: string, includeCategory = true): T[] {
  const query = search.toLowerCase();
  return items.filter(item => [item.name, item.description, ...(includeCategory ? [item.category_name] : [])].some(value => (value || '').toLowerCase().includes(query)));
}
