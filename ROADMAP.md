# Roadmap

KeySprout is a touch-typing curriculum for K–5 students. This document reflects current project state, the next three sprints, and the full backlog organized by theme. It is a working plan, not a contract — scope shifts as we learn what students and teachers actually need.

Every backlog item links to a GitHub issue where you can track status, leave feedback, or claim the work.

---

## Current state

KeySprout is a deployed, production-quality alpha. The core loop — sign in, pick a lesson, type, see your progress — is fully functional and actively used. The infrastructure is solid: versioned database migrations, CI on every PR, typed end to end, and documented for self-hosters and contributors alike.

### What's working

**Core application**
- Next.js 15 + TypeScript + PostgreSQL/Prisma — fully async App Router
- Google OAuth sign-in with pseudonymous animal nicknames (no real names or emails stored)
- 250-lesson curriculum across 5 sections: Home Row → Top Row → Bottom Row → Common Words → Speed Building
- Real-time WPM, accuracy, and per-key error tracking in the typing interface
- Adaptive practice — students generate custom exercises targeting their weakest keys
- Two games: Word Rain and Letter Hunt, with persistent score tracking
- Student dashboard with weekly streak tracker, Quest map, and Pip mascot
- Teacher portal: classroom creation, join codes, member approval, per-student progress views
- Curriculum browser and Insights dashboard for teachers
- Admin panel with HMAC-cookie auth and seed controls

**Design system**
- Warm cream "KeyQuest" aesthetic with a 6-color section palette
- Shared `kq-card`, `kq-btn`, `kq-chip` utility classes built with Tailwind CSS v4
- Custom typography stack: Fredoka One, Nunito, JetBrains Mono
- Design tokens defined entirely in `app/globals.css` — no `tailwind.config.ts`

**Infrastructure**
- Prisma migrate workflow — schema changes require versioned migrations, `db push` removed
- Vitest + v8 coverage (80% line/function, 70% branch) scoped to `lib/`
- 64 unit tests across `typing-engine`, `name-generator`, `admin-auth`, `section-colors`, `utils`
- GitHub Actions: lint, test with coverage, build on every PR and push to `main`
- Dependabot weekly updates for npm and GitHub Actions
- Structured `pino` logging with request IDs via Next.js middleware

**Developer experience**
- `README.md` with step-by-step self-hosting guide
- `CODEBASE.md` architecture reference for contributors and auditors
- `CONTRIBUTING.md` with branching, commit, design token, and migration conventions
- MIT license, Code of Conduct, Security policy, issue templates, PR template

### Known gaps

