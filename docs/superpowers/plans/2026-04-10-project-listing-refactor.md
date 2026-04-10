# Project Listing Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đơn giản hoá app từ eligibility checker sang danh sách dự án NOXH với phân trang DB (page_size=10).

**Architecture:** Drop và tạo lại bảng `projects` trong Supabase theo cấu trúc `data.json`. Xóa toàn bộ eligibility logic. Thêm DB-level pagination vào `useProjects`. Render `ProjectCard` dạng nằm ngang với ảnh cover. Dùng shadcn Pagination.

**Tech Stack:** Next.js 16, React 19, Supabase JS v2, Vitest + @testing-library/react, shadcn/ui, Tailwind CSS v4, TypeScript, lucide-react

---

## File Map

| Action | File                           | Trách nhiệm                                                                  |
| ------ | ------------------------------ | ---------------------------------------------------------------------------- |
| Create | `scripts/seed.ts`              | Đọc `data.json`, insert vào Supabase                                         |
| Modify | `types/noxh.ts`                | Project type mới, giữ UserInfo, xóa Criteria/EligibilityStatus/ProjectResult |
| Modify | `hooks/use-projects.ts`        | Nhận `page`, trả `{ projects, totalCount, loading, error }`                  |
| Modify | `hooks/use-projects.test.ts`   | Tests cho hook mới                                                           |
| Modify | `components/project-card.tsx`  | Layout nằm ngang với imageUrl, xóa eligibility UI                            |
| Modify | `components/project-list.tsx`  | Xóa eligibility counts, thêm Pagination                                      |
| Modify | `app/page.tsx`                 | Xóa eligibility state, thêm currentPage, UserForm → no-op                    |
| Create | `components/ui/pagination.tsx` | shadcn CLI                                                                   |
| Delete | `hooks/use-eligibility.ts`     | Không còn dùng                                                               |
| Delete | `lib/eligibility.ts`           | Không còn dùng                                                               |
| Delete | `lib/eligibility.test.ts`      | Test cho code đã xóa                                                         |

---

## Task 1: Tạo lại DB schema trong Supabase

**Files:** Không có file code — chạy SQL thủ công trong Supabase SQL Editor

- [ ] **Step 1: Mở Supabase SQL Editor**

  Truy cập Supabase dashboard → project `svcsrzwjnwddywlogldw` → SQL Editor

- [ ] **Step 2: Drop bảng cũ và tạo bảng mới**

  ```sql
  DROP TABLE IF EXISTS projects;

  CREATE TABLE projects (
    id         bigint generated always as identity primary key,
    title      text not null,
    address    text,
    capacity   text,
    status     text,
    owner      text,
    url        text,
    image_url  text,
    scraped_at timestamptz
  );
  ```

  Chạy → expected: "Success. No rows returned"

- [ ] **Step 3: Xác nhận bảng đã được tạo**

  ```sql
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_name = 'projects' ORDER BY ordinal_position;
  ```

  Expected: 9 rows (id, title, address, capacity, status, owner, url, image_url, scraped_at)

---

## Task 2: Thêm shadcn Pagination component

**Files:**

- Create: `components/ui/pagination.tsx`

- [ ] **Step 1: Chạy shadcn CLI**

  ```bash
  npx shadcn add pagination
  ```

  Expected: tạo file `components/ui/pagination.tsx`

- [ ] **Step 2: Xác nhận file tồn tại**

  ```bash
  ls components/ui/pagination.tsx
  ```

  Expected: file tồn tại, không có lỗi

- [ ] **Step 3: Commit**

  ```bash
  git add components/ui/pagination.tsx
  git commit -m "feat(ui): add shadcn Pagination component"
  ```

---

## Task 3: Cập nhật types/noxh.ts

**Files:**

- Modify: `types/noxh.ts`

