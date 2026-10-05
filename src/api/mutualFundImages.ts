/** Correct repeated CDN origins while preserving paths and cache query strings. */
export function normalizeMutualFundImageUrl(value: string | null): string | null {
  if (!value) return null;
  let url = value.trim();
  if (!url) return null;

  while (true) {
    const duplicate = url.match(/^(https?:\/\/[^/]+)\/(https?:\/\/.+)$/i);
    if (!duplicate) break;
    try {
      if (new URL(duplicate[1]).origin !== new URL(duplicate[2]).origin) break;
      url = duplicate[2];
    } catch {
      break;
    }
  }
  return url;
}
