# NOXH Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public 2-column web app where users enter personal info and see which NOXH projects they're eligible for.

**Architecture:** Hook-based separation — `lib/eligibility.ts` holds pure eligibility logic (easily testable), `hooks/use-projects.ts` fetches JSON data client-side, `page.tsx` wires form + results in a responsive 2-column layout. No backend or database.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Radix UI (existing design system in `components/ui/`), Vitest + jsdom + @testing-library/react

---

## File Map

| File                          | Action | Responsibility                                  |
| ----------------------------- | ------ | ----------------------------------------------- |
| `types/noxh.ts`               | Create | All shared types                                |
| `public/data/criteria.json`   | Create | Income limits, categories, provinces            |
| `public/data/projects.json`   | Create | 6 seed projects from tracker                    |
| `lib/eligibility.ts`          | Create | Pure `checkEligibility` + `sortResults`         |
| `lib/eligibility.test.ts`     | Create | Unit tests for all eligibility cases            |
| `hooks/use-projects.ts`       | Create | Fetch projects + criteria, expose loading/error |
| `hooks/use-projects.test.ts`  | Create | Tests with mocked fetch                         |
| `hooks/use-eligibility.ts`    | Create | useMemo wrapper over checkEligibility           |
| `components/project-card.tsx` | Create | Single project card with eligibility badge      |
| `components/user-form.tsx`    | Create | 7-field form with validation                    |
| `components/project-list.tsx` | Create | Summary bar + list of ProjectCards              |
| `app/page.tsx`                | Modify | 2-col layout, localStorage save/restore         |

---

### Task 1: Types + JSON Data Files

**Files:**

- Create: `types/noxh.ts`
- Create: `public/data/criteria.json`
- Create: `public/data/projects.json`

- [ ] **Step 1: Create `types/noxh.ts`**

```ts
export type UserInfo = {
  income: number;
  maritalStatus: 'single' | 'married';
  spouseIncome: number;
  provinceId: string;
  category: string;
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};

export type Project = {
  id: number;
  name: string;
  investor: string;
  district: string;
  provinceId: string;
  province: string;
  price: number | null;
  minArea: number | null;
  maxArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  totalUnits: number;
  status: string;
  statusType: 'open' | 'upcoming' | 'pending';
  handover: string;
  priority: string;
  targetCategories: string[];
  incomeLimit: number;
  restricted: boolean;
  quality: string;
  notes: string;
  score: number;
  highlight: boolean;
  tag: string | null;
  updatedAt: string;
};

export type Criteria = {
  version: string;
  incomeLimit: { single: number; married: number };
  eligibleCategories: { id: string; label: string }[];
  housingConditions: { id: string; label: string }[];
  provinces: { id: string; label: string }[];
};

export type EligibilityStatus =
  | 'eligible'
  | 'income_exceeded'
  | 'wrong_province'
  | 'wrong_category'
  | 'housing_ineligible'
  | 'previously_bought'
  | 'restricted';

export type ProjectResult = Project & {
  eligibilityStatus: EligibilityStatus;
  ineligibleReasons: string[];
};
```

- [ ] **Step 2: Create `public/data/criteria.json`**

```json
{
  "version": "2026-04-07",
  "incomeLimit": {
    "single": 25000000,
    "married": 50000000
  },
  "eligibleCategories": [
    { "id": "officer", "label": "Cán bộ, công chức, viên chức" },
    { "id": "military", "label": "Sĩ quan, quân nhân chuyên nghiệp" },
    { "id": "worker", "label": "Công nhân, người lao động" },
    { "id": "poor", "label": "Hộ nghèo, cận nghèo đô thị" },
    { "id": "low_income", "label": "Người thu nhập thấp" },
    { "id": "contributor", "label": "Người có công với cách mạng" }
  ],
  "housingConditions": [
    { "id": "no_house", "label": "Chưa có nhà ở" },
    { "id": "small_house", "label": "Có nhà nhưng < 10m²/người" }
  ],
  "provinces": [
    { "id": "hanoi", "label": "Hà Nội" },
    { "id": "hcm", "label": "TP. Hồ Chí Minh" },
    { "id": "danang", "label": "Đà Nẵng" },
    { "id": "haiphong", "label": "Hải Phòng" },
    { "id": "binhduong", "label": "Bình Dương" },
    { "id": "dongnai", "label": "Đồng Nai" },
    { "id": "longan", "label": "Long An" }
  ]
}
```

