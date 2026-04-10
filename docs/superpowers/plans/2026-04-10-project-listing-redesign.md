# Project Listing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cập nhật schema dữ liệu, chuyển sang FE pagination, thêm modal chi tiết dự án, và đồng bộ pagination style với design system.

**Architecture:** `useProjects` fetch toàn bộ từ Supabase 1 lần, `page.tsx` slice theo trang. `ProjectList` giữ `selectedProject` state để mở `ProjectDetailModal`. `ProjectCard` là `<button>` gọi `onClick` thay vì `<a>` navigate.

**Tech Stack:** Next.js, React, Supabase, Tailwind CSS, Radix UI (Dialog), Vitest, @testing-library/react

---

## File Map

| File                                  | Action | Trách nhiệm                                                   |
| ------------------------------------- | ------ | ------------------------------------------------------------- |
| `types/noxh.ts`                       | Modify | Xoá type cũ, định nghĩa `Project` mới theo schema data.json   |
| `lib/project-utils.ts`                | Create | Helper `parseTotalUnits` — parse tổng số căn từ field `scale` |
| `lib/project-utils.test.ts`           | Create | Tests cho `parseTotalUnits`                                   |
| `hooks/use-projects.ts`               | Modify | Bỏ `page` param, fetch toàn bộ, bỏ `totalCount`               |
| `hooks/use-projects.test.ts`          | Modify | Cập nhật tests theo hook mới và type mới                      |
| `components/ui/pagination.tsx`        | Modify | Style neobrutalist (border-2, shadow offset, bold)            |
| `components/project-card.tsx`         | Modify | Thay `<a>` → `<button>`, hiển thị 7 fields theo yêu cầu       |
| `components/project-detail-modal.tsx` | Create | Modal chi tiết dự án dùng Dialog                              |
| `components/project-list.tsx`         | Modify | Thêm `selectedProject` state, render modal                    |
| `app/page.tsx`                        | Modify | Chuyển FE pagination logic lên đây, bỏ `page` từ hook         |

---

## Task 1: Update Project type

**Files:**

- Modify: `types/noxh.ts`

- [ ] **Step 1: Thay thế `Project` type**

Mở `types/noxh.ts`, giữ nguyên `UserInfo`, thay toàn bộ `Project` type:

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
};

export type UserInfo = {
  income: number;
  maritalStatus: 'single' | 'married';
  provinceId: string;
  category: string;
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};
```

- [ ] **Step 2: Commit**

```bash
git add types/noxh.ts
git commit -m "refactor: update Project type to new schema"
```

---

## Task 2: parseTotalUnits utility (TDD)

**Files:**

- Create: `lib/project-utils.ts`
- Create: `lib/project-utils.test.ts`

- [ ] **Step 1: Viết failing tests**

Tạo file `lib/project-utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseTotalUnits } from '@/lib/project-utils';

