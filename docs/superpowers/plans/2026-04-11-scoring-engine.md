# NOXH Scoring Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biến danh sách dự án NOXH thành công cụ đánh giá cá nhân hóa — người dùng nhập thông tin cá nhân, tài chính, vị trí làm việc và nhận danh sách dự án xếp hạng theo độ phù hợp.

**Architecture:** UserForm thu thập thông tin → gọi `POST /api/geocode` (Next.js Route Handler proxying Google Maps) để geocode địa chỉ nơi làm việc → `useScoring` hook tính điểm từng dự án bằng `lib/scoring.ts` (dùng Haversine + logic tài chính/urgency) → ProjectList render danh sách đã sort theo điểm. Tọa độ dự án được lưu sẵn trong DB bằng script một lần.

**Tech Stack:** Next.js 16 Route Handlers, Supabase (PostgreSQL), Google Maps Geocoding REST API, Vitest + @testing-library/react, TypeScript

---

## File Map

| File                                  | Action  | Trách nhiệm                                                          |
| ------------------------------------- | ------- | -------------------------------------------------------------------- |
| `types/noxh.ts`                       | Mở rộng | Thêm types mới: `ScoredProject`, `CriteriaWeights`, `ScoreBreakdown` |
| `lib/haversine.ts`                    | Tạo mới | Hàm tính khoảng cách Haversine giữa 2 tọa độ                         |
| `lib/haversine.test.ts`               | Tạo mới | Unit tests cho haversine                                             |
| `lib/scoring.ts`                      | Tạo mới | Engine tính điểm thuần túy: 4 tiêu chí + sort                        |
| `lib/scoring.test.ts`                 | Tạo mới | Unit tests cho từng tiêu chí                                         |
| `hooks/use-projects.ts`               | Mở rộng | Map thêm `lat`, `lng`, `investorTier`, `targetGroup` từ DB           |
| `hooks/use-projects.test.ts`          | Mở rộng | Cập nhật mock data với fields mới                                    |
| `hooks/use-scoring.ts`                | Tạo mới | Hook quản lý trạng thái geocode + scoring                            |
| `hooks/use-scoring.test.ts`           | Tạo mới | Tests cho hook                                                       |
| `app/api/geocode/route.ts`            | Tạo mới | POST handler, proxy Google Maps Geocoding API                        |
| `app/api/geocode/route.test.ts`       | Tạo mới | Tests cho route handler                                              |
| `scripts/geocode-projects.ts`         | Tạo mới | Script một lần: điền lat/lng cho dự án trong DB                      |
| `components/user-form.tsx`            | Mở rộng | Thêm savings, workAddress, bỏ provinceId, thêm criteria accordion    |
| `components/project-card.tsx`         | Mở rộng | Thêm score badge, khoảng cách, budget status                         |
| `components/project-detail-modal.tsx` | Mở rộng | Thêm score breakdown section                                         |
| `components/project-list.tsx`         | Mở rộng | Accept `(Project \| ScoredProject)[]`                                |
| `app/page.tsx`                        | Mở rộng | Kết nối `useScoring`, xử lý form submit                              |

---

## Task 1: Extend `types/noxh.ts`

**Files:**

- Modify: `types/noxh.ts`

- [ ] **Step 1: Mở rộng types**

Thay thế toàn bộ nội dung `types/noxh.ts`:

```ts
export type Project = {
  id: number;
  title: string;
  status: string | null;
  price: string | null;
  handover: string | null;
  address: string | null;
  owner: string | null;
  applyTime: string | null;
  scale: string | null;
  area: string | null;
  density: string | null;
  maintenance: string | null;
  imageUrl: string | null;
  url: string | null;
  scrapedAt: string | null;
  // Scoring fields
  lat: number | null;
  lng: number | null;
  investorTier: 'state' | 'experienced' | 'new' | null;
  targetGroup: string | null; // comma-separated categories, null = open to all
};

export type UserInfo = {
  income: number; // VND/month
  savings: number; // VND — vốn tự có
  workAddress: string; // địa chỉ nơi làm việc
  maritalStatus: 'single' | 'married';
  category: string; // 'income_low' | 'worker' | 'civil_servant'
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};

export type CriteriaWeights = {
  finance: 'high' | 'medium' | 'low' | 'off';
  location: 'high' | 'medium' | 'low' | 'off';
  urgency: 'high' | 'medium' | 'low' | 'off';
  investorReputation: 'high' | 'medium' | 'low' | 'off';
};

export const DEFAULT_CRITERIA_WEIGHTS: CriteriaWeights = {
  finance: 'high',
  location: 'high',
  urgency: 'medium',
  investorReputation: 'medium',
};

export type ScoreBreakdown = {
  finance: number | null; // 0–100, null nếu dữ liệu thiếu
  location: number | null; // 0–100, null nếu thiếu tọa độ
  urgency: number | null; // 0–100
  investorReputation: number | null; // 0–100
  eligible: boolean; // false → tag "Không đủ điều kiện"
};

export type ScoredProject = Project & {
  totalScore: number; // 0–100
  scoreBreakdown: ScoreBreakdown;
  distanceKm: number | null; // khoảng cách đến nơi làm việc
};

export const CATEGORY_OPTIONS = [
  { id: 'income_low', label: 'Người thu nhập thấp đô thị' },
  { id: 'worker', label: 'Công nhân / người lao động' },
  { id: 'civil_servant', label: 'Cán bộ, công chức, viên chức' },
] as const;

export const HOUSING_STATUS_OPTIONS = [
  { id: 'no_house', label: 'Chưa có nhà ở' },
  { id: 'small_house', label: 'Có nhà nhưng diện tích <10m²/người' },
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add types/noxh.ts
git commit -m "feat(types): extend Project/UserInfo, add ScoredProject and CriteriaWeights"
```

