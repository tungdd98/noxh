# Supabase Projects Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay thế `fetch('/data/projects.json')` trong `hooks/use-projects.ts` bằng Supabase JS client query.

**Architecture:** Browser-side Supabase client singleton trong `lib/supabase.ts`. Hook `useProjects` giữ nguyên interface, chỉ đổi data source cho projects. Criteria vẫn fetch từ `/data/criteria.json`.

**Tech Stack:** `@supabase/supabase-js`, Next.js 16, React 19, Vitest + Testing Library

---

## File Map

| File                         | Action                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `lib/supabase.ts`            | **Tạo mới** — browser client singleton                                                |
| `types/noxh.ts`              | **Sửa** — thêm field `slug: string` vào `Project` type                                |
| `hooks/use-projects.ts`      | **Sửa** — thay `fetch(projects.json)` bằng Supabase query                             |
| `hooks/use-projects.test.ts` | **Sửa** — mock `@/lib/supabase` thay vì `fetch` cho projects, thêm slug vào mock data |

---

## Task 1: Tạo bảng `projects` trong Supabase

**Files:** Không có file nào trong repo — chạy SQL trong Supabase Dashboard → SQL Editor.

- [ ] **Step 1: Chạy SQL migration**

Vào **Supabase Dashboard → SQL Editor**, paste và chạy toàn bộ đoạn SQL sau:

```sql
-- 1. Tạo bảng
create table if not exists projects (
  id                  int4        primary key,
  name                text        not null,
  investor            text        not null,
  district            text        not null,
  "provinceId"        text        not null,
  province            text        not null,
  price               float8,
  "minArea"           int4,
  "maxArea"           int4,
  "minPrice"          int4,
  "maxPrice"          int4,
  "totalUnits"        int4        not null,
  status              text        not null,
  "statusType"        text        not null,
  handover            text        not null,
  priority            text        not null,
  "targetCategories"  text[]      not null,
  "incomeLimit"       int4        not null,
  restricted          bool        not null,
  quality             text        not null,
  notes               text        not null,
  score               int4        not null,
  highlight           bool        not null,
  tag                 text,
  "updatedAt"         timestamptz not null,
  slug                text        not null unique
);

-- 2. Bật Row Level Security
alter table projects enable row level security;

-- 3. Cho phép anon đọc (public read-only)
create policy "public_read" on projects
  for select to anon using (true);

-- 4. Seed 6 dự án
insert into projects (
  id, name, investor, district, "provinceId", province,
  price, "minArea", "maxArea", "minPrice", "maxPrice", "totalUnits",
  status, "statusType", handover, priority, "targetCategories",
  "incomeLimit", restricted, quality, notes, score, highlight, tag, "updatedAt", slug
) values
  (
    1, 'NOXH Tân Lập', 'Cty CP Đầu tư phát triển Ngôi sao Châu Á',
    'Xã Ô Diên, Hoài Đức', 'hanoi', 'Hà Nội',
    29, 45, 70, 1305, 2030, 459,
    '⚡ Nhận hồ sơ 1–15/5/2026', 'open', 'Q4/2027',
    'Người thu nhập thấp đô thị, công nhân viên',
    ARRAY['low_income', 'worker'],
    25000000, false,
    'Tòa 21 tầng, 2 tầng hầm, nhiều căn nhất trong nhóm',
    'CẦN NỘP HỒ SƠ NGAY — còn ~3 tuần. Nhiều căn nhất = cơ hội trúng thăm cao nhất.',
    93, true, 'KHẨN', '2026-04-09T08:00:00Z', 'noxh-tan-lap'
  ),
  (
    2, 'NOXH Ngọc Hồi', 'Coma7 (Cơ khí & Xây lắp số 7)',
    'Xã Ngọc Hồi, Thanh Trì', 'hanoi', 'Hà Nội',
    24.7, 40, 59, 988, 1450, 160,
    'Sắp mở — Q3/2026', 'upcoming', 'Chưa công bố',
    'Người thu nhập thấp đô thị, công nhân viên',
    ARRAY['low_income', 'worker'],
    25000000, false,
    'Được BXD đánh giá chất lượng thi công tốt, CĐT có kinh nghiệm',
    'Giá/căn tốt nhất — vốn 930tr gần đủ mua đứt căn 40m². Chuẩn bị hồ sơ trước Q3.',
    90, true, 'TOP GIÁ', '2026-04-09T08:00:00Z', 'noxh-ngoc-hoi'
  ),
  (
    3, 'NOXH Tây Nam Mễ Trì', 'Cty CP Xây dựng & PT Nhà DAC Hà Nội',
    'Phường Phú Đô, Nam Từ Liêm', 'hanoi', 'Hà Nội',
    24.5, 55, 70, 1350, 1715, 120,
    'Khởi công Q1/2026 — chưa nhận hồ sơ', 'pending', '2027–2028 (ước tính)',
    'Người thu nhập thấp đô thị, công nhân viên',
    ARRAY['low_income', 'worker'],
    25000000, false,
    'DAC HN là CĐT có kinh nghiệm tại Nam Từ Liêm',
    'VỊ TRÍ SỐ 1 — sát Mễ Trì 2km. Quỹ NOXH nhỏ (~120 căn), lịch thu hồ sơ chưa rõ.',
    78, false, 'VỊ TRÍ ĐỈNH', '2026-04-09T08:00:00Z', 'noxh-tay-nam-me-tri'
  ),
  (
    4, 'Handico CT2', 'Tổng Cty ĐTPT Nhà Hà Nội (Handico)',
    'Phường Lĩnh Nam, Hoàng Mai', 'hanoi', 'Hà Nội',
    null, null, null, null, null, 150,
    'Chưa công bố giá & lịch', 'pending', 'Q4/2026',
    'Người thu nhập thấp đô thị, công nhân viên',
    ARRAY['low_income', 'worker'],
    25000000, false,
    'Handico là CĐT nhà nước uy tín hàng đầu HN',
    'Hoàn thành Q4/2026 → có thể thu hồ sơ Q2/Q3. Cần theo dõi Sở XD HN.',
    68, false, null, '2026-04-09T08:00:00Z', 'handico-ct2'
  ),
  (
    5, 'NOXH Minh Đức', 'Cty CP Tập đoàn G6 + Minh Đức',
    'Xã Mê Linh, Hà Nội', 'hanoi', 'Hà Nội',
    null, 70, 77, null, null, 612,
    'Nhận hồ sơ 6/2026', 'upcoming', 'Chưa công bố',
    'Người thu nhập thấp đô thị, công nhân viên',
    ARRAY['low_income', 'worker'],
    25000000, false,
    'CĐT mới, chưa có thành tích bàn giao thực tế',
    'Xa trung tâm (~25km). Giá chưa công bố. Căn to (70–77m²) = giá tổng cao hơn.',
    52, false, null, '2026-04-09T08:00:00Z', 'noxh-minh-duc'
  ),
  (
    6, 'Bamboo Garden', 'CEO Group',
    'Xã Quốc Oai, Hà Nội', 'hanoi', 'Hà Nội',
    9.96, 49, 60, 484, 593, 432,
    'Đang mở (thuê mua → bán sau 5 năm)', 'open', 'Sắp bàn giao',
    'Người thu nhập thấp, lao động phổ thông',
    ARRAY['low_income', 'worker'],
    25000000, false,
    'CEO Group uy tín, đã có nhiều dự án bàn giao',
    'Giá siêu rẻ nhưng xa trung tâm (~35km). Plan B nếu WFH hoặc chuyển việc.',
    45, false, null, '2026-04-09T08:00:00Z', 'bamboo-garden'
  );
```

