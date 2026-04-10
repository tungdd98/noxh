# Project Listing Redesign — Design Spec

**Date:** 2026-04-10  
**Status:** Approved

---

## Overview

Cập nhật toàn bộ luồng danh sách dự án nhà ở xã hội: schema dữ liệu mới, fetch tất cả 1 lần rồi phân trang FE, card gọn hơn, modal chi tiết thay cho link trực tiếp, và pagination đồng bộ với design system.

---

## 1. Data Structure

### Type `Project` (`types/noxh.ts`)

Xoá toàn bộ type cũ. Type mới theo schema `data.json`:

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
```

### Supabase `DbRow` mapping

Các cột snake_case trong DB map sang camelCase:

| DB column    | Project field |
| ------------ | ------------- |
| `apply_time` | `applyTime`   |
| `image_url`  | `imageUrl`    |
| `scraped_at` | `scrapedAt`   |
| Còn lại      | Giữ nguyên    |

### Helper: parse tổng số căn

```ts
function parseTotalUnits(scale: string | null): number | null {
  // Match tất cả số đứng trước " căn" (bao gồm cả căn thương mại)
  const matches = scale?.match(/(\d+)\s+căn/g) ?? [];
  const total = matches.reduce((sum, m) => sum + parseInt(m), 0);
  return total > 0 ? total : null;
}
```

Hàm này đặt trong `lib/project-utils.ts` để dùng chung.

---

## 2. Data Fetching

### `useProjects` hook (refactor)

Bỏ tham số `page`. Fetch toàn bộ danh sách 1 lần khi mount:

```ts
export function useProjects(): {
  projects: Project[];
  loading: boolean;
  error: string | null;
};
```

- Query: `.select('*').order('id')` — không dùng `.range()`
- Không còn trả về `totalCount` (tính từ `projects.length` bên ngoài)

### Phân trang FE (`page.tsx`)

```ts
const PAGE_SIZE = 10;
const [currentPage, setCurrentPage] = useState(1);
const { projects, loading, error } = useProjects();

const totalCount = projects.length;
const totalPages = Math.ceil(totalCount / PAGE_SIZE);
const pagedProjects = projects.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
);
```

`pagedProjects` và `totalCount` truyền xuống `ProjectList` như hiện tại.

---

## 3. Pagination Style (`components/ui/pagination.tsx`)

Cập nhật thẳng component gốc để đồng bộ design system (border-2, shadow offset, bold font):

- **Trang hiện tại** (`isActive`): `bg-primary text-primary-foreground border-2 border-border shadow-[2px_2px_0_var(--border)] font-extrabold`
- **Trang khác**: `bg-card border-2 border-border font-bold hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--border)] transition-all`
- **Prev/Next button**: `border-2 border-border bg-card font-bold` — disabled thì `opacity-50 pointer-events-none`
- **Ellipsis**: Giữ nguyên

---

## 4. ProjectCard (giao diện mới)

File: `components/project-card.tsx`

Thay `<a>` bằng `<button>` vì click mở modal. Nhận thêm prop `onClick: () => void`.

**Layout:**

```
┌─────────┬────────────────────────────────────┐
│         │ Tên dự án (title)                  │
│  Ảnh   │ 📍 Địa chỉ (address)               │
│         │ 🏠 Số căn (parseTotalUnits(scale)) │
│         │ 🏢 Nhà đầu tư (owner)              │
│         │ 📅 Thời gian thu hồ sơ (applyTime) │
│         │                    [badge: status] │
└─────────┴────────────────────────────────────┘
```

Props:

```ts
type Props = {
  project: Project;
  onClick: () => void;
};
```

---

## 5. ProjectDetail Modal

File mới: `components/project-detail-modal.tsx`

Dùng `Dialog` component có sẵn.

Props:

```ts
type Props = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
```

**Layout modal:**

- **Header**: Ảnh dự án (aspect-video, full width) + tên dự án + badge trạng thái
- **Body**: Grid 2 cột các trường thông tin:
  - Giá bán (`price`)
  - Bàn giao (`handover`)
  - Địa chỉ (`address`)
  - Nhà đầu tư (`owner`)
  - Thời gian thu hồ sơ (`applyTime`)
  - Quy mô (`scale`)
  - Diện tích khu đất (`area`)
  - Mật độ xây dựng (`density`)
  - Phí bảo trì (`maintenance`)
- **Footer**: Button "Xem bài viết" → `url`, `target="_blank"`, `rel="noopener noreferrer"`

---

## 6. State Management (ProjectList)

`ProjectList` giữ `selectedProject: Project | null` state.

```ts
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
```

- `ProjectCard` nhận `onClick={() => setSelectedProject(project)}`
- `ProjectDetailModal` render 1 lần trong `ProjectList`, nhận `project={selectedProject}` và `open={selectedProject !== null}`

---

## Files bị ảnh hưởng

| File                                  | Thay đổi                                                  |
| ------------------------------------- | --------------------------------------------------------- |
| `types/noxh.ts`                       | Xoá type cũ, thêm type mới                                |
| `lib/project-utils.ts`                | Tạo mới — chứa `parseTotalUnits`                          |
| `hooks/use-projects.ts`               | Bỏ `page` param, fetch all, bỏ `totalCount`               |
| `components/ui/pagination.tsx`        | Cập nhật style theo design system                         |
| `components/project-card.tsx`         | Thay `<a>` → `<button>`, cập nhật fields hiển thị         |
| `components/project-detail-modal.tsx` | Tạo mới                                                   |
| `components/project-list.tsx`         | Thêm modal state, dùng `ProjectDetailModal`               |
| `app/page.tsx`                        | Chuyển phân trang logic lên đây, bỏ `page` param cho hook |
