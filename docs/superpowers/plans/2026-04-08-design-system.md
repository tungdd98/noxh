# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng design system Stripe-inspired cho Finance Tracker gồm color tokens, Inter font, shadcn/ui components, và 3 finance-specific wrapper components.

**Architecture:** 3 lớp — Design Tokens (`globals.css`) → UI Primitives (`components/ui/` via shadcn) → Finance Components (`components/finance/` via CVA). Component không dùng màu hex cứng mà chỉ tham chiếu CSS variables. Dark mode qua `.dark` class override.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (new-york), Radix UI, CVA, tailwind-merge, Vitest, @testing-library/react

---

## Task 0: Tạo feature branch

- [ ] **Bước 1: Tạo và checkout branch mới từ main**

```bash
git checkout main
git pull
git checkout -b feat/design-system
```

- [ ] **Bước 2: Verify đang ở đúng branch**

```bash
git branch --show-current
```

Expected: `feat/design-system`

---

## File Map

| File                                                      | Hành động       | Mục đích                                         |
| --------------------------------------------------------- | --------------- | ------------------------------------------------ |
| `app/globals.css`                                         | Modify          | Replace toàn bộ tokens sang Stripe palette       |
| `app/layout.tsx`                                          | Modify          | Geist → Inter, lang="vi"                         |
| `components/ui/input.tsx`                                 | Create (shadcn) | Form input primitive                             |
| `components/ui/select.tsx`                                | Create (shadcn) | Dropdown select primitive                        |
| `components/ui/dialog.tsx`                                | Create (shadcn) | Modal dialog primitive                           |
| `components/ui/badge.tsx`                                 | Create (shadcn) | Badge primitive                                  |
| `components/ui/card.tsx`                                  | Create (shadcn) | Card primitive                                   |
| `components/ui/checkbox.tsx`                              | Create (shadcn) | Checkbox primitive                               |
| `components/ui/radio-group.tsx`                           | Create (shadcn) | Radio group primitive                            |
| `components/ui/sonner.tsx`                                | Create (shadcn) | Toast via Sonner                                 |
| `components/finance/transaction-badge.tsx`                | Create          | Badge với income/expense/saving variant          |
| `components/finance/balance-card.tsx`                     | Create          | Dark card hiển thị số dư + số tiền lớn           |
| `components/finance/amount-input.tsx`                     | Create          | Input tiền tệ với prefix ₫ + tabular-nums        |
| `vitest.config.ts`                                        | Create          | Cấu hình test runner                             |
| `vitest.setup.ts`                                         | Create          | jest-dom matchers                                |
| `components/finance/__tests__/transaction-badge.test.tsx` | Create          | Tests cho TransactionBadge                       |
| `components/finance/__tests__/balance-card.test.tsx`      | Create          | Tests cho BalanceCard                            |
| `components/finance/__tests__/amount-input.test.tsx`      | Create          | Tests cho AmountInput                            |
| `app/page.tsx`                                            | Modify          | Preview page để verify visual + dark mode toggle |

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
  --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600);
  --color-brand-900: var(--brand-900);

  /* Neutral scale → Tailwind: bg-neutral-50, text-neutral-600, ... */
  --color-neutral-50: var(--neutral-50);
  --color-neutral-200: var(--neutral-200);
  --color-neutral-400: var(--neutral-400);
  --color-neutral-600: var(--neutral-600);
  --color-neutral-700: var(--neutral-700);
  --color-neutral-900: var(--neutral-900);

  /* Finance semantic → Tailwind: text-income, bg-expense, ... */
  --color-income: var(--income);
  --color-expense: var(--expense);
  --color-saving: var(--saving);
  --color-warning: var(--warning);

  /* Typography */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  /* Radius */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);

  /* Sidebar (shadcn compatibility) */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Charts */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
}