---

## Task 2: `lib/haversine.ts` (TDD)

**Files:**

- Create: `lib/haversine.ts`
- Create: `lib/haversine.test.ts`

- [ ] **Step 1: Viết test trước**

Tạo `lib/haversine.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { haversineKm } from './haversine';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(21.0, 105.8, 21.0, 105.8)).toBe(0);
  });

  it('calculates distance between Hoan Kiem and Cau Giay (~5.5km)', () => {
    // Hoàn Kiếm: 21.0285, 105.8542
    // Cầu Giấy:  21.0369, 105.7928
    const km = haversineKm(21.0285, 105.8542, 21.0369, 105.7928);
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(7);
  });

  it('calculates distance Hanoi to Ho Chi Minh City (~1735km)', () => {
    const km = haversineKm(21.0285, 105.8542, 10.8231, 106.6297);
    expect(km).toBeGreaterThan(1700);
    expect(km).toBeLessThan(1770);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run lib/haversine.test.ts
```

Expected: FAIL — "Cannot find module './haversine'"

- [ ] **Step 3: Implement `lib/haversine.ts`**

```ts
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

- [ ] **Step 4: Chạy lại test, xác nhận PASS**

```bash
npx vitest run lib/haversine.test.ts
```

Expected: PASS — 3 tests passed

- [ ] **Step 5: Commit**

```bash
git add lib/haversine.ts lib/haversine.test.ts
git commit -m "feat(lib): add haversineKm distance utility"
```

---

## Task 3: `lib/scoring.ts` (TDD)

**Files:**

- Create: `lib/scoring.ts`
- Create: `lib/scoring.test.ts`

- [ ] **Step 1: Viết tests**

Tạo `lib/scoring.test.ts`:

```ts
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
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run lib/scoring.test.ts
```

Expected: FAIL — "Cannot find module './scoring'"

- [ ] **Step 3: Implement `lib/scoring.ts`**

Tạo `lib/scoring.ts`:

```ts
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
```

- [ ] **Step 4: Chạy lại tests**

```bash
npx vitest run lib/scoring.test.ts
```

Expected: PASS — tất cả tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts lib/scoring.test.ts
git commit -m "feat(lib): add scoring engine with 4 criteria and sort"
```

---

## Task 4: DB Migration + cập nhật `use-projects.ts`

**Files:**

- Modify: `hooks/use-projects.ts`
- Modify: `hooks/use-projects.test.ts`

> **Lưu ý:** Bước SQL phải chạy thủ công trong Supabase Dashboard (SQL Editor).

- [ ] **Step 1: Chạy migration trong Supabase Dashboard**

Vào Supabase Dashboard → SQL Editor, chạy:

```sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS lat FLOAT,
  ADD COLUMN IF NOT EXISTS lng FLOAT,
  ADD COLUMN IF NOT EXISTS investor_tier TEXT,
  ADD COLUMN IF NOT EXISTS target_group TEXT;

-- investor_tier allowed values: 'state', 'experienced', 'new'
-- target_group: comma-separated categories, NULL = open to all
```

- [ ] **Step 2: Mở rộng `hooks/use-projects.ts`**

Cập nhật `DbRow` type và `toProject` function:

