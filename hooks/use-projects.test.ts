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
    address: 'Tân Lập, Ô Diên, Hà Nội',
    capacity: '459 căn',
    status: 'Đang thi công',
    owner: 'Cienco 5',
    url: 'https://example.com',
    imageUrl: 'https://example.com/img.jpg',
    scrapedAt: '2026-04-10T10:15:24.165Z',
  },
];

const mockDbRows = mockProjects.map((p) => ({
  id: p.id,
  title: p.title,
  address: p.address,
  capacity: p.capacity,
  status: p.status,
  owner: p.owner,
  url: p.url,
  image_url: p.imageUrl,
  scraped_at: p.scrapedAt,
}));

function mockSupabase(
  data: typeof mockDbRows | null,
  error: Error | null,
  count: number | null
) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({ data, error, count }),
      }),
    }),
  } as unknown as ReturnType<typeof supabase.from>);
}

beforeEach(() => {
  mockSupabase(mockDbRows, null, 1);
});

describe('useProjects', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useProjects(1));
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('loads projects and maps snake_case to camelCase', async () => {
    const { result } = renderHook(() => useProjects(1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].title).toBe('Tân Lập Garden');
    expect(result.current.projects[0].imageUrl).toBe(
      'https://example.com/img.jpg'
    );
    expect(result.current.projects[0].scrapedAt).toBe(
      '2026-04-10T10:15:24.165Z'
    );
    expect(result.current.totalCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('calls range with correct offsets for page 1', async () => {
    const { result } = renderHook(() => useProjects(1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const rangeMock = vi.mocked(
      supabase.from('projects').select('*', { count: 'exact' }).order('id')
    ).range;
    expect(rangeMock).toHaveBeenCalledWith(0, 9);
  });

  it('calls range with correct offsets for page 2', async () => {
    mockSupabase(mockDbRows, null, 15);
    const { result } = renderHook(() => useProjects(2));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const rangeMock = vi.mocked(
      supabase.from('projects').select('*', { count: 'exact' }).order('id')
    ).range;
    expect(rangeMock).toHaveBeenCalledWith(10, 19);
  });

  it('sets error when Supabase returns error', async () => {
    mockSupabase(null, new Error('DB error'), null);
    const { result } = renderHook(() => useProjects(1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });
});
