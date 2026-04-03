# Design System

Private Dance Manager follows a SaaS-inspired design system.

Inspired by: Linear, Stripe dashboard, Notion UI.

---

## Color palette

### Brand / Actions
| Token | Value | Usage |
|---|---|---|
| Button primary bg | `#0b132b` | Primary buttons, active nav links |
| Button primary hover | `#1a2540` | Hover state on primary buttons |
| Accent | `#4f46e5` | Action links, progress fills (future) |

### Neutral
| Token | Value | Usage |
|---|---|---|
| Text primary | `#111827` | Headings, body text, table cells |
| Text secondary | `#6b7280` | Subtitles, labels, empty states |
| Text muted | `#9ca3af` | Placeholders |
| Border default | `#e5e7eb` | Cards, table rows, input borders |
| Border hover | `#9ca3af` | Input/select hover |
| Border focus | `#0f172a` | Input/select focus ring |
| Background page | `#f7f8fa` | Body background |
| Background card | `#ffffff` | Cards, tables, form inputs |
| Background subtle | `#f9fafb` | Table headers, input on hover |
| Background hover | `#f3f4f6` | Row hover, sidebar nav hover |

### Status colors
| Token | Value | Usage |
|---|---|---|
| Success | `#22c55e` | Paid, Active, Confirmed badges |
| Warning | `#f59e0b` | Pending, Expiring soon badges |
| Danger | `#ef4444` | Overdue, Canceled badges |
| Danger text | `#b91c1c` | Form field errors |
| Danger bg | `#fef2f2` | Form error alert background |
| Danger border | `#fecaca` | Form error alert border |
| Info | `#4f46e5` | Info/neutral badges |
| Purple | `#8b5cf6` | Special badges (e.g. "Next" lesson) |

---

## Typography

| Role | Size | Weight | Color |
|---|---|---|---|
| Page title (form) | `clamp(2rem, 3vw, 2.6rem)` | 800 | `#0f172a` |
| Page title (list) | default `<h1>` | 700 | `#111827` |
| Section title | `1rem` | 700 | `#111827` |
| Eyebrow | `0.85rem`, uppercase, +letter-spacing | 700 | `#6b7280` |
| Subtitle | `0.98rem` | 400 | `#6b7280` |
| Body | `0.95rem` | 400 | `#111827` |
| Table head | `0.82–0.95rem`, uppercase | 700 | `#111827` / `#6b7280` |
| Label (form field) | `0.95rem` | 700 | `#111827` |
| Helper / error | `0.88rem` | 400 | `#6b7280` / `#b91c1c` |
| Badge | `0.78rem` | 600 | variant-dependent |

---

## Spacing & Layout

| Token | Value |
|---|---|
| Page content gap | `1.5rem` |
| Card padding | `2rem` (mobile: `1.25rem`) |
| Form grid gap | `1.1rem 1rem` |
| Section padding | `1.5rem` |
| Component gap (buttons) | `0.5–0.75rem` |

---

## Border radius

| Token | Value | Usage |
|---|---|---|
| Pill | `999px` | All buttons (Button component) |
| Card | `24px` (mobile: `18px`) | Form cards, main cards |
| Input / Select | `14px` | All form fields |
| Table wrapper | `1rem` | List page tables |
| Badge | `999px` | Status badges |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| Card shadow | `0 10px 30px rgba(15,23,42,0.06)` | Form cards |
| Button primary shadow | `0 4px 12px rgba(11,19,43,0.15)` | Primary buttons |
| Button danger shadow | `0 4px 12px rgba(220,38,38,0.18)` | Danger buttons |
| Input focus ring | `0 0 0 4px rgba(15,23,42,0.08)` | Focused inputs |

---

## Components

### Button (`src/components/ui/Button.tsx`)

| Prop | Values | Default |
|---|---|---|
| `variant` | `primary` · `secondary` · `danger` | `primary` |
| `size` | `sm` · `md` | `md` |
| `href` | string | — (renders as `<Link>` when set) |
| `isPending` | boolean | — (disables + shows `pendingLabel`) |

**Usage guidelines:**
- `size="md"` — submit buttons at the bottom of forms (main CTA)
- `size="sm"` — contextual actions in page headers, quick actions, inline flows
- `variant="secondary"` — navigation alternatives (e.g. Previous/Next in calendar, Edit)
- `variant="danger"` — destructive actions (delete, cancel)

### FormCard (`src/components/ui/FormCard.tsx`)
Wraps create/edit forms. Provides the page container, white card, and header (eyebrow / title / subtitle).

### FormField (`src/components/ui/FormField.tsx`)
Wraps a label + input/select/textarea + optional error message. Accepts `fullWidth` for 2-column grid spanning.
Owns all shared `input`, `select`, `textarea` hover/focus styles.

### StatusBadge (`src/components/ui/StatusBadge.tsx`)
Renders a colored badge from a status string. Uses `getLabel()` and `getBadgeVariant()` from `src/lib/labels.ts`.

### Cards
White background, `1px solid #e5e7eb` border, `24px` radius, subtle box-shadow.
Used for form pages (via FormCard) and detail pages.

### Tables
Inside a white wrapper with `1rem` radius and border. Head cells have `#f9fafb` background and uppercase labels. Rows separated by `#f3f4f6` bottom borders.

---

## Responsive breakpoints

| Breakpoint | Width | Change |
|---|---|---|
| Mobile | `≤ 640px` | Single-column layouts, stacked headers |
| Tablet | `≤ 760px` | Form grids collapse to 1 column, button full-width |
| Tablet wide | `≤ 860px` | Calendar: 2 columns |
| Desktop | `≥ 1200px` | Calendar: 7 columns |