```ts
type DbRow = {
  id: number;
  title: string;
  status: string | null;
  price: string | null;
  handover: string | null;
  address: string | null;
  owner: string | null;
  apply_time: string | null;
  scale: string | null;
  area: string | null;
  density: string | null;
  maintenance: string | null;
  image_url: string | null;
  url: string | null;
  scraped_at: string | null;
  lat: number | null;
  lng: number | null;
  investor_tier: 'state' | 'experienced' | 'new' | null;
  target_group: string | null;
};

function toProject(row: DbRow): Project {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    price: row.price,
    handover: row.handover,
    address: row.address,
    owner: row.owner,
    applyTime: row.apply_time,
    scale: row.scale,
    area: row.area,
    density: row.density,
    maintenance: row.maintenance,
    imageUrl: row.image_url,
    url: row.url,
    scrapedAt: row.scraped_at,
    lat: row.lat,
    lng: row.lng,
    investorTier: row.investor_tier,
    targetGroup: row.target_group,
  };
}
```

- [ ] **Step 3: Cập nhật `hooks/use-projects.test.ts`**

Thêm các fields mới vào `mockProjects` và `mockDbRows`:

Trong `mockProjects[0]`, thêm:

```ts
lat: 21.02,
lng: 105.83,
investorTier: 'experienced' as const,
targetGroup: null,
```

Trong `mockDbRows[0]`, thêm:

```ts
lat: 21.02,
lng: 105.83,
investor_tier: 'experienced' as const,
target_group: null,
```

Thêm test case:

```ts
it('maps lat, lng, investor_tier, target_group correctly', async () => {
  const { result } = renderHook(() => useProjects());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.projects[0].lat).toBe(21.02);
  expect(result.current.projects[0].lng).toBe(105.83);
  expect(result.current.projects[0].investorTier).toBe('experienced');
  expect(result.current.projects[0].targetGroup).toBeNull();
});
```

- [ ] **Step 4: Chạy test**

```bash
npx vitest run hooks/use-projects.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/use-projects.ts hooks/use-projects.test.ts
git commit -m "feat(db): add lat/lng/investor_tier/target_group columns and update hook mapping"
```

---

## Task 5: `app/api/geocode/route.ts` (TDD)

**Files:**

- Create: `app/api/geocode/route.ts`
- Create: `app/api/geocode/route.test.ts`

> **Prerequisite:** Cần thêm `GOOGLE_MAPS_API_KEY` vào `.env.local`:
>
> ```
> GOOGLE_MAPS_API_KEY=your_key_here
> ```

- [ ] **Step 1: Viết test**

Tạo `app/api/geocode/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/geocode', () => {
  it('returns lat/lng on successful geocode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'OK',
        results: [{ geometry: { location: { lat: 21.0678, lng: 105.8012 } } }],
      }),
    });

    const res = await POST(makeRequest({ address: 'Xuân Đỉnh, Hà Nội' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ lat: 21.0678, lng: 105.8012 });
  });

  it('returns 404 when Google returns ZERO_RESULTS', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
    });

    const res = await POST(
      makeRequest({ address: 'địa chỉ không tồn tại xyz' })
    );
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('returns 400 when address is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 500 when Google API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const res = await POST(makeRequest({ address: 'Hà Nội' }));
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run app/api/geocode/route.test.ts
```

Expected: FAIL — "Cannot find module './route'"

- [ ] **Step 3: Tạo `app/api/geocode/route.ts`**

Tạo thư mục và file:

```ts
import { NextResponse } from 'next/server';

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function POST(req: Request) {
  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { address } = body;
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', MAPS_API_KEY ?? '');
    url.searchParams.set('region', 'vn');

    const gRes = await fetch(url.toString());
    const gData = await gRes.json();

    if (gData.status !== 'OK' || !gData.results.length) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa chỉ' },
        { status: 404 }
      );
    }

    const { lat, lng } = gData.results[0].geometry.location;
    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json({ error: 'Geocoding thất bại' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Chạy lại tests**

```bash
npx vitest run app/api/geocode/route.test.ts
```

Expected: PASS — 4 tests passed

- [ ] **Step 5: Commit**

```bash
git add app/api/geocode/route.ts app/api/geocode/route.test.ts
git commit -m "feat(api): add POST /api/geocode route handler"
```

---

## Task 6: Script geocode dự án trong DB

**Files:**

- Create: `scripts/geocode-projects.ts`

> Script này chạy một lần. Cần `SUPABASE_SERVICE_KEY` (service role key từ Supabase Dashboard → Settings → API).
> Thêm vào `.env.local`:
>
> ```
> SUPABASE_SERVICE_KEY=your_service_role_key_here
> ```

- [ ] **Step 1: Tạo `scripts/geocode-projects.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const mapsKey = process.env.GOOGLE_MAPS_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', mapsKey);
  url.searchParams.set('region', 'vn');

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== 'OK' || !data.results.length) {
    return null;
  }

  return data.results[0].geometry.location;
}

