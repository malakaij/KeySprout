# ADR-0002: Remove Sentry until launch

**Status:** Accepted (Sprint 4.1)

## Context

Sentry was added in Sprint 4 for error tracking. By Sprint 4.1 it had produced zero useful signal: the app has no real users, and the only errors captured were from local development. Meanwhile, Sentry added build-time warnings, runtime overhead, a third-party SDK, and ongoing dependency churn.

## Decision

Remove `@sentry/nextjs` and all related configuration. Rely on `pino` structured logging (already in place via `lib/logger.ts`) for server-side error capture. Revisit Sentry — or an alternative — closer to public launch when real users exist.

## Consequences

- No external error aggregation until launch. Acceptable given there are no users to error.
- `pino` logs are JSON in production and can be piped to any aggregator if needed in the interim.
- Re-adding Sentry later is straightforward: install the package, run the wizard, restore the config. The earlier removal commit can serve as a reference for what to add back.
- **Do not re-propose Sentry (or PostHog, LogRocket, Datadog RUM, etc.) until the project has real users.** "Observability before users" is the trap this ADR is here to prevent.
