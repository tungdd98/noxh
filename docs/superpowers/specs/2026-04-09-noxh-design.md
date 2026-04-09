# Nhà Ở Xã Hội — Web App Design Spec

**Ngày:** 2026-04-09  
**Phiên bản luật áp dụng:** Nghị định 136/2026/NĐ-CP (hiệu lực 07/04/2026)

---

## Tổng quan

Web app public (không cần login) cho phép người dùng nhập thông tin cá nhân và tìm ra các dự án nhà ở xã hội (NOXH) phù hợp với điều kiện của họ theo quy định pháp luật hiện hành.

**Stack:** Next.js 16, Tailwind CSS, Radix UI (design system đã có sẵn)  
**Lưu trữ:** JSON tĩnh (criteria + projects), localStorage (thông tin người dùng)  
**Không có:** database, authentication, API backend riêng

---

## 1. Kiến trúc tổng thể

```
app/
├── page.tsx                  ← trang chính, chỉ lo render
└── globals.css

hooks/
├── use-eligibility.ts        ← toàn bộ logic kiểm tra điều kiện NOXH
└── use-projects.ts           ← load danh sách dự án từ JSON

public/data/
├── criteria.json             ← ngưỡng thu nhập, đối tượng hợp lệ (cập nhật khi luật đổi)
└── projects.json             ← danh sách dự án (n8n ghi vào đây)

components/
└── (dùng lại từ design system có sẵn: Button, Card, Badge, Select, CurrencyInput...)
```

### Luồng data

1. `page.tsx` render 2 cột: `<UserForm>` (trái) + `<ProjectList>` (phải)
2. User điền form → nhấn **"Kiểm tra điều kiện"**
3. `useEligibilityCheck(userInfo, projects)` chạy, gán trạng thái cho từng dự án
4. `<ProjectList>` render tất cả dự án với badge trạng thái
5. `userInfo` được lưu vào `localStorage` sau mỗi lần kiểm tra (tự động khôi phục khi quay lại)

### Điểm tích hợp n8n

n8n ghi đè `public/data/projects.json` theo lịch 6–8h/ngày. Frontend không cần thay đổi. `useProjects` dùng `fetch("/data/projects.json", { cache: "no-store" })` để luôn đọc dữ liệu mới nhất.

---

## 2. Cấu trúc dữ liệu JSON

### `public/data/criteria.json`

```json
{
  "version": "2026-04-07",
  "incomeLimit": {
    "single": 25000000,
    "married": 50000000
  },
  "eligibleCategories": [
    { "id": "officer", "label": "Cán bộ, công chức, viên chức" },
    { "id": "military", "label": "Sĩ quan, quân nhân chuyên nghiệp" },
    { "id": "worker", "label": "Công nhân, người lao động" },
    { "id": "poor", "label": "Hộ nghèo, cận nghèo đô thị" },
    { "id": "low_income", "label": "Người thu nhập thấp" },
    { "id": "contributor", "label": "Người có công với cách mạng" }
  ],
  "housingConditions": [
    { "id": "no_house", "label": "Chưa có nhà ở" },
    { "id": "small_house", "label": "Có nhà nhưng < 10m²/người" }
  ]
}
```

### `public/data/projects.json`

```json
[
  {
    "id": 1,
    "name": "NOXH Tân Lập",
    "investor": "Cty CP Đầu tư phát triển Ngôi sao Châu Á",
    "district": "Xã Ô Diên, Hoài Đức",
    "provinceId": "hanoi",
    "province": "Hà Nội",
    "price": 29,
    "minArea": 45,
    "maxArea": 70,
    "minPrice": 1305,
    "maxPrice": 2030,
    "totalUnits": 459,
    "status": "⚡ Nhận hồ sơ 1–15/5/2026",
    "statusType": "open",
    "handover": "Q4/2027",
    "priority": "Người thu nhập thấp đô thị, công nhân viên",
    "targetCategories": ["low_income", "worker"],
    "incomeLimit": 25000000,
    "restricted": false,
    "quality": "Tòa 21 tầng, 2 tầng hầm, nhiều căn nhất trong nhóm",
    "notes": "CẦN NỘP HỒ SƠ NGAY — còn ~3 tuần.",
    "score": 93,
    "highlight": true,
    "tag": "KHẨN",
    "updatedAt": "2026-04-09T08:00:00Z"
  }
]
```

**Ghi chú field:**

- `price`: triệu/m²
- `minPrice` / `maxPrice`: tổng giá căn, đơn vị triệu VNĐ
- `targetCategories`: array id từ `criteria.eligibleCategories`
- `incomeLimit`: ngưỡng thu nhập riêng của dự án (VNĐ/tháng), mặc định 25,000,000
- `restricted: true` = dự án dành riêng cho LLVT, công an, tái định cư — loại khỏi kết quả người dùng thường
- `score`: điểm tổng 0–100 để sắp xếp
- `statusType`: `"open"` | `"upcoming"` | `"pending"`

---

## 3. Eligibility Logic (`hooks/use-eligibility.ts`)

### Types

