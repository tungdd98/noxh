'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/noxh';

const PAGE_SIZE = 10;

type UseProjectsResult = {
  projects: Project[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

type DbRow = {
  id: number;
  title: string;
  address: string | null;
  capacity: string | null;
  status: string | null;
  owner: string | null;
  url: string | null;
  image_url: string | null;
  scraped_at: string | null;
};

function toProject(row: DbRow): Project {
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    capacity: row.capacity,
    status: row.status,
    owner: row.owner,
    url: row.url,
    imageUrl: row.image_url,
    scrapedAt: row.scraped_at,
  };
}

export function useProjects(page: number): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const from = (page - 1) * PAGE_SIZE;
      const to = page * PAGE_SIZE - 1;

      const {
        data,
        error: dbError,
        count,
      } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('id')
        .range(from, to);

      if (cancelled) return;

      if (dbError) {
        setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
        setProjects([]);
        setTotalCount(0);
      } else {
        setProjects((data as DbRow[]).map(toProject));
        setTotalCount(count ?? 0);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  return { projects, totalCount, loading, error };
}