- [ ] **Step 3: Create `public/data/projects.json`**

Data ported từ `noxh-tracker.jsx`, bỏ các field cá nhân hoá (`distanceToMeTri`, `distanceToXuanDinh`, `floors`, `*Score`), thêm `provinceId`, `province`, `targetCategories`, `incomeLimit`, `updatedAt`:

```json
[
  {
    "id": 1,
    "name": "NOXH Tân Lập",
    "investor": "Cty CP Đầu tư phát triển Ngôi sao Châu Á",
    "district": "Xã Ô Diên, Hoài Đức",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": 29,
    "minArea": 45,
    "maxArea": 70,
    "minPrice": 1305,
    "maxPrice": 2030,
    "totalUnits": 459,
    "status": "⚡ Nhận hồ sơ 1–15/5/2026",
    "statusType": "open",
    "handover": "Q4/2027",
    "priority": "Người thu nhập thấp đô thị, công nhân viên",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "Tòa 21 tầng, 2 tầng hầm, nhiều căn nhất trong nhóm",
    "notes": "CẦN NỘP HỒ SƠ NGAY — còn ~3 tuần. Nhiều căn nhất = cơ hội trúng thăm cao nhất.",
    "score": 93,
    "highlight": true,
    "tag": "KHẨN",
    "updatedAt": "2026-04-09T08:00:00Z"
  },
  {
    "id": 2,
    "name": "NOXH Ngọc Hồi",
    "investor": "Coma7 (Cơ khí & Xây lắp số 7)",
    "district": "Xã Ngọc Hồi, Thanh Trì",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": 24.7,
    "minArea": 40,
    "maxArea": 59,
    "minPrice": 988,
    "maxPrice": 1450,
    "totalUnits": 160,
    "status": "Sắp mở — Q3/2026",
    "statusType": "upcoming",
    "handover": "Chưa công bố",
    "priority": "Người thu nhập thấp đô thị, công nhân viên",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "Được BXD đánh giá chất lượng thi công tốt, CĐT có kinh nghiệm",
    "notes": "Giá/căn tốt nhất — vốn 930tr gần đủ mua đứt căn 40m². Chuẩn bị hồ sơ trước Q3.",
    "score": 90,
    "highlight": true,
    "tag": "TOP GIÁ",
    "updatedAt": "2026-04-09T08:00:00Z"
  },
  {
    "id": 3,
    "name": "NOXH Tây Nam Mễ Trì",
    "investor": "Cty CP Xây dựng & PT Nhà DAC Hà Nội",
    "district": "Phường Phú Đô, Nam Từ Liêm",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": 24.5,
    "minArea": 55,
    "maxArea": 70,
    "minPrice": 1350,
    "maxPrice": 1715,
    "totalUnits": 120,
    "status": "Khởi công Q1/2026 — chưa nhận hồ sơ",
    "statusType": "pending",
    "handover": "2027–2028 (ước tính)",
    "priority": "Người thu nhập thấp đô thị, công nhân viên",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "DAC HN là CĐT có kinh nghiệm tại Nam Từ Liêm",
    "notes": "VỊ TRÍ SỐ 1 — sát Mễ Trì 2km. Quỹ NOXH nhỏ (~120 căn), lịch thu hồ sơ chưa rõ.",
    "score": 78,
    "highlight": false,
    "tag": "VỊ TRÍ ĐỈNH",
    "updatedAt": "2026-04-09T08:00:00Z"
  },
  {
    "id": 4,
    "name": "Handico CT2",
    "investor": "Tổng Cty ĐTPT Nhà Hà Nội (Handico)",
    "district": "Phường Lĩnh Nam, Hoàng Mai",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": null,
    "minArea": null,
    "maxArea": null,
    "minPrice": null,
    "maxPrice": null,
    "totalUnits": 150,
    "status": "Chưa công bố giá & lịch",
    "statusType": "pending",
    "handover": "Q4/2026",
    "priority": "Người thu nhập thấp đô thị, công nhân viên",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "Handico là CĐT nhà nước uy tín hàng đầu HN",
    "notes": "Hoàn thành Q4/2026 → có thể thu hồ sơ Q2/Q3. Cần theo dõi Sở XD HN.",
    "score": 68,
    "highlight": false,
    "tag": null,
    "updatedAt": "2026-04-09T08:00:00Z"
  },
  {
    "id": 5,
    "name": "NOXH Minh Đức",
    "investor": "Cty CP Tập đoàn G6 + Minh Đức",
    "district": "Xã Mê Linh, Hà Nội",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": null,
    "minArea": 70,
    "maxArea": 77,
    "minPrice": null,
    "maxPrice": null,
    "totalUnits": 612,
    "status": "Nhận hồ sơ 6/2026",
    "statusType": "upcoming",
    "handover": "Chưa công bố",
    "priority": "Người thu nhập thấp đô thị, công nhân viên",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "CĐT mới, chưa có thành tích bàn giao thực tế",
    "notes": "Xa trung tâm (~25km). Giá chưa công bố. Căn to (70–77m²) = giá tổng cao hơn.",
    "score": 52,
    "highlight": false,
    "tag": null,
    "updatedAt": "2026-04-09T08:00:00Z"
  },
  {
    "id": 6,
    "name": "Bamboo Garden",
    "investor": "CEO Group",
    "district": "Xã Quốc Oai, Hà Nội",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": 9.96,
    "minArea": 49,
    "maxArea": 60,
    "minPrice": 484,
    "maxPrice": 593,
    "totalUnits": 432,
    "status": "Đang mở (thuê mua → bán sau 5 năm)",
    "statusType": "open",
    "handover": "Sắp bàn giao",
    "priority": "Người thu nhập thấp, lao động phổ thông",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "CEO Group uy tín, đã có nhiều dự án bàn giao",
    "notes": "Giá siêu rẻ nhưng xa trung tâm (~35km). Plan B nếu WFH hoặc chuyển việc.",
    "score": 45,
    "highlight": false,
    "tag": null,
    "updatedAt": "2026-04-09T08:00:00Z"
  }
]
```

