# Roadmap

KeySprout's working plan. For project identity, constraints, and architecture, see [`CLAUDE.md`](CLAUDE.md) and [`CODEBASE.md`](CODEBASE.md). For the full backlog, browse [GitHub Epics](https://github.com/malakaij/KeySprout/labels/epic) — each epic links to its sub-issues with live progress tracking.

---

## Where we are

Production-quality alpha deployed on Vercel. Sprints 1–10 merged (Sprint 10 PR open). Student redesign epic in progress.

**Completed sprints:**
- Sprint 5: Prisma migrations, Next.js 15, React 19, Tailwind v4, ESLint 9, CI on every PR
- Sprint 6 ([Epic #102](https://github.com/malakaij/KeySprout/issues/102)): Accessibility audit — axe-core, focus styles, ARIA labels, high-contrast mode, keyboard-shortcut docs
- Sprint 7 ([Epic #103](https://github.com/malakaij/KeySprout/issues/103)): Physical keyboard detection — `looksLikeNoKeyboard()` heuristic, `KeyboardGuard` blocking UI, auto-dismiss on trusted keypress, localStorage override
- Sprint 8 ([Epic #104](https://github.com/malakaij/KeySprout/issues/104)): Security hardening — Super-Admin rename, bcrypt password, CSRF Origin-header check, Postgres rate limiting, threat model, COPPA statement
- Sprint 9: Collapsible sidebars (224px ↔ 72px icon rail, 180ms); student sidebar adds Courses, Games, Settings nav with per-item accents

**The app is now deployable to real classrooms** (pending CSP headers, deferred post-alpha).

---

## Now — Sprint 10 (Student Redesign, step 2 of 6)

**Sprint 10 (current, PR open):** Courses data model + `/courses` page.
- `CourseEnrollment` model + migration (`userId`, `courseId`, `enrolledAt`, `lastLessonAt`)
- `icon`, `subtitle`, `accent` fields added to `Course`
- `/courses` page: enrolled/available cards with progress bars and enroll button
- Enrollment API at `/api/courses/[id]/enroll`; lesson complete route updates `lastLessonAt`
- Alice in Wonderland seeded as second course: 12 sections (one per chapter), 554 lessons covering the full public-domain text

---

## Next — Sprints 11–14

| Sprint | Work |
|--------|------|
| 11 | `/lessons` rebuild: section accordion + lesson-dot grid + detail panel; course switcher |
| 12 | `/dashboard` cleanup: remove Quest Map, add Up Next card + weekly streak |
| 13 | `/settings` page: nickname reroll, class-code join, display preferences (font + contrast) |
| 14 | Lesson runner redesign: borderless text area, line clipping, font-size selector, SVG keyboard + hand overlay |

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