- [ ] **Step 1: Thay toàn bộ nội dung file**

  ```typescript
  export type Project = {
    id: number;
    title: string;
    address: string | null;
    capacity: string | null;
    status: string | null;
    owner: string | null;
    url: string | null;
    imageUrl: string | null;
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

- [ ] **Step 2: Kiểm tra TypeScript không lỗi (chưa build được vì các file khác vẫn import type cũ — bước này chỉ confirm file đúng syntax)**

  ```bash
  npx tsc --noEmit --skipLibCheck 2>&1 | head -30
  ```

  Có thể có lỗi từ các file chưa update — đó là bình thường, tiếp tục các task tiếp theo.

- [ ] **Step 3: Commit**

  ```bash
  git add types/noxh.ts
  git commit -m "refactor(types): simplify Project type to match data.json schema"
  ```

---

## Task 4: Xóa các file eligibility

**Files:**

- Delete: `hooks/use-eligibility.ts`
- Delete: `lib/eligibility.ts`
- Delete: `lib/eligibility.test.ts`

- [ ] **Step 1: Xóa các file**

  ```bash
  rm hooks/use-eligibility.ts lib/eligibility.ts lib/eligibility.test.ts
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add -u hooks/use-eligibility.ts lib/eligibility.ts lib/eligibility.test.ts
  git commit -m "refactor: remove eligibility logic and tests"
  ```

---

## Task 5: Viết seed script

**Files:**

- Create: `scripts/seed.ts`

Script đọc `data.json` ở root → insert vào Supabase. Dùng `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` từ `.env.local`. Nếu Supabase RLS chặn insert, tắt RLS trên bảng `projects` trong Supabase dashboard (Table Editor → RLS → Disable) hoặc thêm policy cho anon insert.

- [ ] **Step 1: Tạo file `scripts/seed.ts`**

  ```typescript
  import { createClient } from '@supabase/supabase-js';
  import { readFileSync } from 'fs';
  import { resolve } from 'path';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  type RawProject = {
    title: string;
    address: string;
    capacity: string;
    status: string;
    owner: string;
    url: string;
    imageUrl: string;
    scrapedAt: string;
  };

  const raw = readFileSync(resolve(process.cwd(), 'data.json'), 'utf-8');
  const projects: RawProject[] = JSON.parse(raw);

  const rows = projects.map((p) => ({
    title: p.title,
    address: p.address ?? null,
    capacity: p.capacity ?? null,
    status: p.status ?? null,
    owner: p.owner ?? null,
    url: p.url ?? null,
    image_url: p.imageUrl ?? null,
    scraped_at: p.scrapedAt ?? null,
  }));

  const { error, count } = await supabase
    .from('projects')
    .insert(rows, { count: 'exact' });

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${count} projects successfully.`);
  ```

- [ ] **Step 2: Chạy seed script**

  ```bash
  npx tsx --env-file=.env.local scripts/seed.ts
  ```

  Expected: `Seeded N projects successfully.`

  Nếu lỗi permission (RLS): vào Supabase → Table Editor → `projects` → Authentication → Disable RLS, rồi chạy lại.

