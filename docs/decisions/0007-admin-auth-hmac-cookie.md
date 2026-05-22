# ADR-0007: Admin auth uses HMAC cookie, not NextAuth

**Status:** Accepted

## Context

The admin panel exposes destructive operations — most importantly, the database seed action, which clears and repopulates the curriculum tables. There is exactly one admin (the maintainer), not a class of users with rotating membership. NextAuth's model is built around per-user OAuth identities; using it for a single shared admin password would require either (a) a real Google account whitelisted in code, which entangles maintainer identity with the deployment, or (b) the Credentials provider, which carries its own complexity and is discouraged for production use.

## Decision

Admin authentication uses a single-purpose HMAC cookie scheme implemented in `lib/admin-auth.ts`. The admin logs in with a password (`ADMIN_PASSWORD` env var); the server signs a short-lived token and sets it as an HTTP-only cookie. Subsequent admin requests verify the cookie's HMAC signature.

## Consequences

- The admin auth lives separately from NextAuth and the student/teacher session model. This is deliberate — student and teacher sessions should never grant admin access regardless of bugs in either system.
- The current implementation compares `ADMIN_PASSWORD` with plain `===`. This is a known weakness — issue #45 (Sprint 8) switches to a hashed comparison with constant-time verification.
- **Do not migrate admin to NextAuth.** The separation is a feature, not legacy debt.
- Unit tests in `tests/admin-auth.test.ts` cover token round-trip, expiry, and tampering. Any changes to `lib/admin-auth.ts` must keep those green.
