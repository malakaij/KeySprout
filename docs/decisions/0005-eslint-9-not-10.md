# ADR-0005: Stay on ESLint 9 until `eslint-config-next` supports 10

**Status:** Accepted (Sprint 4.1)

## Context

Dependabot opened PR #22 to upgrade ESLint from 9 to 10. The upgrade fails because `eslint-config-next@15` declares a peer dependency of `eslint: ^7.23.0 || ^8.0.0 || ^9.0.0` — ESLint 10 is not listed.

## Decision

Stay on ESLint 9 (currently 9.39.4). Closed PR #22 with a reference to this ADR. Reassess when Next.js publishes an `eslint-config-next` version that supports ESLint 10.

## Consequences

- Future Dependabot PRs for ESLint 10 will appear and should be closed with the same reasoning until the upstream peer dep updates.
- The flat config (`eslint.config.mjs`) is fully compatible with ESLint 9; no migration needed when 10 becomes viable.
- **Do not force the upgrade** by overriding the peer dependency or pinning a forked config — both options trade a clean dependency tree for a marginal version bump.
