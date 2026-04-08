# Design System — Finance Tracker

**Date:** 2026-04-08  
**Status:** Approved  
**Approach:** B — Design Tokens → shadcn/ui → CVA Finance Variants

---

## 1. Context & Goals

Web app quản lý tài chính cá nhân cho 2 người dùng (hoàng thượng + hoàng hậu), sử dụng 1 tài khoản đăng nhập chung. Mục tiêu xây dựng design system nhất quán, dễ mở rộng, phong cách **Stripe-inspired**: trắng sạch, shadow nhẹ, bo góc, màu sắc tinh tế.

**Yêu cầu phong cách:**

- Tông màu hợp mệnh: Kim (hoàng hậu) = trắng/bạc, Thủy (hoàng thượng) = navy/xanh đậm
- Kim sinh Thủy → accent purple-navy trên nền trắng, đúng chất Stripe
- Đơn giản, hiện đại — không sến, không sặc sỡ
- Hỗ trợ Light mode + Dark mode

---

## 2. Architecture — 3 Lớp

```
Layer 1: Design Tokens        app/globals.css
           ↓
Layer 2: UI Primitives        components/ui/       (shadcn/ui + Radix)
           ↓
Layer 3: Finance Components   components/finance/  (CVA variants)
```

**Nguyên tắc:** Component không bao giờ dùng màu cứng (hex). Mọi giá trị đều tham chiếu CSS variable từ Layer 1.

---

## 3. Color Token System

### Brand Scale (Stripe Purple)

| Token         | Value     | Dùng cho                                |
| ------------- | --------- | --------------------------------------- |
| `--brand-50`  | `#eeecff` | Hover tint, badge background            |
| `--brand-200` | `#c7c4ff` | Focus ring                              |
| `--brand-500` | `#635bff` | Primary button, link — màu Stripe chính |
| `--brand-600` | `#533afd` | Button `:hover`                         |
| `--brand-900` | `#0a2540` | Dark card, heading chính — Stripe navy  |

### Neutral Scale (Stripe Grey — blue-grey nhẹ)

| Token           | Value     |
| --------------- | --------- | ------------------------------------------------- |
| `--neutral-50`  | `#f6f9fb` |
| `--neutral-200` | `#e5edf5` |
| `--neutral-400` | `#aab4c1` |
| `--neutral-600` | `#667691` |
| `--neutral-700` | `#3f4b66` |
| `--neutral-900` | `#0a2540` | _(cùng giá trị brand-900, dùng cho text heading)_ |

### Semantic Colors (Finance-specific)

| Token             | Value     | Dùng cho                |
| ----------------- | --------- | ----------------------- |
| `--color-income`  | `#09825d` | Thu nhập                |
| `--color-expense` | `#df1b41` | Chi tiêu                |
| `--color-saving`  | `#635bff` | Tiết kiệm (reuse brand) |
| `--color-warning` | `#f5a623` | Cảnh báo vượt budget    |

### Semantic Aliases (dùng trong component)

**Light mode (`:root`):**

```css
--background: #ffffff --surface: #f6f9fb --foreground: #0a2540
  --muted-foreground: #667691 --border: #e5edf5 --input: #e5edf5
  --primary: #635bff --primary-foreground: #ffffff --ring: #c7c4ff
  --radius: 0.625rem;
```

**Dark mode (`.dark`):**

```css
--background: #0a2540 --surface: #0e2d4a --foreground: #e5edf5
  --muted-foreground: #aab4c1 --border: #1a3654 --input: #1a3654
  --primary: #7b73ff --primary-foreground: #ffffff --ring: #533afd;
```

---

## 4. Typography System

**Font family:** Inter (Google Fonts) — thay thế Geist hiện tại.

| Bậc     | Size | Weight | Letter-spacing | Dùng cho                       |
| ------- | ---- | ------ | -------------- | ------------------------------ |
| Display | 36px | 700    | -1px           | Số tiền lớn trên balance card  |
| H1      | 28px | 700    | -0.5px         | Tiêu đề trang                  |
| H2      | 22px | 600    | -0.3px         | Tiêu đề section                |
| H3      | 17px | 600    | -0.1px         | Tiêu đề card                   |
| Body    | 14px | 400    | 0              | Nội dung, danh sách giao dịch  |
| Caption | 12px | 400    | +0.1px         | Timestamp, chú thích           |
| Label   | 11px | 600    | +0.5px         | Nhãn cột, danh mục (uppercase) |

**Quy tắc số tiền:** Mọi giá trị tiền tệ dùng `font-variant-numeric: tabular-nums` để cột số thẳng hàng.

**Quy tắc chung:** Chỉ dùng weight 400 / 600 / 700. Không dùng weight 300. Không bold body text.

---

## 5. Component List

### Layer 2 — UI Primitives (`components/ui/` via shadcn CLI)

| Component    | Variants                                          | Ghi chú                                                |
| ------------ | ------------------------------------------------- | ------------------------------------------------------ |
| `Button`     | `primary` · `secondary` · `ghost` · `destructive` | 3 sizes: sm / md / lg                                  |
| `Input`      | default · error · disabled                        | Có currency variant với prefix ₫                       |
| `Select`     | —                                                 | Radix Select, dùng cho danh mục                        |
| `RadioGroup` | —                                                 | Chọn loại giao dịch                                    |
| `Checkbox`   | —                                                 | Có indeterminate state                                 |
| `Dialog`     | —                                                 | Form thêm/sửa giao dịch, confirm xoá                   |
| `Badge`      | `default` · `income` · `expense` · `saving`       | Finance variants qua CVA                               |
| `Card`       | `default` · `dark` · `stat`                       | Dark variant = nền `--brand-900`                       |
| `Toast`      | `success` · `error` · `warning`                   | Dùng Sonner (`npx shadcn add sonner`), auto-dismiss 4s |

### Layer 3 — Finance Components (`components/finance/`)

| Component          | Mô tả                                                         |
| ------------------ | ------------------------------------------------------------- |
| `TransactionBadge` | Wrap Badge với income/expense/saving logic                    |
| `BalanceCard`      | Card dark variant + Display typography + tabular-nums         |
| `AmountInput`      | Input + prefix ₫ + tabular-nums + số âm/dương tự động đổi màu |

---

## 6. File Structure

```
app/
└── globals.css              ← Design tokens (Layer 1)

components/
├── ui/                      ← shadcn generate (Layer 2)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── toast.tsx
│   ├── checkbox.tsx
│   └── radio-group.tsx
└── finance/                 ← Custom wrappers (Layer 3)
    ├── transaction-badge.tsx
    ├── balance-card.tsx
    └── amount-input.tsx
```

---

## 7. Build Order

1. **CSS Tokens** — Cập nhật `globals.css`: thay toàn bộ variables hiện tại bằng Stripe token system, thêm dark mode
2. **Inter Font** — Cài qua `next/font/google`, thay Geist trong `layout.tsx`
3. **shadcn add** — Chạy CLI thêm từng component: `button input select dialog badge card toast checkbox radio-group`
4. **Finance Variants** — Tạo `components/finance/`: TransactionBadge, BalanceCard, AmountInput
5. **Dark Mode** — Verify token dark mode hoạt động đúng, test toggle

---

## 8. Out of Scope

- Avatar component (app 1 tài khoản, không cần)
- Chart/Graph component (thuộc phase sau)
- Animation / micro-interaction (phase sau)
- Mobile responsive (sẽ xử lý khi build feature pages)
