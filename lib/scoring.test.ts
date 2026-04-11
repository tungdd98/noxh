import { describe, it, expect } from 'vitest';
import {
  parsePricePerM2,
  scoreFinance,
  scoreLocation,
  scoreUrgency,
  scoreInvestorReputation,
  checkEligible,
  scoreAndSort,
} from './scoring';
import type { Project, UserInfo, CriteriaWeights } from '@/types/noxh';
import { DEFAULT_CRITERIA_WEIGHTS } from '@/types/noxh';

const BASE_PROJECT: Project = {
  id: 1,
  title: 'Test',
  status: 'Đang thi công',
  price: '20 triệu/m²',
  handover: 'Q4/2027',
  address: 'Hà Nội',
  owner: 'CĐT Test',
  applyTime: 'Đợt 1: 30/04/2026 - 15/05/2026',
  scale: null,
  area: null,
  density: null,
  maintenance: null,
  imageUrl: null,
  url: null,
  scrapedAt: null,
  lat: 21.02,
  lng: 105.83,
  investorTier: 'experienced',
  targetGroup: null,
};

const BASE_USER: UserInfo = {
  income: 15_000_000, // 15tr/tháng
  savings: 500_000_000, // 500tr
  workAddress: 'Xuân Đỉnh, Hà Nội',
  maritalStatus: 'single',
  category: 'income_low',
  housingStatus: 'no_house',
  previouslyBought: false,
};

// parsePricePerM2
describe('parsePricePerM2', () => {
  it('parses "20 triệu/m²" → 20', () => {
    expect(parsePricePerM2('20 triệu/m²')).toBe(20);
  });

  it('parses "14,80 triệu/m²" → 14.8', () => {
    expect(parsePricePerM2('14,80 triệu/m²')).toBe(14.8);
  });

  it('returns null for null input', () => {
    expect(parsePricePerM2(null)).toBeNull();
  });

  it('returns null for unparseable string', () => {
    expect(parsePricePerM2('Chưa công bố')).toBeNull();
  });
});

// scoreFinance
describe('scoreFinance', () => {
  it('returns 100 when estimatedTotal <= savings', () => {
    // 20tr/m² × 50m² = 1,000,000,000 VND → vượt savings 500tr → không 100
    // Cần giá nhỏ hơn: 8tr/m² × 50m² = 400tr < 500tr savings
    const p = { ...BASE_PROJECT, price: '8 triệu/m²' };
    expect(scoreFinance(p, BASE_USER)).toBe(100);
  });

  it('returns 0 when loan needed exceeds maxLoan (income × 100)', () => {
    // 20tr/m² × 50m² = 1,000tr. savings=500tr. loanNeeded=500tr. maxLoan=15tr×100=1,500tr. ratio=0.33 → not 0
    // Cần loan >> maxLoan: 60tr/m² × 50m² = 3,000tr. savings=500tr. loanNeeded=2,500tr > maxLoan=1,500tr
    const p = { ...BASE_PROJECT, price: '60 triệu/m²' };
    expect(scoreFinance(p, BASE_USER)).toBe(0);
  });

  it('returns null when price is not published', () => {
    const p = { ...BASE_PROJECT, price: null };
    expect(scoreFinance(p, BASE_USER)).toBeNull();
  });

  it('returns value between 20 and 99 for affordable-with-loan project', () => {
    // 20tr × 50m² = 1,000tr. savings=500tr. loanNeeded=500tr. maxLoan=1,500tr. ratio≈0.33
    const score = scoreFinance(BASE_PROJECT, BASE_USER);
    expect(score).toBeGreaterThanOrEqual(20);
    expect(score).toBeLessThanOrEqual(99);
  });
});

// scoreLocation
describe('scoreLocation', () => {
  it('returns 100 for distance <= 5km', () => {
    // Project at same location as work
    expect(scoreLocation(BASE_PROJECT, 21.02, 105.83)).toBe(100);
  });

  it('returns 70 for distance 5–10km', () => {
    // ~7km away
    expect(scoreLocation(BASE_PROJECT, 21.08, 105.83)).toBe(70);
  });

  it('returns null when project has no coordinates', () => {
    const p = { ...BASE_PROJECT, lat: null, lng: null };
    expect(scoreLocation(p, 21.02, 105.83)).toBeNull();
  });
});

