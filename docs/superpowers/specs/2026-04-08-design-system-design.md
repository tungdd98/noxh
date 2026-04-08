# Design System — Nhà Ở Xã Hội

**Date:** 2026-04-08  
**Status:** Approved  
**Approach:** Indigo Modern — Design Tokens → shadcn/ui → CVA Variants

---

## 1. Context & Goals

Web app tra cứu thông tin nhà ở xã hội dành cho người dân (đặc biệt giới trẻ). Mục tiêu xây dựng design system nhất quán, dễ mở rộng, phong cách **Indigo Modern**: sạch sẽ, shadow nhẹ, bo góc, màu tươi sáng.

**Yêu cầu phong cách:**

- Đơn giản, hiện đại, thân thiện với giới trẻ — không màu mè, không sến
- Tông màu chủ đạo: Indigo (`#6366F1`) — kiểu Notion / Linear
- Nền tím nhạt rất nhẹ (`#F5F3FF`) thay vì trắng tinh
- Shadow nhẹ, bo góc `0.5rem`
- Hỗ trợ Light mode + Dark mode

---

## 2. Architecture — 2 Lớp

```
Layer 1: Design Tokens        app/globals.css
           ↓
Layer 2: UI Primitives        components/ui/       (shadcn/ui + Radix)
```

**Nguyên tắc:** Component không bao giờ dùng màu cứng (hex). Mọi giá trị đều tham chiếu CSS variable từ Layer 1.

> Không có Layer 3 Finance Components — đã xóa hoàn toàn.

---

## 3. Color Token System

### Brand Scale (Indigo)

| Token         | Value     | Dùng cho                           |
| ------------- | --------- | ---------------------------------- |
| `--brand-50`  | `#EEF2FF` | Hover tint, badge background       |
| `--brand-200` | `#C7D2FE` | Focus ring                         |
| `--brand-400` | `#818CF8` | Icon accent, secondary element     |
| `--brand-500` | `#6366F1` | Primary button, link — màu chủ đạo |
| `--brand-600` | `#4F46E5` | Button `:hover`                    |
| `--brand-950` | `#1E1B4B` | Dark card bg, heading chính        |

### Semantic Colors (App-specific)

| Token                 | Light     | Dark      | Dùng cho                 |
| --------------------- | --------- | --------- | ------------------------ |
| `--color-success`     | `#059669` | `#34D399` | Đủ điều kiện             |
| `--color-warning`     | `#D97706` | `#FCD34D` | Cần xem lại              |
| `--color-destructive` | `#DC2626` | `#F87171` | Không đủ điều kiện / Lỗi |
| `--color-info`        | `#0284C7` | `#38BDF8` | Thông tin                |

### Semantic Aliases (dùng trong component)

**Light mode (`:root`):**

```css
--background: #ffffff;
--surface: #f5f3ff;
--foreground: #1e1b4b;
--muted-foreground: #64748b;
--border: #e0e7ff;
--input: #e0e7ff;
--primary: #6366f1;
--primary-foreground: #ffffff;
--secondary: #eef2ff;
--secondary-foreground: #4338ca;
--muted: #f5f3ff;
--accent: #eef2ff;
--accent-foreground: #4338ca;
--ring: #c7d2fe;
--radius: 0.5rem;
```

**Dark mode (`.dark`):**

```css
--background: #0f0e1a;
--surface: #1a1830;
--foreground: #e0e7ff;
--muted-foreground: #818cf8;
--border: #2d2b55;
--input: #2d2b55;
--primary: #818cf8;
--primary-foreground: #1e1b4b;
--secondary: #1a1830;
--secondary-foreground: #c7d2fe;
--muted: #1a1830;
--accent: #2d2b55;
--accent-foreground: #c7d2fe;
--ring: #4f46e5;
```

---

## 4. Typography System

**Font heading:** Be Vietnam Pro (Google Fonts) — thiết kế riêng cho tiếng Việt  
**Font body:** Noto Sans (Google Fonts) — hỗ trợ dấu tiếng Việt tốt, dễ đọc

