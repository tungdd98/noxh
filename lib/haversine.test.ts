import { describe, it, expect } from 'vitest';
import { haversineKm } from './haversine';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(21.0, 105.8, 21.0, 105.8)).toBe(0);
  });

  it('calculates distance between Hoan Kiem and Cau Giay (~5.5km)', () => {
    // Hoàn Kiếm: 21.0285, 105.8542
    // Cầu Giấy:  21.0369, 105.7928
    const km = haversineKm(21.0285, 105.8542, 21.0369, 105.7928);
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(7);
  });

  it('calculates distance Hanoi to Ho Chi Minh City (~1140km)', () => {
    const km = haversineKm(21.0285, 105.8542, 10.8231, 106.6297);
    expect(km).toBeGreaterThan(1100);
    expect(km).toBeLessThan(1200);
  });
});
