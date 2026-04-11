import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { address } = body;
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'vn');

    const gRes = await fetch(url.toString(), {
      headers: { 'User-Agent': 'noxh-app/1.0' },
    });
    const results = await gRes.json();

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa chỉ' },
        { status: 404 }
      );
    }

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);
    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json({ error: 'Geocoding thất bại' }, { status: 500 });
  }
}
