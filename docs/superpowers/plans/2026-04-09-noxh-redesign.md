# NOXH Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign NOXH app từ indigo/white sang LearnHub style — warm cream background, dark 2px borders, offset shadows, xanh lá accent, Plus Jakarta Sans.

**Architecture:** Pure visual changes — 8 files, không đụng logic/hooks/types. Thứ tự: tokens → layout → components. Mỗi task build trên token đã định nghĩa ở task trước.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, shadcn/ui (CVA), TypeScript, `next/font/google`

---

## File Map

| File                          | Thay đổi                                                               |
| ----------------------------- | ---------------------------------------------------------------------- |
| `app/globals.css`             | Toàn bộ color tokens → green/cream palette, radius, remove brand scale |
| `app/layout.tsx`              | Font: `Be_Vietnam_Pro` + `Noto_Sans` → `Plus_Jakarta_Sans`             |
| `app/page.tsx`                | Thêm nav + hero section, body grid, remove form wrapper card           |
| `components/ui/badge.tsx`     | Variants: success/warning/destructive/secondary → bordered pills       |
| `components/ui/button.tsx`    | Default variant: add dark border + offset shadow                       |
| `components/project-card.tsx` | Dark borders, offset shadows, meta pill tags                           |
| `components/user-form.tsx`    | Radio → styled pills, input styling                                    |
| `components/project-list.tsx` | Chips header, skeleton, empty state                                    |

---

## Task 1: Design Tokens + Font

**Files:**

- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Cập nhật `app/globals.css`**

Thay toàn bộ nội dung file:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-success: var(--success);
  --color-warning: var(--warning);

  --font-heading: var(--font-heading);
  --font-sans: var(--font-sans);

  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

/* ─── Light Mode ─────────────────────────────────────── */
:root {
  --background: #faf6ee;
  --foreground: #1a1a1a;
  --card: #ffffff;
  --card-foreground: #1a1a1a;
  --popover: #ffffff;
  --popover-foreground: #1a1a1a;
  --primary: #16a34a;
  --primary-foreground: #ffffff;
  --secondary: #dcfce7;
  --secondary-foreground: #15803d;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #dcfce7;
  --accent-foreground: #15803d;
  --destructive: #dc2626;
  --border: #1a1a1a;
  --input: #faf6ee;
  --ring: #16a34a;
  --radius: 10px;

  --success: #16a34a;
  --warning: #eab308;
}

