# Roadmap

KeySprout's working plan. For project identity, constraints, and architecture, see [`CLAUDE.md`](CLAUDE.md) and [`CODEBASE.md`](CODEBASE.md). For the full backlog, browse [GitHub Epics](https://github.com/malakaij/KeySprout/labels/epic) — each epic links to its sub-issues with live progress tracking.

---

## Where we are

Production-quality alpha deployed on Vercel. Core loop works. Infrastructure recently hardened — Prisma migrations, Next.js 15, React 19, Tailwind v4, ESLint 9, CI on every PR. Sprint 5 (database migrations) is the most recent merge.

**Not yet ready for real classrooms.** The [security hardening epic](https://github.com/malakaij/KeySprout/issues/104) must land first — rate limiting, CSRF tokens, and a hashed admin password are the blockers.

---

## Now — Sprint 6

**[Epic #102: Accessibility audit](https://github.com/malakaij/KeySprout/issues/102)** — close the gap between "works with a keyboard" and "actually accessible." 6 sub-issues covering axe-core audit, focus styles, ARIA labels, screen-reader testing, high-contrast mode, and keyboard-shortcut docs.

**Done when:** axe-core reports zero serious issues; a screen reader user can complete a full lesson.

---

## Next — Sprints 7 and 8

**[Epic #103: Physical keyboard detection](https://github.com/malakaij/KeySprout/issues/103)** (Sprint 7). Touch-only students currently waste their time on a virtual keyboard. Detect and block lessons until a real keypress is registered.

**[Epic #104: Security hardening](https://github.com/malakaij/KeySprout/issues/104)** (Sprint 8). Rate limiting, CSRF tokens, hashed admin password, dependency audit, threat-model docs.

After Epic #104 the app is deployable to real classrooms.

---

## Later

Each future sprint maps to one epic. Open any epic to see its sub-issues, dependencies, and live progress.

| Epic | Theme |
|------|-------|
| [#105](https://github.com/malakaij/KeySprout/issues/105) | Teacher data export — CSV/PDF, bulk actions, weekly digests |
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
