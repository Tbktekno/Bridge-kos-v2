/**
 * Coerces an Express route/query value into a plain string.
 * Express 5 types route params and query values as `string | string[] | ...`.
 */
export function str(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : fallback;
  }
  return fallback;
}

export function queryNumber(value: unknown, fallback?: number): number | undefined {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