- **No rate limiting** — API routes are unthrottled; a scripted client can flood the database (#42)
- **No CSRF protection** — state-changing routes rely on session cookies + same-origin only (#43)
- **Admin password is plain-text comparison** — must switch to hashed + constant-time before launch (#45)
- **No physical keyboard detection** — touch-only students can attempt lessons, defeating the curriculum's purpose (#37)
- **No accessibility audit** — keyboard nav works, but ARIA labels and screen reader behavior are unverified (#30)

---

## Up next

### Sprint 6 — Accessibility audit

Every student deserves a usable experience, and K–5 schools often include students with assistive needs. This sprint closes the gap between "works with a keyboard" and "actually accessible."

| Task | Issue | Priority |
|------|-------|----------|
| Run axe-core audit across all pages | #30 | high |
| Verify visible focus styles on all interactive elements | #31 | high |
| Add ARIA labels to icon-only buttons | #32 | high |
| Test the typing interface with VoiceOver and NVDA | #33 | high |
| Add a high-contrast mode toggle (`prefers-contrast`) | #34 | medium |
| Document keyboard shortcuts in CODEBASE.md | #35 | medium |

**Done when:** axe-core reports zero serious issues. A screen reader user can complete a full lesson.

---

### Sprint 7 — Physical keyboard detection

KeySprout teaches touch-typing. A student practicing on a virtual keyboard is wasting their time. This sprint adds detection and clear guidance before they start.

| Task | Issue | Priority |
|------|-------|----------|
| Detect touch-only devices (`pointer:coarse` + `maxTouchPoints`) | #36 | high |
| Block lesson and game pages when no keyboard is detected | #37 | high |
| Auto-dismiss warning on first physical keypress | #38 | high |
| Graceful handling of Bluetooth keyboards on iPads | #40 | high |
| "I have a keyboard connected" override persisted to localStorage | #39 | medium |
| Pip-illustrated "physical keyboard required" message | #41 | medium |

**Done when:** A student on a phone sees a friendly warning. A student with a Bluetooth keyboard on an iPad is not blocked.

---

### Sprint 8 — Security hardening

These are blocking issues for any classroom deployment with real students. Rate limiting, CSRF, and a hashed admin password are the minimum bar.

| Task | Issue | Priority |
|------|-------|----------|
| Hash admin password and use constant-time comparison | #45 | critical |
| Rate-limit `/api/lessons/*/complete` and `/api/games/score` | #42 | critical |
| Add CSRF tokens on state-changing routes | #43 | critical |
| Run `npm audit` and address moderate+ issues | #46 | high |
| Audit Zod schemas on every API route | #44 | high |
| Document the threat model in CODEBASE.md | #47 | medium |

**Done when:** A scripted attacker can't flood the database. Admin login is constant-time. All state-changing routes verify a CSRF token.

---

## Planned features

Organized by theme. Each item links to a GitHub issue with full acceptance criteria and dependencies.

### Teacher tools

| Feature | Issue | Priority |
|---------|-------|----------|
| CSV export for class progress | #48 | medium |
| PDF progress reports for individual students | #49 | medium |
| Bulk approve/remove for class members | #51 | medium |
| Teacher curriculum editor (create custom lessons) | #56 | medium |
| Assign custom lessons to classrooms | #57 | medium |
| Soft-delete custom lessons (preserve historical attempts) | #59 | medium |
| Lesson preview before publishing | #58 | low |
| Weekly summary email for teachers | #50 | low |

### Student engagement

| Feature | Issue | Priority |
|---------|-------|----------|
| Achievement system (data model + unlock logic) | #52 | medium |
| Badge gallery on the student dashboard | #53 | medium |
| Optional sound effects (off by default, respects `prefers-reduced-motion`) | #55 | low |
| Pip mascot reactions to milestones (cheer, surprise variants) | #54 | low |

### Curriculum expansion

| Feature | Issue | Priority |
|---------|-------|----------|
| Lesson generation: support number and symbol target keys | #62 | medium |
| Curriculum: Number Row section (50 lessons covering 0–9 and shift symbols) | #60 | medium |
| Curriculum: Symbols & Punctuation section (25 lessons) | #61 | medium |
| VirtualKeyboard: show numbers when relevant | #63 | medium |
| Course selector at the top of the lessons page | #77 | low |

### Games

| Feature | Issue | Priority |
|---------|-------|----------|
| Classroom-scoped games leaderboard | #66 | low |
| New game: Trick Words (sight-word practice) | #64 | low |
| New game: Story Builder | #65 | low |

### Progressive Web App

| Feature | Issue | Priority |
|---------|-------|----------|
| PWA: add `manifest.json` and install prompt | #67 | low |
| PWA: service worker for offline lesson caching | #68 | low |
| PWA: background sync for lesson results | #69 | low |
| PWA: install prompt only on devices with a physical keyboard | #70 | low |

### Internationalisation

| Feature | Issue | Priority |
|---------|-------|----------|
| i18n: adopt `next-intl` or `next-i18next` | #71 | low |
| i18n: extract all UI strings to translation files (English baseline) | #72 | low |
| i18n: language switcher in the user menu | #73 | low |
| i18n: translate auth + dashboard pages first (lessons stay English) | #74 | low |
| Translate the UI to Spanish | #75 | low |
| Typing engine: handle ñ, accented vowels, and ¿¡ | #78 | low |
| Author Spanish-language curriculum (250 lessons) | #76 | low |

### Alternate keyboard layouts

| Feature | Issue | Priority |
|---------|-------|----------|
| Detect or select keyboard layout (QWERTY / Dvorak / Colemak) | #79 | low |
| VirtualKeyboard, KeyboardHint, and finger zones per layout | #80 | low |
| Layout-specific curriculum content / filtering | #81 | low |

### Parent portal

| Feature | Issue | Priority |
|---------|-------|----------|
| Parent portal: read-only parent accounts with magic-link auth | #82 | low |
| Student-parent pairing flow | #84 | low |
| Parent dashboard: child's progress, badges, weekly summary | #83 | low |
| COPPA/FERPA compliance review for parent portal | #85 | low |

### Multiplayer & challenges

| Feature | Issue | Priority |
|---------|-------|----------|
| Multiplayer: async weekly class targets | #89 | low |
| Multiplayer: teacher-launched real-time class race | #86 | low |
| Multiplayer: live race leaderboard | #87 | low |
| Multiplayer: replay viewer for teachers (keystroke timing) | #88 | low |

### Community curriculum sharing

| Feature | Issue | Priority |
|---------|-------|----------|
| Community curriculum: public directory of shared courses | #90 | low |
| Community curriculum: browse / fork / remix | #91 | low |
| Community curriculum: admin moderation queue | #92 | low |
| Community curriculum: attribution + licensing tags | #93 | low |

### Stretch / someday

These are directionally interesting but don't have a sprint slot yet. See the linked issue for thinking on each.

| Feature | Issue |
|---------|-------|
| AI-generated remediation passages | #94 |
| Voice feedback for visually impaired learners | #95 |
| SSO integrations (Clever, ClassLink, Google Classroom) | #96 |
| White-label hosting for school districts | #97 |
| District-level curriculum analytics (anonymised) | #98 |
| Self-grading writing prompts (typing + composition) | #99 |
| Dyslexia-friendly font option (OpenDyslexic or similar) | #100 |

---

## How to contribute

- **Pick an issue** — anything in the backlog tables above is available unless assigned
- **Claim it** — comment on the issue with "I'd like to take this"
- **Check dependencies** — each issue body notes what must land first
- **Self-hosters** — prioritize Sprints 6–8 before deploying to real classrooms; they cover accessibility, keyboard detection, and the security baseline

The roadmap is updated before each PR to `main`. If you think the priority order is wrong, open an issue with your reasoning.
