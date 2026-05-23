# Security & Privacy

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, email **malakaidmj@gmail.com** or open a [GitHub Security Advisory](https://github.com/malakaij/KeySprout/security/advisories/new) (private disclosure).

Include:
1. Description of the vulnerability and potential impact
2. Steps to reproduce or a proof-of-concept
3. Relevant file paths or component names

You will receive a response within **72 hours**. Once a fix is confirmed we will patch, release, credit the reporter (unless anonymous is preferred), and publish a brief advisory.

### Scope

In scope:
- Authentication bypasses (admin cookie forgery, session hijacking)
- Privilege escalation (student accessing teacher or super-admin routes)
- SQL injection or Prisma query manipulation
- Exposure of personally identifiable information (real Google emails, names)
- XSS in any student-facing or teacher-facing UI

Out of scope:
- DoS attacks requiring valid admin credentials
- Vulnerabilities in third-party dependencies with no published fix
- Issues that only affect self-hosted instances misconfigured by the operator

---

## Supported versions

KeySprout is pre-1.0 (alpha). Security fixes are applied to the latest commit on `main` only.

---

## Data practices (COPPA)

KeySprout is designed for K–5 students and targets compliance with COPPA (Children's Online Privacy Protection Act, including the April 2026 rule updates).

### What is collected

| Data | Collected | Purpose |
|------|-----------|---------|
| Google `sub` (opaque account ID) | Yes — stored as `{sub}@keysprout.invalid` | Identifies the account across sessions |
| Real name | **No** | — |
| Email address | **No** | — |
| Profile photo | **No** | — |
| Typing speed (WPM) and accuracy | Yes | Progress dashboard and weak-key analysis |
| Game scores | Yes | Personal best tracking |
| Actual text typed | **No** | Only aggregate statistics are stored |
| IP addresses | Transient server logs only | Not persisted to the database |

### What we do not do

- No selling, sharing, or transferring of student data to any third party.
- No advertising or behavioural tracking.
- No third-party analytics SDKs (see ADR-0006).
- Cookies limited to: NextAuth session cookie, super-admin cookie, and optional display-preference cookies (`kq-font`, `kq-contrast`).

### Student nicknames

Every student receives a random animal nickname (e.g., "Cheerful Penguin") derived pseudonymously from their Google `sub`. Real names are never requested or stored by KeySprout. Teachers who need to associate nicknames with real students maintain that mapping in their own records (see ADR-0008).

### COPPA operator responsibility

KeySprout is a **school operator** tool. Under COPPA, schools and districts that deploy KeySprout take responsibility for obtaining parental consent where required. KeySprout does not condition educational participation on disclosure of more personal information than necessary, and does not use student data for commercial purposes.

### Data retention

No automatic data expiry is implemented in alpha. Self-hosters are responsible for their own retention policies. A future admin panel will support per-user data deletion.

---

## Security controls

### Authentication

- Student and teacher sessions use NextAuth v4 with Google OAuth (database sessions, not JWTs). Sessions are invalidated immediately on sign-out by deleting the `Session` row.
- The super-admin panel uses a separate HMAC-cookie mechanism with a bcrypt-hashed password (cost 12). See ADR-0007.
- Token HMAC comparisons use `crypto.timingSafeEqual` to prevent timing side-channels.

### Transport

All production traffic must be served over HTTPS. Set `NEXTAUTH_URL` to an `https://` origin. The admin cookie has the `Secure` flag set in production.

### CSRF

- Session cookies are `SameSite=Lax`; the super-admin cookie is `SameSite=Strict`. Both prevent cookie transmission on cross-site POST requests at the browser level.
- `lib/csrf.ts` — `verifySameOrigin()` additionally checks the `Origin` header against `NEXTAUTH_URL` on every state-changing API route as defense-in-depth.

### Rate limiting

Counters are stored in the `RateLimit` Postgres table (no additional infrastructure required).

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/lessons/*/complete` | 20 per user | 1 minute |
| `POST /api/games/score` | 10 per user | 1 minute |
| `POST /api/user/join-class` | 10 per user | 5 minutes |
| `POST /api/admin/login` | 10 per IP | 5 minutes |

### Input validation

Every API route that reads a request body validates it with a Zod schema before any database access.

---

## Dependency audit

`npm audit` reports 4 moderate findings, all in transitive dependencies of Next.js and next-auth. Neither is exploitable in KeySprout's usage:

| Advisory | Package | Notes |
|----------|---------|-------|
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | `postcss` (via Next.js) | XSS in CSS stringify. We do not call PostCSS with untrusted CSS at runtime. The "fix" downgrades Next.js to an incompatible version. |
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | `uuid` (via next-auth) | Buffer bounds check when a `buf` argument is passed. Neither we nor next-auth pass a `buf` argument. The "fix" downgrades to next-auth v3 (incompatible). |

Both are accepted risks pending upstream fixes. This file will be updated when they are resolved.