- [ ] **Step 4: Commit**

```bash
git add types/noxh.ts public/data/criteria.json public/data/projects.json
git commit -m "feat: add types and seed data files"
```

---

### Task 2: Eligibility Pure Logic + Tests

**Files:**

- Create: `lib/eligibility.ts`
- Create: `lib/eligibility.test.ts`

- [ ] **Step 1: Write the failing tests (`lib/eligibility.test.ts`)**

```ts
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
  spouseIncome: 0,
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

  it('returns income_exceeded when married combined income exceeds criteria limit', () => {
    const user: UserInfo = {
      ...baseUser,
      maritalStatus: 'married',
      income: 24000000,
      spouseIncome: 27000000,
    };
    const result = checkEligibility(user, baseProject, criteria);
    expect(result.eligibilityStatus).toBe('income_exceeded');
  });

  it('is eligible when married and each person is under limit and combined is under 50M', () => {
    const user: UserInfo = {
      ...baseUser,
      maritalStatus: 'married',
      income: 20000000,
      spouseIncome: 20000000,
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/eligibility.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/eligibility'`

- [ ] **Step 3: Create `lib/eligibility.ts`**

```ts
import type {
  UserInfo,
  Project,
  Criteria,
  EligibilityStatus,
  ProjectResult,
} from '@/types/noxh';

const REASON_LABELS: Record<EligibilityStatus, string> = {
  eligible: 'Đủ điều kiện',
  previously_bought: 'Đã từng mua/thuê NOXH',
  housing_ineligible: 'Không đủ điều kiện về nhà ở',
  wrong_province: 'Không đúng tỉnh/thành phố',
  wrong_category: 'Không đúng đối tượng',
  restricted: 'Dự án giới hạn đối tượng',
  income_exceeded: 'Thu nhập vượt mức quy định',
};

export function checkEligibility(
  userInfo: UserInfo,
  project: Project,
  criteria: Criteria
): ProjectResult {
  const failures: EligibilityStatus[] = [];

  if (userInfo.previouslyBought) failures.push('previously_bought');
  if (!['no_house', 'small_house'].includes(userInfo.housingStatus))
    failures.push('housing_ineligible');
  if (userInfo.provinceId !== project.provinceId)
    failures.push('wrong_province');
  if (!project.targetCategories.includes(userInfo.category))
    failures.push('wrong_category');
  if (project.restricted) failures.push('restricted');

  const totalIncome =
    userInfo.maritalStatus === 'married'
      ? userInfo.income + userInfo.spouseIncome
      : userInfo.income;

  if (
    userInfo.income > project.incomeLimit ||
    (userInfo.maritalStatus === 'married' &&
      totalIncome > criteria.incomeLimit.married)
  ) {
    failures.push('income_exceeded');
  }

  return {
    ...project,
    eligibilityStatus: failures.length === 0 ? 'eligible' : failures[0],
    ineligibleReasons: failures.map((f) => REASON_LABELS[f]),
  };
}

export function sortResults(results: ProjectResult[]): ProjectResult[] {
  const eligible = results
    .filter((r) => r.eligibilityStatus === 'eligible')
    .sort((a, b) => b.score - a.score);
  const ineligible = results
    .filter((r) => r.eligibilityStatus !== 'eligible')
    .sort((a, b) => b.score - a.score);
  return [...eligible, ...ineligible];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/eligibility.test.ts
```

