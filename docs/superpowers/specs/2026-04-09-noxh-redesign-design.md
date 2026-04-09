# NOXH Redesign — Design Spec

**Date:** 2026-04-09  
**Status:** Approved  
**Scope:** Full UI redesign — color tokens, typography, layout, all core components

---

## 1. Design Direction

Adopt the **LearnHub / Educational Platform** visual language:

- **Style:** Neo-brutalism lite — white cards with thick dark borders + offset shadows, no box-shadow blur
- **Background:** Warm cream, not pure white
- **Accent:** Vivid green (replacing current indigo)
- **Typography:** Plus Jakarta Sans — very bold headings, clean body
- **Vibe:** Confident, readable, modern — not corporate, not playful-childish

Reference: LearnHub demo screenshot provided by user (warm cream bg, dark 2px borders, green CTA, bold headings, offset card shadows).

---

## 2. Design Tokens (`app/globals.css`)

### Color Palette

| Token                    | Value     | Usage                           |
| ------------------------ | --------- | ------------------------------- |
| `--background`           | `#FAF6EE` | Page background (warm cream)    |
| `--foreground`           | `#1A1A1A` | Primary text                    |
| `--card`                 | `#FFFFFF` | Card background                 |
| `--card-foreground`      | `#1A1A1A` | Card text                       |
| `--primary`              | `#16A34A` | Buttons, active states, accents |
| `--primary-foreground`   | `#FFFFFF` | Text on primary                 |
| `--secondary`            | `#DCFCE7` | Light green tint backgrounds    |
| `--secondary-foreground` | `#15803D` | Text on secondary               |
| `--muted`                | `#F4F4F5` | Meta tags, subtle backgrounds   |
| `--muted-foreground`     | `#71717A` | Secondary text, labels          |
| `--border`               | `#1A1A1A` | Card borders, input borders     |
| `--input`                | `#FAF6EE` | Input background                |
| `--ring`                 | `#16A34A` | Focus ring                      |
| `--success`              | `#16A34A` | Eligible badge                  |
| `--warning`              | `#EAB308` | Upcoming / warning badge        |
| `--destructive`          | `#DC2626` | Ineligible badge                |
| `--radius`               | `10px`    | Base border radius              |

Brand scale tokens (`--brand-*`) removed — replaced by semantic green tokens above.

Dark mode: **not in scope** for this redesign.

### Typography

| Token            | Value                 |
| ---------------- | --------------------- |
| `--font-heading` | `'Plus Jakarta Sans'` |
| `--font-sans`    | `'Plus Jakarta Sans'` |

Load via Google Fonts in `app/layout.tsx` with weights 400, 500, 600, 700, 800, 900.

---

## 3. Layout (`app/page.tsx`)

### Structure

```
<main>
  <nav>          — sticky top bar
  <hero>         — headline + stats strip
  <div.body>
    <aside>      — form panel (sticky, left)
    <section>    — results panel (right)
```

### Nav (`<nav>`)

- Height: 60px, `border-bottom: 2px solid #1A1A1A`, background `#FAF6EE`
- Left: icon (green rounded square) + "Nhà Ở Xã Hội" bold text
- Right: project count badge (green pill with green border)
- `position: sticky; top: 0; z-index: 10`

### Hero

- Below nav, `border-bottom: 2px solid var(--border)`
- Announce badge: green pill with dot — shows last updated date
- `<h1>` large bold (800+), with `<span>` in green for "nhà ở xã hội"
- Sub-copy: 1–2 lines, muted color
- Stats row: 3 numbers (total projects, open, provinces)
- No gradient — background stays `#FAF6EE`

### Body — 2-column grid

- `grid-template-columns: 300px 1fr`
- Form panel: `border-right: 2px solid var(--border)`, white bg, `padding: 24px`
- Results panel: cream bg, `padding: 24px`
- Form panel: `position: sticky; top: 60px` (below nav height)
- On mobile (`< 768px`): stack vertically, form on top, results below

---

## 4. UserForm Component (`components/user-form.tsx`)

Visual changes only — logic and state unchanged.

