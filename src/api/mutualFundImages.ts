/** Repair only the known duplicated Reward Planners CDN prefix. */
export function normalizeMutualFundImageUrl(value: string | null): string | null {
  if (!value) return null;
  let url = value.trim();
  if (!url) return null;

  const prefix = 'https://cdn.rewardplanners.com/';
  while (url.startsWith(`${prefix}${prefix}`)) {
    url = url.slice(prefix.length);
  }
  return url;
}