Expected: all 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/eligibility.ts lib/eligibility.test.ts
git commit -m "feat: add eligibility pure logic with tests"
```

---

### Task 3: useProjects Hook + Tests

**Files:**

- Create: `hooks/use-projects.ts`
- Create: `hooks/use-projects.test.ts`

- [ ] **Step 1: Write the failing tests (`hooks/use-projects.test.ts`)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/use-projects';
import type { Criteria, Project } from '@/types/noxh';

const mockCriteria: Criteria = {
  version: '2026-04-07',
  incomeLimit: { single: 25000000, married: 50000000 },
  eligibleCategories: [{ id: 'worker', label: 'Công nhân' }],
  housingConditions: [{ id: 'no_house', label: 'Chưa có nhà' }],
  provinces: [{ id: 'hanoi', label: 'Hà Nội' }],
};

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Test Project',
    investor: 'Test',
    district: 'Test',
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
    priority: 'Công nhân',
    targetCategories: ['worker'],
    incomeLimit: 25000000,
    restricted: false,
    quality: 'Good',
    notes: '',
    score: 80,
    highlight: false,
    tag: null,
    updatedAt: '2026-04-09T00:00:00Z',
  },
];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url.includes('criteria.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCriteria),
        });
      }
      if (url.includes('projects.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProjects),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    })
  );
});

describe('useProjects', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
    expect(result.current.criteria).toBeNull();
  });

  it('loads projects and criteria', async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].name).toBe('Test Project');
    expect(result.current.criteria?.version).toBe('2026-04-07');
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error')))
    );
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run hooks/use-projects.test.ts
```

Expected: FAIL — `Cannot find module '@/hooks/use-projects'`

- [ ] **Step 3: Create `hooks/use-projects.ts`**

```ts
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
          criteriaRes.json(),
          projectsRes.json(),
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run hooks/use-projects.test.ts
```

Expected: all 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/use-projects.ts hooks/use-projects.test.ts
git commit -m "feat: add useProjects hook with tests"
```

---

### Task 4: useEligibility Hook

**Files:**

- Create: `hooks/use-eligibility.ts`

- [ ] **Step 1: Create `hooks/use-eligibility.ts`**

```ts
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
```

- [ ] **Step 2: Run all existing tests to confirm nothing broke**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add hooks/use-eligibility.ts
git commit -m "feat: add useEligibility hook"
```

---

### Task 5: ProjectCard Component

