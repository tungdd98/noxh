'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project, Criteria, UserInfo } from '@/types/noxh';

export const PAGE_SIZE = 10;

type UseProjectsResult = {
  projects: Project[];
  criteria: Criteria | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
};

export function useProjects(
  userInfo: UserInfo | null,
  page: number
): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Criteria: fetch once on mount. loading starts as true — no need to set again.
  useEffect(() => {
    fetch('/data/criteria.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Criteria fetch failed');
        return res.json() as Promise<Criteria>;
      })
      .then(setCriteria)
      .catch(() => setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  // Projects: fetch only when userInfo is provided, re-fetch on page change.
  useEffect(() => {
    if (!userInfo) return;

    let cancelled = false;
    const from = (page - 1) * PAGE_SIZE;

    async function loadProjects() {
      setLoading(true);
      try {
        const {
          data,
          error: err,
          count,
        } = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .eq('provinceId', userInfo.provinceId)
          .contains('targetCategories', [userInfo.category])
          .order('score', { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (cancelled) return;
        if (err) throw err;
        setProjects((data as Project[]) ?? []);
        setTotalCount(count ?? 0);
      } catch {
        if (!cancelled)
          setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProjects();
    return () => {
      cancelled = true;
    };
  }, [userInfo, page]);

  return { projects, criteria, loading, error, totalCount };
}
