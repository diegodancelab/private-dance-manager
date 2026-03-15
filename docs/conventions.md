# Conventions

This document defines the coding, structure, and collaboration conventions used in the **Private Dance Manager** project.

The goal is to ensure the project remains **maintainable, readable, and scalable** as new features are added.

---

# 1. Git Commit Conventions

This project follows a **conventional commit style**.

Format:

```
type: short description
```

Examples:

```
feat: add lesson editing from calendar
fix: resolve prisma client error in client component
refactor: extract reusable form component
docs: add architecture documentation
style: improve lesson table layout
chore: update dependencies
```

Commit types used in this project:

| Type     | Purpose                                   |
| -------- | ----------------------------------------- |
| feat     | New feature                               |
| fix      | Bug fix                                   |
| refactor | Code restructuring without feature change |
| docs     | Documentation updates                     |
| style    | UI / CSS improvements                     |
| chore    | Maintenance tasks                         |

---

# 2. Naming Conventions

## Files

React components use **PascalCase**

Examples:

```
LessonForm.tsx
StudentTable.tsx
CalendarGrid.tsx
```

Utility files use **camelCase**

Examples:

```
formatDate.ts
calculateLessonPrice.ts
```

---

## CSS Modules

CSS module files follow this pattern:

```
ComponentName.module.css
```

Example:

```
LessonForm.module.css
StudentsTable.module.css
```

---

# 3. Folder Structure

The project follows a **feature-oriented structure**.

Example:

```
src
 ├ app
 │ ├ calendar
 │ ├ students
 │ ├ lessons
 │ ├ payments
 │ └ charges
 │
 ├ components
 │ ├ forms
 │ ├ tables
 │ └ ui
 │
 ├ lib
 │ ├ prisma
 │ ├ utils
 │ └ validations
 │
 └ styles
```

---

# 4. Component Guidelines

Components should be:

* small
* reusable
* easy to test
* easy to understand

Avoid large monolithic components.

Preferred structure:

```
Component.tsx
Component.module.css
```

---

# 5. Styling Conventions

This project uses:

* **CSS Modules**
* **global design tokens**
* a shared **design system**

Rules:

* avoid inline styles
* avoid duplicating CSS across components
* use shared classes when possible
* follow the project design system

Documentation:

```
docs/design-system.md
```

---

# 6. Server / Client Separation

Next.js App Router rules:

* Prisma calls must **only run in server components or server actions**
* Client components must **never directly access Prisma**

Example:

Correct:

```
Server Component
  -> calls prisma
  -> passes data to client component
```

Incorrect:

```
Client component calling prisma
```

---

# 7. Form Handling

Forms should follow this pattern:

* validation handled server-side
* reusable form components when possible
* consistent layout across all forms

Create / Edit pages should share common components.

---

# 8. Future Conventions

As the project evolves, this document may include:

* testing conventions
* API conventions
* CI/CD guidelines
* deployment practices
