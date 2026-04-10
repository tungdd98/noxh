/**
 * Parse tổng số căn (bao gồm cả căn thương mại) từ field `scale`.
 * Ví dụ: "CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại" → 459
 */
export function parseTotalUnits(scale: string | null): number | null {
  const matches = scale?.match(/(\d+)\s+căn/g) ?? [];
  const total = matches.reduce((sum, m) => sum + parseInt(m), 0);
  return total > 0 ? total : null;
}
