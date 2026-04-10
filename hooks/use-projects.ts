'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project, Criteria } from '@/types/noxh';

type UseProjectsResult = {
  projects: Project[];
  criteria: Criteria | null;
  loading: boolean;
  error: string | null;
};

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [criteriaRes, projectsRes] = await Promise.all([
          fetch('/data/criteria.json', { cache: 'no-store' }),
          supabase
            .from('projects')
            .select('*')
            .order('score', { ascending: false }),
        ]);
        if (!criteriaRes.ok) throw new Error('Criteria fetch failed');
        if (projectsRes.error) throw projectsRes.error;
        const criteriaData = (await criteriaRes.json()) as Criteria;
        setCriteria(criteriaData);
        setProjects(projectsRes.data as Project[]);
      } catch {
        setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { projects, criteria, loading, error };
}
