# Design System Implementation Plan — Nhà Ở Xã Hội

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng design system Indigo Modern cho app Nhà Ở Xã Hội gồm color tokens, Be Vietnam Pro + Noto Sans font, shadcn/ui components, và Design System Preview Page.

**Architecture:** 2 lớp — Design Tokens (`globals.css`) → UI Primitives (`components/ui/` via shadcn). Component không dùng màu hex cứng mà chỉ tham chiếu CSS variables. Dark mode qua `.dark` class override.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (new-york), Radix UI, CVA, tailwind-merge

---

## File Map

| File                            | Hành động       | Mục đích                                              |
| ------------------------------- | --------------- | ----------------------------------------------------- |
| `app/globals.css`               | Modify          | Replace toàn bộ tokens sang Indigo palette            |
| `app/layout.tsx`                | Modify          | Geist → Be Vietnam Pro + Noto Sans, title app mới     |
| `app/page.tsx`                  | Rewrite         | Design System Preview Page (6 sections + dark toggle) |
| `components/ui/input.tsx`       | Create (shadcn) | Form input primitive                                  |
| `components/ui/textarea.tsx`    | Create (shadcn) | Textarea primitive                                    |
| `components/ui/select.tsx`      | Create (shadcn) | Dropdown select primitive                             |
| `components/ui/badge.tsx`       | Create (shadcn) | Badge primitive + CVA variants                        |
| `components/ui/card.tsx`        | Create (shadcn) | Card primitive                                        |
| `components/ui/checkbox.tsx`    | Create (shadcn) | Checkbox primitive                                    |
| `components/ui/radio-group.tsx` | Create (shadcn) | Radio group primitive                                 |
| `components/ui/sonner.tsx`      | Create (shadcn) | Toast via Sonner                                      |
| `components/finance/`           | Delete          | Xóa toàn bộ finance components và tests               |

---

## Task 0: Xóa Finance Components

**Files:**

- Delete: `components/finance/` (toàn bộ thư mục)

- [ ] **Bước 1: Xóa thư mục finance**

```bash
rm -rf components/finance/
```

- [ ] **Bước 2: Verify đã xóa**

```bash
ls components/
```

Expected: không còn thư mục `finance/`

- [ ] **Bước 3: Commit**

```bash
git add -A
git commit -m "chore(design-system): remove finance components"
```

---

## Task 1: Replace Design Tokens trong globals.css

**Files:**

- Modify: `app/globals.css`

- [ ] **Bước 1: Ghi đè toàn bộ globals.css**

```css
/* app/globals.css */
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* shadcn semantic aliases → Tailwind color utilities */
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

  /* Brand scale → Tailwind: bg-brand-50, text-brand-500, ... */
  --color-brand-50: var(--brand-50);
  --color-brand-200: var(--brand-200);
  --color-brand-400: var(--brand-400);
  --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600);
  --color-brand-950: var(--brand-950);

  /* Semantic app colors → Tailwind: text-success, bg-warning, ... */
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);

  /* Typography */
  --font-heading: var(--font-heading);
  --font-sans: var(--font-sans);

  /* Radius */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

/* ─── Light Mode ─────────────────────────────────────── */
:root {
  /* Brand scale (Indigo) */
  --brand-50: #eef2ff;
  --brand-200: #c7d2fe;
  --brand-400: #818cf8;
  --brand-500: #6366f1;
  --brand-600: #4f46e5;
  --brand-950: #1e1b4b;

  /* Semantic app colors */
  --success: #059669;
  --warning: #d97706;
  --info: #0284c7;

  /* shadcn semantic aliases */
  --background: #ffffff;
  --foreground: #1e1b4b;
  --card: #ffffff;
  --card-foreground: #1e1b4b;
  --popover: #ffffff;
  --popover-foreground: #1e1b4b;
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --secondary: #eef2ff;
  --secondary-foreground: #4338ca;
  --muted: #f5f3ff;
  --muted-foreground: #64748b;
  --accent: #eef2ff;
  --accent-foreground: #4338ca;
  --destructive: #dc2626;
  --border: #e0e7ff;
  --input: #e0e7ff;
  --ring: #c7d2fe;
  --radius: 0.5rem;
}

/* ─── Dark Mode ──────────────────────────────────────── */
.dark {
  --background: #0f0e1a;
  --foreground: #e0e7ff;
  --card: #1a1830;
  --card-foreground: #e0e7ff;
  --popover: #1a1830;
  --popover-foreground: #e0e7ff;
  --primary: #818cf8;
  --primary-foreground: #1e1b4b;
  --secondary: #1a1830;
  --secondary-foreground: #c7d2fe;
  --muted: #1a1830;
  --muted-foreground: #818cf8;
  --accent: #2d2b55;
  --accent-foreground: #c7d2fe;
  --destructive: #f87171;
  --border: #2d2b55;
  --input: #2d2b55;
  --ring: #4f46e5;

  /* Semantic dark overrides */
  --success: #34d399;
  --warning: #fcd34d;
  --info: #38bdf8;
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
```

