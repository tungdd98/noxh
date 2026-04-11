# NOXH Scoring Engine — Design Spec

**Date:** 2026-04-11  
**Status:** Approved

---

## Mục tiêu

Biến website danh sách NOXH thành công cụ đánh giá cá nhân hóa: người dùng nhập thông tin cá nhân + tài chính + vị trí làm việc, hệ thống tự động xếp hạng các dự án theo độ phù hợp với người đó cụ thể. Người dùng cũng có thể tùy chỉnh trọng số từng tiêu chí.

---

## Kiến trúc tổng thể

### Luồng hoạt động

1. Người dùng điền form (thông tin cá nhân + địa chỉ nơi làm việc + vốn tự có)
2. Nhấn "Tìm dự án phù hợp" → client gọi `POST /api/geocode` với địa chỉ nơi làm việc
3. Route Handler gọi Google Maps Geocoding API phía server → trả `{ lat, lng }`
4. `useScoredProjects` hook nhận tọa độ + thông tin người dùng + trọng số tiêu chí
5. Fetch dự án từ Supabase (đã có `lat/lng` sẵn trong DB)
6. Tính điểm từng tiêu chí cho từng dự án bằng Haversine + logic tài chính/urgency/đối tượng
7. Sort descending → render danh sách xếp hạng

### Các thành phần mới

| Thành phần            | Loại          | Mô tả                                           |
| --------------------- | ------------- | ----------------------------------------------- |
| `POST /api/geocode`   | Route Handler | Proxy Google Maps Geocoding API, bảo vệ API key |
| `useScoredProjects()` | Hook          | Scoring engine phía client                      |
| `lib/scoring.ts`      | Utility       | Hàm tính điểm thuần túy, dễ test                |
| `lib/haversine.ts`    | Utility       | Tính khoảng cách giữa 2 tọa độ                  |
| Script geocode DB     | Script        | Chạy một lần để điền lat/lng cho dự án hiện có  |

---

## Database

### Migration

```sql
ALTER TABLE projects ADD COLUMN lat FLOAT;
ALTER TABLE projects ADD COLUMN lng FLOAT;
ALTER TABLE projects ADD COLUMN investor_tier TEXT;
-- investor_tier values: 'state' | 'experienced' | 'new'
```

### Script geocoding một lần

Chạy script `scripts/geocode-projects.ts` để điền `lat/lng` cho tất cả dự án hiện có trong DB dựa trên trường `address`. Dùng Google Maps Geocoding API phía server.

---

## Types

### Mở rộng `Project`

```ts
export type Project = {
  // fields hiện có giữ nguyên
  lat: number | null;
  lng: number | null;
  investorTier: 'state' | 'experienced' | 'new' | null;
};
```

### Mở rộng `UserInfo`

```ts
export type UserInfo = {
  income: number;
  savings: number; // vốn tự có
  workAddress: string; // địa chỉ nơi làm việc (để geocode)
  maritalStatus: 'single' | 'married';
  category: string;
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
  // provinceId: bỏ — mặc định Hà Nội
};
```

### Types mới

```ts
export type CriteriaWeights = {
  finance: 'high' | 'medium' | 'low' | 'off';
  location: 'high' | 'medium' | 'low' | 'off';
  urgency: 'high' | 'medium' | 'low' | 'off';
  investorReputation: 'high' | 'medium' | 'low' | 'off';
  // eligible: không có weight — luôn bắt buộc, không tắt được
};

export type ScoreBreakdown = {
  finance: number | null; // 0–100
  location: number | null; // 0–100
  urgency: number | null; // 0–100
  investorReputation: number | null; // 0–100
  eligible: boolean; // false → tag "Không đủ điều kiện"
};

export type ScoredProject = Project & {
  totalScore: number; // 0–100
  scoreBreakdown: ScoreBreakdown;
  distanceKm: number | null;
};
```

---

## Scoring Engine (`lib/scoring.ts`)

### Thang điểm từng tiêu chí

**Tài chính (0–100)**

- Giá tổng căn ≤ vốn tự có → 100đ
- Giá tổng > vốn tự có nhưng (giá - vốn) / thu_nhập ≤ 100 tháng → tuyến tính từ 99 xuống 20đ
- Giá chưa công bố → null (không tính)
- Vượt quá khả năng vay → 0đ

**Vị trí (0–100)** — dùng Haversine

- ≤ 5km → 100đ
- ≤ 10km → 70đ
- ≤ 15km → 50đ
- ≤ 20km → 30đ
- > 20km → 10đ
- Dự án chưa có tọa độ → null (không tính)