**Files:**

- Create: `components/project-card.tsx`

- [ ] **Step 1: Create `components/project-card.tsx`**

```tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProjectResult, EligibilityStatus } from '@/types/noxh';

const STATUS_CONFIG: Record<
  'open' | 'upcoming' | 'pending',
  { label: string; className: string }
> = {
  open: {
    label: 'Đang nhận hồ sơ',
    className: 'bg-[#22c55e]/10 text-[#15803d]',
  },
  upcoming: { label: 'Sắp mở', className: 'bg-[#f59e0b]/10 text-[#92400e]' },
  pending: {
    label: 'Chưa chốt lịch',
    className: 'bg-muted text-muted-foreground',
  },
};

const ELIGIBILITY_BADGE: Record<
  EligibilityStatus,
  {
    variant: 'success' | 'warning' | 'destructive' | 'secondary';
    label: string;
  }
> = {
  eligible: { variant: 'success', label: 'Đủ điều kiện' },
  wrong_province: { variant: 'warning', label: 'Không đúng tỉnh' },
  income_exceeded: { variant: 'destructive', label: 'Thu nhập vượt mức' },
  wrong_category: { variant: 'warning', label: 'Không đúng đối tượng' },
  housing_ineligible: { variant: 'destructive', label: 'Không đủ ĐK nhà ở' },
  previously_bought: { variant: 'destructive', label: 'Đã từng mua NOXH' },
  restricted: { variant: 'secondary', label: 'Dự án giới hạn đối tượng' },
};

function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return 'Chưa công bố';
  if (!max) return `Từ ${min}tr`;
  if (!min) return `Đến ${max}tr`;
  return min >= 1000
    ? `${(min / 1000).toFixed(1)}–${(max / 1000).toFixed(1)} tỷ`
    : `${min}–${max}tr`;
}

function formatArea(min: number | null, max: number | null): string {
  if (!min && !max) return '';
  if (!max) return `${min}m²`;
  return `${min}–${max}m²`;
}

type Props = { project: ProjectResult };

export function ProjectCard({ project }: Props) {
  const eligibility = ELIGIBILITY_BADGE[project.eligibilityStatus];
  const statusCfg = STATUS_CONFIG[project.statusType];
  const isEligible = project.eligibilityStatus === 'eligible';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-opacity',
        !isEligible && 'opacity-75'
      )}
    >
      {project.tag && (
        <span className="bg-primary text-primary-foreground absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold">
          {project.tag}
        </span>
      )}
      <CardContent className="space-y-2 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 pr-14">
          <h3 className="text-sm leading-tight font-semibold">
            {project.name}
          </h3>
          <Badge variant={eligibility.variant} className="shrink-0">
            {eligibility.label}
          </Badge>
        </div>

        <p className="text-muted-foreground text-xs">
          {project.district} · {project.province}
        </p>

        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {(project.minArea || project.maxArea) && (
            <span>📐 {formatArea(project.minArea, project.maxArea)}</span>
          )}
          <span>💰 {formatPrice(project.minPrice, project.maxPrice)}</span>
          <span>🏠 {project.totalUnits} căn</span>
          {project.handover && project.handover !== 'Chưa công bố' && (
            <span>📅 {project.handover}</span>
          )}
        </div>

        <div
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs font-medium',
            statusCfg.className
          )}
        >
          {project.status}
        </div>

        {!isEligible && project.ineligibleReasons.length > 0 && (
          <p className="text-muted-foreground text-[11px]">
            Lý do: {project.ineligibleReasons.join(' · ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS (no new tests needed for this component)

- [ ] **Step 3: Commit**

```bash
git add components/project-card.tsx
git commit -m "feat: add ProjectCard component"
```

---

### Task 6: UserForm Component

**Files:**

- Create: `components/user-form.tsx`

- [ ] **Step 1: Create `components/user-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserInfo, Criteria } from '@/types/noxh';

type Props = {
  criteria: Criteria;
  initialValues: UserInfo | null;
  onSubmit: (info: UserInfo) => void;
};

