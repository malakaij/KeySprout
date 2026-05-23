# ADR-0008: Student names stored in teacher's browser only, never on the server

**Status:** Accepted

## Context

KeySprout's pseudonymous nickname system (ADR-0001) was designed for Google OAuth students — the OAuth `sub` is HMACed into an animal nickname and the real identity never touches the database. This works well for older students with Google accounts.

For younger students using credential-based logins (Epic #123), teachers still need to identify which nickname belongs to which student in their dashboard. The naive solution — storing first name + last initial in the database — introduces a server-side PII surface that creates three problems:

1. **Key management**: encrypting names at rest requires a `DISPLAY_NAME_KEY` env var. In a self-hosted deployment, the admin controls both the key and the database, so encryption provides no meaningful protection against the admin themselves, and a full server compromise defeats it entirely.
2. **COPPA obligations**: any PII on the server becomes subject to data retention policies, breach notification, and the 2025 COPPA amendments' written retention requirements.
3. **Self-hosted trust**: KeySprout is designed for self-hosting by schools and individuals. The maintainer cannot audit every self-hosted instance's security posture.

The same problem applies to identity provider integrations (Clever, Google Classroom): those APIs return real student names, but storing them server-side recreates the PII surface we are trying to avoid.

## Decision

Student display names are **never written to KeySprout's database or server-side logs.** Teachers maintain names in their own storage; KeySprout reads them transiently and caches them in the teacher's browser.

### Two roster input paths

**Path 1 — Identity provider (Clever, Google Classroom)**
The server exposes a stateless proxy endpoint (`GET /api/teacher/roster-names`). It reads the teacher's classroom roster (UUIDs only) from the DB, calls the identity provider API with those IDs, returns the `{ uuid → displayName }` mapping to the browser, and writes nothing to the DB. The proxy is stateless with respect to names.

**Path 2 — CSV upload**
For students on credential-based logins, the teacher downloads a pre-filled CSV template containing two columns: KeySprout UUID and animal nickname. The teacher adds a name column and re-uploads the file. The browser parses the CSV entirely client-side using the File API; the file bytes are never POSTed to the server. The UUID is the idempotent matching key, so re-uploads safely refresh names without creating duplicates.

### Two cache layers in the teacher's browser

Names are stored in the teacher's browser in two layers:

1. **`localStorage`** — synchronous write on every roster refresh, keyed by `{ classroomId: { uuid: displayName } }`. Fast, always available, device-specific.
2. **`drive.appdata`** — async write to a hidden JSON file in the teacher's Google Drive application data folder (requires `drive.appdata` OAuth scope). Cross-device persistent. `drive.appdata` is the source of truth: on page load, if `localStorage` is empty or stale, the browser fetches from `drive.appdata` and repopulates `localStorage`.

For teachers without a Google account who do not use an identity provider, `localStorage` is the only persistence layer. This is an accepted limitation for a rare case; the teacher can re-upload their CSV on a new device to restore the cache.

### Student login confirmation

The student-facing login confirmation screen (shown after QR code login) displays the student's animal nickname and their assigned Pip color variant — not their name. This means the confirmation requires no server-side name knowledge and works for pre-readers.

## Consequences

- **No name column on `User` or any related model.** Schema migrations for Epic #123 must not add a name field.
- **`drive.appdata` scope added to teacher OAuth.** The NextAuth Google provider configuration gains `drive.appdata` in its scope list when the teacher first connects name persistence.
- **CSV template endpoint required.** `GET /api/teacher/classrooms/:id/roster-template` returns a CSV of UUIDs and nicknames for the teacher to download. This is non-sensitive data (no PII).
- **The stateless proxy endpoint holds no state.** It must not log, cache, or write name data at any point in its execution. Code review must enforce this.
- **ADR-0001 is extended, not superseded.** The pseudonymous nickname system remains the identity model. This ADR governs how teachers optionally associate a display label with a nickname, entirely outside the server's data model.
- **Self-hosted admins gain no access to student names** by querying the database, reading logs, or reading env vars, because no names are ever written there.