| Bậc     | Size | Weight | Line-height | Dùng cho                              |
| ------- | ---- | ------ | ----------- | ------------------------------------- |
| Display | 36px | 700    | 1.2         | Số lớn, hero heading                  |
| H1      | 28px | 700    | 1.25        | Tiêu đề trang                         |
| H2      | 22px | 600    | 1.3         | Tiêu đề section                       |
| H3      | 17px | 600    | 1.4         | Tiêu đề card                          |
| Body    | 14px | 400    | 1.6         | Nội dung chính                        |
| Caption | 12px | 400    | 1.5         | Timestamp, chú thích                  |
| Label   | 11px | 600    | 1.0         | Nhãn cột (uppercase, +0.5px tracking) |

**Quy tắc:**

- Chỉ dùng weight 400 / 600 / 700
- Không dùng weight 300
- Không bold body text

---

## 5. Component List

### Layer 2 — UI Primitives (`components/ui/` via shadcn CLI)

| Component    | Variants                                                      | Ghi chú                          |
| ------------ | ------------------------------------------------------------- | -------------------------------- |
| `Button`     | `default` · `secondary` · `outline` · `ghost` · `destructive` | 3 sizes: sm / md / lg            |
| `Input`      | default · error · disabled                                    | Visible label, error below field |
| `Textarea`   | default · error · disabled                                    | —                                |
| `Select`     | —                                                             | Radix Select                     |
| `Checkbox`   | —                                                             | indeterminate state              |
| `RadioGroup` | —                                                             | —                                |
| `Badge`      | `default` · `success` · `warning` · `destructive` · `info`    | CVA variants                     |
| `Card`       | —                                                             | shadcn Card primitive            |
| `Sonner`     | `success` · `error` · `warning` · `info`                      | Auto-dismiss 4s                  |

---

## 6. Design System Preview Page (`app/page.tsx`)

Trang preview standalone với dark/light toggle ở góc trên phải. Các section theo thứ tự:

1. **Colors** — Brand scale swatches + semantic color chips (success/warning/destructive/info)
2. **Typography** — Hiển thị từng bậc Display → Label với text mẫu tiếng Việt
3. **Buttons** — 5 variants × 3 sizes + loading state
4. **Badges** — 5 variants
5. **Forms** — Input, Textarea, Select, Checkbox, RadioGroup (có label, error state, disabled)
6. **Toast / Notification** — 4 nút trigger: success, error, warning, info

---

## 7. File Structure

```
app/
└── globals.css              ← Design tokens (Layer 1)

components/
└── ui/                      ← shadcn generate (Layer 2)
    ├── button.tsx
    ├── input.tsx
    ├── textarea.tsx
    ├── select.tsx
    ├── checkbox.tsx
    ├── radio-group.tsx
    ├── badge.tsx
    ├── card.tsx
    └── sonner.tsx
```

> `components/finance/` đã bị xóa hoàn toàn.

---

## 8. Build Order

1. **CSS Tokens** — Cập nhật `globals.css`: thay Stripe palette → Indigo palette, cập nhật dark mode
2. **Font** — Cài `Be Vietnam Pro` + `Noto Sans` qua `next/font/google`, cập nhật `layout.tsx`
3. **shadcn add** — Thêm: `button input textarea select checkbox radio-group badge card sonner`
4. **CVA Badge Variants** — Thêm `success`, `warning`, `info` variant vào `components/ui/badge.tsx`
5. **Xóa Finance Components** — Xóa `components/finance/` và các test liên quan
6. **Cập nhật page.tsx** — Viết lại Design System Preview Page với 6 sections
7. **Dark Mode** — Verify token dark mode hoạt động đúng với toggle

---

## 9. Out of Scope

- Layout trang Nhà Ở Xã Hội (phase sau)
- Dialog / Modal component (phase sau)
- Avatar, Chart/Graph (phase sau)
- Animation / micro-interaction (phase sau)
- Mobile responsive (sẽ xử lý khi build feature pages)
- Eligibility checker, project search (phase sau)
