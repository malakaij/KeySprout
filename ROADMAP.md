# Roadmap

This document tracks what KeySprout has, what is in progress, and what we're planning. It's a working plan, not a contract — sprint scope shifts as we learn what students and teachers actually need.

---

## Status snapshot

### Shipped

**Core application**
- Next.js 14 + TypeScript foundation with PostgreSQL/Prisma backend
- Google OAuth sign-in with pseudonymous animal nicknames (no real names or emails stored)
- 250-lesson curriculum across 5 sections (Home Row → Top Row → Bottom Row → Common Words → Speed Building)
- Real-time WPM, accuracy, and per-key error tracking in the typing interface
- Adaptive practice — students can generate custom exercises targeting their weakest keys
- Two typing games (Word Rain, Letter Hunt) with persistent score tracking
- Student dashboard with weekly streak tracker, Quest map, and Pip mascot
- Teacher portal: classroom creation, join codes, member approval, per-student progress views
- Curriculum browser and Insights dashboard for teachers
- Admin panel with HMAC-cookie authentication and seed controls

**Design system**
- Warm cream "KeyQuest" aesthetic with 6-color section palette
- Shared `kq-card`, `kq-btn`, `kq-chip` utility classes
- Custom typography stack (Fredoka One, Nunito, JetBrains Mono)
- Consistent design tokens across the entire app

**Documentation & code quality**
- README for self-hosters with step-by-step Google OAuth + database setup
- CODEBASE.md architecture guide for auditors and contributors
- Inline comment schema (JSDoc on lib exports, props comments on shared components)
- Dead code removal and de-duplication pass complete

