# CLAUDE.md — Private Dance Manager

## Project Overview

**Private Dance Manager** is a fullstack SaaS-style web application for dance teachers to manage private lessons, students, payments, expenses, and scheduling.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js (App Router), React, TypeScript |
| Backend     | Next.js Server Actions            |
| ORM         | Prisma                            |
| Database    | PostgreSQL                        |
| Styling     | CSS Modules + Global design tokens |
| Deployment  | Vercel                            |
| CI/CD       | GitHub Actions                    |
| Dev Env     | Docker Compose                    |

---

## Project Structure

```
src/
 ├── app/
 │   ├── calendar/       # Scheduling feature
 │   ├── students/       # Student management
 │   ├── lessons/        # Lesson management
 │   ├── packages/       # Hour bundle management
 │   ├── payments/       # Payment tracking
 │   └── charges/        # Charge management
 ├── components/
 │   ├── forms/          # Reusable form components
 │   ├── tables/         # Reusable table components
 │   └── ui/             # Generic UI components
 ├── lib/
 │   ├── prisma/         # Prisma client setup
 │   ├── utils/          # Utility functions
 │   └── validations/    # Server-side validation logic
 └── styles/             # Global styles and design tokens

prisma/
 ├── schema.prisma       # Database schema
 ├── migrations/         # Migration history
 └── seed.ts             # Seed script

docs/
 ├── architecture.md
 ├── conventions.md
 └── design-system.md
```

---

## Database Models

Key Prisma models:

- **User** — roles: `ADMIN`, `TEACHER`, `STUDENT`
- **Lesson** — types: `PRIVATE`, `DUO`, `GROUP`, `ONLINE`
- **LessonParticipant** — booking status per participant
- **Package** — hour bundles sold to students — statuses: `ACTIVE`, `EXHAUSTED`, `EXPIRED`, `CANCELED`
- **PackageUsage** — records minutes consumed per `LessonParticipant`
- **Charge** — types: `LESSON`, `PACKAGE`, `ADJUSTMENT`, `OTHER` — statuses: `PENDING`, `PARTIALLY_PAID`, `PAID`, `CANCELED`
- **Payment** — methods: `CASH`, `TWINT`, `BANK_TRANSFER`, `CARD`, `OTHER`
- **PaymentAllocation** — links payments to charges (many-to-many)
- **ProgressEntry** — tracks student progress over time

Default currency: **CHF**

---

## Architecture Rules

### Server / Client Separation (CRITICAL)

```
✅ Correct:
  Server Component → Prisma query → passes data to Client Component

❌ Wrong:
  Client Component → Prisma query (NEVER do this)
```

Prisma must **only** be used in Server Components or Server Actions.

### Data Flow Pattern

```
User submits form
    ↓
Server Action (validation + Prisma)
    ↓
Database update
    ↓
Page refresh / UI update
```

---

## Coding Conventions

### File Naming

| Type              | Convention   | Example                    |
|-------------------|--------------|----------------------------|
| React components  | PascalCase   | `LessonForm.tsx`           |
| Utility functions | camelCase    | `formatDate.ts`            |
| CSS Modules       | PascalCase   | `LessonForm.module.css`    |

### Component Guidelines

- Keep components **small and focused**
- Always pair `Component.tsx` with `Component.module.css`
- Prefer reusable components over duplication
- No inline styles — always use CSS Modules or shared design tokens

### Form Handling

- Validation is **server-side** (in Server Actions)
- Create/Edit pages should share common form components
- Use `useActionState` for form state management in Client Components

---

## Design System

Inspired by Linear, Stripe, and Notion.

| Token              | Value       |
|--------------------|-------------|
| Primary            | `#4f46e5`   |
| Primary hover      | `#4338ca`   |
| Background         | `#f6f8fb`   |
| Card background    | `#ffffff`   |
| Border             | `#e5e7eb`   |
| Text primary       | `#111827`   |
| Text secondary     | `#6b7280`   |

Key components: Cards, Tables, Buttons (Primary / Secondary / Danger), Badges for statuses.

---

## Git Commit Convention

```
type: short description
```

| Type       | Purpose                              |
|------------|--------------------------------------|
| `feat`     | New feature                          |
| `fix`      | Bug fix                              |
| `refactor` | Code change without feature addition |
| `docs`     | Documentation update                 |
| `style`    | UI/CSS improvement                   |
| `chore`    | Maintenance task                     |

---

## Planned Evolutions

- Authentication system
- Multi-user / multi-teacher support
- Subscription billing
- REST API endpoints
- Full CI/CD pipeline
- Containerized production deployment

## Business logic validation

When modifying:
- packages
- lessons
- charges
- payments
- student summary

Claude MUST:
- read docs/business-logic-test-scenarios.md
- verify invariants
- detect missing validations
- flag critical risks before implementation