- [ ] **Step 3: Xác nhận dữ liệu trong Supabase**

  Chạy trong SQL Editor:

  ```sql
  SELECT COUNT(*) FROM projects;
  SELECT title, status FROM projects LIMIT 5;
  ```

  Expected: count > 0, title và status có giá trị tiếng Việt đúng.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/seed.ts
  git commit -m "feat(scripts): add seed script to import data.json into Supabase"
  ```

---

## Task 6: Viết test mới cho useProjects, sau đó viết lại hook

**Files:**

- Modify: `hooks/use-projects.test.ts`
- Modify: `hooks/use-projects.ts`

### Bước A — Viết test trước

- [ ] **Step 1: Thay toàn bộ `hooks/use-projects.test.ts`**

  ```typescript
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
      address: 'Tân Lập, Ô Diên, Hà Nội',
      capacity: '459 căn',
      status: 'Đang thi công',
      owner: 'Cienco 5',
      url: 'https://example.com',
      imageUrl: 'https://example.com/img.jpg',
      scrapedAt: '2026-04-10T10:15:24.165Z',
    },
  ];

  // Raw DB response dùng snake_case
  const mockDbRows = mockProjects.map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    capacity: p.capacity,
    status: p.status,
    owner: p.owner,
    url: p.url,
    image_url: p.imageUrl,
    scraped_at: p.scrapedAt,
  }));

  function mockSupabase(
    data: typeof mockDbRows | null,
    error: Error | null,
    count: number | null
  ) {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data, error, count }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);
  }

  beforeEach(() => {
    mockSupabase(mockDbRows, null, 1);
  });

  describe('useProjects', () => {
    it('starts with loading state', () => {
      const { result } = renderHook(() => useProjects(1));
      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });

    it('loads projects and maps snake_case to camelCase', async () => {
      const { result } = renderHook(() => useProjects(1));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe('Tân Lập Garden');
      expect(result.current.projects[0].imageUrl).toBe(
        'https://example.com/img.jpg'
      );
      expect(result.current.projects[0].scrapedAt).toBe(
        '2026-04-10T10:15:24.165Z'
      );
      expect(result.current.totalCount).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('calls range with correct offsets for page 1', async () => {
      const { result } = renderHook(() => useProjects(1));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const rangeMock = vi.mocked(
        supabase.from('projects').select('*', { count: 'exact' }).order('id')
      ).range;
      // page 1 → range(0, 9)
      expect(rangeMock).toHaveBeenCalledWith(0, 9);
    });

    it('calls range with correct offsets for page 2', async () => {
      mockSupabase(mockDbRows, null, 15);
      const { result } = renderHook(() => useProjects(2));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const rangeMock = vi.mocked(
        supabase.from('projects').select('*', { count: 'exact' }).order('id')
      ).range;
      // page 2 → range(10, 19)
      expect(rangeMock).toHaveBeenCalledWith(10, 19);
    });

    it('sets error when Supabase returns error', async () => {
      mockSupabase(null, new Error('DB error'), null);
      const { result } = renderHook(() => useProjects(1));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe(
        'Không thể tải dữ liệu dự án. Vui lòng thử lại.'
      );
      expect(result.current.projects).toEqual([]);
    });
  });
  ```

- [ ] **Step 2: Chạy test — expect FAIL**

  ```bash
  npx vitest run hooks/use-projects.test.ts
  ```

  Expected: FAIL vì hook chưa có signature mới.

### Bước B — Viết lại hook

- [ ] **Step 3: Thay toàn bộ `hooks/use-projects.ts`**

  ```typescript
  'use client';

  import { useState, useEffect } from 'react';
  import { supabase } from '@/lib/supabase';
  import type { Project } from '@/types/noxh';

  const PAGE_SIZE = 10;

  type UseProjectsResult = {
    projects: Project[];
    totalCount: number;
    loading: boolean;
    error: string | null;
  };

  type DbRow = {
    id: number;
    title: string;
    address: string | null;
    capacity: string | null;
    status: string | null;
    owner: string | null;
    url: string | null;
    image_url: string | null;
    scraped_at: string | null;
  };

  function toProject(row: DbRow): Project {
    return {
      id: row.id,
      title: row.title,
      address: row.address,
      capacity: row.capacity,
      status: row.status,
      owner: row.owner,
      url: row.url,
      imageUrl: row.image_url,
      scrapedAt: row.scraped_at,
    };
  }

  export function useProjects(page: number): UseProjectsResult {
    const [projects, setProjects] = useState<Project[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);

        const from = (page - 1) * PAGE_SIZE;
        const to = page * PAGE_SIZE - 1;

        const {
          data,
          error: dbError,
          count,
        } = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .order('id')
          .range(from, to);

        if (cancelled) return;

        if (dbError) {
          setError('Không thể tải dữ liệu dự án. Vui lòng thử lại.');
          setProjects([]);
          setTotalCount(0);
        } else {
          setProjects((data as DbRow[]).map(toProject));
          setTotalCount(count ?? 0);
        }

        setLoading(false);
      }

      load();
      return () => {
        cancelled = true;
      };
    }, [page]);

    return { projects, totalCount, loading, error };
  }
  ```

- [ ] **Step 4: Chạy test — expect PASS**

  ```bash
  npx vitest run hooks/use-projects.test.ts
  ```

  Expected: tất cả tests PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add hooks/use-projects.ts hooks/use-projects.test.ts
  git commit -m "feat(use-projects): add pagination support and map DB snake_case to camelCase"
  ```

---

## Task 7: Viết lại ProjectCard

**Files:**

- Modify: `components/project-card.tsx`

Layout nằm ngang: ảnh trái (120×90px) — nội dung phải. Cả card là link. Style dùng neobrutalism của hệ thống.