describe('parseTotalUnits', () => {
  it('sums all units (residential + commercial) across multiple towers', () => {
    expect(
      parseTotalUnits(
        'CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại'
      )
    ).toBe(459);
  });

  it('handles single tower with commercial units', () => {
    expect(parseTotalUnits('Tòa CT - 489 căn - 123 căn thương mại')).toBe(612);
  });

  it('returns null for null input', () => {
    expect(parseTotalUnits(null)).toBeNull();
  });

  it('returns null for "--" placeholder', () => {
    expect(parseTotalUnits('--')).toBeNull();
  });

  it('handles scale with no commercial units', () => {
    expect(
      parseTotalUnits('9 Toà (CT1 đến CT9) - 3103 căn - 0 căn thương mại')
    ).toBe(3103);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

```bash
npx vitest run lib/project-utils.test.ts
```

Expected: FAIL với `Cannot find module '@/lib/project-utils'`

- [ ] **Step 3: Implement `parseTotalUnits`**

Tạo file `lib/project-utils.ts`:

```ts
/**
 * Parse tổng số căn (bao gồm cả căn thương mại) từ field `scale`.
 * Ví dụ: "CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại" → 459
 */
export function parseTotalUnits(scale: string | null): number | null {
  const matches = scale?.match(/(\d+)\s+căn/g) ?? [];
  const total = matches.reduce((sum, m) => sum + parseInt(m), 0);
  return total > 0 ? total : null;
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

```bash
npx vitest run lib/project-utils.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/project-utils.ts lib/project-utils.test.ts
git commit -m "feat: add parseTotalUnits helper"
```

---

## Task 3: Refactor useProjects hook (TDD)

**Files:**

- Modify: `hooks/use-projects.ts`
- Modify: `hooks/use-projects.test.ts`

- [ ] **Step 1: Viết failing tests trước**

Thay toàn bộ nội dung `hooks/use-projects.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/hooks/use-projects';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/noxh';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockProjects: Project[] = [
  {
    id: 1,
    title: 'Tân Lập Garden',
    status: 'Đang thi công',
    price: '20 triệu/m²',
    handover: 'Quý IV/2027',
    address: 'Tân Lập, Ô Diên, Hà Nội',
    owner: 'Cienco 5',
    applyTime: 'Đợt 1: 30/04/2026 - 15/05/2026',
    scale:
      'CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại',
    area: '4.909 m²',
    density: '40%',
    maintenance: '400.000 vnđ/m²',
    imageUrl: 'https://example.com/img.jpg',
    url: 'https://example.com',
    scrapedAt: '2026-04-10T10:15:24.165Z',
  },
];

const mockDbRows = [
  {
    id: 1,
    title: 'Tân Lập Garden',
    status: 'Đang thi công',
    price: '20 triệu/m²',
    handover: 'Quý IV/2027',
    address: 'Tân Lập, Ô Diên, Hà Nội',
    owner: 'Cienco 5',
    apply_time: 'Đợt 1: 30/04/2026 - 15/05/2026',
    scale:
      'CT1 - 230 căn - 0 căn thương mại\nCT2 - 137 căn - 92 căn thương mại',
    area: '4.909 m²',
    density: '40%',
    maintenance: '400.000 vnđ/m²',
    image_url: 'https://example.com/img.jpg',
    url: 'https://example.com',
    scraped_at: '2026-04-10T10:15:24.165Z',
  },
];

function mockSupabase(data: typeof mockDbRows | null, error: Error | null) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data, error }),
    }),
  } as unknown as ReturnType<typeof supabase.from>);
}

beforeEach(() => {
  mockSupabase(mockDbRows, null);
});

