# Architecture

This document describes the architecture of **Private Dance Manager**.

The project is designed as a **modern SaaS-style web application** built with Next.js.

---

# 1. Overview

Private Dance Manager is a management tool for dance teachers to handle:

* private lessons
* students
* payments
* expenses
* scheduling

The architecture focuses on:

* simplicity
* maintainability
* scalability

---

# 2. Technology Stack

Frontend & Backend:

* Next.js (App Router)
* React
* TypeScript

Database:

* PostgreSQL
* Prisma ORM

Styling:

* CSS Modules
* Global design tokens

Future improvements may include:

* authentication
* subscription system
* multi-user SaaS support

---

# 3. High Level Architecture

The application follows a **fullstack Next.js architecture**.

```
Browser
   │
   ▼
Next.js App Router
   │
   ├ Server Components
   ├ Client Components
   └ Server Actions
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL Database
```

---

# 4. Application Structure

Main folders:

```
src/app
```

Contains the application routes.

Example:

```
calendar
students
lessons
payments
charges
```

Each folder represents a **feature domain**.

---

# 5. Data Layer

Database access is handled using **Prisma**.

Responsibilities:

* database schema
* type-safe queries
* migrations

Typical pattern:

```
Server Component
   → fetch data using Prisma
   → pass data to UI components
```

Prisma must **never be used in client components**.

---

# 6. UI Layer

The UI layer is built with React components.

Structure:

```
components
  ├ forms
  ├ tables
  └ ui
```

The goal is to extract **reusable UI components**.

Examples:

* StudentTable
* LessonForm
* PaymentTable

---

# 7. Styling Strategy

Styling uses a combination of:

* CSS Modules
* global design tokens
* reusable UI classes

The visual system is documented in:

```
docs/design-system.md
```

---

# 8. Data Flow

Typical data flow example:

Create lesson:

```
User submits form
    ↓
Server Action
    ↓
Prisma query
    ↓
Database update
    ↓
Page refresh / UI update
```

---

# 9. Future Architecture Evolution

Planned improvements:

* authentication system
* multi-user support
* subscription billing
* API endpoints
* CI/CD pipeline
* containerized deployment

These changes will move the project toward a **production-ready SaaS architecture**.

---

# 10. Design Philosophy

The architecture aims to remain:

* simple
* modular
* predictable
* easy to extend

Each feature should remain **isolated and maintainable**.