- [ ] **Bước 2: Chạy dev server để verify không có lỗi CSS**

```bash
npm run dev
```

Mở http://localhost:3000 — trang home vẫn hiển thị bình thường.

- [ ] **Bước 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(design-system): replace color tokens with Indigo palette"
```

---

## Task 2: Chuyển font sang Be Vietnam Pro + Noto Sans

**Files:**

- Modify: `app/layout.tsx`

- [ ] **Bước 1: Cập nhật layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Noto_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-heading',
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const notoSans = Noto_Sans({
  variable: '--font-sans',
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
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
      className={`${beVietnamPro.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Bước 2: Verify font đã load**

```bash
npm run dev
```

Mở http://localhost:3000 → DevTools → inspect text → computed font-family phải là `Noto Sans`.

- [ ] **Bước 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(design-system): switch font to Be Vietnam Pro + Noto Sans"
```

---

## Task 3: Thêm shadcn UI components qua CLI

**Files:**

- Create: `components/ui/input.tsx`, `textarea.tsx`, `select.tsx`, `badge.tsx`, `card.tsx`, `checkbox.tsx`, `radio-group.tsx`, `sonner.tsx`

> `components/ui/button.tsx` đã tồn tại — chọn **Yes** overwrite để lấy version mới nhất.

- [ ] **Bước 1: Chạy shadcn add**

```bash
npx shadcn@latest add input textarea select badge card checkbox radio-group sonner
```

Khi CLI hỏi overwrite → nhập `y`.

- [ ] **Bước 2: Verify các file đã được tạo**

```bash
ls components/ui/
```

Expected: `badge.tsx button.tsx card.tsx checkbox.tsx input.tsx radio-group.tsx select.tsx sonner.tsx textarea.tsx`

- [ ] **Bước 3: Commit**

```bash
git add components/ui/ app/layout.tsx
git commit -m "feat(design-system): add shadcn UI primitives via CLI"
```

---

## Task 4: Thêm CVA variants cho Badge

**Files:**

- Modify: `components/ui/badge.tsx`

shadcn Badge mặc định chỉ có `default`, `secondary`, `outline`, `destructive`. Cần thêm `success`, `warning`, `info`.

- [ ] **Bước 1: Mở `components/ui/badge.tsx` và thêm variants**

Tìm `badgeVariants` CVA object, thêm vào `variants.variant`:

```ts
success:     'border-transparent bg-[#059669]/10 text-[#059669] dark:bg-[#34D399]/10 dark:text-[#34D399]',
warning:     'border-transparent bg-[#D97706]/10 text-[#D97706] dark:bg-[#FCD34D]/10 dark:text-[#92400E]',
info:        'border-transparent bg-[#0284C7]/10 text-[#0284C7] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]',
```

- [ ] **Bước 2: Cập nhật TypeScript type nếu cần**

Nếu file có `export type BadgeVariant`, thêm `'success' | 'warning' | 'info'` vào union.

- [ ] **Bước 3: Verify build**

```bash
npm run build
```

- [ ] **Bước 4: Commit**

```bash
git add components/ui/badge.tsx
git commit -m "feat(design-system): add success/warning/info variants to Badge"
```

---

## Task 5: Viết lại Design System Preview Page

**Files:**

- Rewrite: `app/page.tsx`

- [ ] **Bước 1: Viết lại page.tsx với 6 sections**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-4 text-[11px] font-semibold tracking-[0.5px] uppercase">
      {children}
    </p>
  );
}

// ─── Color swatches ───────────────────────────────────────
const brandScale = [
  { label: '50', bg: 'bg-[#EEF2FF]', text: 'text-[#1E1B4B]', hex: '#EEF2FF' },
  { label: '200', bg: 'bg-[#C7D2FE]', text: 'text-[#1E1B4B]', hex: '#C7D2FE' },
  { label: '400', bg: 'bg-[#818CF8]', text: 'text-white', hex: '#818CF8' },
  { label: '500', bg: 'bg-[#6366F1]', text: 'text-white', hex: '#6366F1' },
  { label: '600', bg: 'bg-[#4F46E5]', text: 'text-white', hex: '#4F46E5' },
  { label: '950', bg: 'bg-[#1E1B4B]', text: 'text-white', hex: '#1E1B4B' },
];

const semanticColors = [
  { label: 'Success', bg: 'bg-[#059669]', hex: '#059669' },
  { label: 'Warning', bg: 'bg-[#D97706]', hex: '#D97706' },
  { label: 'Destructive', bg: 'bg-destructive', hex: '#DC2626' },
  { label: 'Info', bg: 'bg-[#0284C7]', hex: '#0284C7' },
];

// ─── Main ─────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'dark' : ''}>
      <main className="bg-background text-foreground min-h-screen p-8">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-[28px] font-bold tracking-[-0.5px]">
                Design System
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Nhà Ở Xã Hội — Indigo Modern
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>

          {/* ── 1. Colors ── */}
          <section>
            <SectionLabel>Colors</SectionLabel>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Brand Scale
                </p>
                <div className="flex gap-2">
                  {brandScale.map((s) => (
                    <div key={s.label} className="flex-1">
                      <div
                        className={`${s.bg} ${s.text} flex h-12 items-end rounded-md p-1.5`}
                      >
                        <span className="text-[9px] leading-none font-semibold">
                          {s.label}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-center text-[9px]">
                        {s.hex}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Semantic Colors
                </p>
                <div className="flex gap-2">
                  {semanticColors.map((s) => (
                    <div key={s.label} className="flex-1">
                      <div className={`${s.bg} h-10 rounded-md`} />
                      <p className="text-muted-foreground mt-1 text-center text-[9px]">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. Typography ── */}
          <section>
            <SectionLabel>Typography</SectionLabel>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="font-heading text-[36px] leading-[1.2] font-bold tracking-[-1px]">
                  Display — Tìm nhà phù hợp
                </div>
                <div className="font-heading text-[28px] leading-[1.25] font-bold tracking-[-0.5px]">
                  H1 — Nhà ở xã hội
                </div>
                <div className="font-heading text-[22px] leading-[1.3] font-semibold tracking-[-0.3px]">
                  H2 — Điều kiện đăng ký
                </div>
                <div className="font-heading text-[17px] leading-[1.4] font-semibold">
                  H3 — Thông tin dự án
                </div>
                <div className="text-[14px] leading-[1.6] font-normal">
                  Body — Nhà ở xã hội là loại nhà ở được đầu tư xây dựng để bán,
                  cho thuê cho các đối tượng được hưởng chính sách hỗ trợ về nhà
                  ở.
                </div>
                <div className="text-muted-foreground text-[12px] leading-[1.5] font-normal">
                  Caption — Cập nhật ngày 08/04/2026
                </div>
                <div className="text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase">
                  Label — Trạng thái dự án
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 3. Buttons ── */}
          <section>
            <SectionLabel>Buttons</SectionLabel>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">Sizes</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs">States</p>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button variant="outline" disabled>
                      Disabled Outline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 4. Badges ── */}
          <section>
            <SectionLabel>Badges</SectionLabel>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Đủ điều kiện</Badge>
                  <Badge variant="warning">Cần xem lại</Badge>
                  <Badge variant="destructive">Không đủ</Badge>
                  <Badge variant="info">Thông tin</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 5. Forms ── */}
          <section>
            <SectionLabel>Forms</SectionLabel>
            <Card>
              <CardContent className="space-y-5 pt-6">
                {/* Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="income">Thu nhập hàng tháng</Label>
                  <Input id="income" placeholder="VD: 10.000.000 ₫" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="income-err" className="text-destructive">
                    Thu nhập hàng tháng *
                  </Label>
                  <Input
                    id="income-err"
                    placeholder="VD: 10.000.000 ₫"
                    className="border-destructive"
                  />
                  <p className="text-destructive text-xs">
                    Vui lòng nhập thu nhập hàng tháng
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Disabled</Label>
                  <Input placeholder="Không thể chỉnh sửa" disabled />
                </div>

                {/* Textarea */}
                <div className="space-y-1.5">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea id="note" placeholder="Nhập ghi chú..." rows={3} />
                </div>

                {/* Select */}
                <div className="space-y-1.5">
                  <Label>Tỉnh / Thành phố</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh thành..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                      <SelectItem value="hn">Hà Nội</SelectItem>
                      <SelectItem value="dn">Đà Nẵng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Radio */}
                <div className="space-y-2">
                  <Label>Tình trạng hôn nhân</Label>
                  <RadioGroup defaultValue="single" className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="font-normal">
                        Độc thân
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="married" id="married" />
                      <Label htmlFor="married" className="font-normal">
                        Đã kết hôn
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox id="confirm" />
                  <Label htmlFor="confirm" className="font-normal">
                    Tôi xác nhận thông tin trên là chính xác
                  </Label>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── 6. Toast ── */}
          <section>
            <SectionLabel>Toast / Notification</SectionLabel>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      toast.success('Bạn đủ điều kiện mua nhà ở xã hội!')
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
                    }
                  >
                    Error Toast
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => toast.warning('Thu nhập gần ngưỡng tối đa!')}
                  >
                    Warning Toast
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toast.info('Điều kiện cập nhật tháng 04/2026')
                    }
                  >
                    Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Bước 2: Chạy dev server verify visual**

```bash
npm run dev
```

Mở http://localhost:3000 — verify:

- 6 sections hiển thị đúng thứ tự
- Dark mode toggle hoạt động
- Toast triggers hoạt động

- [ ] **Bước 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(design-system): rewrite preview page with 6 sections"
```

---

## Task 6: Verify tổng thể & Dark Mode

- [ ] **Bước 1: Chạy build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Bước 2: Verify dark mode**

Mở http://localhost:3000, click toggle Dark — kiểm tra:

- Background chuyển sang `#0F0E1A`
- Text chuyển sang `#E0E7FF`
- Button primary dùng `#818CF8`
- Border hiển thị đúng `#2D2B55`
- Badge variants vẫn đọc được

- [ ] **Bước 3: Commit cuối**

```bash
git add -A
git commit -m "feat(design-system): complete Indigo Modern design system"
```

---

## Out of Scope

- Dialog / Modal component (phase sau)
- Avatar, Chart/Graph (phase sau)
- Animation / micro-interaction (phase sau)
- Mobile responsive (sẽ xử lý khi build feature pages)
- Layout trang Nhà Ở Xã Hội (phase sau)
