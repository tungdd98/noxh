'use client';

import { useState } from 'react';
import { scoreAndSort } from '@/lib/scoring';
import type {
  Project,
  UserInfo,
  CriteriaWeights,
  ScoredProject,
} from '@/types/noxh';

type ScoringState = {
  scored: ScoredProject[];
  weights: CriteriaWeights | null;
  loading: boolean;
  error: string | null;
};

export function useScoring(projects: Project[]) {
  const [state, setState] = useState<ScoringState>({
    scored: [],
    weights: null,
    loading: false,
    error: null,
  });

  async function score(userInfo: UserInfo, weights: CriteriaWeights) {
    setState({ scored: [], weights: null, loading: true, error: null });

    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: `${userInfo.workAddress}, Hà Nội`,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setState({
          scored: [],
          weights: null,
          loading: false,
          error: data.error,
        });
        return;
      }

      const scored = scoreAndSort(
        projects,
        userInfo,
        data.lat,
        data.lng,
        weights
      );
      setState({ scored, weights, loading: false, error: null });
    } catch {
      setState({
        scored: [],
        weights: null,
        loading: false,
        error: 'Không thể geocode địa chỉ. Vui lòng thử lại.',
      });
    }
  }

  return { ...state, score };
}
