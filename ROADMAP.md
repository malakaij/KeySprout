# Roadmap

KeySprout's working plan. For project identity, constraints, and architecture, see [`CLAUDE.md`](CLAUDE.md) and [`CODEBASE.md`](CODEBASE.md). For the full backlog, browse [GitHub Epics](https://github.com/malakaij/KeySprout/labels/epic) — each epic links to its sub-issues with live progress tracking.

---

## Where we are

Production-quality alpha deployed on Vercel. Sprints 1–8 are merged or in review.

**Completed sprints:**
- Sprint 5: Prisma migrations, Next.js 15, React 19, Tailwind v4, ESLint 9, CI on every PR
- Sprint 6 ([Epic #102](https://github.com/malakaij/KeySprout/issues/102)): Accessibility audit — axe-core, focus styles, ARIA labels, high-contrast mode, keyboard-shortcut docs
- Sprint 7 ([Epic #103](https://github.com/malakaij/KeySprout/issues/103)): Physical keyboard detection — `looksLikeNoKeyboard()` heuristic, `KeyboardGuard` blocking UI, auto-dismiss on trusted keypress, localStorage override

**Not yet ready for real classrooms.** Sprint 8 (security hardening) is in review as PR #133; it must merge first.

---

## Now — Sprint 8

**[Epic #104: Security hardening](https://github.com/malakaij/KeySprout/issues/104)** — PR #133 in review.

- Super-Admin renamed from Admin; bcrypt-hashed password (`SUPER_ADMIN_PASSWORD`), `timingSafeEqual` token comparison
- CSRF: `verifySameOrigin()` Origin-header check on all state-changing routes
- Postgres-based rate limiting on lesson completions, game scores, join-class, and admin login
- Threat model in `CODEBASE.md`; COPPA compliance statement in `SECURITY.md`; `npm audit` findings documented

**Done when:** PR #133 merges and Vercel deploy is green.

---

## Next

**After Sprint 8 the app is deployable to real classrooms.**

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