describe('useProjects', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it('loads all projects and maps snake_case to camelCase', async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0]).toEqual(mockProjects[0]);
  });

  it('maps apply_time → applyTime and image_url → imageUrl', async () => {
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects[0].applyTime).toBe(
      'Đợt 1: 30/04/2026 - 15/05/2026'
    );
    expect(result.current.projects[0].imageUrl).toBe(
      'https://example.com/img.jpg'
    );
  });

  it('sets error message when Supabase returns error', async () => {
    mockSupabase(null, new Error('DB error'));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
    );
    expect(result.current.projects).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

```bash
npx vitest run hooks/use-projects.test.ts
```

Expected: FAIL — hook vẫn nhận `page` param, vẫn có `.range()`

- [ ] **Step 3: Refactor hook**

Thay toàn bộ nội dung `hooks/use-projects.ts`:

```ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/noxh';

type UseProjectsResult = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

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
  };
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('projects')
        .select('*')
        .order('id');

      if (cancelled) return;

      if (dbError) {
        setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
        setProjects([]);
      } else {
        setProjects((data as DbRow[]).map(toProject));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

```bash
npx vitest run hooks/use-projects.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/use-projects.ts hooks/use-projects.test.ts
git commit -m "refactor: fetch all projects at once, move pagination to FE"
```

---

## Task 4: Update pagination style

**Files:**

- Modify: `components/ui/pagination.tsx`

- [ ] **Step 1: Thay thế `PaginationLink`**

Trong `components/ui/pagination.tsx`, thay hàm `PaginationLink` (xoá import `buttonVariants`):

```tsx
function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        'border-border inline-flex items-center justify-center rounded-md border-2 text-sm font-bold transition-all',
        size === 'icon' ? 'size-9' : 'h-9 gap-1.5 px-3',
        isActive
          ? 'bg-primary text-primary-foreground shadow-[2px_2px_0_var(--border)]'
          : 'bg-card text-foreground hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--border)]',
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Thay thế `PaginationPrevious` và `PaginationNext`**

```tsx
function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('font-extrabold', className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:block">Trước</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('font-extrabold', className)}
      {...props}
    >
      <span className="hidden sm:block">Sau</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}
```

- [ ] **Step 3: Xoá import `buttonVariants`**

Xoá dòng import `buttonVariants` và `Button` khỏi đầu file vì không còn dùng nữa:

```tsx
// Xoá dòng này:
import { buttonVariants, type Button } from '@/components/ui/button';
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/pagination.tsx
git commit -m "feat: update pagination style to match design system"
```

---

## Task 5: Update ProjectCard

**Files:**

- Modify: `components/project-card.tsx`

- [ ] **Step 1: Thay toàn bộ nội dung `ProjectCard`**

```tsx
import Image from 'next/image';
import { MapPin, Building2, Home, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseTotalUnits } from '@/lib/project-utils';
import type { Project } from '@/types/noxh';

type Props = {
  project: Project;
  onClick: () => void;
};

export function ProjectCard({ project, onClick }: Readonly<Props>) {
  const totalUnits = parseTotalUnits(project.scale);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card border-border flex w-full overflow-hidden rounded-[14px] border-2 text-left transition-all',
        'shadow-[3px_3px_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--border)]'
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
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <h3 className="text-foreground mb-0.5 line-clamp-1 text-base leading-tight font-extrabold">
            {project.title}
          </h3>
          {project.address && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{project.address}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-y-1">
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

- [ ] **Step 2: Commit**

```bash
git add components/project-card.tsx
git commit -m "feat: update ProjectCard to show new fields and open modal on click"
```

---

## Task 6: Create ProjectDetailModal

**Files:**

- Create: `components/project-detail-modal.tsx`

- [ ] **Step 1: Tạo component**

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
import type { Project } from '@/types/noxh';

type Props = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type InfoRowProps = {
  label: string;
  value: string | null;
  className?: string;
};

function InfoRow({ label, value, className }: InfoRowProps) {
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

export function ProjectDetailModal({
  project,
  open,
  onOpenChange,
}: Readonly<Props>) {
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
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-xl leading-tight font-extrabold">
                    {project.title}
                  </DialogTitle>
                  {project.status && (
                    <span className="border-muted-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold">
                      {project.status}
                    </span>
                  )}
                </div>
              </DialogHeader>

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

- [ ] **Step 2: Commit**

```bash
git add components/project-detail-modal.tsx
git commit -m "feat: add ProjectDetailModal component"
```

---

## Task 7: Update ProjectList

**Files:**

- Modify: `components/project-list.tsx`

- [ ] **Step 1: Thay toàn bộ nội dung `ProjectList`**

```tsx
'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/project-card';
import { ProjectDetailModal } from '@/components/project-detail-modal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { Project } from '@/types/noxh';

type Props = {
  projects: Project[];
  totalCount: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  pageSize: number;
};

export function ProjectList({
  projects,
  totalCount,
  currentPage,
  loading,
  error,
  onPageChange,
  pageSize,
}: Readonly<Props>) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-card flex animate-pulse overflow-hidden rounded-[14px] border-2 shadow-[3px_3px_0_var(--border)]"
          >
            <div className="bg-muted aspect-square w-40 shrink-0" />
            <div className="flex-1 p-3">
              <div className="bg-muted mb-2 h-4 w-3/5 rounded-md" />
              <div className="bg-muted mb-3 h-3 w-2/5 rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-4 w-16 rounded-md" />
                <div className="bg-muted h-4 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex h-40 items-center justify-center text-sm font-semibold">
        {error}
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs font-extrabold tracking-widest uppercase">
          {totalCount} dự án
        </p>

        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  aria-disabled={currentPage <= 1}
                  className={
                    currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                  );
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push('ellipsis');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  aria-disabled={currentPage >= totalPages}
                  className={
                    currentPage >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <ProjectDetailModal
        project={selectedProject}
        open={selectedProject !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/project-list.tsx
git commit -m "feat: add project detail modal to ProjectList"
```

---

## Task 8: Update page.tsx (FE pagination)

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Chuyển pagination logic lên `page.tsx`**

Thay toàn bộ nội dung `app/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';

const PAGE_SIZE = 10;

export default function NOXHPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { projects, loading, error } = useProjects();

  const totalCount = projects.length;
  const pagedProjects = projects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
            {totalCount} dự án
          </span>
        )}
      </header>

      <div className="bg-background border-border border-b-2 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-foreground mb-2 text-4xl leading-tight font-black md:text-5xl">
            Danh sách <span className="text-primary">nhà ở xã hội</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            Tổng hợp các dự án nhà ở xã hội tại Hà Nội.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
          <aside className="border-border bg-card border-b-2 p-6 md:sticky md:top-15 md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
            <p className="text-primary mb-5 text-xs font-extrabold tracking-widest uppercase">
              Thông tin của bạn
            </p>
            <UserForm onSubmit={() => {}} />
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

- [ ] **Step 2: Chạy toàn bộ test suite**

```bash
npx vitest run
```

Expected: Tất cả tests PASS

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: move FE pagination to page.tsx, connect ProjectList with pageSize prop"
```