const DEFAULT_FORM: UserInfo = {
  income: 0,
  maritalStatus: 'single',
  spouseIncome: 0,
  provinceId: '',
  category: '',
  housingStatus: 'no_house',
  previouslyBought: false,
};

export function UserForm({ criteria, initialValues, onSubmit }: Props) {
  const [form, setForm] = useState<UserInfo>(initialValues ?? DEFAULT_FORM);

  const isValid =
    form.income > 0 &&
    form.provinceId !== '' &&
    form.category !== '' &&
    (form.maritalStatus === 'single' || form.spouseIncome >= 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Thu nhập */}
      <div className="space-y-1.5">
        <Label htmlFor="income">Thu nhập hàng tháng</Label>
        <CurrencyInput
          id="income"
          placeholder="VD: 12.000.000"
          value={form.income || ''}
          onChange={(val) =>
            setForm((f) => ({ ...f, income: val === '' ? 0 : val }))
          }
        />
      </div>

      {/* 2. Hôn nhân */}
      <div className="space-y-1.5">
        <Label>Tình trạng hôn nhân</Label>
        <RadioGroup
          value={form.maritalStatus}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              maritalStatus: v as 'single' | 'married',
              spouseIncome: 0,
            }))
          }
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="cursor-pointer font-normal">
              Độc thân
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="married" id="married" />
            <Label htmlFor="married" className="cursor-pointer font-normal">
              Đã kết hôn
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* 3. Thu nhập vợ/chồng (conditional) */}
      {form.maritalStatus === 'married' && (
        <div className="space-y-1.5">
          <Label htmlFor="spouse-income">Thu nhập vợ/chồng</Label>
          <CurrencyInput
            id="spouse-income"
            placeholder="VD: 10.000.000"
            value={form.spouseIncome || ''}
            onChange={(val) =>
              setForm((f) => ({ ...f, spouseIncome: val === '' ? 0 : val }))
            }
          />
        </div>
      )}

      {/* 4. Tỉnh thành */}
      <div className="space-y-1.5">
        <Label>Tỉnh / Thành phố muốn mua</Label>
        <Select
          value={form.provinceId}
          onValueChange={(v) => setForm((f) => ({ ...f, provinceId: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn tỉnh thành..." />
          </SelectTrigger>
          <SelectContent>
            {criteria.provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. Đối tượng */}
      <div className="space-y-1.5">
        <Label>Đối tượng</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn đối tượng..." />
          </SelectTrigger>
          <SelectContent>
            {criteria.eligibleCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 6. Tình trạng nhà ở */}
      <div className="space-y-1.5">
        <Label>Tình trạng nhà ở hiện tại</Label>
        <RadioGroup
          value={form.housingStatus}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              housingStatus: v as 'no_house' | 'small_house',
            }))
          }
          className="space-y-2"
        >
          {criteria.housingConditions.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <RadioGroupItem value={c.id} id={`housing-${c.id}`} />
              <Label
                htmlFor={`housing-${c.id}`}
                className="cursor-pointer font-normal"
              >
                {c.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 7. Đã từng mua NOXH */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="previously-bought"
          checked={form.previouslyBought}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, previouslyBought: Boolean(v) }))
          }
        />
        <Label
          htmlFor="previously-bought"
          className="cursor-pointer font-normal"
        >
          Đã từng mua hoặc thuê nhà ở xã hội
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={!isValid}>
        Kiểm tra điều kiện →
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add components/user-form.tsx
git commit -m "feat: add UserForm component"
```

---

### Task 7: ProjectList Component

**Files:**

- Create: `components/project-list.tsx`

- [ ] **Step 1: Create `components/project-list.tsx`**

```tsx
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/project-card';
import type { ProjectResult } from '@/types/noxh';

type Props = {
  results: ProjectResult[];
  hasChecked: boolean;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
};