/* ─── Light Mode ─────────────────────────────────────── */
:root {
  /* Brand scale */
  --brand-50: #eeecff;
  --brand-200: #c7c4ff;
  --brand-500: #635bff;
  --brand-600: #533afd;
  --brand-900: #0a2540;

  /* Neutral scale (Stripe blue-grey) */
  --neutral-50: #f6f9fb;
  --neutral-200: #e5edf5;
  --neutral-400: #aab4c1;
  --neutral-600: #667691;
  --neutral-700: #3f4b66;
  --neutral-900: #0a2540; /* same as brand-900, used for text */

  /* Finance semantic */
  --income: #09825d;
  --expense: #df1b41;
  --saving: #635bff;
  --warning: #f5a623;

  /* shadcn semantic aliases */
  --background: #ffffff;
  --foreground: #0a2540;
  --card: #ffffff;
  --card-foreground: #0a2540;
  --popover: #ffffff;
  --popover-foreground: #0a2540;
  --primary: #635bff;
  --primary-foreground: #ffffff;
  --secondary: #f6f9fb;
  --secondary-foreground: #0a2540;
  --muted: #f6f9fb;
  --muted-foreground: #667691;
  --accent: #f6f9fb;
  --accent-foreground: #0a2540;
  --destructive: #df1b41;
  --border: #e5edf5;
  --input: #e5edf5;
  --ring: #c7c4ff;
  --radius: 0.625rem;

  /* Sidebar */
  --sidebar: #f6f9fb;
  --sidebar-foreground: #0a2540;
  --sidebar-primary: #635bff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #eeecff;
  --sidebar-accent-foreground: #0a2540;
  --sidebar-border: #e5edf5;
  --sidebar-ring: #c7c4ff;

  /* Charts */
  --chart-1: #635bff;
  --chart-2: #09825d;
  --chart-3: #df1b41;
  --chart-4: #f5a623;
  --chart-5: #0a2540;
}

