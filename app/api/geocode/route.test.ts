import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/geocode', () => {
  it('returns lat/lng on successful geocode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { lat: '21.0678', lon: '105.8012', display_name: 'Xuân Đỉnh, Hà Nội' },
      ],
    });

    const res = await POST(makeRequest({ address: 'Xuân Đỉnh, Hà Nội' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ lat: 21.0678, lng: 105.8012 });
  });

  it('returns 404 when Nominatim returns empty results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const res = await POST(
      makeRequest({ address: 'địa chỉ không tồn tại xyz' })
    );
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('returns 400 when address is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 500 when Nominatim API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const res = await POST(makeRequest({ address: 'Hà Nội' }));
    expect(res.status).toBe(500);
  });
});
