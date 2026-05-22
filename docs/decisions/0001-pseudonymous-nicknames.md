# ADR-0001: Pseudonymous animal nicknames, no real names stored

**Status:** Accepted

## Context

KeySprout serves K–5 students. COPPA and FERPA make any storage of real names, photos, or identifying information a significant liability — and harvesting that data from a Google OAuth flow would be technically trivial but ethically wrong. Teachers do need *some* way to identify students in their class roster.

## Decision

We discard the Google profile (`name`, `email`, `picture`) at sign-in and never persist it. Instead, we derive a deterministic pseudonymous nickname (e.g. "Brave Otter") from the OAuth `sub` using `lib/name-generator.ts`. The `sub` itself is hashed before storage; only the hash and the nickname are kept.

Teachers see and approve students by nickname. There is no UI surface anywhere that displays a real name.

## Consequences

- A student who switches Google accounts gets a new nickname and starts over — accepted trade-off.
- Teachers managing larger classes may have trouble distinguishing students. Acceptable for now; a teacher-assignable display label scoped to one classroom is a future option that wouldn't violate the constraint.
- We can never recover a real-world identity from our database. This is by design and should not be "fixed."
- Any future feature that wants to display, log, or export student names must be rejected or redesigned.
