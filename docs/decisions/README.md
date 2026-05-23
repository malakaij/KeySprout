# Architectural Decision Records

Short records of architectural and product decisions worth remembering. Each ADR captures the context, the decision, and the rationale — so future contributors (and Claude) don't re-litigate settled choices.

## Format

One file per decision: `NNNN-short-slug.md`. Numbering is sequential and never reused. Each ADR has these sections:

- **Status** — accepted, superseded, deprecated
- **Context** — what prompted the decision
- **Decision** — what we chose
- **Consequences** — what this means in practice

When a decision is reversed, mark the old ADR as superseded and write a new one.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](0001-pseudonymous-nicknames.md) | Pseudonymous animal nicknames, no real names stored | Accepted |
| [0002](0002-remove-sentry.md) | Remove Sentry until launch | Accepted |
| [0003](0003-prisma-migrate-not-db-push.md) | Use Prisma `migrate`, forbid `db push` | Accepted |
| [0004](0004-tailwind-v4-no-config-file.md) | Tailwind v4 with `@theme` in CSS, no config file | Accepted |
| [0005](0005-eslint-9-not-10.md) | Stay on ESLint 9 until `eslint-config-next` supports 10 | Accepted |
| [0006](0006-no-third-party-analytics.md) | No third-party analytics SDKs | Accepted |
| [0007](0007-admin-auth-hmac-cookie.md) | Admin auth uses HMAC cookie, not NextAuth | Accepted |
| [0008](0008-student-names-browser-only.md) | Student names stored in teacher's browser only, never on the server | Accepted |
| [0009](0009-accessibility-by-default.md) | Accessibility features are on by default unless a competing need exists | Accepted |
