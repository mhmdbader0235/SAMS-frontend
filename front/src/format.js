/**
 * Shared display formatters. Currency defaults to 'JOD' only as a last
 * resort — callers should pass the tenant's real currency from
 * useSchoolStore().profile.currency wherever it's already loaded.
 */
export function formatMoney(value, currency = 'JOD') {
  const num = parseFloat(value || 0);
  return `${num.toFixed(2)} ${currency}`;
}
