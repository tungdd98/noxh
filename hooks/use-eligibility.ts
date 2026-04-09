'use client';

import { useMemo } from 'react';
import { checkEligibility, sortResults } from '@/lib/eligibility';
import type { UserInfo, Project, Criteria, ProjectResult } from '@/types/noxh';

export function useEligibility(
  userInfo: UserInfo | null,
  projects: Project[],
  criteria: Criteria | null
): ProjectResult[] {
  return useMemo(() => {
    if (!userInfo || !criteria || projects.length === 0) return [];
    return sortResults(
      projects.map((p) => checkEligibility(userInfo, p, criteria))
    );
  }, [userInfo, projects, criteria]);
}
