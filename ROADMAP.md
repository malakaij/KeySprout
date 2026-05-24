# Roadmap

KeySprout's working plan. For project identity, constraints, and architecture, see [`CLAUDE.md`](CLAUDE.md) and [`CODEBASE.md`](CODEBASE.md). For the full backlog, browse [GitHub Epics](https://github.com/malakaij/KeySprout/labels/epic) — each epic links to its sub-issues with live progress tracking.

---

## Where we are

Production-quality alpha deployed on Vercel. Sprints 1–12 merged. Student redesign epic in progress.

**Completed sprints:**
- Sprint 5: Prisma migrations, Next.js 15, React 19, Tailwind v4, ESLint 9, CI on every PR
- Sprint 6 ([Epic #102](https://github.com/malakaij/KeySprout/issues/102)): Accessibility audit — axe-core, focus styles, ARIA labels, high-contrast mode, keyboard-shortcut docs
- Sprint 7 ([Epic #103](https://github.com/malakaij/KeySprout/issues/103)): Physical keyboard detection — `looksLikeNoKeyboard()` heuristic, `KeyboardGuard` blocking UI, auto-dismiss on trusted keypress, localStorage override
- Sprint 8 ([Epic #104](https://github.com/malakaij/KeySprout/issues/104)): Security hardening — Super-Admin rename, bcrypt password, CSRF Origin-header check, Postgres rate limiting, threat model, COPPA statement
- Sprint 9: Collapsible sidebars (224px ↔ 72px icon rail, 180ms); student sidebar adds Courses, Games, Settings nav with per-item accents
- Sprint 10: Courses data model + enrollment; Alice in Wonderland course (554 lessons, 12 chapters); teachers can assign courses to classrooms
- Sprint 11: `/lessons` rebuilt — section accordions, lesson-dot grid (14px, 4 states), inline detail panel, course switcher pill tabs
- Sprint 12: `/dashboard` cleanup — Quest Map removed, Up Next card (accent color band, lesson preview, direct Start button), games moved inline, weekly streak retained

**The app is now deployable to real classrooms** (pending CSP headers, deferred post-alpha).

---

**Completed sprints (continued):**
- Sprint 13: `/settings` page — Username (reroll/request), Class (join by code), Display (font picker + high-contrast, always-open inline). `DisplaySettings` `alwaysOpen` prop added.
- Sprint 14: Lesson runner redesigned — `TypingArea` borderless + 3-line clip; SVG keyboard + hand overlay with per-finger highlighting; S/M/L font-size toggle (localStorage-persisted).

---

## Now — Post student-redesign epic

The student-redesign epic (Sprints 9–14) is complete. All student-facing pages rebuilt.

**Candidate next work:**

| Theme | Notes |
|-------|-------|
| CSP headers | Last pre-launch blocker |
| Teacher data export | CSV/PDF, bulk actions ([#105](https://github.com/malakaij/KeySprout/issues/105)) |
| Student credentials | Username/password, QR login cards ([#123](https://github.com/malakaij/KeySprout/issues/123)) |

---

## Next

| Theme | Notes |
|-------|-------|
| Teacher data export | CSV/PDF, bulk actions, weekly digests ([#105](https://github.com/malakaij/KeySprout/issues/105)) |
| Student credentials | Username/password auth, QR code login cards ([#123](https://github.com/malakaij/KeySprout/issues/123)) |
| CSP headers | Final blocker before real-classroom launch |

---

## Later

Each future sprint maps to one epic. Open any epic to see its sub-issues, dependencies, and live progress.

| Epic | Theme |
|------|-------|
| [#105](https://github.com/malakaij/KeySprout/issues/105) | Teacher data export — CSV/PDF, bulk actions, weekly digests |
| [#123](https://github.com/malakaij/KeySprout/issues/123) | Student credentials & login cards — username/password auth, QR code login cards |
| [#106](https://github.com/malakaij/KeySprout/issues/106) | Student engagement & achievements |
| [#107](https://github.com/malakaij/KeySprout/issues/107) | Custom lessons (teacher-authored) |
| [#108](https://github.com/malakaij/KeySprout/issues/108) | Curriculum: numbers & symbols |
| [#109](https://github.com/malakaij/KeySprout/issues/109) | Games expansion (Trick Words, Story Builder, leaderboard) |
| [#110](https://github.com/malakaij/KeySprout/issues/110) | Progressive Web App |
| [#111](https://github.com/malakaij/KeySprout/issues/111) | Internationalisation (Spanish first) |
| [#112](https://github.com/malakaij/KeySprout/issues/112) | Alternate keyboard layouts (Dvorak, Colemak) |
| [#113](https://github.com/malakaij/KeySprout/issues/113) | Parent portal |
| [#114](https://github.com/malakaij/KeySprout/issues/114) | Multiplayer & challenges |
| [#115](https://github.com/malakaij/KeySprout/issues/115) | Community curriculum sharing |
| [#116](https://github.com/malakaij/KeySprout/issues/116) | Stretch / someday — AI, SSO, dyslexia font, etc. |

---

## How this roadmap is maintained

Updated before each PR to `main`. The two sections that drift fastest — "Where we are" and "Now" — are the ones to keep current. Per-issue detail lives on the epics; this file just orients.
