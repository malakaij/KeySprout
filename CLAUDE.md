# CLAUDE.md

This file is loaded into Claude's context at the start of every session. It is the project's working memory: identity, hard constraints, settled decisions, and where we are right now. Update it when any of those change.

---

## What KeySprout is

A touch-typing curriculum web app for K–5 students. Self-hostable, open source, privacy-first. A student signs in with Google, gets a randomly assigned animal nickname (no real name stored), and works through 250 lessons across 5 sections with real-time WPM/accuracy tracking. Teachers create classrooms, approve students by nickname, and see per-student progress. The aesthetic is warm and kid-friendly — "KeyQuest" cream paper with bold ink shadows and a mascot called Pip.

Audience priority order: **students first, teachers second, self-hosters third.** When these conflict (e.g. a feature is great for teachers but distracting for students), default to the student.

---

## Hard constraints (do not violate without explicit approval)

- **No PII in storage, logs, or fixtures.** Never persist real names, email addresses, photos, or Google `sub` values. Internal UUIDs are fine — they're opaque without DB access. Nicknames are derived pseudonymously from the OAuth `sub`.
- **No third-party analytics SDKs** (Google Analytics, PostHog, Segment, etc.) without explicit maintainer approval. We serve minors.
- **No raw Tailwind color scales** (`slate-*`, `gray-*`, `emerald-*`, etc.). Use the design tokens defined in `app/globals.css` — `paper`, `paper-dark`, `ink`, `coral`, `sunny`, `mint`, `sky`, `grape`, `berry`. For section colors use `sectionColor(index)` from `lib/section-colors.ts`.
- **Schema changes require a Prisma migration.** Never run `prisma db push` against any real database. The `db:push` script was deliberately removed. Workflow: edit `schema.prisma` → `npm run db:migrate -- --name short_description` → review and commit the generated SQL.
- **Server components fetch data; client components don't.** Pages (`page.tsx`) are server components. Interactive pieces live in `*Client.tsx` files marked `'use client'` and receive data as props.
- **Every exported function in `lib/` gets a one-sentence JSDoc.** Every prop on a shared component that isn't self-explanatory gets a `/** ... */` comment. Inline `//` comments only for non-obvious algorithmic choices — never to narrate what the code already says.

---

## Current state (updated each sprint)

**As of Sprint 5:** Production-quality alpha. Core loop fully functional and deployed on Vercel. Infrastructure recently hardened — Prisma migrations now version-controlled, Next.js 15 + React 19 + ESLint 9 + Tailwind v4 all upgraded, CI on every PR.

**As of Sprint 8:** Security hardening merged. Super-admin renamed from Admin (`SUPER_ADMIN_USERNAME`/`SUPER_ADMIN_PASSWORD` env vars, bcrypt-hashed password, `timingSafeEqual` token comparison). CSRF Origin-header checking on all state-changing routes. Postgres-based rate limiting on lesson completions, game scores, join-class, and admin login. Threat model documented in `CODEBASE.md`. COPPA compliance statement in `SECURITY.md`. `npm audit` findings documented as accepted risks.

**As of Sprint 9:** Student redesign Epic begun. Sidebar refactor: both `StudentSidebar` and `TeacherSidebar` now collapsible (224px ↔ 72px icon rail, 180ms transition, `PanelLeft` toggle). Student sidebar adds Courses (`/courses`), Games, Settings (`/settings`) nav items with per-item accent colors. Placeholder pages added for `/courses` and `/settings`. `DisplaySettings` removed from sidebar footer (moves to `/settings` in Sprint 13).

**As of Sprint 10:** Courses data model shipped. `CourseEnrollment` model + migration (`userId`, `courseId`, `enrolledAt`, `lastLessonAt`). `/courses` page shows enrolled and available courses with progress bars and enroll button. Enrollment API at `/api/courses/[id]/enroll`. Lesson complete route now upserts enrollment + updates `lastLessonAt`. Alice in Wonderland added as second course: 12 sections (one per chapter), 554 lessons covering the full public-domain text, split at sentence boundaries into ~120–300-char chunks.

**As of Sprint 11:** `/lessons` page rebuilt. Server component now accepts `?course=id` and fetches all enrolled courses for the switcher. Client replaced with: scrollable course-switcher pill tabs (only shown when enrolled in 2+ courses); collapsible section accordions (auto-opens the section with the next unstarted lesson); lesson-dot grid (14px dots colour-coded by state: passed / attempted / unlocked / locked); inline detail panel on dot click (title, content preview, best stats, goal line, Start/Practice-again button).

