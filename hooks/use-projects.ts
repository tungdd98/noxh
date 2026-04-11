'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/noxh';

type UseProjectsResult = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

type DbRow = {
  id: number;
  title: string;
  status: string | null;
  price: string | null;
  handover: string | null;
  address: string | null;
  owner: string | null;
  apply_time: string | null;
  scale: string | null;
  area: string | null;
  density: string | null;
  maintenance: string | null;
  image_url: string | null;
  url: string | null;
  scraped_at: string | null;
  lat: number | null;
  lng: number | null;
  investor_tier: 'state' | 'experienced' | 'new' | null;
  target_group: string | null;
};

function toProject(row: DbRow): Project {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    price: row.price,
    handover: row.handover,
    address: row.address,
    owner: row.owner,
    applyTime: row.apply_time,
    scale: row.scale,
    area: row.area,
    density: row.density,
    maintenance: row.maintenance,
    imageUrl: row.image_url,
    url: row.url,
    scrapedAt: row.scraped_at,
    lat: row.lat,
    lng: row.lng,
    investorTier: row.investor_tier,
    targetGroup: row.target_group,
  };
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('projects')
        .select('*')
        .order('id');

      if (cancelled) return;

      if (dbError) {
        setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
        setProjects([]);
      } else {
        setProjects((data as DbRow[]).map(toProject));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
