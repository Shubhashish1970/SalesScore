/**
 * Format INR (Indian Rupees) for display. API figures are in INR.
 * Intelligently chooses Lacs (L) or Crores (Cr) based on magnitude.
 * 1 Lac = 1,00,000 INR | 1 Crore = 1,00,00,000 INR
 */
export function formatInr(rupees: number): string {
  if (!Number.isFinite(rupees) || rupees < 0) return "0";
  if (rupees === 0) return "0";
  if (rupees >= 1e7) return `${(rupees / 1e7).toFixed(2)} Cr`;
  if (rupees >= 1e5) return `${(rupees / 1e5).toFixed(2)} L`;
  if (rupees >= 1e3) return `${(rupees / 1e3).toFixed(1)} K`;
  return String(Math.round(rupees));
}