async function main() {
  // Lấy tất cả dự án chưa có tọa độ
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, address')
    .is('lat', null);

  if (error) {
    console.error('Lỗi fetch projects:', error);
    process.exit(1);
  }

  console.log(`Tìm thấy ${projects.length} dự án cần geocode`);

  for (const project of projects) {
    if (!project.address) {
      console.log(`[SKIP] #${project.id} ${project.title} — không có địa chỉ`);
      continue;
    }

    const coords = await geocodeAddress(project.address);

    if (!coords) {
      console.log(
        `[FAIL] #${project.id} ${project.title} — không geocode được`
      );
      continue;
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('id', project.id);

    if (updateError) {
      console.error(`[ERROR] #${project.id}:`, updateError);
    } else {
      console.log(
        `[OK] #${project.id} ${project.title} → ${coords.lat}, ${coords.lng}`
      );
    }

    // Rate limit: 10 req/s Google Maps free tier
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log('Hoàn thành!');
}

main();
```

- [ ] **Step 2: Thêm script vào `package.json`**

Trong section `"scripts"` của `package.json`, thêm:

```json
"geocode-db": "dotenv -e .env.local -- npx tsx scripts/geocode-projects.ts"
```

> Nếu chưa có `dotenv-cli`, cài: `npm install --save-dev dotenv-cli tsx`

- [ ] **Step 3: Commit**

```bash
git add scripts/geocode-projects.ts package.json package-lock.json
git commit -m "feat(scripts): add one-time geocode script for existing projects"
```

> **Chạy script sau khi commit:**
>
> ```bash
> npm run geocode-db
> ```

---

## Task 7: `hooks/use-scoring.ts` (TDD)

**Files:**

- Create: `hooks/use-scoring.ts`
- Create: `hooks/use-scoring.test.ts`

- [ ] **Step 1: Viết test**

Tạo `hooks/use-scoring.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScoring } from './use-scoring';
import type { Project } from '@/types/noxh';
import { DEFAULT_CRITERIA_WEIGHTS } from '@/types/noxh';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const BASE_PROJECT: Project = {
  id: 1,
  title: 'Test Project',
  status: 'Đang thi công',
  price: '20 triệu/m²',
  handover: null,
  address: 'Hà Nội',
  owner: null,
  applyTime: 'Đợt 1: 01/04/2026 - 30/04/2026',
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

const BASE_USER = {
  income: 15_000_000,
  savings: 500_000_000,
  workAddress: 'Xuân Đỉnh, Hà Nội',
  maritalStatus: 'single' as const,
  category: 'income_low',
  housingStatus: 'no_house' as const,
  previouslyBought: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useScoring', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useScoring([BASE_PROJECT]));
    expect(result.current.scored).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading true while scoring', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ lat: 21.04, lng: 105.84 }),
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useScoring([BASE_PROJECT]));

    act(() => {
      result.current.score(BASE_USER, DEFAULT_CRITERIA_WEIGHTS);
    });

    expect(result.current.loading).toBe(true);
  });

  it('returns scored projects on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lat: 21.04, lng: 105.84 }),
    });

    const { result } = renderHook(() => useScoring([BASE_PROJECT]));

    await act(async () => {
      await result.current.score(BASE_USER, DEFAULT_CRITERIA_WEIGHTS);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.scored).toHaveLength(1);
    expect(result.current.scored[0]).toHaveProperty('totalScore');
    expect(result.current.scored[0]).toHaveProperty('distanceKm');
  });

  it('sets error when geocode fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'Không tìm thấy địa chỉ' }),
    });

    const { result } = renderHook(() => useScoring([BASE_PROJECT]));

    await act(async () => {
      await result.current.score(BASE_USER, DEFAULT_CRITERIA_WEIGHTS);
    });

    expect(result.current.error).toBe('Không tìm thấy địa chỉ');
    expect(result.current.scored).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run hooks/use-scoring.test.ts
```

Expected: FAIL — "Cannot find module './use-scoring'"

- [ ] **Step 3: Implement `hooks/use-scoring.ts`**

```ts
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
  loading: boolean;
  error: string | null;
};

export function useScoring(projects: Project[]) {
  const [state, setState] = useState<ScoringState>({
    scored: [],
    loading: false,
    error: null,
  });

  async function score(userInfo: UserInfo, weights: CriteriaWeights) {
    setState({ scored: [], loading: true, error: null });

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
        setState({ scored: [], loading: false, error: data.error });
        return;
      }

      const scored = scoreAndSort(
        projects,
        userInfo,
        data.lat,
        data.lng,
        weights
      );
      setState({ scored, loading: false, error: null });
    } catch {
      setState({
        scored: [],
        loading: false,
        error: 'Không thể geocode địa chỉ. Vui lòng thử lại.',
      });
    }
  }

  return { ...state, score };
}
```

- [ ] **Step 4: Chạy lại tests**

```bash
npx vitest run hooks/use-scoring.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/use-scoring.ts hooks/use-scoring.test.ts
git commit -m "feat(hooks): add useScoring hook for geocode + score pipeline"
```

---

## Task 8: Mở rộng `components/user-form.tsx`

**Files:**

- Modify: `components/user-form.tsx`

- [ ] **Step 1: Thay thế nội dung `user-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';
import type { UserInfo, CriteriaWeights } from '@/types/noxh';
import {
  DEFAULT_CRITERIA_WEIGHTS,
  CATEGORY_OPTIONS,
  HOUSING_STATUS_OPTIONS,
} from '@/types/noxh';

