import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency as formatAmount, formatNumber as formatAmountNumber, formatSignedCurrency as formatSignedAmount } from '@/utils/currencyUtils';

export const CURRENCIES = {
  USD: { country: 'United States', locale: 'en-US', currency: 'USD' },
  KRW: { country: 'South Korea', locale: 'ko-KR', currency: 'KRW' },
  JPY: { country: 'Japan', locale: 'ja-JP', currency: 'JPY' },
  MMK: { country: 'Myanmar', locale: 'my-MM', currency: 'MMK' },
  THB: { country: 'Thailand', locale: 'th-TH', currency: 'THB' },
  VND: { country: 'Vietnam', locale: 'vi-VN', currency: 'VND' },
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { profile } = useAuth();
  const [currency, setCurrencyState] = useState(() => localStorage.getItem('work-tracker-currency') || 'KRW');

  useEffect(() => {
    if (profile?.currency && CURRENCIES[profile.currency]) {
      setCurrencyState(profile.currency);
      localStorage.setItem('work-tracker-currency', profile.currency);
    }
  }, [profile?.currency]);

  function setCurrency(nextCurrency) {
    if (!CURRENCIES[nextCurrency]) return;
    setCurrencyState(nextCurrency);
    localStorage.setItem('work-tracker-currency', nextCurrency);
  }

  const value = useMemo(() => ({
    currency,
    setCurrency,
    currencyInfo: CURRENCIES[currency] ?? CURRENCIES.KRW,
    formatCurrency: (amount) => formatAmount(amount, currency),
    formatSignedCurrency: (amount) => formatSignedAmount(amount, currency),
    formatNumber: (amount) => formatAmountNumber(amount, currency),
    currencySymbol: new Intl.NumberFormat(CURRENCIES[currency]?.locale ?? 'ko-KR', {
      style: 'currency', currency: CURRENCIES[currency]?.currency ?? 'KRW', maximumFractionDigits: 0,
    }).formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency,
  }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error('useCurrency must be used within CurrencyProvider');
  return value;
}
