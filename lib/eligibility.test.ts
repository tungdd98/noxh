import { describe, it, expect } from 'vitest';
import { checkEligibility, sortResults } from '@/lib/eligibility';
import type { UserInfo, Project, Criteria, ProjectResult } from '@/types/noxh';

const criteria: Criteria = {
  version: '2026-04-07',
  incomeLimit: { single: 25000000, married: 50000000 },
  eligibleCategories: [
    { id: 'worker', label: 'Công nhân' },
    { id: 'low_income', label: 'Người thu nhập thấp' },
  ],
  housingConditions: [
    { id: 'no_house', label: 'Chưa có nhà' },
    { id: 'small_house', label: 'Có nhà nhỏ' },
  ],
  provinces: [{ id: 'hanoi', label: 'Hà Nội' }],
};

const baseProject: Project = {
  id: 1,
  name: 'Test Project',
  investor: 'Test',
  district: 'Test District',
  provinceId: 'hanoi',
  province: 'Hà Nội',
  price: 25,
  minArea: 45,
  maxArea: 70,
  minPrice: 1000,
  maxPrice: 1500,
  totalUnits: 100,
  status: 'Đang mở',
  statusType: 'open',
  handover: 'Q4/2027',
  priority: 'Người thu nhập thấp, công nhân',
  targetCategories: ['low_income', 'worker'],
  incomeLimit: 25000000,
  restricted: false,
  quality: 'Good',
  notes: '',
  score: 80,
  highlight: false,
  tag: null,
  updatedAt: '2026-04-09T00:00:00Z',
};

const baseUser: UserInfo = {
  income: 10000000,
  maritalStatus: 'single',
  provinceId: 'hanoi',
  category: 'worker',
  housingStatus: 'no_house',
  previouslyBought: false,
};

describe('checkEligibility', () => {
  it('returns eligible when all conditions pass', () => {
    const result = checkEligibility(baseUser, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('eligible');
    expect(result.ineligibleReasons).toHaveLength(0);
  });

  it('returns previously_bought when user already bought NOXH', () => {
    const user = { ...baseUser, previouslyBought: true };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('previously_bought');
    expect(result.ineligibleReasons).toContain('Đã từng mua/thuê NOXH');
  });

  it('returns wrong_province when provinces do not match', () => {
    const user = { ...baseUser, provinceId: 'hcm' };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('wrong_province');
  });

  it('returns wrong_category when user category not in targetCategories', () => {
    const user = { ...baseUser, category: 'officer' };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('wrong_category');
  });

  it('returns restricted when project is restricted', () => {
    const project = { ...baseProject, restricted: true };
    const result = checkEligibility(baseUser, project, criteria);
    expect(result.eligibilityStatus).toBe('restricted');
  });

  it('returns income_exceeded when single income is over project limit', () => {
    const user = { ...baseUser, income: 26000000 };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('income_exceeded');
  });

  it('returns income_exceeded when married combined income exceeds 50M limit', () => {
    const user: UserInfo = {
      ...baseUser,
      maritalStatus: 'married',
      income: 51000000,
    };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('income_exceeded');
  });

  it('is eligible when married and combined income is under 50M', () => {
    const user: UserInfo = {
      ...baseUser,
      maritalStatus: 'married',
      income: 40000000,
    };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('eligible');
  });

  it('collects multiple ineligible reasons', () => {
    const user = { ...baseUser, provinceId: 'hcm', category: 'officer' };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.ineligibleReasons.length).toBeGreaterThan(1);
  });
});

describe('sortResults', () => {
  it('puts eligible results first, sorted by score desc', () => {
    const results: ProjectResult[] = [
      {
        ...baseProject,
        id: 1,
        score: 50,
        eligibilityStatus: 'wrong_province',
        ineligibleReasons: [],
      },
      {
        ...baseProject,
        id: 2,
        score: 90,
        eligibilityStatus: 'eligible',
        ineligibleReasons: [],
      },
      {
        ...baseProject,
        id: 3,
        score: 70,
        eligibilityStatus: 'eligible',
        ineligibleReasons: [],
      },
      {
        ...baseProject,
        id: 4,
        score: 60,
        eligibilityStatus: 'income_exceeded',
        ineligibleReasons: [],
      },
    ];
    const sorted = sortResults(results);
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(3);
    expect(sorted[2].score).toBeGreaterThanOrEqual(sorted[3].score);
  });
});