**As of Sprint 12:** `/dashboard` cleaned up. Quest Map removed (didn't scale to 554-lesson Alice course). New Up Next card: accent-colored header band with course icon and name, lesson title + content preview, direct Start button. Stats grid, weekly streak dots, recent activity, and practice games retained. Games moved inline (2-col grid alongside recent activity). NameCard and JoinClassCard at bottom.

**As of Sprint 13:** `/settings` page live. Three sections: Username (NameCard — reroll / teacher-mediated request), Class (JoinClassCard — join by code), Display (DisplaySettings always-open — high-contrast toggle, reading font picker, keyboard override clear). `DisplaySettings` gained `alwaysOpen` prop so it renders inline without the sidebar collapse toggle.

**As of Sprint 14 (current):** Lesson runner redesigned. `TypingArea`: borderless (soft tinted bg, no heavy border), line clipping (3 lines at a time via word-wrap, advances with cursor), font-size prop (`sm`/`md`/`lg`). `KeyboardHint`: full SVG keyboard layout + two SVG hand diagrams with per-finger highlighting — shows which hand and which finger (index/middle/ring/pinky/thumb) to press next. `LessonClient`: S/M/L font-size toggle (persisted to localStorage via `useTypingFontSize` hook), state shared with `TypingArea`. `hooks/useTypingFontSize.ts` added.

**Not yet ready for real classrooms.** Remaining blockers: CSP headers (deferred post-alpha).

---

## Architecture at a glance

Single Next.js 15 App Router project. PostgreSQL via Prisma. NextAuth v4 for Google OAuth (database sessions). Admin panel uses a separate HMAC-cookie auth (deliberately not NextAuth — see ADR-0007). Vitest for unit tests, scoped to `lib/` with 80% line/function and 70% branch thresholds. Pino for structured logging with request IDs injected via middleware.

For full architecture, see [`CODEBASE.md`](CODEBASE.md). For contribution conventions (branching, commits, comment schema), see [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Settled decisions — do not re-propose

Each of these has a full ADR in [`docs/decisions/`](docs/decisions/). Read the ADR before suggesting we revisit any of them.

| # | Decision | Why |
|---|----------|-----|
| 0001 | Pseudonymous animal nicknames, no real names stored | COPPA-aligned, protects minors |
| 0002 | Sentry removed until launch | Premature for zero-user alpha; `pino` covers errors |
| 0003 | Prisma `migrate` workflow, `db push` forbidden | `db push` silently destroys data on certain schema changes |
| 0004 | Tailwind CSS v4 with `@theme` in `globals.css`, no config file | v4 native pattern; deleted `tailwind.config.ts` in Sprint 4.2 |
| 0005 | ESLint 9 (not 10) | `eslint-config-next@15` peer dep blocks ESLint 10 |
| 0006 | No third-party analytics SDKs | Privacy-first stance for minors |
| 0007 | **Super-Admin** auth uses HMAC cookie, not NextAuth; "Admin" term reserved for future teacher-management role | Single shared password; doesn't fit per-user OAuth model |
| 0008 | Student names stored in teacher's browser only, never on the server | COPPA extension; names are never in KeySprout's data estate |
| 0009 | Accessibility features are on by default unless a competing need exists | K–5 students cannot self-advocate; optional features that cost nothing should be universal |

---

## Workflow conventions

- **Branching:** feature branches off `main`, named by change (`feat/...`, `fix/...`, `docs/...`). Squash merge. **Create a new branch at the start of every new Epic or Sprint** — never reuse a branch from a previous sprint. For small out-of-band changes (CLAUDE.md edits, doc fixes) that don't belong to an open issue, ask whether a new branch is appropriate before proceeding; when in doubt, create one.
- **Stale branches:** delete local branches once their PR is merged. Keep the local branch list clean — one branch per active piece of work. **Before pushing any commit, confirm the branch's PR is still open** — if it has been merged, stop, delete the local branch (`git branch -d <branch>`), create a new branch from `main`, and push there instead. Never push to a branch whose PR is already merged.
- **Commits:** present tense, under 70 chars, body explains *why*. Never include the model identifier in commits or PR text.
- **Before pushing:** `npm test`, `npm run build`, `npm run lint` all pass.
- **PRs:** fill out the template. Do not create PRs unless explicitly asked.
- **Destructive actions:** confirm before running. Rebases, force pushes, `db push`, deletions all require explicit approval.
- **Doc updates:** `CLAUDE.md` current state and `ROADMAP.md` ("Where we are" + "Now") **must be updated in every PR** — not as a follow-up. This applies to every sprint PR and any PR that changes what's done, in-progress, or next. If a PR settles an architectural choice, add an ADR to `docs/decisions/` in the same PR.
- **Bias toward action:** attempt tasks before asking clarifying questions. Ask only when reversibility is low or scope is genuinely ambiguous.
- **Sensitive operations:** if a task requires running code that involves sensitive data (passwords, secrets, tokens), do not run it yourself — tell the user to run it in GitHub Codespaces instead.

---

## Useful commands

```bash
npm run dev                # local dev server
npm test                   # unit tests once
npm run test:watch         # unit tests in watch mode
npm run test:coverage      # coverage report (HTML in coverage/)
npm run lint               # ESLint
npm run build              # full prod build (runs prisma migrate deploy)
npm run build:ci           # build without migrations (CI only)
npm run db:migrate -- --name short_desc   # create + apply new migration
npm run db:migrate:deploy  # apply pending migrations (prod-safe)
npm run db:migrate:status  # check migration state
npm run db:seed            # seed the 250-lesson curriculum
```

---

## How to use this file

- **Reading:** treat the "Hard constraints" and "Settled decisions" sections as load-bearing. If a request conflicts with either, surface the conflict before acting.
- **Writing:** when something settles — a constraint emerges, a decision is made, the current state changes — update this file in the same PR. The doc only works if it stays current.
- **What belongs here vs. elsewhere:** identity / constraints / settled choices / current state → here. Architecture detail → `CODEBASE.md`. Contribution mechanics → `CONTRIBUTING.md`. Self-hosting setup → `README.md`. Backlog detail → GitHub issues.
