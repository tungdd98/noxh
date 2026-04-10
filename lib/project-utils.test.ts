import { describe, it, expect } from 'vitest';
import { parseTotalUnits } from '@/lib/project-utils';

describe('parseTotalUnits', () => {
  it('sums all units (residential + commercial) across multiple towers', () => {
    expect(
      parseTotalUnits(
        'CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại'
      )
    ).toBe(459);
  });

  it('handles single tower with commercial units', () => {
    expect(parseTotalUnits('Tòa CT - 489 căn - 123 căn thương mại')).toBe(612);
  });

  it('returns null for null input', () => {
    expect(parseTotalUnits(null)).toBeNull();
  });

  it('returns null for "--" placeholder', () => {
    expect(parseTotalUnits('--')).toBeNull();
  });

  it('handles scale with no commercial units', () => {
    expect(
      parseTotalUnits('9 Toà (CT1 đến CT9) - 3103 căn - 0 căn thương mại')
    ).toBe(3103);
  });
});
