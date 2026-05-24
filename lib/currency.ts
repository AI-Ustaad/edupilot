// lib/currency.ts
// Simple exchange rates (can be updated manually or fetched from API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  PKR: 278,   // 1 USD = 278 PKR (update as needed)
  INR: 83.5,  // 1 USD = 83.5 INR
  GBP: 0.79,  // 1 USD = 0.79 GBP
  EUR: 0.92,  // 1 USD = 0.92 EUR
  AED: 3.67,  // 1 USD = 3.67 AED
  SAR: 3.75,  // 1 USD = 3.75 SAR
  CAD: 1.36,  // 1 USD = 1.36 CAD
  AUD: 1.52,  // 1 USD = 1.52 AUD
};

export function detectCurrency(): string {
  // Browser language detection
  const lang = navigator.language;
  
  // Pakistan
  if (lang === 'ur-PK' || lang === 'en-PK' || lang === 'pa-PK') return 'PKR';
  // India
  if (lang === 'hi-IN' || lang === 'en-IN' || lang === 'bn-IN') return 'INR';
  // United Kingdom
  if (lang === 'en-GB') return 'GBP';
  // Europe
  if (lang === 'de-DE' || lang === 'fr-FR' || lang === 'it-IT' || lang === 'es-ES') return 'EUR';
  // UAE
  if (lang === 'ar-AE' || lang === 'en-AE') return 'AED';
  // Saudi Arabia
  if (lang === 'ar-SA' || lang === 'en-SA') return 'SAR';
  // Canada
  if (lang === 'en-CA' || lang === 'fr-CA') return 'CAD';
  // Australia
  if (lang === 'en-AU') return 'AUD';
  // Default
  return 'USD';
}

export function formatPrice(usdAmount: number, currency: string): string {
  const rate = EXCHANGE_RATES[currency] || 1;
  const converted = usdAmount * rate;
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(converted);
}

export function getCurrencySymbol(currency: string): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  // Extract symbol from formatted zero
  return formatter.format(0).replace(/\d|\.|,| /g, '').trim();
}
