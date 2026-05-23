# ADR-0007: Super-Admin auth uses HMAC cookie, not NextAuth

**Status:** Accepted

## Context

The super-admin panel exposes destructive operations — most importantly, the database seed action, which clears and repopulates the curriculum tables. There is exactly one super-admin (the maintainer), not a class of users with rotating membership. NextAuth's model is built around per-user OAuth identities; using it for a single shared password would require either (a) a real Google account whitelisted in code, which entangles maintainer identity with the deployment, or (b) the Credentials provider, which carries its own complexity and is discouraged for production use.

## Decision

Super-Admin authentication uses a single-purpose HMAC cookie scheme implemented in `lib/admin-auth.ts`. The super-admin logs in with a bcrypt-hashed password stored in `SUPER_ADMIN_PASSWORD`; the server verifies the hash with `bcryptjs.compare()` and signs a short-lived token stored as an HTTP-only, `SameSite=Strict` cookie. Token HMAC comparisons use `crypto.timingSafeEqual` to prevent timing side-channels.

**Terminology:**

| Role | Manages | Auth mechanism |
|------|---------|----------------|
| **Super-Admin** | Deployments, migrations, seeding, infrastructure | HMAC cookie (this ADR) |
| **Admin** *(future)* | Teachers, student accounts, classroom approvals | NextAuth, per-user |
| **Teacher** | Their own classrooms and students | NextAuth |
| **Student** | Their own lessons and progress | NextAuth |

URL paths (`/admin`, `/api/admin/*`) remain unchanged for backwards compatibility. Only code symbols and UI labels reflect the Super-Admin name.

## Consequences

- The super-admin auth lives entirely separately from NextAuth and the student/teacher session model. This is deliberate — student and teacher sessions must never grant super-admin access regardless of bugs in either system.
- `SUPER_ADMIN_PASSWORD` stores a bcrypt hash, not a plaintext password. Deployers must generate a hash before first run: `node -e "require('bcryptjs').hash('your-password',12).then(console.log)"`.
- **Do not migrate super-admin to NextAuth.** The separation is a feature, not legacy debt.
- Unit tests in `tests/admin-auth.test.ts` cover token round-trip, expiry, and tampering.
