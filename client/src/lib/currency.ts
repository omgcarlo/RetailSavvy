export type Currency = "PHP";

export const currencies = {
  PHP: {
    symbol: "₱",
    code: "PHP",
  },
};

export function formatCurrency(amount: number | string, currency: Currency = "PHP"): string {
  const numAmount = typeof amount === "string" ? Number(amount) : amount;
  return `${currencies[currency].symbol}${numAmount.toFixed(2)}`;
}