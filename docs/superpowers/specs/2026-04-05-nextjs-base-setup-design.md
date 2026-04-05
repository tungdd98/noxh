# Design Spec: Next.js Base Project Setup

**Date:** 2026-04-05
**Project:** finance-tracker (personal finance tracker)
**Scope:** Frontend base setup only — backend (Supabase) will be configured separately

---

## Overview

Khởi tạo project Next.js từ đầu theo phương án manual từng bước, đảm bảo hiểu rõ từng tool được cấu hình.

---

## 1. Khởi tạo Project

```bash
npx create-next-app@latest finance-tracker
```

**Lựa chọn khi setup:**

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Turbopack: Yes
- Import alias: `@/*`

---

## 2. Cấu trúc thư mục

```
finance-tracker/
├── app/                  # App Router pages & layouts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/           # Shared UI components
│   └── ui/               # shadcn/ui components (auto-generated)
├── lib/                  # Utilities, helpers
│   └── utils.ts
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── public/
├── .husky/               # Git hooks
├── .prettierrc
├── eslint.config.mjs
├── commitlint.config.js
└── ...config files
```

---

## 3. Tool Stack & Versions

| Package                         | Version | Mục đích                      |
| ------------------------------- | ------- | ----------------------------- |
| Next.js                         | 15.x    | Framework                     |
| React                           | 19.x    | UI library                    |
| Tailwind CSS                    | 4.x     | Styling                       |
| shadcn/ui                       | latest  | Component library             |
| TypeScript                      | 5.x     | Type safety                   |
| Prettier                        | 3.x     | Code formatting               |
| prettier-plugin-tailwindcss     | latest  | Auto-sort Tailwind classes    |
| Husky                           | 9.x     | Git hooks                     |
| lint-staged                     | 15.x    | Run linters on staged files   |
| commitlint                      | 19.x    | Enforce commit message format |
| @commitlint/config-conventional | 19.x    | Conventional Commits ruleset  |

---

## 4. Các tool và cấu hình

### 4.1 shadcn/ui

```bash
npx shadcn@latest init
```

- Style: `New York`
- Base color: `Neutral`
- CSS variables: Yes

### 4.2 Prettier

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

File `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 4.3 ESLint

Đã có sẵn từ `create-next-app`. Thêm `eslint-config-prettier` để tránh conflict với Prettier:

```bash
npm install -D eslint-config-prettier
```

### 4.4 Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

Pre-commit hook (`.husky/pre-commit`):

```bash
npx lint-staged
```

Cấu hình `lint-staged` trong `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### 4.5 Commitlint

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

File `commitlint.config.js`:

```js
export default {
  extends: ['@commitlint/config-conventional'],
};
```

Commit-msg hook (`.husky/commit-msg`):

```bash
npx --no -- commitlint --edit $1
```

---

## 5. Commit Flow

```
git commit
  → husky: pre-commit
    → lint-staged: prettier + eslint trên staged files
  → husky: commit-msg
    → commitlint: validate commit message
  → ✅ commit thành công
```

---

## 6. Commit Convention (Conventional Commits)

| Type        | Mục đích                |
| ----------- | ----------------------- |
| `feat:`     | Tính năng mới           |
| `fix:`      | Sửa bug                 |
| `chore:`    | Maintenance, config     |
| `docs:`     | Tài liệu                |
| `style:`    | Format, không đổi logic |
| `refactor:` | Refactor code           |

---

## 7. Out of Scope (giai đoạn này)

- Supabase / backend integration
- Authentication
- Routing cụ thể cho các tính năng
- State management
