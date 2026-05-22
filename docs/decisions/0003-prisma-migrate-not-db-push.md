# ADR-0003: Use Prisma `migrate`, forbid `db push`

**Status:** Accepted (Sprint 5)

## Context

Through Sprint 4, schema changes used `prisma db push`, which syncs `schema.prisma` to the database without producing a version-controlled migration. `db push` is convenient but silently destructive on certain changes (column type narrowing, NOT NULL additions without defaults) and provides no rollback or audit trail. The production Vercel database was created this way.

## Decision

Adopt `prisma migrate` as the only schema-change workflow. Every change to `schema.prisma` ships with a SQL migration in `prisma/migrations/`. The `db:push` npm script was removed entirely to prevent accidental use. Production builds run `prisma migrate deploy` automatically as part of `npm run build`.

The existing production database was baselined by manually creating `_prisma_migrations` and marking `0_init` as applied — see `prisma/migrations/README.md`.

## Consequences

- Schema changes now require an extra step (`npm run db:migrate -- --name short_desc`) and a code-review pass on the generated SQL.
- Rollback is possible via `prisma migrate resolve --rolled-back`.
- Failed production migrations are recoverable per the procedure in `prisma/migrations/README.md`.
- **Never use `db push` against any database** — local, staging, or production. If a script or doc suggests it, that's a bug to fix.
- New developers run `npm run db:migrate:deploy` instead of `db:push` to set up a local database from scratch.
