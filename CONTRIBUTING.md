# Contributing to KeySprout

Thanks for your interest in contributing! KeySprout is a typing curriculum app for K-5 students, and we welcome bug reports, feature ideas, documentation improvements, and code contributions.

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork** the repository and clone your fork locally
2. **Install dependencies**: `npm install`
3. **Set up the database**: copy `.env.example` to `.env` and fill in `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TEACHER_ACCESS_CODE`, `ADMIN_PASSWORD`
4. **Push the schema**: `npx prisma db push`
5. **Seed the curriculum** (destructive — clears all data): visit `/admin` and click "Seed Database", or call `seedDatabase()` from `lib/seed-db.ts`
6. **Run the dev server**: `npm run dev`

See `README.md` for a non-technical setup walkthrough and `CODEBASE.md` for an architectural overview.

## Branching

- Create a branch off `main` named after the change: `fix/lesson-progress-bar`, `feat/spelling-game`, `docs/contributing-guide`
- Keep branches focused — one feature or fix per branch
- Rebase onto the latest `main` before opening a PR

## Commits

- Write clear, present-tense commit subjects ("Add letter-hunt scoring" not "Added scoring")
- Keep the subject under 70 characters
- Use the body to explain **why**, not what (the diff already shows what)
- One logical change per commit when practical

## Code Style

### Design tokens — never use raw Tailwind colors

KeySprout has a warm cream design system. Always use the design tokens defined in `tailwind.config.ts`:

- `paper`, `paper-dark`, `ink`
- `coral`, `sunny`, `mint`, `sky`, `grape`, `berry`

**Never** use `slate-*`, `gray-*`, `emerald-*`, `amber-*`, or any other raw Tailwind scale. Use the utility classes `.kq-card`, `.kq-btn`, `.kq-chip` for consistent borders and shadows.

For section colors (used in lesson lists, progress charts, etc.), use `sectionColor(index)` from `lib/section-colors.ts`.

### Server vs. client components

- `page.tsx` files are server components — fetch data here
- Interactive pieces live in `*Client.tsx` files marked `'use client'`
- Don't fetch data inside client components; pass it down as props from the server page

### Comment schema

KeySprout uses a three-tier comment convention. Apply each tier where it fits — and nowhere else.

1. **JSDoc on every exported function in `lib/`.** One-sentence summary, then any non-obvious return-value behavior (e.g. "returns 1.0 when total is 0").
2. **Props comments on shared components.** For each prop in a `*Props` interface that isn't self-explanatory from its name and type, write a one-line `/** ... */` block above it.
3. **Inline `//` comments** only for non-obvious algorithmic or implementation choices — invariants, workarounds, or anything that would surprise a careful reader. Do not narrate what the code obviously does.

If a comment would just restate the code, delete it.

## Pull Requests

- Open a PR against `main` once the branch is ready for review
- Fill out the PR template — checklist matters
- Link any related issues with "Closes #123" in the PR body
- Keep PRs small. A 200-line PR gets a thorough review; a 2,000-line one gets a rubber stamp
- Be ready to iterate — review comments are not personal

### Before opening a PR

- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

CI runs the same three checks (lint, test, build) on every PR and push to `main`.
- [ ] Manually test the change in the browser (golden path + one edge case)
- [ ] No raw Tailwind color scales added
- [ ] No real student PII (names, emails, photos) committed in fixtures or tests
- [ ] New `lib/` exports have JSDoc
- [ ] New shared components have props comments

## Reporting Bugs

Use the **Bug Report** issue template. Include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser + OS
- Whether you're a student, teacher, or admin in the app

## Suggesting Features

Use the **Feature Request** issue template. Describe the problem first, then your proposed solution. Features that align with the K-5 audience and the privacy-first design will be prioritized.

## Privacy

KeySprout is built for children. Be paranoid about PII:

- Never log or commit a real Google `sub`, email, or display name
- Never add a third-party analytics SDK without a maintainer's explicit go-ahead
- See the privacy audit table in `CODEBASE.md` for what data is stored where

## Logging

Server-side code uses `pino` via `lib/logger.ts`. Route handlers should create a child logger bound to the request ID:

```ts
import { requestLogger } from '@/lib/logger'

export async function POST(req: Request) {
  const log = requestLogger(req.headers.get('x-request-id') ?? 'unknown')
  log.info({ lessonId }, 'lesson completed')
  log.error({ err }, 'something failed')
}
```

Rules:
- **Never log PII** — no real names, email addresses, Google `sub` values, or raw request bodies that may contain credentials.
- Internal UUIDs (`user.id`, `lesson.id`) are safe — they are opaque without database access.
- Use `log.warn` for rejected or suspicious requests (failed auth, bad input).
- Use `log.error({ err }, 'message')` for caught exceptions — pass the error object as `err` so pino serializes the stack trace.

In development, output is colorized and human-readable. In production, each line is a JSON object you can pipe to any log aggregator.

## Running tests

```bash
npm test              # run all tests once
npm run test:watch    # re-run on file changes
npm run test:coverage # generate coverage report (output in coverage/)
```

Tests live in `tests/`. Coverage is scoped to `lib/` with an 80% line/function and 70% branch threshold — CI fails if a PR drops below. The `coverage/` directory is gitignored; the HTML report is uploaded as a CI artifact on every run, downloadable from the Actions tab.

## Questions

Open a discussion or email **malakaidmj@gmail.com**.
