'use client';

import { useState, useEffect } from 'react';
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
          fetch('/data/projects.json', { cache: 'no-store' }),
        ]);
        if (!criteriaRes.ok || !projectsRes.ok) throw new Error('Fetch failed');
        const [criteriaData, projectsData] = await Promise.all([
          criteriaRes.json() as Promise<Criteria>,
          projectsRes.json() as Promise<Project[]>,
        ]);
        setCriteria(criteriaData);
        setProjects(projectsData);
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