**Urgency (0–100)**

- `status` chứa từ khóa đang nhận hồ sơ → 100đ
- Sắp mở trong Q tiếp theo → 60đ
- Chưa chốt lịch → 20đ
- Quá hạn → 0đ

**Uy tín CĐT (0–100)**

- `investor_tier = 'state'` → 100đ
- `investor_tier = 'experienced'` → 70đ
- `investor_tier = 'new'` → 30đ
- null → 50đ (mặc định trung bình)

**Đối tượng (eligible: boolean)**

- Không tính vào điểm số
- Nếu `false`: project vẫn hiển thị, bị đẩy xuống cuối list, có tag đỏ "Không đủ điều kiện"
- Logic: so khớp `category` người dùng với `priority` của dự án

### Công thức tổng

```
weightMap = { high: 3, medium: 2, low: 1, off: 0 }

score = Σ(điểm_i × weight_i) / Σ(weight_i) cho các tiêu chí có điểm ≠ null và weight ≠ off
```

### Sắp xếp

1. Dự án `eligible = true` trước, `eligible = false` sau
2. Trong mỗi nhóm: sort theo `totalScore` giảm dần

---

## UI

### UserForm mở rộng

```
─── Thông tin của bạn ───
[Hôn nhân: Độc thân / Đã kết hôn]
[Thu nhập hàng tháng: ___]
[Vốn tự có: ___]                    ← MỚI
[Địa chỉ nơi làm việc: text input]  ← MỚI
[Đối tượng: dropdown]
[Tình trạng nhà ở: radio]
[Đã từng mua NOXH: checkbox]

─── Tiêu chí đánh giá ─── (accordion)  ← MỚI
  ✅ Tài chính         [Cao ▾]
  ✅ Vị trí            [Cao ▾]
  ✅ Urgency           [TB  ▾]
  ✅ Uy tín CĐT        [TB  ▾]
  🔒 Đối tượng        (bắt buộc, không tắt)

[Tìm dự án phù hợp →]
```

### ProjectCard mở rộng

- Score badge tròn góc trên phải card: số điểm + màu (xanh ≥70, vàng ≥40, đỏ <40)
- Dòng khoảng cách: "📍 6.2km từ nơi làm việc"
- Dòng tài chính: "💰 1.3–2.0 tỷ • trong ngân sách" hoặc "⚠️ vượt ngân sách"
- Tag đỏ "Không đủ điều kiện" nếu `eligible = false`

### Modal chi tiết (mở rộng)

Thêm section "Điểm phù hợp với bạn" với 4 progress bar:

```
Tài chính      ████████░░  82/100
Vị trí         ██████░░░░  60/100
Urgency        ██████████  100/100
Uy tín CĐT     ████████░░  80/100
```

---

## Route Handler

### `POST /api/geocode`

**Request:**

```json
{ "address": "123 Xuân Đỉnh, Bắc Từ Liêm, Hà Nội" }
```

**Response:**

```json
{ "lat": 21.0678, "lng": 105.8012 }
```

**Error:**

```json
{ "error": "Không tìm thấy địa chỉ" }
```

- API key đọc từ env `GOOGLE_MAPS_API_KEY` (server-only, không expose ra client)
- Không cache — mỗi lần submit form gọi lại (địa chỉ có thể thay đổi)

---

## Files cần tạo / sửa

| File                                  | Action                     |
| ------------------------------------- | -------------------------- |
| `app/api/geocode/route.ts`            | Tạo mới                    |
| `lib/scoring.ts`                      | Tạo mới                    |
| `lib/haversine.ts`                    | Tạo mới                    |
| `hooks/use-scored-projects.ts`        | Tạo mới                    |
| `scripts/geocode-projects.ts`         | Tạo mới                    |
| `types/noxh.ts`                       | Mở rộng                    |
| `components/user-form.tsx`            | Mở rộng                    |
| `components/project-card.tsx`         | Mở rộng                    |
| `components/project-detail-modal.tsx` | Mở rộng                    |
| `app/page.tsx`                        | Kết nối hook mới           |
| `.env.local`                          | Thêm `GOOGLE_MAPS_API_KEY` |

---

## Không thuộc scope này

- Cache geocoding kết quả nơi làm việc (để sau)
- Lưu profile người dùng / đăng nhập
- So sánh dự án side-by-side
- Thông báo khi dự án mở hồ sơ
