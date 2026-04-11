import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const mapsKey = process.env.GOOGLE_MAPS_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', mapsKey);
  url.searchParams.set('region', 'vn');

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== 'OK' || !data.results.length) {
    return null;
  }

  return data.results[0].geometry.location;
}

async function main() {
  // Lấy tất cả dự án chưa có tọa độ
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, address')
    .is('lat', null);

  if (error) {
    console.error('Lỗi fetch projects:', error);
    process.exit(1);
  }

  console.log(`Tìm thấy ${projects.length} dự án cần geocode`);

  for (const project of projects) {
    if (!project.address) {
      console.log(`[SKIP] #${project.id} ${project.title} — không có địa chỉ`);
      continue;
    }

    const coords = await geocodeAddress(project.address);

    if (!coords) {
      console.log(
        `[FAIL] #${project.id} ${project.title} — không geocode được`
      );
      continue;
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('id', project.id);

    if (updateError) {
      console.error(`[ERROR] #${project.id}:`, updateError);
    } else {
      console.log(
        `[OK] #${project.id} ${project.title} → ${coords.lat}, ${coords.lng}`
      );
    }

    // Rate limit: 10 req/s Google Maps free tier
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log('Hoàn thành!');
}

main();
