import { NextResponse } from 'next/server';

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

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
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', MAPS_API_KEY ?? '');
    url.searchParams.set('region', 'vn');

    const gRes = await fetch(url.toString());
    const gData = await gRes.json();

    if (gData.status !== 'OK' || !gData.results.length) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa chỉ' },
        { status: 404 }
      );
    }

    const { lat, lng } = gData.results[0].geometry.location;
    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json({ error: 'Geocoding thất bại' }, { status: 500 });
  }
}
