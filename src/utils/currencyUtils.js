const KRW_FORMATTER = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 0,
});

/** ₩1,250,000 */
export function formatCurrency(amount) {
  return KRW_FORMATTER.format(amount);
}

/** -₩32,170 for negative amounts (tax), ₩942,830 otherwise */
export function formatSignedCurrency(amount) {
  if (amount < 0) return `-${formatCurrency(Math.abs(amount))}`;
  return formatCurrency(amount);
}

/** 1,250,000 without currency symbol */
export function formatNumber(amount) {
  return NUMBER_FORMATTER.format(amount);
}

/** Parses user input like "10,000" or "₩10,000" back into a number */
export function parseCurrencyInput(value) {
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
