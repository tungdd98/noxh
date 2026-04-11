import { haversineKm } from './haversine';
import type {
  Project,
  UserInfo,
  CriteriaWeights,
  ScoredProject,
} from '@/types/noxh';

const WEIGHT_VALUES = { high: 3, medium: 2, low: 1, off: 0 } as const;

// "20 triệu/m²" → 20, "14,80 triệu/m²" → 14.8, null → null
export function parsePricePerM2(priceStr: string | null): number | null {
  if (!priceStr) return null;
  const match = priceStr.match(/([\d,]+)\s*triệu/i);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
}

function parseVNDate(s: string): Date {
  const [d, m, y] = s.split('/');
  return new Date(+y, +m - 1, +d);
}

function applyTimeState(
  applyTime: string | null
): 'active' | 'upcoming' | 'closed' | 'unknown' {
  if (!applyTime || applyTime === '--') return 'unknown';
  const match = applyTime.match(
    /(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/
  );
  if (!match) return 'upcoming';
  const start = parseVNDate(match[1]);
  const end = parseVNDate(match[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (end < today) return 'closed';
  if (start > today) return 'upcoming';
  return 'active';
}

export function scoreFinance(
  project: Project,
  userInfo: UserInfo
): number | null {
  const pricePerM2Trieu = parsePricePerM2(project.price);
  if (pricePerM2Trieu === null) return null;

  const STANDARD_AREA = 50; // m²
  const estimatedTotal = pricePerM2Trieu * STANDARD_AREA * 1_000_000; // VND
  const { savings, income } = userInfo;

  if (estimatedTotal <= savings) return 100;

  const loanNeeded = estimatedTotal - savings;
  const maxLoan = income * 100;
  if (loanNeeded > maxLoan) return 0;

  // Linear: loanNeeded 0→maxLoan gives score 99→20
  const ratio = loanNeeded / maxLoan;
  return Math.round(99 - ratio * 79);
}

export function scoreLocation(
  project: Project,
  workLat: number,
  workLng: number
): number | null {
  if (project.lat === null || project.lng === null) return null;
  const km = haversineKm(project.lat, project.lng, workLat, workLng);
  if (km <= 5) return 100;
  if (km <= 10) return 70;
  if (km <= 15) return 50;
  if (km <= 20) return 30;
  return 10;
}

export function scoreUrgency(project: Project): number | null {
  const state = applyTimeState(project.applyTime);
  switch (state) {
    case 'active':
      return 100;
    case 'upcoming':
      return 60;
    case 'unknown':
      return 20;
    case 'closed':
      return 0;
  }
}

export function scoreInvestorReputation(project: Project): number {
  switch (project.investorTier) {
    case 'state':
      return 100;
    case 'experienced':
      return 70;
    case 'new':
      return 30;
    default:
      return 50;
  }
}

export function checkEligible(project: Project, userInfo: UserInfo): boolean {
  if (userInfo.previouslyBought) return false;
  if (!project.targetGroup) return true;
  const allowed = project.targetGroup.split(',').map((s) => s.trim());
  return allowed.includes(userInfo.category);
}

export function scoreAndSort(
  projects: Project[],
  userInfo: UserInfo,
  workLat: number,
  workLng: number,
  weights: CriteriaWeights
): ScoredProject[] {
  const scored = projects.map((project): ScoredProject => {
    const finance = scoreFinance(project, userInfo);
    const location = scoreLocation(project, workLat, workLng);
    const urgency = scoreUrgency(project);
    const investorReputation = scoreInvestorReputation(project);
    const eligible = checkEligible(project, userInfo);

    const entries: [keyof CriteriaWeights, number | null][] = [
      ['finance', finance],
      ['location', location],
      ['urgency', urgency],
      ['investorReputation', investorReputation],
    ];

    let weightedSum = 0;
    let totalWeight = 0;
    for (const [key, score] of entries) {
      const w = WEIGHT_VALUES[weights[key]];
      if (w > 0 && score !== null) {
        weightedSum += score * w;
        totalWeight += w;
      }
    }

    const totalScore =
      totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    const distanceKm =
      project.lat !== null && project.lng !== null
        ? Math.round(
            haversineKm(project.lat, project.lng, workLat, workLng) * 10
          ) / 10
        : null;

    return {
      ...project,
      totalScore,
      scoreBreakdown: {
        finance,
        location,
        urgency,
        investorReputation,
        eligible,
      },
      distanceKm,
    };
  });

  return scored.sort((a, b) => {
    if (a.scoreBreakdown.eligible !== b.scoreBreakdown.eligible) {
      return a.scoreBreakdown.eligible ? -1 : 1;
    }
    return b.totalScore - a.totalScore;
  });
}
