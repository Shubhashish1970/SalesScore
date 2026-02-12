/**
 * Format INR (Indian Rupees) for display. Use on ALL screens that show monetary amounts.
 * API figures are in INR. Intelligently chooses K / L / Cr by magnitude.
 * All non-zero values get a unit (K, L, or Cr) for consistency.
 * 1 K = 1,000 INR | 1 L = 1,00,000 INR | 1 Cr = 1,00,00,000 INR
 */
export function formatInr(rupees: number): string {
  if (!Number.isFinite(rupees) || rupees < 0) return "0";
  if (rupees === 0) return "0";
  if (rupees >= 1e7) return `${(rupees / 1e7).toFixed(2)} Cr`;
  if (rupees >= 1e5) return `${(rupees / 1e5).toFixed(2)} L`;
  if (rupees >= 1e3) return `${(rupees / 1e3).toFixed(1)} K`;
  return `${(rupees / 1e3).toFixed(1)} K`;
}
