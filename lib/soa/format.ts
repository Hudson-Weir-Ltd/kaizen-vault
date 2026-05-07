/**
 * SoA-specific formatters. Centralised so we don't drift to multiple
 * money-formatting styles across tables and the preview.
 */

export function formatGBP(amount: number | null | undefined, opts?: { showZero?: boolean }): string {
  if (amount == null) return "—";
  if (amount === 0 && !opts?.showZero) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parenthesise negatives. Used for surplus/shortfall + deficiency display
 * so they read like an accounts page rather than -£1,234.
 */
export function formatGBPSigned(amount: number | null | undefined): string {
  if (amount == null) return "—";
  if (amount === 0) return formatGBP(0, { showZero: true });
  if (amount < 0) return `(${formatGBP(Math.abs(amount), { showZero: true })})`;
  return formatGBP(amount, { showZero: true });
}
