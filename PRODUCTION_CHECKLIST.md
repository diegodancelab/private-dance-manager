# Production Checklist — Private Dance Manager

Operational reference for deploying, maintaining, and recovering the production environment.

---

## 1. What to back up

The **PostgreSQL database** is the only stateful asset. Everything else (code, config) is in git or Vercel.

| Data | Location | Back up? |
|------|----------|----------|
| All app data (students, lessons, payments, packages, charges) | PostgreSQL database | **Yes — critical** |
| Sessions | PostgreSQL (`Session` table) | No — sessions are ephemeral |
| Source code | Git repository | No — already versioned |
| Environment variables | Vercel dashboard | No — stored in Vercel |
| Prisma migrations | Git repository (`prisma/migrations/`) | No — already versioned |

---

## 2. Database backup

### Manual backup (pg_dump)

```bash
pg_dump "<DATABASE_URL>" \
  --format=custom \
  --no-acl \
  --no-owner \
  --file="backup_$(date +%Y%m%d_%H%M%S).dump"
```

Restore from a dump:

```bash
pg_restore \
  --dbname="<DATABASE_URL>" \
  --no-acl \
  --no-owner \
  --clean \
  backup_YYYYMMDD_HHMMSS.dump
```

> `--format=custom` produces a compressed binary dump. Use `--format=plain` for a readable SQL file instead.

### Minimum backup schedule for personal prod

| Trigger | Action |
|---------|--------|
| **Before every deploy that includes a migration** | Manual `pg_dump` — mandatory |
| **Weekly** | Manual or automated `pg_dump` |
| **After entering significant data** | Manual `pg_dump` |

### Where to store backups

- Local machine (minimum)
- Cloud storage bucket (recommended): S3, Backblaze B2, or any object storage
- Keep at least the **last 3 backups**

### If using a managed PostgreSQL provider

| Provider | Built-in backups |
|----------|-----------------|
| Vercel Postgres (Neon) | Daily automated backups, point-in-time recovery on paid plans |
| Supabase | Daily backups on free tier, PITR on Pro |
| Railway | Daily backups on paid plans |
| Render | Daily backups on paid plans |

Check your provider's backup policy. Even with automatic backups, **always do a manual dump before a migration**.

---

## 3. Pre-deploy checklist

Run through this before pushing to `prod`.

### Schema changes (when a migration exists)

- [ ] Backup the production database: `pg_dump "<PROD_DATABASE_URL>" --format=custom --file="pre_deploy_$(date +%Y%m%d).dump"`
- [ ] Review the migration SQL in `prisma/migrations/<latest>/migration.sql`
- [ ] Verify the migration is additive (new tables, new nullable columns) — destructive changes require extra care
- [ ] Check migration status against prod: `DATABASE_URL=<PROD_URL> npm run migrate:status`
- [ ] Deploy — `prisma migrate deploy` runs automatically as part of `npm run build`

### Every deploy

- [ ] Test the feature locally with `npm run dev`
- [ ] Run `npm run build` locally to catch TypeScript or build errors before pushing
- [ ] Push to `preprod` first, verify manually
- [ ] Push to `prod` once `preprod` is validated

---

## 4. Post-deploy verification

After each production deploy, verify:

- [ ] App loads at the production URL (no 500 error)
- [ ] Login works with production credentials
- [ ] At least one critical path works (e.g., create a lesson, view students)
- [ ] Vercel function logs show no errors (Vercel dashboard → Functions tab)

---

## 5. First production setup (one-time)

Sequence for a fresh production database:

```bash
# 1. Apply all migrations
DATABASE_URL=<prod-db-url> npm run migrate:prod

# 2. Create the teacher account
DATABASE_URL=<prod-db-url> \
BOOTSTRAP_EMAIL=you@example.com \
BOOTSTRAP_PASSWORD=<strong-password> \
BOOTSTRAP_FIRST_NAME=Diego \
BOOTSTRAP_LAST_NAME=Poli \
npm run bootstrap:prod

# 3. Deploy the app (Vercel will run migrate + build automatically)
git push origin prod
```

---

## 6. Diagnosing a production issue

### Step 1 — Check Vercel logs

Vercel dashboard → Project → **Functions** tab → filter by date/time of incident.

Server Actions run as serverless functions. Errors appear here with stack traces.

### Step 2 — Common error patterns

| Symptom | Likely cause |
|---------|-------------|
| 500 on all pages | Build deployed with schema mismatch — check if migration ran |
| Login fails for valid credentials | `isActive` is false, or `passwordHash` is null in DB |
| "Student not found" on lesson creation | Student does not belong to this teacher (`createdByTeacherId` mismatch) |
| Package minutes inconsistent | Concurrent usage — check `PackageUsage` records in DB |
| Prisma error `P1001` | Database unreachable — check `DATABASE_URL` and DB provider status |
| Prisma error `P3006` | Migration failed — check migration SQL manually |

### Step 3 — Inspect the database directly

Use Prisma Studio against the production database (read-only inspection):

```bash
DATABASE_URL=<prod-db-url> npx prisma studio
```

> Prisma Studio runs locally and connects to the remote DB. Do not modify data through Studio unless you know exactly what you are doing.

### Step 4 — Roll back a bad deploy

Vercel supports instant rollback to any previous deployment:

Vercel dashboard → Project → **Deployments** → find the last good deploy → **Promote to Production**.

> Rolling back the app does **not** roll back the database. If the bad deploy included a migration, you must restore from backup manually.

---

## 7. Keeping the database clean

Sessions expire after 30 days but are not automatically deleted from the `Session` table. For a personal prod with low traffic, this is not critical, but can be cleaned up periodically:

```sql
DELETE FROM "Session" WHERE "expiresAt" < NOW();
```

Run via Prisma Studio or any PostgreSQL client.

---

## 8. Environment variables reference

| Variable | Required | Where to set |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Vercel dashboard (per environment) |
| `NODE_ENV` | Auto | Set to `production` by Vercel automatically |

Variables used only for local CLI commands (never set on Vercel):

| Variable | Used by |
|----------|---------|
| `BOOTSTRAP_EMAIL` | `npm run bootstrap:prod` |
| `BOOTSTRAP_PASSWORD` | `npm run bootstrap:prod` |
| `BOOTSTRAP_FIRST_NAME` | `npm run bootstrap:prod` |
| `BOOTSTRAP_LAST_NAME` | `npm run bootstrap:prod` |
| `BOOTSTRAP_PHONE` | `npm run bootstrap:prod` |
| `POSTGRES_*` | Docker Compose (local dev only) |