| Element             | Old                                 | New                                                                                                      |
| ------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Section label       | uppercase muted                     | uppercase green (#16A34A)                                                                                |
| Input background    | `bg-muted/40`                       | `#FAF6EE`                                                                                                |
| Input border        | `border` (light)                    | `2px solid #1A1A1A`                                                                                      |
| Input border-radius | default                             | `10px`                                                                                                   |
| Radio items         | standard radios                     | Pill buttons: 2-option groups → side-by-side (`flex gap-2`); 3+ options → stacked (each pill full-width) |
| Active radio pill   | —                                   | `bg-[#16A34A] text-white border-[#16A34A] shadow-[2px_2px_0_#1A1A1A]`                                    |
| Submit button       | indigo filled                       | Green filled, `border: 2px solid #1A1A1A`, `box-shadow: 3px 3px 0 #1A1A1A`                               |
| Helper text         | muted-sm                            | `text-[#71717A] text-xs` (unchanged)                                                                     |
| Checkbox            | standard                            | Standard checkbox, unchanged logic                                                                       |
| Outer wrapper       | `bg-muted/40 rounded-xl border p-5` | Remove wrapper — form sits directly in the white panel                                                   |

---

## 5. ProjectCard Component (`components/project-card.tsx`)

| Element                        | Old                                               | New                                                                                            |
| ------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Card container                 | `border rounded-xl` with soft shadow              | `border-2 border-[#1A1A1A] rounded-[14px] bg-white shadow-[3px_3px_0_#1A1A1A]`                 |
| Ineligible card                | `opacity-75`                                      | `opacity-55 border-[#D4D4D8] shadow-[2px_2px_0_#D4D4D8]`                                       |
| Card hover                     | opacity transition                                | `translate-x-[-2px] translate-y-[-2px] shadow-[5px_5px_0_#1A1A1A]`                             |
| Project name                   | `text-sm font-semibold`                           | `text-sm font-extrabold text-[#1A1A1A]`                                                        |
| Location line                  | muted xs                                          | muted xs (unchanged)                                                                           |
| Meta tags (area, price, units) | emoji + muted text inline                         | Pill tags: `bg-[#F4F4F5] border border-[#E4E4E7] rounded-md px-2 py-0.5 text-xs font-semibold` |
| Status badge                   | `rounded-md px-2.5 py-1.5` colored                | Same shape, add `border-[1.5px]` matching color family                                         |
| Eligibility badge              | shadcn Badge                                      | Pill: `rounded-full border-[1.5px]` — green/yellow/red/neutral                                 |
| Tag (e.g. "HB")                | `bg-primary text-primary-foreground rounded-full` | Same pill style, green                                                                         |
| Ineligible reasons             | muted 11px                                        | `text-[#71717A] text-[11px]` (unchanged)                                                       |
| Emoji icons                    | keep                                              | keep (📐 💰 🏠 📅)                                                                             |

### Badge colors

| Status                                                   | Background | Text      | Border    |
| -------------------------------------------------------- | ---------- | --------- | --------- |
| eligible                                                 | `#DCFCE7`  | `#15803D` | `#16A34A` |
| wrong_province / wrong_category                          | `#FEF9C3`  | `#854D0E` | `#EAB308` |
| income_exceeded / housing_ineligible / previously_bought | `#FEE2E2`  | `#991B1B` | `#DC2626` |
| restricted                                               | `#F4F4F5`  | `#52525B` | `#D4D4D8` |

---

## 6. ProjectList Component (`components/project-list.tsx`)

- Results header: label uppercase muted + chip badges (green/red pill with border)
- Skeleton loading: use `border-2 border-[#1A1A1A]` style cards
- Empty state: green rounded-square icon box (`border-2 border-[#16A34A] shadow-[3px_3px_0_#1A1A1A]`) + bold title + muted sub

---

## 7. Files Changed

| File                          | Change                                                           |
| ----------------------------- | ---------------------------------------------------------------- |
| `app/globals.css`             | Replace all color tokens, add Google Fonts import, update radius |
| `app/layout.tsx`              | Load Plus Jakarta Sans, update font-family metadata              |
| `app/page.tsx`                | Add nav + hero sections, update body grid layout                 |
| `components/user-form.tsx`    | Visual: radio pills, input styling, button styling               |
| `components/project-card.tsx` | Card border, shadow, badge styles                                |
| `components/project-list.tsx` | Header chips, skeleton, empty state                              |
| `components/ui/badge.tsx`     | Update variant styles (success/warning/destructive/secondary)    |
| `components/ui/button.tsx`    | Update primary style to green + offset shadow                    |

No changes to: hooks, types, lib, data fetching, form logic, eligibility logic.

---

## 8. Constraints

- Keep all existing TypeScript interfaces and prop shapes
- No new dependencies — use existing Tailwind + shadcn
- shadcn component internals: only update CSS/className, not component logic
- Mobile: form stacks above results (existing behavior preserved)
- Scrollbar hide utility in globals.css: keep as-is
