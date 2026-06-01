const EXCHANGE_RATES: Record<string, number> = {
  PKR: 1,
  USD: 0.0036,  // 1 PKR = 0.0036 USD (approx)
  AED: 0.013,
};

export function convertAmount(amount: number, from: string, to: string): number {
  const rate = EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
  return Math.round(amount * rate);
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
  return formatter.format(amount);
}
