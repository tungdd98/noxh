import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'vn');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'noxh-app/1.0' },
  });
  const results = await res.json();

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
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

    // Rate limit: Nominatim yêu cầu tối đa 1 req/s
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log('Hoàn thành!');
}

main();
