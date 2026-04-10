import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/use-projects';
import { supabase } from '@/lib/supabase';
import type { Criteria, Project, UserInfo } from '@/types/noxh';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockCriteria: Criteria = {
  version: '2026-04-07',
  incomeLimit: { single: 25000000, married: 50000000 },
  eligibleCategories: [{ id: 'worker', label: 'Công nhân' }],
  housingConditions: [{ id: 'no_house', label: 'Chưa có nhà' }],
  provinces: [{ id: 'hanoi', label: 'Hà Nội' }],
};

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Test Project',
    investor: 'Test',
    district: 'Test',
    provinceId: 'hanoi',
    province: 'Hà Nội',
    price: 25,
    minArea: 45,
    maxArea: 70,
    minPrice: 1000,
    maxPrice: 1500,
    totalUnits: 100,
    status: 'Đang mở',
    statusType: 'open',
    handover: 'Q4/2027',
    priority: 'Công nhân',
    targetCategories: ['worker'],
    incomeLimit: 25000000,
    restricted: false,
    quality: 'Good',
    notes: '',
    score: 80,
    highlight: false,
    tag: null,
    updatedAt: '2026-04-09T00:00:00Z',
    slug: 'test-project',
  },
];

const mockUserInfo: UserInfo = {
  maritalStatus: 'single',
  income: 15000000,
  provinceId: 'hanoi',
  category: 'worker',
  housingStatus: 'no_house',
  previouslyBought: false,
};

function mockSupabaseChain(result: {
  data: Project[] | null;
  error: Error | null;
  count: number | null;
}) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue(result),
      }),
    }),
  } as unknown as ReturnType<typeof supabase.from>);
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if ((url as string).includes('criteria.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCriteria),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    })
  );

  mockSupabaseChain({ data: mockProjects, error: null, count: 1 });
});

describe('useProjects', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useProjects(null, 1));
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
    expect(result.current.criteria).toBeNull();
  });

  it('loads criteria on mount without userInfo', async () => {
    const { result } = renderHook(() => useProjects(null, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.criteria?.version).toBe('2026-04-07');
    expect(result.current.projects).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('loads projects when userInfo is provided', async () => {
    const { result } = renderHook(() => useProjects(mockUserInfo, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Test Project');
    expect(result.current.projects[0].slug).toBe('test-project');
    expect(result.current.totalCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error when Supabase returns error', async () => {
    mockSupabaseChain({
      data: null,
      error: new Error('DB error'),
      count: null,
    });
    const { result } = renderHook(() => useProjects(mockUserInfo, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });

  it('sets error when criteria fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error')))
    );
    const { result } = renderHook(() => useProjects(null, 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });
});
