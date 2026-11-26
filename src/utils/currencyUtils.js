const CURRENCY_LOCALES = {
  USD: 'en-US', KRW: 'ko-KR', JPY: 'ja-JP', MMK: 'my-MM', THB: 'th-TH', VND: 'vi-VN',
};

/** Formats an amount using the selected currency, without converting its numeric value. */
export function formatCurrency(amount, currency = 'KRW') {
  const locale = CURRENCY_LOCALES[currency] ?? CURRENCY_LOCALES.KRW;
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount);
}

/** -₩32,170 for negative amounts (tax), ₩942,830 otherwise */
export function formatSignedCurrency(amount, currency = 'KRW') {
  if (amount < 0) return `-${formatCurrency(Math.abs(amount), currency)}`;
  return formatCurrency(amount, currency);
}

/** 1,250,000 without currency symbol */
export function formatNumber(amount, currency = 'KRW') {
  const locale = CURRENCY_LOCALES[currency] ?? CURRENCY_LOCALES.KRW;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
}

/** Parses user input like "10,000" or "₩10,000" back into a number */
export function parseCurrencyInput(value) {
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
