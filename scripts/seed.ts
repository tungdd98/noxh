import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  type RawProject = {
    title: string;
    status: string;
    price: string;
    handover: string;
    address: string;
    owner: string;
    applyTime: string;
    scale: string;
    area: string;
    density: string;
    maintenance: string;
    imageUrl: string;
    url: string;
    scrapedAt: string;
  };

  const raw = readFileSync(resolve(process.cwd(), 'data.json'), 'utf-8');
  const projects: RawProject[] = JSON.parse(raw);

  const rows = projects.map((p) => ({
    title: p.title,
    status: p.status ?? null,
    price: p.price ?? null,
    handover: p.handover ?? null,
    address: p.address ?? null,
    owner: p.owner ?? null,
    apply_time: p.applyTime ?? null,
    scale: p.scale ?? null,
    area: p.area ?? null,
    density: p.density ?? null,
    maintenance: p.maintenance ?? null,
    image_url: p.imageUrl ?? null,
    url: p.url ?? null,
    scraped_at: p.scrapedAt ?? null,
  }));

  const { error, count } = await supabase
    .from('projects')
    .insert(rows, { count: 'exact' });

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${count} projects successfully.`);
}

main();
