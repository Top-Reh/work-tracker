import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';

const RATE_CURRENCIES = [
  { code: 'USD', country: 'United States Dollar', flag: '🇺🇸' },
  { code: 'KRW', country: 'South Korean Won', flag: '🇰🇷' },
  { code: 'JPY', country: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'MMK', country: 'Myanmar Kyat', flag: '🇲🇲' },
  { code: 'THB', country: 'Thai Baht', flag: '🇹🇭' },
  { code: 'CNY', country: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'VND', country: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'EUR', country: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', country: 'British Pound', flag: '🇬🇧' },
  { code: 'SGD', country: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', country: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'AUD', country: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', country: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'INR', country: 'Indian Rupee', flag: '🇮🇳' },
];

const ALL_CODES = RATE_CURRENCIES.map(({ code }) => code);

function formatRate(amount, locale) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: amount >= 1 ? 2 : 4,
    maximumFractionDigits: amount >= 1 ? 2 : 6,
  }).format(amount);
}

export function ExchangeRates() {
  const { t } = useLanguage();
  const { currency, currencyInfo } = useCurrency();
  const [ratesData, setRatesData] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState(ALL_CODES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    const quotes = ALL_CODES.filter((code) => code !== currency).join(',');
    fetch(`https://api.frankfurter.dev/v2/rates?base=${currency}&quotes=${quotes}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Rates request failed');
        return response.json();
      })
      .then((data) => setRatesData(data))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [currency, reload]);

  const baseCurrency = currencyInfo?.currency ?? 'KRW';
  const baseLocale = currencyInfo?.locale ?? 'ko-KR';
  const asOfDate = ratesData?.[0]?.date
    ? new Date(`${ratesData[0].date}T00:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })
    : null;

  function toggleCurrency(code) {
    setSelectedCodes((current) => current.includes(code)
      ? current.filter((item) => item !== code)
      : [...current, code]);
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--ink)]">{t('Exchange Rates')}</h1>
          <p className="text-[13px] text-[var(--ink-faint)] mt-1">
            {t('Rate against')} {baseCurrency}
            {asOfDate ? ` · ${t('Updated')} ${asOfDate}` : ''}
          </p>
        </div>
        <Button variant="secondary" className="shrink-0 min-h-10 px-3" onClick={() => setReload((value) => value + 1)} disabled={loading} aria-label={t('Refresh rates')}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <section aria-label={t('Choose currencies')}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">{t('Choose currencies')}</h2>
          <div className="flex gap-3 text-[12px] font-medium">
            <button className="text-[var(--selected)]" onClick={() => setSelectedCodes(ALL_CODES)}>{t('All')}</button>
            <button className="text-[var(--selected)]" onClick={() => setSelectedCodes([])}>{t('Clear')}</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {RATE_CURRENCIES.map(({ code, flag }) => {
            const selected = selectedCodes.includes(code);
            return (
              <button
                key={code}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleCurrency(code)}
                className={`min-h-10 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${selected ? 'border-[var(--selected)] bg-[var(--selected-soft)] text-[var(--selected)]' : 'border-[var(--border)] bg-[var(--paper-raised)] text-[var(--ink-soft)]'}`}
              >
                <span aria-hidden="true">{flag} </span>{code}
              </button>
            );
          })}
        </div>
      </section>

      {loading && (
        <Card className="p-5 text-center text-[14px] text-[var(--ink-soft)]">{t('Loading exchange rates…')}</Card>
      )}

      {error && (
        <Card className="p-5 text-center space-y-3">
          <p className="text-[14px] text-[var(--negative)]">{t('Could not load exchange rates. Please try again.')}</p>
          <Button variant="secondary" onClick={() => setReload((value) => value + 1)}>{t('Refresh rates')}</Button>
        </Card>
      )}

      {!loading && !error && ratesData && (
        <div className="space-y-3">
          {RATE_CURRENCIES.filter(({ code }) => selectedCodes.includes(code)).map(({ code, country, flag }) => {
            const quote = ratesData.find((rate) => rate.quote === code);
            const value = code === baseCurrency ? 1 : quote?.rate ? 1 / Number(quote.rate) : null;
            if (value == null) return null;

            return (
              <Card key={code} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-[var(--ink)]"><span aria-hidden="true">{flag} </span>{code}</p>
                    <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">{country}</p>
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-[12px] font-medium text-[var(--ink-faint)]">1 {code} =</p>
                    <p className="text-[20px] sm:text-[22px] font-bold tabular text-[var(--ink)] break-all">
                      {formatRate(value, baseLocale)} <span className="text-[14px] font-semibold">{baseCurrency}</span>
                    </p>
                    <p className="text-[11px] text-[var(--ink-faint)]">{t('Reference rate')}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-[var(--ink-faint)]">
        {t('Rates are daily reference rates, not bank buy/sell quotes.')} {' '}
        <a className="text-[var(--selected)] underline underline-offset-2" href="https://frankfurter.dev/" target="_blank" rel="noreferrer">
          {t('Source: Frankfurter')}
        </a>
      </p>
    </div>
  );
}