/* ─── Dark Mode ──────────────────────────────────────── */
.dark {
  --background: #0a2540;
  --foreground: #e5edf5;
  --card: #0e2d4a;
  --card-foreground: #e5edf5;
  --popover: #0e2d4a;
  --popover-foreground: #e5edf5;
  --primary: #7b73ff;
  --primary-foreground: #ffffff;
  --secondary: #0e2d4a;
  --secondary-foreground: #e5edf5;
  --muted: #0e2d4a;
  --muted-foreground: #aab4c1;
  --accent: #0e2d4a;
  --accent-foreground: #e5edf5;
  --destructive: #ff5278;
  --border: #1a3654;
  --input: #1a3654;
  --ring: #533afd;

  /* Sidebar */
  --sidebar: #0e2d4a;
  --sidebar-foreground: #e5edf5;
  --sidebar-primary: #7b73ff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #1a3654;
  --sidebar-accent-foreground: #e5edf5;
  --sidebar-border: #1a3654;
  --sidebar-ring: #533afd;

  /* Charts dark */
  --chart-1: #7b73ff;
  --chart-2: #34d399;
  --chart-3: #fb7185;
  --chart-4: #fbbf24;
  --chart-5: #e5edf5;
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

Mở http://localhost:3000 — trang home vẫn hiển thị bình thường. Nền trắng, chữ navy.

- [ ] **Bước 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(design-system): replace color tokens with Stripe palette"
```

---

## Task 2: Chuyển từ Geist sang Inter

**Files:**

- Modify: `app/layout.tsx`

- [ ] **Bước 1: Cập nhật layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Personal finance tracking application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
```

> **Lưu ý:** `variable: '--font-sans'` → next/font sẽ inject CSS var `--font-sans` lên `<html>`. `globals.css` đã có `--font-sans: var(--font-sans)` trong `@theme inline` nên Tailwind tự pick up. Xoá `--font-mono` reference trong globals.css không cần thiết vì không có component dùng mono.

- [ ] **Bước 2: Verify Inter đã load**

```bash
npm run dev
```

Mở http://localhost:3000 → DevTools → chữ "Finance Tracker" inspect → computed font-family phải là `Inter`.

- [ ] **Bước 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(design-system): switch font from Geist to Inter"
```

---

## Task 3: Thêm shadcn UI components qua CLI

**Files:**

- Create: `components/ui/input.tsx`, `select.tsx`, `dialog.tsx`, `badge.tsx`, `card.tsx`, `checkbox.tsx`, `radio-group.tsx`, `sonner.tsx`

> `components/ui/button.tsx` đã tồn tại — shadcn sẽ hỏi overwrite, chọn **No** (skip) hoặc **Yes** nếu muốn version mới nhất.

- [ ] **Bước 1: Chạy shadcn add cho tất cả components một lệnh**

```bash
npx shadcn@latest add input select dialog badge card checkbox radio-group sonner
```

Khi CLI hỏi về existing components → nhập `y` để overwrite nếu cần, hoặc `n` để skip button.

- [ ] **Bước 2: Verify các file đã được tạo**

```bash
ls components/ui/
```

Expected output phải có: `badge.tsx button.tsx card.tsx checkbox.tsx dialog.tsx input.tsx radio-group.tsx select.tsx sonner.tsx`

- [ ] **Bước 3: Thêm Toaster vào layout.tsx để Sonner hoạt động**

```tsx
// app/layout.tsx — thêm import và <Toaster />
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Personal finance tracking application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Bước 4: Verify build không lỗi**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Bước 5: Commit**

```bash
git add components/ui/ app/layout.tsx
git commit -m "feat(design-system): add shadcn UI primitives via CLI"
```

---

## Task 4: Cài Vitest + React Testing Library

**Files:**

- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (scripts)

- [ ] **Bước 1: Cài dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Bước 2: Tạo vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Bước 3: Tạo vitest.setup.ts**

```ts
// vitest.setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Bước 4: Thêm script test vào package.json**

Mở `package.json`, thêm vào `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Bước 5: Chạy test để verify setup hoạt động (không có test nào = pass)**

```bash
npm test
```

Expected: `No test files found` hoặc `0 tests passed` — không có error.

- [ ] **Bước 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: setup Vitest + React Testing Library"
```

---

## Task 5: TransactionBadge component

**Files:**

- Create: `components/finance/__tests__/transaction-badge.test.tsx`
- Create: `components/finance/transaction-badge.tsx`

- [ ] **Bước 1: Tạo thư mục và file test**

```bash
mkdir -p components/finance/__tests__
```

- [ ] **Bước 2: Viết failing test**

```tsx
// components/finance/__tests__/transaction-badge.test.tsx
import { render, screen } from '@testing-library/react';
import { TransactionBadge } from '../transaction-badge';

describe('TransactionBadge', () => {
  it('renders "Thu nhập" for income type', () => {
    render(<TransactionBadge type="income" />);
    expect(screen.getByText('Thu nhập')).toBeInTheDocument();
  });

  it('renders "Chi tiêu" for expense type', () => {
    render(<TransactionBadge type="expense" />);
    expect(screen.getByText('Chi tiêu')).toBeInTheDocument();
  });

  it('renders "Tiết kiệm" for saving type', () => {
    render(<TransactionBadge type="saving" />);
    expect(screen.getByText('Tiết kiệm')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TransactionBadge type="income" className="test-class" />);
    expect(
      screen.getByText('Thu nhập').closest('[data-slot="badge"]')
    ).toHaveClass('test-class');
  });
});
```

- [ ] **Bước 3: Chạy test — verify FAIL**

```bash
npm test -- transaction-badge
```

Expected: `FAIL — Cannot find module '../transaction-badge'`

- [ ] **Bước 4: Implement TransactionBadge**

```tsx
// components/finance/transaction-badge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TransactionType = 'income' | 'expense' | 'saving';

const variantStyles: Record<TransactionType, string> = {
  income:
    'border-[#09825d]/20 bg-[#09825d]/10 text-[#09825d] hover:bg-[#09825d]/15',
  expense:
    'border-[#df1b41]/20 bg-[#df1b41]/10 text-[#df1b41] hover:bg-[#df1b41]/15',
  saving: 'border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-50',
};

const labels: Record<TransactionType, string> = {
  income: 'Thu nhập',
  expense: 'Chi tiêu',
  saving: 'Tiết kiệm',
};

interface TransactionBadgeProps {
  type: TransactionType;
  className?: string;
}

export function TransactionBadge({ type, className }: TransactionBadgeProps) {
  return (
    <Badge variant="outline" className={cn(variantStyles[type], className)}>
      {labels[type]}
    </Badge>
  );
}
```

- [ ] **Bước 5: Chạy test — verify PASS**

```bash
npm test -- transaction-badge
```

Expected: `PASS — 4 tests passed`

- [ ] **Bước 6: Commit**

```bash
git add components/finance/transaction-badge.tsx components/finance/__tests__/transaction-badge.test.tsx
git commit -m "feat(design-system): add TransactionBadge finance component"
```

---

## Task 6: BalanceCard component

**Files:**

- Create: `components/finance/__tests__/balance-card.test.tsx`
- Create: `components/finance/balance-card.tsx`

- [ ] **Bước 1: Viết failing test**

```tsx
// components/finance/__tests__/balance-card.test.tsx
import { render, screen } from '@testing-library/react';
import { BalanceCard } from '../balance-card';

describe('BalanceCard', () => {
  it('renders the label', () => {
    render(<BalanceCard label="Tổng tài sản" amount={124580000} />);
    expect(screen.getByText('Tổng tài sản')).toBeInTheDocument();
  });

  it('formats amount in VND', () => {
    render(<BalanceCard label="Tổng tài sản" amount={124580000} />);
    // Intl.NumberFormat vi-VN: 124.580.000 ₫
    expect(screen.getByText(/124/)).toBeInTheDocument();
  });

  it('renders positive change indicator', () => {
    render(
      <BalanceCard label="Tổng tài sản" amount={124580000} change={2.4} />
    );
    expect(screen.getByText(/2\.4/)).toBeInTheDocument();
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('renders negative change indicator', () => {
    render(
      <BalanceCard label="Tổng tài sản" amount={124580000} change={-1.5} />
    );
    expect(screen.getByText(/1\.5/)).toBeInTheDocument();
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('does not render change when not provided', () => {
    render(<BalanceCard label="Tổng tài sản" amount={124580000} />);
    expect(screen.queryByText(/↑|↓/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Bước 2: Chạy test — verify FAIL**

```bash
npm test -- balance-card
```

Expected: `FAIL — Cannot find module '../balance-card'`

- [ ] **Bước 3: Implement BalanceCard**

```tsx
// components/finance/balance-card.tsx
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  label: string;
  amount: number;
  change?: number;
  className?: string;
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function BalanceCard({
  label,
  amount,
  change,
  className,
}: BalanceCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#0a2540] p-5 shadow-[0_4px_24px_rgba(10,37,64,0.18)]',
        className
      )}
    >
      <p className="text-[11px] font-semibold tracking-[0.5px] text-[#aab4c1] uppercase">
        {label}
      </p>
      <p
        className="mt-1 text-[36px] leading-tight font-bold tracking-[-1px] text-white"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatVND(amount)}
      </p>
      {change !== undefined && (
        <div className="mt-2">
          <span className="inline-block rounded-full bg-[#1e3a5f] px-3 py-0.5 text-[10px] text-[#7b73ff]">
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% tháng này
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Bước 4: Chạy test — verify PASS**

```bash
npm test -- balance-card
```

Expected: `PASS — 5 tests passed`

- [ ] **Bước 5: Commit**

```bash
git add components/finance/balance-card.tsx components/finance/__tests__/balance-card.test.tsx
git commit -m "feat(design-system): add BalanceCard finance component"
```

---

## Task 7: AmountInput component

**Files:**

- Create: `components/finance/__tests__/amount-input.test.tsx`
- Create: `components/finance/amount-input.tsx`

- [ ] **Bước 1: Viết failing test**

```tsx
// components/finance/__tests__/amount-input.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AmountInput } from '../amount-input';

describe('AmountInput', () => {
  it('renders ₫ prefix', () => {
    render(<AmountInput value="" onChange={() => {}} />);
    expect(screen.getByText('₫')).toBeInTheDocument();
  });

  it('displays formatted value', () => {
    render(<AmountInput value={1500000} onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('1.500.000');
  });

  it('calls onChange with numeric value on input', () => {
    const handleChange = vi.fn();
    render(<AmountInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '450000' } });
    expect(handleChange).toHaveBeenCalledWith(450000);
  });

  it('calls onChange with empty string when input is cleared', () => {
    const handleChange = vi.fn();
    render(<AmountInput value={450000} onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('strips non-numeric characters', () => {
    const handleChange = vi.fn();
    render(<AmountInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc123' } });
    expect(handleChange).toHaveBeenCalledWith(123);
  });
});
```

- [ ] **Bước 2: Chạy test — verify FAIL**

```bash
npm test -- amount-input
```

Expected: `FAIL — Cannot find module '../amount-input'`

- [ ] **Bước 3: Implement AmountInput**

```tsx
// components/finance/amount-input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

type TransactionType = 'income' | 'expense' | 'saving';

interface AmountInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type'
> {
  value: number | '';
  onChange: (value: number | '') => void;
  transactionType?: TransactionType;
}

const typeColorClass: Record<TransactionType, string> = {
  income: 'text-[#09825d]',
  expense: 'text-[#df1b41]',
  saving: 'text-foreground',
};

export function AmountInput({
  value,
  onChange,
  transactionType,
  className,
  ...props
}: AmountInputProps) {
  const colorClass = transactionType
    ? typeColorClass[transactionType]
    : 'text-foreground';

  const displayValue = value === '' ? '' : value.toLocaleString('vi-VN');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    onChange(raw === '' ? '' : Number(raw));
  }

  return (
    <div className="relative flex items-center">
      <span className="text-muted-foreground pointer-events-none absolute left-3 text-sm font-medium">
        ₫
      </span>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          'border-input bg-background flex h-9 w-full rounded-lg border pr-3 pl-7 text-sm',
          'placeholder:text-muted-foreground transition-colors',
          'focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[font-variant-numeric:tabular-nums]',
          colorClass,
          className
        )}
      />
    </div>
  );
}
```

- [ ] **Bước 4: Chạy test — verify PASS**

```bash
npm test -- amount-input
```

Expected: `PASS — 5 tests passed`

- [ ] **Bước 5: Commit**

```bash
git add components/finance/amount-input.tsx components/finance/__tests__/amount-input.test.tsx
git commit -m "feat(design-system): add AmountInput finance component"
```

---

## Task 8: Typography utility component

**Files:**

- Create: `components/ui/typography.tsx`

Typography không cần test riêng — là thin wrapper trên HTML elements, logic-free.

- [ ] **Bước 1: Tạo typography.tsx**

```tsx
// components/ui/typography.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

// Display — 36px/700/-1px — số tiền lớn
export function Display({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-[36px] leading-tight font-bold tracking-[-1px] [font-variant-numeric:tabular-nums]',
        className
      )}
      {...props}
    />
  );
}

// H1 — 28px/700/-0.5px
export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn('text-[28px] font-bold tracking-[-0.5px]', className)}
      {...props}
    />
  );
}

// H2 — 22px/600/-0.3px
export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-[22px] font-semibold tracking-[-0.3px]', className)}
      {...props}
    />
  );
}

// H3 — 17px/600/-0.1px
export function H3({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[17px] font-semibold tracking-[-0.1px]', className)}
      {...props}
    />
  );
}

// Body — 14px/400
export function Body({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-foreground text-sm', className)} {...props} />;
}

// Caption — 12px/400/+0.1px
export function Caption({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-muted-foreground text-xs tracking-[0.1px]',
        className
      )}
      {...props}
    />
  );
}

// Label — 11px/600/+0.5px uppercase
export function Label({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'text-muted-foreground text-[11px] font-semibold tracking-[0.5px] uppercase',
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Bước 2: Commit**

```bash
git add components/ui/typography.tsx
git commit -m "feat(design-system): add Typography utility components"
```

---

## Task 9: Preview page + Dark mode verify

**Files:**

- Modify: `app/page.tsx`

- [ ] **Bước 1: Cập nhật page.tsx với component preview và dark mode toggle**

```tsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceCard } from '@/components/finance/balance-card';
import { TransactionBadge } from '@/components/finance/transaction-badge';
import { AmountInput } from '@/components/finance/amount-input';
import { toast } from 'sonner';

export default function Home() {
  const [dark, setDark] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');

  return (
    <div className={dark ? 'dark' : ''}>
      <main className="bg-background text-foreground min-h-screen p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-bold tracking-[-0.5px]">
              Design System Preview
            </h1>
            <Button variant="outline" onClick={() => setDark(!dark)}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>

          {/* Balance Card */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Balance Card
            </p>
            <BalanceCard label="Tổng tài sản" amount={124580000} change={2.4} />
          </section>

          {/* Badges */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Transaction Badges
            </p>
            <div className="flex gap-2">
              <TransactionBadge type="income" />
              <TransactionBadge type="expense" />
              <TransactionBadge type="saving" />
              <Badge>Default</Badge>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Amount Input
            </p>
            <div className="space-y-2">
              <AmountInput
                value={amount}
                onChange={setAmount}
                transactionType="income"
                placeholder="0"
              />
              <AmountInput
                value={amount}
                onChange={setAmount}
                transactionType="expense"
                placeholder="0"
              />
            </div>
          </section>

          {/* Card */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Card
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Giao dịch gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: 'Lương tháng 4',
                    type: 'income',
                    amount: '+8.200.000 ₫',
                  },
                  {
                    label: 'Siêu thị Big C',
                    type: 'expense',
                    amount: '-450.000 ₫',
                  },
                  {
                    label: 'Tiết kiệm',
                    type: 'saving',
                    amount: '+2.000.000 ₫',
                  },
                ].map((tx) => (
                  <div
                    key={tx.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <TransactionBadge
                        type={tx.type as 'income' | 'expense' | 'saving'}
                      />
                      <span className="text-sm">{tx.label}</span>
                    </div>
                    <span
                      className="text-sm font-semibold [font-variant-numeric:tabular-nums]"
                      style={{
                        color:
                          tx.type === 'income'
                            ? '#09825d'
                            : tx.type === 'expense'
                              ? '#df1b41'
                              : '#635bff',
                      }}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Form elements */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Form Elements
            </p>
            <div className="space-y-3">
              <Input placeholder="Mô tả giao dịch..." />
              <div className="flex items-center gap-2">
                <Checkbox id="confirm" />
                <label htmlFor="confirm" className="text-sm">
                  Xác nhận giao dịch
                </label>
              </div>
            </div>
          </section>

          {/* Toast */}
          <section>
            <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.5px] uppercase">
              Toast Notifications
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => toast.success('Thêm giao dịch thành công!')}
              >
                Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() => toast.error('Có lỗi xảy ra!')}
              >
                Error Toast
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Bước 2: Chạy dev server và verify**

```bash
npm run dev
```

Mở http://localhost:3000 và kiểm tra từng mục:

| Hạng mục                 | Kết quả mong đợi                            |
| ------------------------ | ------------------------------------------- |
| Font                     | Inter, không phải Geist                     |
| BalanceCard              | Nền navy `#0a2540`, chữ trắng, số tiền lớn  |
| TransactionBadge income  | Chữ xanh `#09825d`, nền xanh nhạt           |
| TransactionBadge expense | Chữ đỏ `#df1b41`, nền đỏ nhạt               |
| Button primary           | Nền tím `#635bff`                           |
| Dark toggle              | Toàn bộ nền chuyển sang navy, chữ sang sáng |
| Toast success            | Popup xanh lá góc dưới phải                 |

- [ ] **Bước 3: Chạy toàn bộ test lần cuối**

```bash
npm test
```

Expected: `15 tests passed` (4 + 5 + 5 + setup smoke)

- [ ] **Bước 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(design-system): add component preview page with dark mode toggle"
```

---

## Checklist hoàn thành

- [ ] `globals.css` dùng Stripe color tokens (hex, không oklch)
- [ ] Inter font load qua `next/font/google`
- [ ] 9 shadcn components có trong `components/ui/`
- [ ] `components/ui/typography.tsx` có đủ 7 variants
- [ ] `Toaster` mounted trong layout
- [ ] `TransactionBadge` test pass + render đúng 3 loại
- [ ] `BalanceCard` test pass + format VND + change indicator
- [ ] `AmountInput` test pass + ₫ prefix + strip non-numeric
- [ ] Dark mode toggle hoạt động visual ở preview page
- [ ] `npm run build` không có lỗi TypeScript

- [ ] `globals.css` dùng Stripe color tokens (hex, không oklch)
- [ ] Inter font load qua `next/font/google`
- [ ] 9 shadcn components có trong `components/ui/`
- [ ] `Toaster` mounted trong layout
- [ ] `TransactionBadge` test pass + render đúng 3 loại
- [ ] `BalanceCard` test pass + format VND + change indicator
- [ ] `AmountInput` test pass + ₫ prefix + strip non-numeric
- [ ] Dark mode toggle hoạt động visual ở preview page
- [ ] `npm run build` không có lỗi TypeScript
