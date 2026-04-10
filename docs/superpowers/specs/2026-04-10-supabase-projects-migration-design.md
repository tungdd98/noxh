# Design: Migrate projects.json → Supabase

**Date:** 2026-04-10  
**Status:** Approved

## Overview

Chuyển dữ liệu dự án NOXH từ file tĩnh `public/data/projects.json` sang Supabase database. Dữ liệu criteria (`public/data/criteria.json`) giữ nguyên dạng JSON.

## Architecture

### Approach

Client-side Supabase client, giữ nguyên pattern `useEffect` trong `hooks/use-projects.ts`. Không thay đổi UI, types, hay criteria fetch.

### Components

| File                                        | Thay đổi                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| `lib/supabase.ts`                           | Tạo mới — browser client singleton                      |
| `hooks/use-projects.ts`                     | Thay `fetch('/data/projects.json')` bằng Supabase query |
| Supabase: table `projects`                  | Tạo mới — schema + seed 6 rows + RLS                    |
| `public/data/projects.json`                 | Giữ nguyên (không xóa, dùng làm reference)              |
| `public/data/criteria.json`                 | Không thay đổi                                          |
| `app/page.tsx`, `types/noxh.ts`, toàn bộ UI | Không thay đổi                                          |

## Supabase Table Schema

Table name: `projects`

| Column             | Type        | Nullable |
| ------------------ | ----------- | -------- |
| `id`               | int4 (PK)   | No       |
| `name`             | text        | No       |
| `investor`         | text        | No       |
| `district`         | text        | No       |
| `provinceId`       | text        | No       |
| `province`         | text        | No       |
| `price`            | float8      | Yes      |
| `minArea`          | int4        | Yes      |
| `maxArea`          | int4        | Yes      |
| `minPrice`         | int4        | Yes      |
| `maxPrice`         | int4        | Yes      |
| `totalUnits`       | int4        | No       |
| `status`           | text        | No       |
| `statusType`       | text        | No       |
| `handover`         | text        | No       |
| `priority`         | text        | No       |
| `targetCategories` | text[]      | No       |
| `incomeLimit`      | int4        | No       |
| `restricted`       | bool        | No       |
| `quality`          | text        | No       |
| `notes`            | text        | No       |
| `score`            | int4        | No       |
| `highlight`        | bool        | No       |
| `tag`              | text        | Yes      |
| `updatedAt`        | timestamptz | No       |

Column names giữ camelCase để khớp trực tiếp với `Project` type — không cần mapping.

## Row Level Security

- `anon` role: SELECT only (public read)
- Không có INSERT/UPDATE/DELETE từ client

## Data Flow

```
useProjects hook (client)
  ├── fetch('/data/criteria.json')   → Criteria (unchanged)
  └── supabase.from('projects')
        .select('*')
        .order('score', { ascending: false })
      → Project[]
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Error Handling

Giữ nguyên: bất kỳ lỗi nào (criteria hoặc projects) đều set `error` state và `loading = false`. UI hiển thị thông báo lỗi.

## Out of Scope

- Auth / protected routes
- Admin CRUD UI
- Criteria migration sang Supabase
- Server Components / API routes
