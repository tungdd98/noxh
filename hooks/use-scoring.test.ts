import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScoring } from './use-scoring';
import type { Project } from '@/types/noxh';
import { DEFAULT_CRITERIA_WEIGHTS } from '@/types/noxh';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const BASE_PROJECT: Project = {
  id: 1,
  title: 'Test Project',
  status: 'Đang thi công',
  price: '20 triệu/m²',
  handover: null,
  address: 'Hà Nội',
  owner: null,
  applyTime: 'Đợt 1: 01/04/2026 - 30/04/2026',
  scale: null,
  area: null,
  density: null,
  maintenance: null,
  imageUrl: null,
  url: null,
  scrapedAt: null,
  lat: 21.02,
  lng: 105.83,
  investorTier: 'experienced',
  targetGroup: null,
};

const BASE_USER = {
  income: 15_000_000,
  savings: 500_000_000,
  workAddress: 'Xuân Đỉnh, Hà Nội',
  maritalStatus: 'single' as const,
  category: 'income_low',
  housingStatus: 'no_house' as const,
  previouslyBought: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useScoring', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useScoring([BASE_PROJECT]));
    expect(result.current.scored).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading true while scoring', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ lat: 21.04, lng: 105.84 }),
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useScoring([BASE_PROJECT]));

    act(() => {
      result.current.score(BASE_USER, DEFAULT_CRITERIA_WEIGHTS);
    });

    expect(result.current.loading).toBe(true);
  });

  it('returns scored projects on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lat: 21.04, lng: 105.84 }),
    });

    const { result } = renderHook(() => useScoring([BASE_PROJECT]));

    await act(async () => {
      await result.current.score(BASE_USER, DEFAULT_CRITERIA_WEIGHTS);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.scored).toHaveLength(1);
    expect(result.current.scored[0]).toHaveProperty('totalScore');
    expect(result.current.scored[0]).toHaveProperty('distanceKm');
  });

  it('sets error when geocode fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'Không tìm thấy địa chỉ' }),
    });

    const { result } = renderHook(() => useScoring([BASE_PROJECT]));

    await act(async () => {
      await result.current.score(BASE_USER, DEFAULT_CRITERIA_WEIGHTS);
    });

    expect(result.current.error).toBe('Không tìm thấy địa chỉ');
    expect(result.current.scored).toEqual([]);
  });
});
