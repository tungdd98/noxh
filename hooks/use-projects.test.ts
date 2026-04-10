import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/use-projects';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/noxh';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockProjects: Project[] = [
  {
    id: 1,
    title: 'Tân Lập Garden',
    status: 'Đang thi công',
    price: '20 triệu/m²',
    handover: 'Quý IV/2027',
    address: 'Tân Lập, Ô Diên, Hà Nội',
    owner: 'Cienco 5',
    applyTime: 'Đợt 1: 30/04/2026 - 15/05/2026',
    scale:
      'CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại',
    area: '4.909 m²',
    density: '40%',
    maintenance: '400.000 vnđ/m²',
    imageUrl: 'https://example.com/img.jpg',
    url: 'https://example.com',
    scrapedAt: '2026-04-10T10:15:24.165Z',
  },
];

const mockDbRows = [
  {
    id: 1,
    title: 'Tân Lập Garden',
    status: 'Đang thi công',
    price: '20 triệu/m²',
    handover: 'Quý IV/2027',
    address: 'Tân Lập, Ô Diên, Hà Nội',
    owner: 'Cienco 5',
    apply_time: 'Đợt 1: 30/04/2026 - 15/05/2026',
    scale:
      'CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại',
    area: '4.909 m²',
    density: '40%',
    maintenance: '400.000 vnđ/m²',
    image_url: 'https://example.com/img.jpg',
    url: 'https://example.com',
    scraped_at: '2026-04-10T10:15:24.165Z',
  },
];

function mockSupabase(data: typeof mockDbRows | null, error: Error | null) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data, error }),
    }),
  } as unknown as ReturnType<typeof supabase.from>);
}

beforeEach(() => {
  mockSupabase(mockDbRows, null);
});

describe('useProjects', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it('loads all projects and maps snake_case to camelCase', async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0]).toEqual(mockProjects[0]);
  });

  it('maps apply_time → applyTime and image_url → imageUrl', async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects[0].applyTime).toBe(
      'Đợt 1: 30/04/2026 - 15/05/2026'
    );
    expect(result.current.projects[0].imageUrl).toBe(
      'https://example.com/img.jpg'
    );
  });

  it('sets error message when Supabase returns error', async () => {
    mockSupabase(null, new Error('DB error'));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });
});
