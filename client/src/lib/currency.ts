export type Currency = "USD" | "PHP";

export const currencies = {
  USD: {
    symbol: "$",
    code: "USD",
    exchangeRate: 1, // Base currency
  },
  PHP: {
    symbol: "₱",
    code: "PHP",
    exchangeRate: 56.12, // Example rate, should be updated from an API in production
  },
};

export function formatCurrency(amount: number | string, currency: Currency = "USD"): string {
  const numAmount = typeof amount === "string" ? Number(amount) : amount;
  return `${currencies[currency].symbol}${numAmount.toFixed(2)}`;
}

export function convertCurrency(amount: number | string, from: Currency, to: Currency): number {
  const numAmount = typeof amount === "string" ? Number(amount) : amount;
  const inUSD = from === "USD" ? numAmount : numAmount / currencies[from].exchangeRate;
  const final = to === "USD" ? inUSD : inUSD * currencies[to].exchangeRate;
  return Number(final.toFixed(2));
}
