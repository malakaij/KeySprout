# ADR-0009: Accessibility features are on by default unless a competing need exists

**Status:** Accepted

---

## Context

KeySprout serves K–5 students — an audience that typically cannot self-advocate for accessibility accommodations. A child who struggles to read low-contrast text, or who has undiagnosed dyslexia, will not know to look for a settings panel. They will simply find the app harder to use and either disengage or be silently disadvantaged relative to their peers.

The conventional approach — comply with the minimum WCAG threshold and provide optional accessibility features — is insufficient for this audience. Optional features require users to:

1. Recognise that they have a need
2. Know that the app has a relevant setting
3. Find and operate that setting

K–5 students reliably fail all three steps. Many of the accommodations that help them (readable fonts, sufficient contrast, clear visual hierarchy) cost nothing for users who do not need them.

---

## Decision

**Accessibility features are the default state of the application unless doing so creates a competing need that would meaningfully degrade the experience for a significant portion of users.**

"Competing need" is defined narrowly. Aesthetic preference alone is not a competing need. A feature must be the default unless:

- It measurably and significantly harms readability or usability for users who do not need the accommodation (e.g. a font that impairs readers without dyslexia); or
- It conflicts with another accessibility concern for a different population; or
- It cannot be implemented as a universal default without breaking core product functionality.

When a competing need exists, the feature becomes an opt-in preference — but it must still be:
- Surfaced prominently (not buried in settings)
- Auto-applied when the OS reports the relevant preference (`prefers-contrast`, `prefers-reduced-motion`, etc.)
- Stored server-side so it persists across devices without requiring re-configuration on every login

---

## Applied examples

| Feature | Decision | Rationale |
|---------|----------|-----------|
| WCAG AA contrast on all informational text | **Default for everyone** | No competing need. Raising muted text opacity from 40% to 70% preserves visual hierarchy while passing WCAG AA. |
| `prefers-contrast: more` CSS media query | **Honoured automatically** | Zero implementation cost; respects OS-level choice students may have had made for them by a parent or school. |
| High-contrast mode (white paper, 90% ink) | **Opt-in, auto-applied from OS** | Competing need: the warm cream paper aesthetic is a deliberate design choice central to the kid-friendly brand. Not everyone benefits from maximum contrast. |
| Dyslexia-friendly font options | **Opt-in** | Competing need: fonts designed for dyslexia impair reading speed for many users without dyslexia; making one the default would disadvantage the majority to help the minority. |
| Skip-to-main keyboard link | **Default (visually hidden)** | No competing need. Present and functional for keyboard users; invisible to pointer users. |
| `focus-visible` outlines | **Default for everyone** | No competing need. Visible focus indicators benefit keyboard users; mouse/touch users never trigger `:focus-visible`. |

---

## Consequences

- Every new feature is evaluated against this principle before shipping.
- "Optional" is not an acceptable answer to an accessibility gap unless a genuine competing need can be named. Absence of evidence of user complaints is not evidence of absence of need.
- Preferences that cannot be universal defaults must still be prominently surfaced, auto-applied from OS signals, and server-persisted.
- This principle extends ADR-0001 (privacy by default) to the accessibility domain: both treat the least-visible user as the design constraint, not the exception.
