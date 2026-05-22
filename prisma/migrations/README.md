# Database migrations

Every change to `prisma/schema.prisma` ships with a SQL migration in this directory. Migrations are applied in lexical order by `prisma migrate deploy`, which runs automatically as part of `npm run build` on production deploys.

## For new developers

Follow the setup in [`README.md`](../../README.md). The short version: `npm run db:migrate:deploy` creates all tables from scratch by running every migration in order.

## For schema changes

See the *Schema changes — always create a migration* section in [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

## One-time baseline for the production database

The production database (Vercel deploy) was created with `prisma db push` before this migration system existed. It has all the tables but no `_prisma_migrations` history table, so `prisma migrate deploy` would fail thinking the schema is empty when it isn't.

This needs to be done **once**, before merging Sprint 5 to main:

```bash
# Connect to the production DATABASE_URL locally
export DATABASE_URL="<production connection string>"

# Mark the initial migration as already applied without running it
npx prisma migrate resolve --applied 0_init
```

Verify it worked:

```bash
npx prisma migrate status
```

You should see: `Database schema is up to date!` with `0_init` listed as applied.

After this baseline runs once, every subsequent deploy will run `prisma migrate deploy` and apply new migrations cleanly.

## What to do if a migration fails on production

`prisma migrate deploy` is idempotent — it only applies migrations that haven't run yet. If a deploy fails partway through a migration:

1. Don't panic — the failed migration is recorded in `_prisma_migrations` with a `finished_at` of `NULL`
2. Diagnose the SQL error from the deploy logs
3. Either fix the migration's SQL and run `prisma migrate resolve --rolled-back <name>` to retry, **or** if the migration partially succeeded, hand-finish the schema and run `prisma migrate resolve --applied <name>`
4. Trigger another deploy