/* ─── Dark Mode (not active — no dark toggle in app) ─── */
.dark {
  --background: #0f0e1a;
  --foreground: #e0e7ff;
  --card: #1a1830;
  --card-foreground: #e0e7ff;
  --popover: #1a1830;
  --popover-foreground: #e0e7ff;
  --primary: #22c55e;
  --primary-foreground: #052e16;
  --secondary: #14532d;
  --secondary-foreground: #dcfce7;
  --muted: #1a1830;
  --muted-foreground: #818cf8;
  --accent: #14532d;
  --accent-foreground: #dcfce7;
  --destructive: #f87171;
  --border: #2d2b55;
  --input: #2d2b55;
  --ring: #16a34a;
  --success: #22c55e;
  --warning: #fcd34d;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

@utility scrollbar-hide {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 2: Cập nhật `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nhà Ở Xã Hội',
  description: 'Tra cứu thông tin nhà ở xã hội',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

> Lưu ý: `--font-heading` bỏ variable riêng — dùng chung `--font-sans` cho cả heading và body (Plus Jakarta Sans đủ dày để làm heading).

- [ ] **Step 3: Verify build sạch**

```bash
cd /Users/mac/Desktop/noxh && npm run build 2>&1 | tail -20
```

Expected: ✓ Compiled successfully (hoặc chỉ type errors từ các file chưa update — bình thường).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design): green/cream tokens + Plus Jakarta Sans font"
```

---

## Task 2: Page Layout — Nav + Hero + Grid

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Thay toàn bộ `app/page.tsx`**

```tsx
'use client';

import { useState, useRef } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useEligibility } from '@/hooks/use-eligibility';
import { UserForm } from '@/components/user-form';
import { ProjectList } from '@/components/project-list';
import type { UserInfo } from '@/types/noxh';

const LOCAL_STORAGE_KEY = 'noxh_user_info';

function readStoredUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as UserInfo) : null;
  } catch {
    return null;
  }
}

export default function NOXHPage() {
  const { projects, criteria, loading, error } = useProjects();
  const [submittedInfo, setSubmittedInfo] = useState<UserInfo | null>(null);
  const [initialValues] = useState<UserInfo | null>(readStoredUserInfo);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useEligibility(submittedInfo, projects, criteria);
  const hasChecked = submittedInfo !== null;

  const updatedAt =
    projects.length > 0
      ? projects.reduce(
          (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
          projects[0].updatedAt
        )
      : null;

  const openCount = projects.filter((p) => p.statusType === 'open').length;
  const provinceCount = new Set(projects.map((p) => p.province)).size;

  function handleSubmit(info: UserInfo) {
    setSubmittedInfo(info);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
    } catch {
      // ignore storage errors
    }
    if (window.innerWidth < 768) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* ── Nav ── */}
      <header className="bg-background sticky top-0 z-10 flex h-[60px] items-center justify-between border-b-2 border-[#1a1a1a] px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-[#1a1a1a] text-lg shadow-[2px_2px_0_#1a1a1a]">
            🏠
          </div>
          <span className="text-lg font-extrabold text-[#1a1a1a]">
            Nhà Ở Xã Hội
          </span>
        </div>
        {projects.length > 0 && (
          <span className="border-primary bg-secondary text-secondary-foreground rounded-full border-[1.5px] px-3 py-1 text-xs font-bold">
            {projects.length} dự án
          </span>
        )}
      </header>

      {/* ── Hero ── */}
      <div className="bg-background border-b-2 border-[#1a1a1a] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {updatedAt && (
            <div className="border-primary bg-secondary text-secondary-foreground mb-4 inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-1.5 text-xs font-bold">
              <span className="bg-primary h-2 w-2 rounded-full" />
              Dữ liệu cập nhật {new Date(updatedAt).toLocaleDateString('vi-VN')}
            </div>
          )}
          <h1 className="mb-2 text-4xl leading-tight font-black text-[#1a1a1a] md:text-5xl">
            Tra cứu điều kiện mua{' '}
            <span className="text-primary">nhà ở xã hội</span>
          </h1>
          <p className="text-muted-foreground mb-6 max-w-lg text-sm">
            Nhập thông tin của bạn — hệ thống tự động lọc các dự án đủ điều kiện
            tức thì.
          </p>
          {projects.length > 0 && (
            <div className="flex gap-8">
              <div>
                <div className="text-2xl font-black text-[#1a1a1a]">
                  {projects.length}
                </div>
                <div className="text-muted-foreground text-xs">Tổng dự án</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#1a1a1a]">
                  {openCount}
                </div>
                <div className="text-muted-foreground text-xs">
                  Đang mở hồ sơ
                </div>
              </div>
              {provinceCount > 0 && (
                <div>
                  <div className="text-2xl font-black text-[#1a1a1a]">
                    {provinceCount}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Tỉnh thành
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body: 2-col grid ── */}
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
          {/* Left: Form panel */}
          <aside className="border-b-2 border-[#1a1a1a] bg-white p-6 md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:border-r-2 md:border-b-0">
            <p className="text-primary mb-5 text-[11px] font-extrabold tracking-widest uppercase">
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
          </aside>

          {/* Right: Results */}
          <section ref={resultsRef} className="min-w-0 p-6">
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

- [ ] **Step 2: Verify dev server**

```bash
cd /Users/mac/Desktop/noxh && npm run dev
```

Mở http://localhost:3000 — kiểm tra: nav sticky ✓, hero hiện ✓, 2 cột trên desktop ✓, stack trên mobile ✓.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(design): add nav + hero, update 2-col grid layout"
```

---

## Task 3: Badge Variants

**Files:**

- Modify: `components/ui/badge.tsx`

- [ ] **Step 1: Cập nhật badge variants**

Thay `badgeVariants` cva:

```tsx
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-2 border-[#1a1a1a] bg-primary text-primary-foreground',
        secondary:
          'border-[1.5px] border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b]',
        destructive:
          'border-[1.5px] border-[#dc2626] bg-[#fee2e2] text-[#991b1b]',
        outline: 'border-[1.5px] border-border text-foreground',
        ghost: 'text-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        success: 'border-[1.5px] border-[#16a34a] bg-[#dcfce7] text-[#15803d]',
        warning: 'border-[1.5px] border-[#eab308] bg-[#fef9c3] text-[#854d0e]',
        info: 'border-[1.5px] border-[#0284c7] bg-[#e0f2fe] text-[#075985]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

- [ ] **Step 2: Verify — chạy dev và kiểm tra badges trên ProjectCard**

```bash
npm run dev
```

Nhập thông tin form, kiểm tra badge "Đủ điều kiện" (green), "Thu nhập vượt mức" (red), "Sắp mở" (yellow).

- [ ] **Step 3: Commit**

```bash
git add components/ui/badge.tsx
git commit -m "feat(design): badge variants → bordered pills (green/red/yellow)"
```

---

## Task 4: Button Default Variant

**Files:**

- Modify: `components/ui/button.tsx`

- [ ] **Step 1: Cập nhật default variant trong `buttonVariants`**

Chỉ thay dòng `default`:

```tsx
default:
  'border-2 border-[#1a1a1a] bg-primary text-primary-foreground shadow-[3px_3px_0_#1a1a1a] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#1a1a1a] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#1a1a1a] transition-all',
```

> `translate-x-px` = 1px offset. Giữ micro-interaction nhẹ nhàng cho button nhỏ; form submit button sẽ nổi bật hơn qua `w-full`.

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Kiểm tra nút "Kiểm tra điều kiện →" — xanh lá, dark border, shadow offset.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat(design): button default → green + neo-brutalism shadow"
```

---

## Task 5: ProjectCard

**Files:**

- Modify: `components/project-card.tsx`

- [ ] **Step 1: Thay toàn bộ `components/project-card.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type { ProjectResult, EligibilityStatus } from '@/types/noxh';

const STATUS_CONFIG: Record<
  'open' | 'upcoming' | 'pending',
  { label: string; className: string }
> = {
  open: {
    label: 'Đang nhận hồ sơ',
    className: 'border-[1.5px] border-[#16a34a] bg-[#dcfce7] text-[#15803d]',
  },
  upcoming: {
    label: 'Sắp mở',
    className: 'border-[1.5px] border-[#eab308] bg-[#fef9c3] text-[#854d0e]',
  },
  pending: {
    label: 'Chưa chốt lịch',
    className: 'border-[1.5px] border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b]',
  },
};

const ELIGIBILITY_BADGE: Record<
  EligibilityStatus,
  { className: string; label: string }
> = {
  eligible: {
    className: 'border-[1.5px] border-[#16a34a] bg-[#dcfce7] text-[#15803d]',
    label: 'Đủ điều kiện',
  },
  wrong_province: {
    className: 'border-[1.5px] border-[#eab308] bg-[#fef9c3] text-[#854d0e]',
    label: 'Không đúng tỉnh',
  },
  income_exceeded: {
    className: 'border-[1.5px] border-[#dc2626] bg-[#fee2e2] text-[#991b1b]',
    label: 'Thu nhập vượt mức',
  },
  wrong_category: {
    className: 'border-[1.5px] border-[#eab308] bg-[#fef9c3] text-[#854d0e]',
    label: 'Không đúng đối tượng',
  },
  housing_ineligible: {
    className: 'border-[1.5px] border-[#dc2626] bg-[#fee2e2] text-[#991b1b]',
    label: 'Không đủ ĐK nhà ở',
  },
  previously_bought: {
    className: 'border-[1.5px] border-[#dc2626] bg-[#fee2e2] text-[#991b1b]',
    label: 'Đã từng mua NOXH',
  },
  restricted: {
    className: 'border-[1.5px] border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b]',
    label: 'Dự án giới hạn đối tượng',
  },
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

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

type Props = { project: ProjectResult; rank?: number };

export function ProjectCard({ project, rank }: Props) {
  const eligibility = ELIGIBILITY_BADGE[project.eligibilityStatus];
  const statusCfg = STATUS_CONFIG[project.statusType];
  const isEligible = project.eligibilityStatus === 'eligible';
  const areaStr = formatArea(project.minArea, project.maxArea);

  return (
    <div
      className={cn(
        'rounded-[14px] border-2 bg-white p-4 transition-all',
        isEligible
          ? 'border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1a1a1a]'
          : 'border-[#d4d4d8] opacity-55 shadow-[2px_2px_0_#d4d4d8]'
      )}
    >
      {/* Top row: name + eligibility badge */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          {rank && rank <= 3 && (
            <span className="mt-px shrink-0 text-base leading-none">
              {RANK_MEDALS[rank - 1]}
            </span>
          )}
          <h3 className="text-sm leading-tight font-extrabold text-[#1a1a1a]">
            {project.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {project.tag && (
            <span className="rounded-full border-[1.5px] border-[#16a34a] bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
              {project.tag}
            </span>
          )}
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
              eligibility.className
            )}
          >
            {eligibility.label}
          </span>
        </div>
      </div>

      {/* Location */}
      <p className="text-muted-foreground mb-2 text-xs">
        {project.district} · {project.province}
      </p>

      {/* Meta tags */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {areaStr && (
          <span className="rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0.5 text-[11px] font-semibold text-[#52525b]">
            📐 {areaStr}
          </span>
        )}
        <span className="rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0.5 text-[11px] font-semibold text-[#52525b]">
          💰 {formatPrice(project.minPrice, project.maxPrice)}
        </span>
        <span className="rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0.5 text-[11px] font-semibold text-[#52525b]">
          🏠 {project.totalUnits} căn
        </span>
        {project.handover && project.handover !== 'Chưa công bố' && (
          <span className="rounded-md border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-0.5 text-[11px] font-semibold text-[#52525b]">
            📅 {project.handover}
          </span>
        )}
      </div>

      {/* Status */}
      <div
        className={cn(
          'inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold',
          statusCfg.className
        )}
      >
        {project.status}
      </div>

      {/* Ineligible reasons */}
      {!isEligible && project.ineligibleReasons.length > 0 && (
        <p className="text-muted-foreground mt-2 text-[11px]">
          Lý do: {project.ineligibleReasons.join(' · ')}
        </p>
      )}
    </div>
  );
}
```

> Lưu ý: bỏ import `Badge` và `Card` — dùng div + inline className trực tiếp để kiểm soát style tốt hơn.

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Kiểm tra: eligible cards có dark border + green shadow ✓, ineligible cards mờ + gray border ✓, hover lift effect ✓.

- [ ] **Step 3: Commit**

```bash
git add components/project-card.tsx
git commit -m "feat(design): project-card → dark borders, offset shadows, pill meta tags"
```

---

## Task 6: UserForm — Pill Radios + Input Styling

**Files:**

- Modify: `components/user-form.tsx`

- [ ] **Step 1: Thay toàn bộ `components/user-form.tsx`**

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
import { cn } from '@/lib/utils';
import type { UserInfo, Criteria } from '@/types/noxh';

type Props = {
  criteria: Criteria;
  initialValues: UserInfo | null;
  onSubmit: (info: UserInfo) => void;
};

const DEFAULT_FORM: UserInfo = {
  income: 0,
  maritalStatus: 'single',
  provinceId: '',
  category: '',
  housingStatus: 'no_house',
  previouslyBought: false,
};

const INPUT_CLASS =
  'w-full rounded-[10px] border-2 border-[#1a1a1a] bg-input px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1';

const SELECT_TRIGGER_CLASS =
  'w-full rounded-[10px] border-2 border-[#1a1a1a] bg-input px-3.5 py-2.5 text-sm font-medium text-foreground h-auto';

export function UserForm({ criteria, initialValues, onSubmit }: Props) {
  const [form, setForm] = useState<UserInfo>(initialValues ?? DEFAULT_FORM);

  const isValid =
    form.income > 0 && form.provinceId !== '' && form.category !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Hôn nhân — 2 options → side-by-side pills */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-[#1a1a1a]">
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
                  ? 'border-[#16a34a] bg-[#16a34a] text-white shadow-[2px_2px_0_#1a1a1a]'
                  : 'bg-input border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#f0f0ea]'
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

      {/* 2. Thu nhập */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-[#1a1a1a]" htmlFor="income">
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

      {/* 3. Tỉnh thành */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-[#1a1a1a]">
          Tỉnh / Thành phố muốn mua
        </Label>
        <Select
          value={form.provinceId}
          onValueChange={(v) => setForm((f) => ({ ...f, provinceId: v }))}
        >
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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

      {/* 4. Đối tượng */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-[#1a1a1a]">Đối tượng</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
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

      {/* 5. Tình trạng nhà ở — 3+ options → stacked pills */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-[#1a1a1a]">
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
          {criteria.housingConditions.map((c) => (
            <Label
              key={c.id}
              htmlFor={`housing-${c.id}`}
              className={cn(
                'flex w-full cursor-pointer items-center rounded-[10px] border-2 px-3.5 py-2.5 text-sm font-bold transition-all',
                form.housingStatus === c.id
                  ? 'border-[#16a34a] bg-[#16a34a] text-white shadow-[2px_2px_0_#1a1a1a]'
                  : 'bg-input border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#f0f0ea]'
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

      {/* 6. Đã từng mua NOXH */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="previously-bought"
          checked={form.previouslyBought}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, previouslyBought: Boolean(v) }))
          }
          className="border-2 border-[#1a1a1a]"
        />
        <Label
          htmlFor="previously-bought"
          className="cursor-pointer text-sm font-medium text-[#1a1a1a]"
        >
          Đã từng mua hoặc thuê nhà ở xã hội
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full text-sm font-extrabold"
        disabled={!isValid}
      >
        Kiểm tra điều kiện →
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Kiểm tra: radio pills side-by-side (hôn nhân) ✓, stacked pills (nhà ở) ✓, active pill xanh ✓, inputs cream bg dark border ✓.

- [ ] **Step 3: Commit**

```bash
git add components/user-form.tsx
git commit -m "feat(design): user-form → pill radios, dark-border inputs"
```

---

## Task 7: ProjectList — Header, Skeleton, Empty State

**Files:**

- Modify: `components/project-list.tsx`

- [ ] **Step 1: Thay toàn bộ `components/project-list.tsx`**

```tsx
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-[14px] border-2 border-[#1a1a1a] bg-white p-4 shadow-[3px_3px_0_#1a1a1a]"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="h-4 w-3/5 rounded-md bg-[#f4f4f5]" />
              <div className="h-5 w-20 rounded-full bg-[#f4f4f5]" />
            </div>
            <div className="mb-3 h-3 w-2/5 rounded bg-[#f4f4f5]" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-md bg-[#f4f4f5]" />
              <div className="h-6 w-20 rounded-md bg-[#f4f4f5]" />
              <div className="h-6 w-14 rounded-md bg-[#f4f4f5]" />
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

  if (!hasChecked) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[16px] border-2 border-[#16a34a] bg-[#dcfce7] text-3xl shadow-[3px_3px_0_#1a1a1a]">
          🏠
        </div>
        <div>
          <p className="mb-1 text-base font-extrabold text-[#1a1a1a]">
            Nhập thông tin để bắt đầu
          </p>
          <p className="text-muted-foreground text-sm">
            Điền form bên trái và nhấn &quot;Kiểm tra&quot; để xem dự án phù hợp
          </p>
          {updatedAt && (
            <p className="text-muted-foreground mt-2 text-xs">
              Dữ liệu cập nhật: {new Date(updatedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
      </div>
    );
  }

  const eligibleCount = results.filter(
    (r) => r.eligibilityStatus === 'eligible'
  ).length;
  const ineligibleCount = results.length - eligibleCount;

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[11px] font-extrabold tracking-widest uppercase">
          {results.length} dự án
        </p>
        <div className="flex gap-2">
          {eligibleCount > 0 && (
            <span className="rounded-full border-[1.5px] border-[#16a34a] bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#15803d]">
              {eligibleCount} đủ ĐK
            </span>
          )}
          {ineligibleCount > 0 && (
            <span className="rounded-full border-[1.5px] border-[#dc2626] bg-[#fee2e2] px-3 py-1 text-xs font-bold text-[#991b1b]">
              {ineligibleCount} không đủ
            </span>
          )}
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {(() => {
          let eligibleRank = 0;
          return results.map((project) => {
            const rank =
              project.eligibilityStatus === 'eligible' && eligibleRank < 3
                ? ++eligibleRank
                : undefined;
            return (
              <ProjectCard key={project.id} project={project} rank={rank} />
            );
          });
        })()}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify toàn bộ flow**

```bash
npm run dev
```

Kiểm tra đầy đủ:

1. Trang load — empty state icon xanh + bold text ✓
2. Nhập form — submit — kết quả hiện ✓
3. Eligible cards: dark border, green shadow, hover lift ✓
4. Header chips: green / red pill ✓
5. Loading skeleton: dark border cards ✓

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`. Nếu có type error, fix trước khi commit.

- [ ] **Step 4: Final commit**

```bash
git add components/project-list.tsx
git commit -m "feat(design): project-list → bordered skeleton, green empty state, pill chips"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec requirement                                         | Task   |
| -------------------------------------------------------- | ------ |
| `--background: #FAF6EE` warm cream                       | Task 1 |
| `--primary: #16A34A` green                               | Task 1 |
| `--border: #1A1A1A` dark                                 | Task 1 |
| `--radius: 10px`                                         | Task 1 |
| Plus Jakarta Sans font                                   | Task 1 |
| Nav sticky 60px, logo icon, badge                        | Task 2 |
| Hero: announce badge, h1 with green span, sub, stats     | Task 2 |
| Body 2-col grid `300px 1fr`                              | Task 2 |
| Form panel: white bg, border-right, sticky top-60px      | Task 2 |
| Remove form wrapper card                                 | Task 2 |
| Badge: success/warning/destructive/secondary bordered    | Task 3 |
| Button default: dark border + offset shadow              | Task 4 |
| Card: dark border, offset shadow, hover lift             | Task 5 |
| Card ineligible: muted border, opacity-55                | Task 5 |
| Meta tags as pill tags                                   | Task 5 |
| Radio → pill buttons (2-option side-by-side, 3+ stacked) | Task 6 |
| Input: cream bg, dark border, 10px radius                | Task 6 |
| ProjectList: skeleton dark border, empty state icon box  | Task 7 |
| ProjectList: header chips bordered pills                 | Task 7 |

### No Placeholders ✓

Tất cả steps đều có code thực. Không có TBD.

### Type Consistency ✓

- `EligibilityStatus` dùng đúng từ `@/types/noxh`
- `ProjectResult.statusType` dùng đúng trong `STATUS_CONFIG`
- `UserInfo` interfaces không thay đổi
- `Criteria` props không thay đổi
