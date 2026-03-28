#  Private Dance Manager

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

- **Calendar** — Schedule and visualize upcoming lessons
- **Students** — Manage student profiles and progress
- **Lessons** — Create and track private, duo, group, or online lessons
- **Packages** — Sell hour bundles to students and track consumption per lesson
- **Payments** — Record payments (cash, Twint, bank transfer, card)
- **Charges** — Issue charges and track payment status per student

---

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) & Docker Compose
- [npm](https://www.npmjs.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/private-dance-manager.git
cd private-dance-manager
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your local values (the defaults match the Docker Compose config):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/private_dance_manager

POSTGRES_DB=private_dance_manager
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
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

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Run database migrations

```bash
npx prisma migrate dev
```

### 7. (Optional) Seed the database

```bash
npx prisma db seed
```

### 8. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command           | Description                                       |
|-------------------|---------------------------------------------------|
| `npm run dev`     | Start the development server                      |
| `npm run build`   | Generate Prisma client, then build for production |
| `npm run start`   | Start the production server                       |
| `npm run lint`    | Run ESLint                                        |

### Prisma

| Command                        | Description                           |
|--------------------------------|---------------------------------------|
| `npx prisma generate`          | Regenerate Prisma client              |
| `npx prisma migrate dev`       | Run migrations in development         |
| `npx prisma migrate deploy`    | Apply pending migrations (production) |
| `npx prisma db seed`           | Seed the database                     |
| `npx prisma studio`            | Open Prisma Studio (visual DB editor) |

---

## Deployment Strategy

The project uses a **3-branch workflow** on Vercel:

| Branch    | Vercel Environment | Purpose                          |
|-----------|--------------------|----------------------------------|
| `prod`    | Production         | Live production app              |
| `preprod` | Preview (pinned)   | Staging / final validation       |
| `dev`     | Preview (pinned)   | Remote integration testing       |

Vercel automatically deploys on push to any of these branches. Each branch connects to its own dedicated PostgreSQL database.

### Environment variables per branch

Only `DATABASE_URL` differs between environments. The Docker Compose variables (`POSTGRES_*`) are for local development only and must **not** be set on Vercel.

| Variable        | `dev`                | `preprod`                | `prod`                |
|-----------------|----------------------|--------------------------|-----------------------|
| `DATABASE_URL`  | dev database URL     | preprod database URL     | prod database URL     |
| `POSTGRES_*`    | local only           | local only               | local only            |

---

## Vercel Setup

> **Assumption:** You have a Vercel account and the project is imported from GitHub.

### 1. Import the project

In the Vercel dashboard, import the repository. Vercel will auto-detect Next.js.

### 2. Set the production branch

In **Project Settings → Git → Production Branch**, set `prod` as the production branch.

### 3. Configure environment variables

In **Project Settings → Environment Variables**, add `DATABASE_URL` with a different value for each environment scope:

- **Production** (branch: `prod`) — your production PostgreSQL URL
- **Preview** — set a default preview value, then **override per branch**:
  - Branch `preprod` → preprod database URL
  - Branch `dev` → dev database URL

Vercel supports branch-specific overrides for preview environment variables. Use this to ensure `dev` and `preprod` never share a database.

### 4. Build command

The build command is already configured in `package.json`:

```
prisma generate && next build
```

Vercel uses `npm run build` by default, which runs this command. No additional Vercel configuration is required — `prisma generate` regenerates the Prisma client from the schema at build time (the generated output at `src/generated/prisma/` is gitignored and must be generated fresh on each deploy).

### 5. Run migrations on deploy

Vercel does **not** run migrations automatically. You must apply migrations manually before or after deploying a new schema change:

```bash
# Point to the target database via DATABASE_URL
DATABASE_URL=<target-db-url> npx prisma migrate deploy
```

Or use a Vercel deployment hook / GitHub Actions step to run `prisma migrate deploy` as part of your release process.

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
 │   ├── auth/           # Session-based authentication
 │   ├── prisma.ts       # Prisma client (uses PrismaPg driver adapter)
 │   └── utils/          # Utility functions
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

- [ ] Multi-teacher support
- [ ] Subscription billing
- [ ] REST API endpoints
- [ ] CI/CD pipeline (auto-migrate on deploy)
- [ ] Containerized production deployment