export function ProjectList({
  results,
  hasChecked,
  loading,
  error,
  updatedAt,
}: Props) {
  if (loading) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
        Đang tải dữ liệu dự án...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex h-40 items-center justify-center text-sm">
        {error}
      </div>
    );
  }

  if (!hasChecked) {
    return (
      <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 text-center text-sm">
        <span className="text-3xl">🏠</span>
        <p>Nhập thông tin bên trái và nhấn "Kiểm tra" để xem dự án phù hợp</p>
        {updatedAt && (
          <p className="text-xs">
            Dữ liệu cập nhật: {new Date(updatedAt).toLocaleString('vi-VN')}
          </p>
        )}
      </div>
    );
  }

  const eligibleCount = results.filter(
    (r) => r.eligibilityStatus === 'eligible'
  ).length;
  const ineligibleCount = results.length - eligibleCount;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.5px] uppercase">
          {results.length} dự án
        </p>
        <div className="flex gap-2">
          {eligibleCount > 0 && (
            <Badge variant="success">{eligibleCount} đủ ĐK</Badge>
          )}
          {ineligibleCount > 0 && (
            <Badge variant="destructive">{ineligibleCount} không đủ</Badge>
          )}
        </div>
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {results.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add components/project-list.tsx
git commit -m "feat: add ProjectList component"
```

---

### Task 8: Main Page + localStorage

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with the main NOXH app**

Thay toàn bộ nội dung file. Trang hiện tại là design system preview — ta thay bằng app thực:

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useEligibility } from '@/hooks/use-eligibility';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';
import type { UserInfo } from '@/types/noxh';

const LOCAL_STORAGE_KEY = 'noxh_user_info';

export default function NOXHPage() {
  const { projects, criteria, loading, error } = useProjects();
  const [submittedInfo, setSubmittedInfo] = useState<UserInfo | null>(null);
  const [initialValues, setInitialValues] = useState<UserInfo | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) setInitialValues(JSON.parse(saved));
    } catch {
      // ignore corrupted data
    }
  }, []);

  const results = useEligibility(submittedInfo, projects, criteria);
  const hasChecked = submittedInfo !== null;

  // Latest updatedAt from any project
  const updatedAt =
    projects.length > 0
      ? projects.reduce(
          (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
          projects[0].updatedAt
        )
      : null;

  function handleSubmit(info: UserInfo) {
    setSubmittedInfo(info);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    } catch {
      // ignore storage errors
    }
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">
              Nhà Ở Xã Hội
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Tìm dự án phù hợp với điều kiện của bạn
              {updatedAt &&
                ` · Cập nhật ${new Date(updatedAt).toLocaleString('vi-VN')}`}
            </p>
          </div>
          {projects.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
              {projects.length} dự án
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Left: Form */}
          <aside className="w-full md:w-[340px] md:shrink-0">
            <div className="bg-muted/40 rounded-xl border p-5">
              <p className="text-muted-foreground mb-4 text-[11px] font-semibold tracking-[0.5px] uppercase">
                Thông tin của bạn
              </p>
              {criteria ? (
                <UserForm
                  criteria={criteria}
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                />
              ) : loading ? (
                <p className="text-muted-foreground text-sm">Đang tải...</p>
              ) : (
                <p className="text-destructive text-sm">{error}</p>
              )}
            </div>
          </aside>

          {/* Right: Results */}
          <section ref={resultsRef} className="min-w-0 flex-1">
            <ProjectList
              results={results}
              hasChecked={hasChecked}
              loading={loading}
              error={error}
              updatedAt={updatedAt}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 3: Start dev server và kiểm tra thủ công**

```bash
npm run dev
```

Mở http://localhost:3000 và kiểm tra:

- Form hiển thị 7 trường
- Field "Thu nhập vợ/chồng" ẩn khi chọn Độc thân, hiện khi chọn Đã kết hôn
- Nút "Kiểm tra" disabled khi chưa điền đủ thu nhập, tỉnh thành, đối tượng
- Sau khi nhấn "Kiểm tra": cột phải hiện danh sách 6 dự án với badge đủ/không đủ ĐK
- Reload trang: form tự điền lại từ localStorage
- Trên mobile (thu hẹp window < 768px): sau khi nhấn "Kiểm tra", trang tự scroll xuống kết quả

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build NOXH main page with 2-column layout and localStorage"
```