- [ ] **Step 1: Thay toàn bộ `components/project-card.tsx`**

  ```tsx
  import Image from 'next/image';
  import { MapPin, Building2, Home } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import type { Project } from '@/types/noxh';

  type Props = { project: Project };

  export function ProjectCard({ project }: Props) {
    return (
      <a
        href={project.url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'bg-card border-border flex overflow-hidden rounded-[14px] border-2 transition-all',
          'shadow-[3px_3px_0_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--border)]'
        )}
      >
        {/* Ảnh bên trái */}
        <div className="bg-muted relative h-[90px] w-[120px] shrink-0">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="120px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              🏠
            </div>
          )}
        </div>

        {/* Nội dung bên phải */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <h3 className="text-foreground mb-0.5 line-clamp-1 text-sm leading-tight font-extrabold">
              {project.title}
            </h3>
            {project.address && (
              <p className="text-muted-foreground flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{project.address}</span>
              </p>
            )}
          </div>

          <div className="mt-1.5 flex items-end justify-between gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {project.capacity && (
                <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                  <Home className="h-3 w-3" />
                  {project.capacity}
                </span>
              )}
              {project.owner && (
                <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                  <Building2 className="h-3 w-3" />
                  <span className="line-clamp-1 max-w-[160px]">
                    {project.owner}
                  </span>
                </span>
              )}
            </div>

            {project.status && (
              <span className="border-muted-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold">
                {project.status}
              </span>
            )}
          </div>
        </div>
      </a>
    );
  }
  ```

- [ ] **Step 2: Kiểm tra không có lỗi TypeScript**

  ```bash
  npx tsc --noEmit --skipLibCheck 2>&1 | grep "project-card"
  ```

  Expected: không có output (không lỗi ở file này).

- [ ] **Step 3: Commit**

  ```bash
  git add components/project-card.tsx
  git commit -m "feat(project-card): rewrite with horizontal layout and imageUrl support"
  ```

---

## Task 8: Viết lại ProjectList

**Files:**

- Modify: `components/project-list.tsx`

Bỏ eligibility counts, thêm `<Pagination>` ở cuối.

- [ ] **Step 1: Thay toàn bộ `components/project-list.tsx`**

  ```tsx
  import { ProjectCard } from '@/components/project-card';
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

  const PAGE_SIZE = 10;

  type Props = {
    projects: Project[];
    totalCount: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
    onPageChange: (page: number) => void;
  };

  export function ProjectList({
    projects,
    totalCount,
    currentPage,
    loading,
    error,
    onPageChange,
  }: Props) {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border bg-card flex animate-pulse overflow-hidden rounded-[14px] border-2 shadow-[3px_3px_0_var(--border)]"
            >
              <div className="bg-muted h-[90px] w-[120px] shrink-0" />
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

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-[11px] font-extrabold tracking-widest uppercase">
          {totalCount} dự án
        </p>

        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
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
                  // Hiển thị: trang đầu, trang cuối, trang hiện tại và ±1
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
    );
  }
  ```

- [ ] **Step 2: Kiểm tra không có lỗi TypeScript**

  ```bash
  npx tsc --noEmit --skipLibCheck 2>&1 | grep "project-list"
  ```

  Expected: không có output.

- [ ] **Step 3: Commit**

  ```bash
  git add components/project-list.tsx
  git commit -m "feat(project-list): remove eligibility UI, add shadcn Pagination"
  ```

---

## Task 9: Cập nhật page.tsx

**Files:**

- Modify: `app/page.tsx`

Xóa eligibility state, thêm `currentPage`, truyền props mới vào `ProjectList`. `UserForm.onSubmit` → no-op tạm thời.

- [ ] **Step 1: Thay toàn bộ `app/page.tsx`**

  ```tsx
  'use client';

  import { useState } from 'react';
  import { useProjects } from '@/hooks/use-projects';
  import { UserForm } from '@/components/user-form';
  import { ProjectList } from '@/components/project-list';

  export default function NOXHPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const { projects, totalCount, loading, error } = useProjects(currentPage);

    function handlePageChange(page: number) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
      <main className="bg-background text-foreground min-h-screen">
        <header className="bg-background border-border sticky top-0 z-10 flex h-[60px] items-center justify-between border-b-2 px-6">
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
            <aside className="border-border bg-card border-b-2 p-6 md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
              <p className="text-primary mb-5 text-[11px] font-extrabold tracking-widest uppercase">
                Thông tin của bạn
              </p>
              <UserForm onSubmit={() => {}} />
            </aside>

            <section className="min-w-0 p-6">
              <ProjectList
                projects={projects}
                totalCount={totalCount}
                currentPage={currentPage}
                loading={loading}
                error={error}
                onPageChange={handlePageChange}
              />
            </section>
          </div>
        </div>
      </main>
    );
  }
  ```