```ts
type UserInfo = {
  income: number; // thu nhập cá nhân (VNĐ/tháng)
  maritalStatus: 'single' | 'married';
  spouseIncome: number; // 0 nếu độc thân
  provinceId: string;
  category: string; // id từ eligibleCategories
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};

type EligibilityStatus =
  | 'eligible'
  | 'income_exceeded'
  | 'wrong_province'
  | 'wrong_category'
  | 'housing_ineligible'
  | 'previously_bought'
  | 'restricted';

type ProjectResult = Project & {
  eligibilityStatus: EligibilityStatus;
  ineligibleReasons: string[];
};
```

### Logic kiểm tra (theo thứ tự ưu tiên)

```
1. previouslyBought === true              → "previously_bought"
2. housingStatus không hợp lệ            → "housing_ineligible"
3. provinceId !== project.provinceId     → "wrong_province"
4. category ∉ project.targetCategories  → "wrong_category"
5. restricted === true                   → "restricted"
6. totalIncome > project.incomeLimit     → "income_exceeded"
   (totalIncome = income + spouseIncome nếu married, income nếu single)
7. Qua hết                               → "eligible"
```

Mỗi dự án có thể có nhiều lý do không đủ — tất cả được trả về trong `ineligibleReasons` để hiển thị badge/tooltip chi tiết.

### Sắp xếp kết quả

- Nhóm `eligible` lên đầu, sắp xếp theo `score` giảm dần
- Nhóm không đủ xếp phía dưới, sắp xếp theo `score` giảm dần

---

## 4. UI Layout

### Desktop (≥ 768px) — Split 2 cột

```
┌─────────────────────────────────────────────────────┐
│  Nhà Ở Xã Hội          Cập nhật 09/04 08:00  [6 dự án] │
├──────────────────────┬──────────────────────────────┤
│  Thông tin của bạn   │  Kết quả — 6 dự án           │
│  ──────────────────  │  [3 đủ ĐK] [3 không đủ]      │
│  Thu nhập            │                               │
│  Hôn nhân            │  ┌─ NOXH Tân Lập ──────────┐ │
│  Thu nhập vợ/chồng   │  │ ✓ Đủ điều kiện    [KHẨN] │ │
│  Tỉnh thành          │  │ Hoài Đức · 45–70m²       │ │
│  Đối tượng           │  │ 1.3–2 tỷ · 459 căn       │ │
│  Tình trạng nhà ở    │  └──────────────────────────┘ │
│  Đã mua NOXH chưa    │                               │
│                      │  ┌─ Bamboo Garden ──────────┐ │
│  [Kiểm tra →]        │  │ Không đúng tỉnh           │ │
│                      │  └──────────────────────────┘ │
└──────────────────────┴──────────────────────────────┘
```

- Cột trái: `width: 340px`, fixed
- Cột phải: flex-1, scrollable

### Mobile (< 768px) — Stack dọc

Form ở trên, nhấn "Kiểm tra" → tự scroll xuống phần kết quả.

### Project Card

Mỗi card hiển thị:

- Tên dự án + badge eligibility status (góc phải)
- Tag nếu có (KHẨN, TOP GIÁ...) — badge indigo góc trên phải
- Địa chỉ (district · province)
- Row thông tin: diện tích, giá, số căn, bàn giao
- Status bar ở dưới: màu xanh (open), vàng (upcoming), xám (pending)

Badge màu sắc:

- `eligible` → `variant="success"` — "Đủ điều kiện"
- `wrong_province` → `variant="warning"` — "Không đúng tỉnh"
- `income_exceeded` → `variant="destructive"` — "Thu nhập vượt mức"
- `wrong_category` → `variant="warning"` — "Không đúng đối tượng"
- `housing_ineligible` → `variant="destructive"` — "Không đủ ĐK nhà ở"
- `previously_bought` → `variant="destructive"` — "Đã từng mua NOXH"
- `restricted` → `variant="secondary"` — "Dự án giới hạn đối tượng"

---

## 5. n8n Integration

### Hiện tại

`useProjects` fetch file tĩnh:

```ts
const res = await fetch('/data/projects.json', { cache: 'no-store' });
```

### Sau này (n8n)

n8n workflow chạy 6–8h/ngày:

1. Scrape/fetch dữ liệu dự án từ nguồn (Sở Xây dựng, báo, v.v.)
2. Transform thành schema `projects.json`
3. Ghi đè `public/data/projects.json`

**Nếu deploy Vercel:** n8n trigger webhook → Vercel redeploy, hoặc dùng Next.js ISR với `revalidate: 3600`  
**Nếu deploy VPS:** n8n ghi file trực tiếp qua SSH/SCP, Next.js serve file mới ngay

`useProjects` được thiết kế để dễ swap: đổi URL từ `/data/projects.json` sang API endpoint mà không ảnh hưởng UI hay eligibility logic.

---

## 6. Thông tin người dùng — localStorage

Key: `noxh_user_info`  
Value: JSON của `UserInfo`

Tự động load khi trang khởi động để khôi phục form. Ghi lại mỗi khi user nhấn "Kiểm tra".

---

## Phạm vi ngoài scope

- Authentication / user accounts
- Lưu dự án yêu thích (có thể thêm sau với localStorage)
- So sánh dự án side-by-side
- Điều kiện cư trú (thường trú/tạm trú) — bỏ qua theo quyết định thiết kế
- Map hiển thị vị trí dự án
