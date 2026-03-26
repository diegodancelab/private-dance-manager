# 🩰 Private Dance Manager

> Platform for managing private dance lessons, student progress, and learning resources.

A fullstack SaaS-style web application built for dance teachers to handle lessons, students, payments, charges, and scheduling — all in one place.

---

## Tech Stack

| Category    | Technology                              |
|-------------|-----------------------------------------|
| Framework   | [Next.js 16](https://nextjs.org/) (App Router) |
| Language    | TypeScript                              |
| Database    | PostgreSQL 16                           |
| ORM         | Prisma 7                                |
| Styling     | CSS Modules + Design Tokens             |
| Deployment  | [Vercel](https://vercel.com/)           |
| CI/CD       | GitHub Actions                          |
| Dev Env     | Docker Compose                          |

---

## Features

- 📅 **Calendar** — Schedule and visualize upcoming lessons
- 🎓 **Students** — Manage student profiles and progress
- 📖 **Lessons** — Create and track private, duo, group, or online lessons
- 📦 **Packages** — Sell hour bundles to students and track consumption per lesson
- 💳 **Payments** — Record payments (cash, Twint, bank transfer, card)
- 🧾 **Charges** — Issue charges and track payment status per student

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) & Docker Compose
- [npm](https://www.npmjs.com/)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/private-dance-manager.git
cd private-dance-manager
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:PORT/DB_NAME

POSTGRES_DB=private_dance_manager
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. (Optional) Seed the database

```bash
npx prisma db seed
```

### 7. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start the development server         |
| `npm run build`   | Build for production                 |
| `npm run start`   | Start the production server          |
| `npm run lint`    | Run ESLint                           |

### Prisma

| Command                        | Description                          |
|--------------------------------|--------------------------------------|
| `npx prisma migrate dev`       | Run migrations in development        |
| `npx prisma db seed`           | Seed the database                    |
| `npx prisma studio`            | Open Prisma Studio (visual DB editor)|
| `npx prisma generate`          | Regenerate Prisma client             |

---

## Project Structure

```
src/
 ├── app/
 │   ├── calendar/       # Scheduling
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
 │   ├── prisma/         # Prisma client
 │   ├── utils/          # Utility functions
 │   └── validations/    # Server-side validation
 └── styles/             # Global styles & design tokens

prisma/
 ├── schema.prisma       # Database schema
 ├── migrations/         # Migration history
 └── seed.ts             # Seed script

docs/
 ├── architecture.md     # Architecture overview
 ├── conventions.md      # Coding conventions
 └── design-system.md   # Design system reference
```

---

## Documentation

- [Architecture](./docs/architecture.md)
- [Conventions](./docs/conventions.md)
- [Design System](./docs/design-system.md)

---

## Roadmap

- [ ] Authentication system
- [ ] Multi-teacher support
- [ ] Subscription billing
- [ ] REST API endpoints
- [ ] CI/CD pipeline improvements
- [ ] Containerized production deployment