- [ ] **Step 2: Cập nhật UserForm props**

  `UserForm` hiện nhận `criteria` và `initialValues` — cần bỏ vì chưa dùng. Mở `components/user-form.tsx`, đổi props thành chỉ nhận `onSubmit`:

  Tìm đoạn:

  ```tsx
  type Props = {
    criteria: Criteria;
    initialValues: UserInfo | null;
    onSubmit: (info: UserInfo) => void;
  };
  ```

  Thay thành:

  ```tsx
  type Props = {
    onSubmit: (info: UserInfo) => void;
  };
  ```

  Và xóa dòng `import type { UserInfo, Criteria } from '@/types/noxh';` → thay bằng `import type { UserInfo } from '@/types/noxh';`

  Xóa tham số `criteria` và `initialValues` khỏi function signature:

  ```tsx
  export function UserForm({ onSubmit }: Props) {
  ```

  Xóa dòng:

  ```tsx
  const [initialValues] = useState<UserInfo | null>(readStoredUserInfo);
  ```

  Đổi:

  ```tsx
  const [form, setForm] = useState<UserInfo>(initialValues ?? DEFAULT_FORM);
  ```

  thành:

  ```tsx
  const [form, setForm] = useState<UserInfo>(DEFAULT_FORM);
  ```

  Xóa các chỗ dùng `criteria.provinces`, `criteria.eligibleCategories`, `criteria.housingConditions` — thay bằng hardcode hoặc để trống tạm. Dùng array rỗng:

  ```tsx
  {
    ([] as { id: string; label: string }[]).map((p) => (
      <SelectItem key={p.id} value={p.id}>
        {p.label}
      </SelectItem>
    ));
  }
  ```

  > **Lưu ý:** `UserForm` sẽ hiển thị form trống (dropdown không có options) — đây là tạm thời, sẽ được kết nối lại khi phát triển tiếp.

- [ ] **Step 3: Xóa import không dùng trong page.tsx**

  Đảm bảo `app/page.tsx` không import `useEligibility`, `UserInfo`, `Criteria`, hay bất kỳ type/hook đã xóa.

- [ ] **Step 4: Kiểm tra TypeScript**

  ```bash
  npx tsc --noEmit --skipLibCheck 2>&1
  ```

  Expected: không có lỗi.

- [ ] **Step 5: Chạy toàn bộ tests**

  ```bash
  npx vitest run
  ```

  Expected: tất cả PASS (chỉ còn `hooks/use-projects.test.ts`).

- [ ] **Step 6: Chạy dev server và kiểm tra thủ công**

  ```bash
  npm run dev
  ```

  Mở `http://localhost:3000`:
  - Header hiển thị số dự án
  - Danh sách 10 project-card hiển thị đúng
  - Mỗi card có ảnh bên trái, title, địa chỉ, capacity, owner, status badge
  - Pagination hiển thị ở cuối (nếu có > 10 dự án)
  - Click trang khác → danh sách cập nhật

- [ ] **Step 7: Commit**

  ```bash
  git add app/page.tsx components/user-form.tsx
  git commit -m "feat(page): remove eligibility state, wire pagination into ProjectList"
  ```

---

## Task 10: Dọn dẹp public/data

**Files:**

- Delete (nếu không còn dùng): `public/data/criteria.json`
- Giữ lại: `public/data/projects.json` nếu còn referenced (kiểm tra trước)

- [ ] **Step 1: Kiểm tra file criteria.json còn được import ở đâu không**

  ```bash
  grep -r "criteria.json" --include="*.ts" --include="*.tsx" .
  ```

  Expected: không có kết quả (đã xóa fetch criteria trong useProjects).

- [ ] **Step 2: Xóa criteria.json**

  ```bash
  rm public/data/criteria.json
  ```

- [ ] **Step 3: Kiểm tra projects.json có được dùng không**

  ```bash
  grep -r "projects.json" --include="*.ts" --include="*.tsx" .
  ```

  Nếu không có kết quả → xóa:

  ```bash
  rm public/data/projects.json
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add -u public/data/
  git commit -m "chore: remove unused static data files"
  ```

---

## Checklist tự review

- [x] **Spec coverage:**
  - ✅ Bỏ tính toán eligibility → Tasks 4, 8, 9
  - ✅ Đổi DB schema theo data.json → Task 1
  - ✅ Seed data.json → Task 5
  - ✅ Phân trang DB page_size=10 → Task 6
  - ✅ shadcn Pagination component → Task 2, Task 8

- [x] **Types nhất quán:**
  - `Project` định nghĩa Task 3, dùng Task 6, 7, 8 — nhất quán
  - `useProjects(page)` → `{ projects, totalCount, loading, error }` — dùng đúng ở Task 8

- [x] **Không có placeholder:** Tất cả code blocks đầy đủ
