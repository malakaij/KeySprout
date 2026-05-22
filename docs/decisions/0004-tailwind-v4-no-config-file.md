# ADR-0004: Tailwind v4 with `@theme` in CSS, no config file

**Status:** Accepted (Sprint 4.2)

## Context

Tailwind v4 introduced a CSS-first configuration model via the `@theme` directive. The old `tailwind.config.ts` still works but is no longer the recommended pattern. Keeping both creates confusion about where the source of truth lives.

## Decision

All design tokens, fonts, shadows, animations, and keyframes are defined inside the `@theme` block in `app/globals.css`. The `tailwind.config.ts` file was deleted. Custom utility classes (`kq-card`, `kq-btn`, `kq-chip`) use the `@utility` directive instead of `@layer components`. The PostCSS plugin switched from `tailwindcss` to `@tailwindcss/postcss`; `autoprefixer` was removed (v4 handles prefixing internally).

## Consequences

- One source of truth for design tokens: `app/globals.css`.
- New tokens are added to the `@theme` block, not a TypeScript config.
- `tailwind-merge` upgraded to v3 to match v4's class naming.
- **Never recreate `tailwind.config.ts`.** If you need a token, add it to `@theme`.
- The Tailwind v4 codemod made some mistakes (broken Google Fonts import, duplicate `:root` blocks) — the current `globals.css` is the hand-corrected version. Don't re-run the codemod on it.