**Open-source infrastructure**
- `LICENSE` (MIT), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`
- GitHub issue templates (bug, feature, docs) and PR template with design-token + PII checks
- Repository tagged `v0.1.0-alpha`

**Testing & CI**
- Vitest configured with v8 coverage (80% line/function, 70% branch thresholds, scoped to `lib/`)
- 64 unit tests covering `typing-engine`, `name-generator`, `admin-auth`, `section-colors`, and `utils`
- GitHub Actions workflow running lint, test (with coverage), and build on every PR and push to `main`
- Coverage HTML uploaded as a CI artifact

### In progress

- **Branch `claude/dev`** — active development branch, branched off `main` after the v0.1.0-alpha release

### Known gaps (to address in early sprints)

- **No Dependabot** — npm and Actions versions don't auto-update yet
- **No migration system** — schema changes happen via `prisma db push`, which is fine for development but not for production updates
- **No rate limiting** — all API routes are unthrottled
- **No error boundaries or 404/500 pages** — uncaught errors show the default Next.js stack
- **No structured logging** — only ad-hoc `console.log` calls
- **Mobile responsive is partial** — typing interface works but games and dashboards have rough edges on phones
- **No accessibility audit** — keyboard nav works but ARIA labels and screen reader behaviour haven't been verified

---

## Timeline overview

| Horizon | Theme |
|---------|-------|
| **Tomorrow** | Smoke-test the merge candidate, add LICENSE, file the initial issue list |
| **Next 2 weeks** | Open-source readiness: tests, CI, contribution guide |
| **Next month** | Production hardening: migrations, rate limiting, error handling, accessibility |
| **Next 3 months** | Teacher tools, engagement features, custom lessons |
| **Next 6 months** | New games, expanded curriculum, mobile PWA |
| **Next year** | Internationalisation, alternate keyboard layouts, community curriculum sharing |

---

## Tomorrow

This section has been retired — the initial release shipped as `v0.1.0-alpha`. Sprints 1–3 are largely complete (see status snapshot above). Next active work is finishing Sprint 3 (Dependabot) and starting Sprint 4 (error handling & observability).

---

## Sprint plan

Each sprint is approximately 1–2 weeks. Scope is intentionally loose — adjacent items can swap in if priorities change. Sprints 1–3 are firm; everything from Sprint 7 onward is directional.

### Sprint 1 — Open-source readiness ✅ shipped
*Week 1*

- Add `LICENSE` (MIT) and `CODE_OF_CONDUCT.md` (Contributor Covenant)
- Write `CONTRIBUTING.md` (copy the conventions section from CODEBASE.md and expand)
- Create GitHub issue templates: bug report, feature request, documentation
- Create PR template with checklist (tests added, types pass, lint clean)
- Add `SECURITY.md` with disclosure instructions
- Update README badges (license, build status placeholder)

**Done when:** A first-time visitor to the repo can find license, conduct expectations, contribution guide, and security policy without scrolling.

### Sprint 2 — Testing foundation ✅ shipped
*Week 2*

- Add Vitest for unit tests; configure with Next.js path aliases
- Write unit tests for `lib/typing-engine.ts` (every exported function)
- Write unit tests for `lib/name-generator.ts` (determinism + uniqueness)
- Write unit tests for `lib/admin-auth.ts` (token round-trip, expiry, tampering)
- Aim for 80%+ coverage in `lib/`

**Done when:** `npm test` runs the suite, every `lib/` function has at least one happy-path test and one boundary test.

### Sprint 3 — CI/CD 🟡 mostly shipped
*Week 3*

- [x] GitHub Actions workflow: lint, test (with coverage), build on every PR and push to `main`
- [x] Vercel deploy preview for PRs (built-in via Vercel Git integration)
- [x] Branch protection on `main`: linear history, squash-only merge, required PR review, conversation resolution
- [ ] Add Dependabot config for npm + GitHub Actions ([#11](https://github.com/malakaij/KeySprout/issues/11))

**Done when:** Every PR shows green checks before merge. Dependabot opens weekly update PRs.

### Sprint 4 — Error handling & observability
*Week 4*

- [ ] Custom `app/not-found.tsx` (Pip-themed 404) ([#12](https://github.com/malakaij/KeySprout/issues/12))
- [ ] Custom `app/error.tsx` and `app/global-error.tsx` (friendly recovery) ([#13](https://github.com/malakaij/KeySprout/issues/13))
- [ ] Add `loading.tsx` to slow routes (dashboard, teacher insights) ([#14](https://github.com/malakaij/KeySprout/issues/14))
- [ ] Wire up structured logging (`pino` or similar) with request IDs ([#15](https://github.com/malakaij/KeySprout/issues/15))
- [ ] Optional: integrate Sentry behind an env flag for self-hosters who want it ([#16](https://github.com/malakaij/KeySprout/issues/16))

**Done when:** A thrown error in any route shows a friendly screen with a "Go home" button. Server logs include request IDs for debugging.

### Sprint 5 — Database migrations
*Week 5*

- Switch from `prisma db push` to `prisma migrate dev` workflow
- Generate the initial migration from current schema (`prisma migrate dev --name initial`)
- Update README and CODEBASE.md migration paths
- Add `npm run db:migrate` script for production deploys
- Document the migration → review → apply → deploy flow

**Done when:** Schema changes require a versioned migration file. The build script applies migrations safely without destructive `db push`.

### Sprint 6 — Accessibility audit
*Weeks 6*

- Run axe-core against every page; fix all critical and serious findings
- Verify all interactive elements have visible focus styles (already partially done)
- Add ARIA labels to icon-only buttons
- Test the typing interface with VoiceOver and NVDA
- Add a high-contrast mode toggle (respects `prefers-contrast`)
- Document keyboard shortcuts in CODEBASE.md

**Done when:** axe-core reports zero serious issues. A screen reader can complete a full lesson.

### Sprint 7 — Mobile & responsive polish
*Weeks 7*

- Audit every page at 360px, 768px, 1024px breakpoints
- Refactor Quest map to stack vertically on mobile (currently overflows)
- Make Word Rain playable with on-screen keyboard
- Add a mobile-friendly virtual keyboard for tablets without physical keyboards
- Test landscape orientation specifically (a real K-5 use case on Chromebooks)

**Done when:** A teacher can demo the full app from a phone. Every dashboard fits without horizontal scroll on a 360px viewport.

### Sprint 8 — Rate limiting & security hardening
*Weeks 8*

- Add rate limiting to `/api/lessons/*/complete` and `/api/games/score` (Upstash Redis or in-memory + warning for self-hosters)
- Add CSRF tokens on state-changing routes (currently relying on session cookies + same-origin)
- Audit Zod schemas — ensure every API body is validated
- Move admin password to a hashed comparison instead of plain `===`
- Run `npm audit` and address any moderate+ issues
- Document the threat model in CODEBASE.md

**Done when:** A scripted attacker can't flood the database with fake lesson attempts. Admin login is constant-time.

### Sprint 9 — Teacher data export
*Weeks 9*

- "Export class progress as CSV" button on the classroom page (WPM, accuracy, completion per student)
- PDF progress reports for individual students (printable for parent-teacher meetings)
- "Email me a weekly summary" toggle (requires SMTP config in `.env`)
- Bulk approve/remove for class members

**Done when:** A teacher can hand a parent a printed progress report without copying data by hand.

### Sprint 10 — Student engagement: achievements
*Week 10*

- Achievement system: First Lesson, 5-Day Streak, 50 WPM Club, Perfect Accuracy, etc.
- Badge gallery on the student dashboard
- Pip mascot reactions to milestones (new variants: cheer, surprise)
- Optional sound effects (off by default, respects `prefers-reduced-motion`)

**Done when:** Students see a celebratory animation on milestones; the dashboard shows their collected badges.

### Sprint 11 — Custom lessons (teacher-authored)
*Week 11*

- Teacher curriculum editor: create custom lessons with title, content, target keys, WPM/accuracy thresholds
- Teachers can assign custom lessons to their classrooms (uses the existing `ClassroomCourse` table)
- Lesson preview before publishing
- Soft-delete custom lessons (preserve historical attempts)

**Done when:** A teacher can write a lesson about their school mascot and assign it to their class.

### Sprint 12 — Curriculum expansion: numbers & symbols
*Week 12*

- New section: Number Row (50 lessons covering 0–9 and shift-symbols)
- New section: Symbols & Punctuation (25 lessons)
- Update lesson generation to support number/symbol target keys
- Update VirtualKeyboard to show numbers when relevant

**Done when:** A student can complete an end-to-end course including numbers and symbols.

### Sprint 13 — Two new games
*Week 13*

- **Trick Words** — high-frequency words appear briefly; type before they vanish (sight-word practice)
- **Story Builder** — type one sentence at a time to assemble a short story; teacher can author the story
- Add a games leaderboard scoped to classroom

**Done when:** Students have four games to choose from and can see their class ranking.

### Sprint 14 — Progressive Web App
*Week 14*

- Add `manifest.json` with KeySprout icons and install prompt
- Service worker for offline lesson caching (lessons work without network once loaded)
- "Install KeySprout" prompt on mobile
- Background sync for posting lesson results when connection returns

**Done when:** A student can complete a lesson on an iPad in airplane mode and the result syncs when they reconnect.

### Sprint 15 — Internationalisation infrastructure
*Week 15*

- Adopt `next-intl` or `next-i18next`
- Extract all UI strings to translation files (English baseline)
- Add a language switcher in the user menu
- Update auth + dashboard pages first; lessons stay English-only for now (curriculum is in English)

**Done when:** A non-English UI can be added by translating one JSON file. The English experience is unchanged.

### Sprint 16 — Spanish curriculum
*Week 16*

- Translate the UI to Spanish (community contribution welcome)
- Author a Spanish-language curriculum (250 lessons mirroring the English structure)
- Add a course selector at the top of the lessons page
- Test that the typing engine handles `ñ`, accented vowels, and `¿¡`

**Done when:** A Spanish-speaking student can complete a full curriculum in their native language.

### Sprint 17 — Alternate keyboard layouts
*Week 17*

- Detect or let the user select QWERTY / Dvorak / Colemak
- Adjust VirtualKeyboard, KeyboardHint, and finger-zone colors per layout
- Filter the curriculum or generate layout-specific content where applicable
- Document the trade-offs (some lessons are designed around QWERTY home row)

**Done when:** A Dvorak user can complete the curriculum with appropriate finger zones highlighted.

### Sprint 18 — Parent portal
*Week 18*

- Read-only parent accounts (signed in via separate magic-link flow, no Google requirement)
- Parents see their child's progress, badges, and weekly summary
- Pairing flow: student generates a code, parent enters it
- COPPA/FERPA compliance review

**Done when:** A parent can monitor their child's progress without seeing other students' data.

### Sprint 19 — Classroom challenges & multiplayer
*Week 19*

- Teacher-launched "race": all students in a class type the same passage simultaneously
- Live leaderboard during the race
- Replay viewer (teacher only) showing keystroke timing
- Async challenges: weekly class targets

**Done when:** A teacher can run a 5-minute typing race for their whole class with a live leaderboard.

### Sprint 20 — Community curriculum sharing
*Week 20*

- Public curriculum directory: teachers can publish their custom courses
- Browse, fork, and remix community curriculums
- Lightweight moderation queue (admin approves before public listing)
- Attribution + licensing tags per shared curriculum

**Done when:** A teacher in Texas can pick up a curriculum a teacher in Norway shared and assign it the same day.

---

## Stretch / "someday" items

These don't fit a sprint yet but are worth keeping visible:

- **Native mobile apps** (React Native / Capacitor wrapper)
- **AI-generated remediation** — LLM produces personalised practice passages, layered on top of the existing weak-key system
- **Voice feedback** for visually impaired learners
- **SSO integrations** (Clever, ClassLink, Google Classroom)
- **White-label hosting** option for school districts
- **Curriculum analytics for districts** — anonymised aggregates across many classrooms
- **Self-grading writing prompts** — combine typing with composition (older students)
- **Hardware integrations** — Bluetooth keyboard pairing prompts, dyslexia-friendly fonts

---

## How to use this document

- **Contributors**: pick an unclaimed item from the current or next sprint and open an issue saying "I'd like to take this."
- **Self-hosters**: track the "Production hardening" sprints (4–8) before deploying to real classrooms.
- **Teachers/parents**: the Engagement (10), Custom lessons (11), and Parent portal (18) sprints are the ones most likely to matter for daily classroom use — let us know which you want sooner.

Updates to this roadmap happen via PR. If you think the priority order is wrong, open an issue with the proposed change and reasoning.
