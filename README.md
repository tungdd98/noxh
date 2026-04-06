# Finance Tracker

Ứng dụng theo dõi chi tiêu và thu nhập cá nhân, xây dựng với Next.js 16.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York style)
- **Language:** TypeScript 5
- **Code Quality:** Prettier, ESLint, Husky, lint-staged, Commitlint

## Getting Started

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## Commit Convention

Project dùng [Conventional Commits](https://www.conventionalcommits.org/):

| Type        | Mục đích                |
| ----------- | ----------------------- |
| `feat:`     | Tính năng mới           |
| `fix:`      | Sửa bug                 |
| `chore:`    | Maintenance, config     |
| `docs:`     | Tài liệu                |
| `style:`    | Format, không đổi logic |
| `refactor:` | Refactor code           |

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier format
npm run format:check # Prettier check
```
