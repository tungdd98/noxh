'use client';

import { useMemo } from 'react';
import { checkEligibility } from '@/lib/eligibility';
import type { UserInfo, Project, Criteria, ProjectResult } from '@/types/noxh';

export function useEligibility(
  userInfo: UserInfo | null,
  projects: Project[],
  criteria: Criteria | null
): ProjectResult[] {
  return useMemo(() => {
    if (!userInfo || !criteria || projects.length === 0) return [];
    return projects.map((p) => checkEligibility(userInfo, p, criteria));
  }, [userInfo, projects, criteria]);
}
