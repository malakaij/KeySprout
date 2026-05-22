# Roadmap

KeySprout's working plan. For project identity, constraints, and architecture, see [`CLAUDE.md`](CLAUDE.md) and [`CODEBASE.md`](CODEBASE.md). For the full backlog with acceptance criteria, see [GitHub Issues](https://github.com/malakaij/KeySprout/issues).

---

## Where we are

Production-quality alpha deployed on Vercel. Core loop works. Infrastructure recently hardened — Prisma migrations, Next.js 15, React 19, Tailwind v4, ESLint 9, CI on every PR. Sprint 5 (database migrations) is the most recent merge.

**Not yet ready for real classrooms.** Three security blockers must land first: rate limiting ([#42](https://github.com/malakaij/KeySprout/issues/42)), CSRF tokens ([#43](https://github.com/malakaij/KeySprout/issues/43)), hashed admin password ([#45](https://github.com/malakaij/KeySprout/issues/45)).

---

## Now — Sprint 6: Accessibility audit

Every student deserves a usable experience. Close the gap between "works with a keyboard" and "actually accessible."

- [#30](https://github.com/malakaij/KeySprout/issues/30) Run axe-core audit across all pages **— high**
- [#31](https://github.com/malakaij/KeySprout/issues/31) Verify visible focus styles on all interactive elements **— high**
- [#32](https://github.com/malakaij/KeySprout/issues/32) Add ARIA labels to icon-only buttons **— high**
- [#33](https://github.com/malakaij/KeySprout/issues/33) Test the typing interface with VoiceOver and NVDA **— high**
- [#34](https://github.com/malakaij/KeySprout/issues/34) High-contrast mode toggle **— medium**
- [#35](https://github.com/malakaij/KeySprout/issues/35) Document keyboard shortcuts **— medium**

**Done when:** axe-core reports zero serious issues; a screen reader user can complete a full lesson.

---

## Next — Sprints 7 and 8

**Sprint 7 — Physical keyboard detection.** Touch-only students currently waste their time on a virtual keyboard. Detect and block lessons until a real keypress is registered. Issues [#36–#41](https://github.com/malakaij/KeySprout/labels/device-detection).

**Sprint 8 — Security hardening.** The three classroom-deployment blockers plus dependency audit and threat-model docs. Issues [#42–#47](https://github.com/malakaij/KeySprout/labels/security).

After Sprint 8 the app is deployable to real classrooms.

---

## Later

The full backlog is in GitHub Issues, browseable by [`priority`](https://github.com/malakaij/KeySprout/labels?q=priority) and [category](https://github.com/malakaij/KeySprout/labels) labels. Themes:

- **Teacher tools** — CSV/PDF exports, bulk actions, custom lessons
- **Student engagement** — achievements, badges, Pip reactions
- **Curriculum expansion** — numbers, symbols, Spanish, alternate layouts
- **Games** — Trick Words, Story Builder, classroom leaderboards
- **PWA** — offline lessons, background sync, install prompt
- **i18n** — string extraction, language switcher, Spanish curriculum
- **Parent portal** — magic-link accounts, pairing flow, COPPA review
- **Multiplayer** — real-time races, leaderboards, replays
- **Community** — curriculum sharing, fork/remix, moderation
- **Stretch** — AI remediation, voice feedback, SSO, white-label, dyslexia font

---

## How this roadmap is maintained

Updated before each PR to `main`. The two sections that drift fastest — "Where we are" and "Now" — are the ones to keep current. The full backlog detail lives in issues; this file just orients.