- [ ] **Step 2: Xác nhận trong Supabase Table Editor**

Vào **Table Editor → projects**, kiểm tra thấy đúng 6 rows. Nếu có lỗi ở Step 1, đọc error message và fix SQL trước khi tiếp tục.

---

## Task 2: Cài package + tạo `lib/supabase.ts`

**Files:**

- Modify: `package.json` (npm install)
- Create: `lib/supabase.ts`

- [ ] **Step 1: Cài `@supabase/supabase-js`**

```bash
npm install @supabase/supabase-js
```

Expected: package xuất hiện trong `dependencies` của `package.json`.

- [ ] **Step 2: Tạo `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase browser client"
```

---

## Task 2b: Thêm `slug` vào `Project` type

**Files:**

- Modify: `types/noxh.ts`

- [ ] **Step 1: Thêm field `slug` vào `Project` type**

Trong `types/noxh.ts`, thêm `slug: string;` sau field `tag`:

```ts
tag: string | null;
updatedAt: string;
slug: string;
```

- [ ] **Step 2: Commit**

```bash
git add types/noxh.ts
git commit -m "feat(types): add slug field to Project type"
```

---

## Task 3: Cập nhật tests cho Supabase

**Files:**

- Modify: `hooks/use-projects.test.ts`

- [ ] **Step 1: Chạy tests hiện tại để xác nhận chúng pass**

```bash
npm test
```

Expected: 3 tests pass.

- [ ] **Step 2: Viết lại `hooks/use-projects.test.ts`**

Thay toàn bộ nội dung file bằng:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/use-projects';
import { supabase } from '@/lib/supabase';
import type { Criteria, Project } from '@/types/noxh';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

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
    slug: 'test-project',
  },
];

beforeEach(() => {
  // Criteria vẫn fetch từ JSON file
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if ((url as string).includes('criteria.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCriteria),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    })
  );

  // Projects từ Supabase
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
    }),
  } as any);
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

  it('sets error when Supabase returns error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error'),
        }),
      }),
    } as any);
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });

  it('sets error when criteria fetch fails', async () => {
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

- [ ] **Step 3: Chạy tests — xác nhận FAIL vì `useProjects` chưa dùng Supabase**

```bash
npm test
```

Expected: tests fail (hook vẫn đang fetch `projects.json` chứ không dùng `supabase.from`).

- [ ] **Step 4: Commit test file**

```bash
git add hooks/use-projects.test.ts
git commit -m "test(use-projects): update tests to mock Supabase client"
```

---

## Task 4: Cập nhật `hooks/use-projects.ts`

**Files:**

- Modify: `hooks/use-projects.ts`

- [ ] **Step 1: Thay toàn bộ nội dung `hooks/use-projects.ts`**

```ts
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
```

- [ ] **Step 2: Chạy tests — xác nhận tất cả PASS**

```bash
npm test
```

Expected: 4 tests pass.

- [ ] **Step 3: Chạy lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-projects.ts
git commit -m "feat(use-projects): migrate projects data source to Supabase"
```

---

## Task 5: Kiểm tra end-to-end

**Files:** Không có thay đổi code.

- [ ] **Step 1: Chạy dev server**

```bash
npm run dev
```

- [ ] **Step 2: Mở trình duyệt tại `http://localhost:3000`**

Kiểm tra:

- Header hiển thị đúng số dự án (6)
- Stats "Đang mở hồ sơ" đúng (2 — NOXH Tân Lập + Bamboo Garden)
- Dữ liệu cập nhật hiển thị ngày 9/4/2026
- Không có lỗi trong browser console

- [ ] **Step 3: Tắt dev server**
