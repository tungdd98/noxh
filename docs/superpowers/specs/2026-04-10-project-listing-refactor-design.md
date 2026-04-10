# Design: Project Listing Refactor

**Date:** 2026-04-10  
**Scope:** Đơn giản hoá app — bỏ eligibility, đổi DB schema theo data.json, thêm phân trang DB

---

## 1. Mục tiêu

Chuyển app từ "kiểm tra điều kiện mua NOXH" sang "danh sách dự án NOXH" đơn giản. Form nhập thông tin người dùng được giữ lại để phát triển tiếp sau. Ưu tiên hiển thị dữ liệu đúng trước.

---

## 2. Database

### Schema mới (Supabase)

Drop bảng `projects` cũ, tạo lại:

```sql
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

### Seed data

Viết script Node.js (`scripts/seed.ts`) đọc `data.json` tại root → insert vào Supabase bằng `service_role` key. Chạy một lần.

---

## 3. Types

File `types/noxh.ts` — xóa toàn bộ, chỉ giữ lại:

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

`Criteria`, `EligibilityStatus`, `ProjectResult` bị xóa.

---

## 4. Data Fetching

### `hooks/use-projects.ts`

Nhận `page: number`, trả về `{ projects, totalCount, loading, error }`:

- `page_size = 10`
- Dùng Supabase `.select('*', { count: 'exact' }).range(from, to)`
- `from = (page - 1) * 10`, `to = page * 10 - 1`

Không fetch `criteria.json` nữa.

---

## 5. Components

### `ProjectCard` — layout nằm ngang

```
┌──────────────────────────────────────────────┐
│ [Ảnh]  │ Title (bold)                        │
│  120px │ address (muted)                      │
│        │                                      │
│        │ [capacity icon] [owner icon]         │
│        │                          [Status]   │
└──────────────────────────────────────────────┘
```

- Ảnh: `w-[120px] h-[90px] object-cover rounded-l-[12px]`, fallback placeholder màu `bg-muted` nếu `imageUrl` null
- Cả card là `<a href={url} target="_blank" rel="noopener noreferrer">`
- `status`: badge text thuần từ DB (không map sang enum)
- Style: `border-2 border-border shadow-[3px_3px_0_var(--border)] rounded-[14px]`

### `ProjectList` — bỏ eligibility

- Header: `{totalCount} dự án`
- Render 10 `ProjectCard`
- Render `<Pagination>` shadcn ở cuối (chỉ khi `totalPages > 1`)

### `page.tsx`

- `currentPage` state (default: 1)
- `useProjects(currentPage)` → `{ projects, totalCount, loading, error }`
- Bỏ: `useEligibility`, `submittedInfo`, `resultsRef`, `openCount`, `provinceCount`, `updatedAt`
- Sidebar: giữ nguyên `UserForm` (chưa kết nối logic, dành cho phát triển sau)
- `onSubmit` của UserForm → no-op tạm thời (`() => {}`)
- Supabase trả về column `image_url` (snake_case) → cần dùng `.select()` với alias hoặc cấu hình Supabase client `db.schema` để tự convert sang camelCase. Nếu không, map thủ công trong hook.

---

## 6. Code bị xóa

| File                        | Lý do                          |
| --------------------------- | ------------------------------ |
| `hooks/use-eligibility.ts`  | Bỏ tính năng eligibility check |
| `lib/eligibility.ts`        | Bỏ tính năng eligibility check |
| `lib/eligibility.test.ts`   | Test cho code đã xóa           |
| `public/data/criteria.json` | Không fetch nữa (nếu tồn tại)  |

Types bị xóa: `Criteria`, `EligibilityStatus`, `ProjectResult`.

---

## 7. Pagination

Dùng component `Pagination` từ shadcn/ui (Radix):

- `page_size = 10`
- `totalPages = Math.ceil(totalCount / 10)`
- Chỉ hiện nếu `totalPages > 1`
- Khi chuyển trang: scroll lên đầu section kết quả