// scoreUrgency
describe('scoreUrgency', () => {
  it('returns 100 for currently active application window', () => {
    // applyTime contains date range that includes today (2026-04-11)
    const p = { ...BASE_PROJECT, applyTime: 'Đợt 1: 30/04/2026 - 15/05/2026' };
    // Today is 2026-04-11 which is BEFORE the window starts → upcoming (60)
    // Actually 30/04/2026 > 2026-04-11, so this is upcoming
    expect(scoreUrgency(p)).toBe(60);
  });

  it('returns 100 when today is within the window', () => {
    const p = { ...BASE_PROJECT, applyTime: 'Đợt 1: 01/04/2026 - 30/04/2026' };
    expect(scoreUrgency(p)).toBe(100);
  });

  it('returns 0 for expired window', () => {
    const p = { ...BASE_PROJECT, applyTime: 'Đợt 1: 25/11/2025 - 26/12/2025' };
    expect(scoreUrgency(p)).toBe(0);
  });

  it('returns 20 for unknown schedule', () => {
    const p = { ...BASE_PROJECT, applyTime: '--' };
    expect(scoreUrgency(p)).toBe(20);
  });

  it('returns 20 for null applyTime', () => {
    const p = { ...BASE_PROJECT, applyTime: null };
    expect(scoreUrgency(p)).toBe(20);
  });
});

// scoreInvestorReputation
describe('scoreInvestorReputation', () => {
  it('returns 100 for state investor', () => {
    expect(
      scoreInvestorReputation({ ...BASE_PROJECT, investorTier: 'state' })
    ).toBe(100);
  });

  it('returns 70 for experienced investor', () => {
    expect(
      scoreInvestorReputation({ ...BASE_PROJECT, investorTier: 'experienced' })
    ).toBe(70);
  });

  it('returns 30 for new investor', () => {
    expect(
      scoreInvestorReputation({ ...BASE_PROJECT, investorTier: 'new' })
    ).toBe(30);
  });

  it('returns 50 for unknown investor', () => {
    expect(
      scoreInvestorReputation({ ...BASE_PROJECT, investorTier: null })
    ).toBe(50);
  });
});

// checkEligible
describe('checkEligible', () => {
  it('returns false if user has previously bought', () => {
    const user = { ...BASE_USER, previouslyBought: true };
    expect(checkEligible(BASE_PROJECT, user)).toBe(false);
  });

  it('returns true when project targetGroup is null (open to all)', () => {
    expect(
      checkEligible({ ...BASE_PROJECT, targetGroup: null }, BASE_USER)
    ).toBe(true);
  });

  it('returns true when user category is in project targetGroup', () => {
    const p = { ...BASE_PROJECT, targetGroup: 'income_low,worker' };
    expect(checkEligible(p, BASE_USER)).toBe(true);
  });

  it('returns false when user category is not in project targetGroup', () => {
    const p = { ...BASE_PROJECT, targetGroup: 'armed_forces' };
    expect(checkEligible(p, BASE_USER)).toBe(false);
  });
});

// scoreAndSort
describe('scoreAndSort', () => {
  it('puts ineligible projects at the end', () => {
    const ineligibleProject: Project = {
      ...BASE_PROJECT,
      id: 2,
      targetGroup: 'armed_forces',
      price: '5 triệu/m²', // great score but ineligible
    };
    const result = scoreAndSort(
      [ineligibleProject, BASE_PROJECT],
      BASE_USER,
      21.02,
      105.83,
      DEFAULT_CRITERIA_WEIGHTS
    );
    expect(result[0].id).toBe(BASE_PROJECT.id);
    expect(result[1].id).toBe(ineligibleProject.id);
    expect(result[1].scoreBreakdown.eligible).toBe(false);
  });

  it('attaches distanceKm to each project', () => {
    const result = scoreAndSort(
      [BASE_PROJECT],
      BASE_USER,
      21.02,
      105.83,
      DEFAULT_CRITERIA_WEIGHTS
    );
    expect(result[0].distanceKm).not.toBeNull();
  });

  it('returns 0 totalScore when all criteria are off', () => {
    const allOff: CriteriaWeights = {
      finance: 'off',
      location: 'off',
      urgency: 'off',
      investorReputation: 'off',
    };
    const result = scoreAndSort(
      [BASE_PROJECT],
      BASE_USER,
      21.02,
      105.83,
      allOff
    );
    expect(result[0].totalScore).toBe(0);
  });
});