type Props = {
  onSubmit: (info: UserInfo, weights: CriteriaWeights) => void;
  loading?: boolean;
};

const DEFAULT_FORM: UserInfo = {
  income: 0,
  savings: 0,
  workAddress: '',
  maritalStatus: 'single',
  category: '',
  housingStatus: 'no_house',
  previouslyBought: false,
};

const WEIGHT_OPTIONS = [
  { value: 'high', label: 'Cao' },
  { value: 'medium', label: 'TB' },
  { value: 'low', label: 'Thấp' },
  { value: 'off', label: 'Tắt' },
] as const;

const CRITERIA_LABELS: Record<keyof CriteriaWeights, string> = {
  finance: 'Tài chính',
  location: 'Vị trí',
  urgency: 'Urgency',
  investorReputation: 'Uy tín CĐT',
};

const INPUT_CLASS =
  'h-auto w-full rounded-[10px] border-2 border-border bg-input px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1';

const SELECT_TRIGGER_CLASS =
  'w-full rounded-[10px] border-2 border-border bg-input px-3.5 py-2.5 text-sm font-medium text-foreground h-auto data-[size=default]:h-auto';

export function UserForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<UserInfo>(DEFAULT_FORM);
  const [weights, setWeights] = useState<CriteriaWeights>(
    DEFAULT_CRITERIA_WEIGHTS
  );
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  const isValid =
    form.income > 0 && form.category !== '' && form.workAddress.trim() !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form, weights);
  }

  function setWeight(
    key: keyof CriteriaWeights,
    value: CriteriaWeights[keyof CriteriaWeights]
  ) {
    setWeights((w) => ({ ...w, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hôn nhân */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">
          Tình trạng hôn nhân
        </Label>
        <RadioGroup
          value={form.maritalStatus}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, maritalStatus: v as 'single' | 'married' }))
          }
          className="flex gap-2"
        >
          {(
            [
              { value: 'single', label: 'Độc thân' },
              { value: 'married', label: 'Đã kết hôn' },
            ] as const
          ).map((opt) => (
            <Label
              key={opt.value}
              htmlFor={opt.value}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center rounded-[10px] border-2 px-3 py-2.5 text-sm font-bold transition-all',
                form.maritalStatus === opt.value
                  ? 'border-primary bg-primary text-primary-foreground shadow-[2px_2px_0_var(--border)]'
                  : 'bg-input border-border text-foreground hover:bg-muted'
              )}
            >
              <RadioGroupItem
                value={opt.value}
                id={opt.value}
                className="sr-only"
              />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Thu nhập */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold" htmlFor="income">
          Thu nhập hàng tháng
        </Label>
        <CurrencyInput
          id="income"
          placeholder="VD: 12.000.000"
          value={form.income || ''}
          onChange={(val) =>
            setForm((f) => ({ ...f, income: val === '' ? 0 : val }))
          }
          className={INPUT_CLASS}
        />
        {form.maritalStatus === 'married' && (
          <p className="text-muted-foreground text-xs">
            Nhập tổng thu nhập của cả 2 vợ chồng
          </p>
        )}
      </div>

      {/* Vốn tự có */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold" htmlFor="savings">
          Vốn tự có
        </Label>
        <CurrencyInput
          id="savings"
          placeholder="VD: 500.000.000"
          value={form.savings || ''}
          onChange={(val) =>
            setForm((f) => ({ ...f, savings: val === '' ? 0 : val }))
          }
          className={INPUT_CLASS}
        />
      </div>

      {/* Địa chỉ nơi làm việc */}
      <div className="space-y-1.5">
        <Label
          className="text-foreground text-xs font-bold"
          htmlFor="workAddress"
        >
          Địa chỉ nơi làm việc
        </Label>
        <Input
          id="workAddress"
          placeholder="VD: Xuân Đỉnh, Bắc Từ Liêm"
          value={form.workAddress}
          onChange={(e) =>
            setForm((f) => ({ ...f, workAddress: e.target.value }))
          }
          className={INPUT_CLASS}
        />
      </div>

      {/* Đối tượng */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">Đối tượng</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder="Chọn đối tượng..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tình trạng nhà ở */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-bold">
          Tình trạng nhà ở hiện tại
        </Label>
        <RadioGroup
          value={form.housingStatus}
          onValueChange={(v) =>
            setForm((f) => ({
              ...f,
              housingStatus: v as 'no_house' | 'small_house',
            }))
          }
          className="flex flex-col gap-2"
        >
          {HOUSING_STATUS_OPTIONS.map((c) => (
            <Label
              key={c.id}
              htmlFor={`housing-${c.id}`}
              className={cn(
                'flex w-full cursor-pointer items-center rounded-[10px] border-2 px-3.5 py-2.5 text-sm font-bold transition-all',
                form.housingStatus === c.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-[2px_2px_0_var(--border)]'
                  : 'bg-input border-border text-foreground hover:bg-muted'
              )}
            >
              <RadioGroupItem
                value={c.id}
                id={`housing-${c.id}`}
                className="sr-only"
              />
              {c.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Đã từng mua */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="previously-bought"
          checked={form.previouslyBought}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, previouslyBought: Boolean(v) }))
          }
          className="border-border border-2"
        />
        <Label
          htmlFor="previously-bought"
          className="text-foreground cursor-pointer text-sm font-medium"
        >
          Đã từng mua hoặc thuê nhà ở xã hội
        </Label>
      </div>

      {/* Tiêu chí đánh giá — accordion */}
      <div className="border-border rounded-[10px] border-2">
        <button
          type="button"
          onClick={() => setCriteriaOpen((o) => !o)}
          className="text-foreground flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold"
        >
          <span>Tiêu chí đánh giá</span>
          <span>{criteriaOpen ? '▲' : '▼'}</span>
        </button>

        {criteriaOpen && (
          <div className="border-border space-y-3 border-t-2 px-3.5 py-3">
            {(Object.keys(CRITERIA_LABELS) as (keyof CriteriaWeights)[]).map(
              (key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-foreground text-xs font-semibold">
                    {CRITERIA_LABELS[key]}
                  </span>
                  <div className="flex gap-1">
                    {WEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWeight(key, opt.value)}
                        className={cn(
                          'rounded-md border px-2 py-0.5 text-xs font-bold transition-all',
                          weights[key] === opt.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-input text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Đối tượng — bắt buộc, không tắt */}
            <div className="flex items-center justify-between gap-2 opacity-60">
              <span className="text-foreground text-xs font-semibold">
                Đối tượng
              </span>
              <span className="border-border rounded-md border px-2 py-0.5 text-xs font-bold">
                🔒 Bắt buộc
              </span>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isValid || loading}
        className="w-full"
      >
        {loading ? 'Đang tính...' : 'Tìm dự án phù hợp →'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Chạy build để kiểm tra TypeScript**

```bash
npx tsc --noEmit
```

Expected: Không có lỗi TypeScript

- [ ] **Step 3: Commit**

```bash
git add components/user-form.tsx
git commit -m "feat(ui): extend UserForm with savings, workAddress, criteria weights accordion"
```

---

## Task 9: Mở rộng `components/project-card.tsx`

**Files:**

- Modify: `components/project-card.tsx`

- [ ] **Step 1: Thay thế nội dung `project-card.tsx`**

```tsx
import Image from 'next/image';
import {
  MapPin,
  Building2,
  Home,
  CalendarDays,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTotalUnits } from '@/lib/project-utils';
import type { Project, ScoredProject } from '@/types/noxh';

type Props = {
  project: Project | ScoredProject;
  onClick: () => void;
};

function isScoredProject(p: Project | ScoredProject): p is ScoredProject {
  return 'totalScore' in p;
}

function ScoreBadge({ score, eligible }: { score: number; eligible: boolean }) {
  const color = !eligible
    ? 'bg-destructive text-destructive-foreground'
    : score >= 70
      ? 'bg-green-600 text-white'
      : score >= 40
        ? 'bg-amber-500 text-white'
        : 'bg-red-500 text-white';

  return (
    <div
      className={cn(
        'absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-[2px_2px_0_rgba(0,0,0,0.3)]',
        color
      )}
    >
      {score}
    </div>
  );
}

export function ProjectCard({ project, onClick }: Readonly<Props>) {
  const totalUnits = parseTotalUnits(project.scale);
  const scored = isScoredProject(project) ? project : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-border flex w-full overflow-hidden rounded-2xl border-2 text-left transition-all',
        'shadow-[3px_3px_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--border)]',
        scored && !scored.scoreBreakdown.eligible && 'opacity-60'
      )}
    >
      <div className="bg-muted relative aspect-square w-40 shrink-0">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="160px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🏠
          </div>
        )}

        {scored && (
          <ScoreBadge
            score={scored.totalScore}
            eligible={scored.scoreBreakdown.eligible}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <h3 className="text-foreground line-clamp-1 text-base leading-tight font-extrabold">
              {project.title}
            </h3>
            {scored && !scored.scoreBreakdown.eligible && (
              <span className="shrink-0 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-black text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Không đủ điều kiện
              </span>
            )}
          </div>
          {project.address && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.address}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-1">
          {scored?.distanceKm !== null && scored?.distanceKm !== undefined && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Navigation className="h-3 w-3 shrink-0" />
              {scored.distanceKm}km từ nơi làm việc
            </span>
          )}

          {totalUnits !== null && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Home className="h-3 w-3 shrink-0" />
              {totalUnits.toLocaleString('vi-VN')} căn
            </span>
          )}

          {project.owner && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.owner}</span>
            </span>
          )}

          {project.applyTime && project.applyTime !== '--' && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.applyTime}</span>
            </span>
          )}
        </div>

        <div className="mt-1.5 flex justify-end gap-2">
          {project.status && (
            <span className="border-muted-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold">
              {project.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Chạy TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Không có lỗi

- [ ] **Step 3: Commit**

```bash
git add components/project-card.tsx
git commit -m "feat(ui): add score badge, distance, eligible tag to ProjectCard"
```

---

## Task 10: Mở rộng `components/project-detail-modal.tsx`

**Files:**

- Modify: `components/project-detail-modal.tsx`

- [ ] **Step 1: Cập nhật `project-detail-modal.tsx`**

Thay thế phần import type và type `Props`, thêm helper và ScoreSection:

```tsx
'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Project, ScoredProject } from '@/types/noxh';

type Props = {
  project: Project | ScoredProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type InfoRowProps = {
  label: string;
  value: string | null;
  className?: string;
};

function isScoredProject(p: Project | ScoredProject): p is ScoredProject {
  return 'totalScore' in p;
}

function InfoRow({ label, value, className }: Readonly<InfoRowProps>) {
  if (!value || value === '--') return null;
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
        {label}
      </span>
      <span className="text-foreground text-sm font-semibold whitespace-pre-line">
        {value}
      </span>
    </div>
  );
}

type ScoreBarProps = { label: string; score: number | null };

function ScoreBar({ label, score }: ScoreBarProps) {
  if (score === null) return null;
  const color =
    score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/100</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
}: Readonly<Props>) {
  const scored = project && isScoredProject(project) ? project : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        {project && (
          <>
            <div className="bg-muted relative aspect-video w-full shrink-0">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🏠
                </div>
              )}
            </div>

            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl leading-tight font-extrabold">
                  {project.title}
                </DialogTitle>
                {project.status && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="border-muted-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold">
                      {project.status}
                    </span>
                  </div>
                )}
              </DialogHeader>

              {/* Score breakdown section */}
              {scored && (
                <div className="border-border mb-6 space-y-3 rounded-[10px] border-2 p-4">
                  <p className="text-primary text-xs font-extrabold tracking-widest uppercase">
                    Điểm phù hợp với bạn — {scored.totalScore}/100
                  </p>
                  {!scored.scoreBreakdown.eligible && (
                    <p className="text-xs font-semibold text-red-500">
                      ⚠️ Bạn có thể không đủ điều kiện cho dự án này
                    </p>
                  )}
                  <ScoreBar
                    label="Tài chính"
                    score={scored.scoreBreakdown.finance}
                  />
                  <ScoreBar
                    label="Vị trí"
                    score={scored.scoreBreakdown.location}
                  />
                  <ScoreBar
                    label="Urgency"
                    score={scored.scoreBreakdown.urgency}
                  />
                  <ScoreBar
                    label="Uy tín CĐT"
                    score={scored.scoreBreakdown.investorReputation}
                  />
                  {scored.distanceKm !== null && (
                    <p className="text-muted-foreground text-xs">
                      📍 Cách nơi làm việc {scored.distanceKm}km (đường chim
                      bay)
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow label="Giá bán" value={project.price} />
                <InfoRow label="Bàn giao" value={project.handover} />
                <InfoRow
                  label="Địa chỉ"
                  value={project.address}
                  className="sm:col-span-2"
                />
                <InfoRow
                  label="Nhà đầu tư"
                  value={project.owner}
                  className="sm:col-span-2"
                />
                <InfoRow
                  label="Thời gian thu hồ sơ"
                  value={project.applyTime}
                  className="sm:col-span-2"
                />
                <InfoRow
                  label="Quy mô"
                  value={project.scale}
                  className="sm:col-span-2"
                />
                <InfoRow label="Diện tích khu đất" value={project.area} />
                <InfoRow label="Mật độ xây dựng" value={project.density} />
                <InfoRow
                  label="Phí bảo trì"
                  value={project.maintenance}
                  className="sm:col-span-2"
                />
              </div>

              {project.url && (
                <div className="mt-6 flex justify-end">
                  <Button asChild>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      Xem bài viết
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/project-detail-modal.tsx
git commit -m "feat(ui): add score breakdown section to ProjectDetailModal"
```

---

## Task 11: Cập nhật `components/project-list.tsx`

**Files:**

- Modify: `components/project-list.tsx`

- [ ] **Step 1: Cập nhật type props**

Thay đổi import và type `Props` trong `project-list.tsx`:

Dòng 16, thay:

```ts
import type { Project } from '@/types/noxh';
```

thành:

```ts
import type { Project, ScoredProject } from '@/types/noxh';
```

Dòng 17, thay:

```ts
type Props = {
  projects: Project[];
```

thành:

```ts
type Props = {
  projects: (Project | ScoredProject)[];
```

Dòng 36, thay:

```ts
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
```

thành:

```ts
const [selectedProject, setSelectedProject] = useState<
  Project | ScoredProject | null
>(null);
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Không có lỗi

- [ ] **Step 3: Commit**

```bash
git add components/project-list.tsx
git commit -m "feat(ui): update ProjectList to accept ScoredProject union type"
```

---

## Task 12: Cập nhật `app/page.tsx`

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Thay thế nội dung `app/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useScoring } from '@/hooks/use-scoring';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';
import type { UserInfo, CriteriaWeights } from '@/types/noxh';

const PAGE_SIZE = 10;

export default function NOXHPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    scored,
    loading: scoringLoading,
    error: scoringError,
    score,
  } = useScoring(projects);

  const hasScored = scored.length > 0;
  const displayProjects = hasScored ? scored : projects;
  const totalCount = displayProjects.length;
  const pagedProjects = displayProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleFormSubmit(info: UserInfo, weights: CriteriaWeights) {
    setCurrentPage(1);
    await score(info, weights);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loading = projectsLoading || scoringLoading;
  const error = projectsError ?? scoringError;

  return (
    <main className="bg-background text-foreground min-h-screen">
      <header className="bg-background border-border sticky top-0 z-10 flex h-15 items-center justify-between border-b-2 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary border-border flex h-9 w-9 items-center justify-center rounded-[8px] border-2 text-lg shadow-[2px_2px_0_var(--border)]">
            🏠
          </div>
          <span className="text-foreground text-lg font-extrabold">
            Nhà Ở Xã Hội
          </span>
        </div>
        {totalCount > 0 && (
          <span className="border-primary bg-secondary text-secondary-foreground rounded-full border-[1.5px] px-3 py-1 text-xs font-bold">
            {totalCount} dự án{hasScored ? ' • đã xếp hạng' : ''}
          </span>
        )}
      </header>

      <div className="bg-background border-border border-b-2 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-foreground mb-2 text-4xl leading-tight font-black md:text-5xl">
            Danh sách <span className="text-primary">nhà ở xã hội</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            {hasScored
              ? 'Dự án đã được xếp hạng theo mức độ phù hợp với bạn.'
              : 'Nhập thông tin của bạn để tìm dự án phù hợp nhất.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
          <aside className="border-border bg-card border-b-2 p-6 md:sticky md:top-15 md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
            <p className="text-primary mb-5 text-xs font-extrabold tracking-widest uppercase">
              Thông tin của bạn
            </p>
            <UserForm onSubmit={handleFormSubmit} loading={scoringLoading} />
          </aside>

          <section className="min-w-0 p-6">
            <ProjectList
              projects={pagedProjects}
              totalCount={totalCount}
              currentPage={currentPage}
              loading={loading}
              error={error}
              onPageChange={handlePageChange}
              pageSize={PAGE_SIZE}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Chạy full test suite**

```bash
npx vitest run
```

Expected: Tất cả tests pass

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Không có lỗi

- [ ] **Step 4: Commit cuối**

```bash
git add app/page.tsx
git commit -m "feat(page): wire useScoring hook, show ranked projects after form submit"
```

---

## Kiểm tra tổng thể sau khi hoàn thành

- [ ] Thêm `GOOGLE_MAPS_API_KEY` vào `.env.local`
- [ ] Thêm `SUPABASE_SERVICE_KEY` vào `.env.local`
- [ ] Chạy DB migration trong Supabase Dashboard
- [ ] Chạy `npm run geocode-db` để điền lat/lng cho dự án
- [ ] Chạy `npm run dev` và test luồng đầy đủ:
  1. Nhập thu nhập, vốn tự có, địa chỉ nơi làm việc, đối tượng
  2. Nhấn "Tìm dự án phù hợp"
  3. Xác nhận danh sách hiển thị score badge và khoảng cách
  4. Click vào dự án, xác nhận modal có score breakdown
