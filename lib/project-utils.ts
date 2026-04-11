export function getStatusStyle(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('đang thi công'))
    return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s.includes('bàn giao') || s.includes('hoàn thành'))
    return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('mở bán'))
    return 'bg-orange-100 text-orange-700 border-orange-200';
  if (s.includes('dừng') || s.includes('tạm dừng'))
    return 'bg-red-100 text-red-600 border-red-200';
  return 'bg-muted text-muted-foreground border-muted-border';
}

/**
 * Parse tổng số căn (bao gồm cả căn thương mại) từ field `scale`.
 * Ví dụ: "CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại" → 459
 */
export function parseTotalUnits(scale: string | null): number | null {
  const matches = scale?.match(/(\d+)\s+căn/g) ?? [];
  const total = matches.reduce((sum, m) => sum + parseInt(m), 0);
  return total > 0 ? total : null;
}
