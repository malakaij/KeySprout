# ADR-0006: No third-party analytics SDKs

**Status:** Accepted

## Context

KeySprout serves minors. Every third-party analytics SDK (Google Analytics, PostHog, Segment, Mixpanel, LogRocket, FullStory, etc.) ships a script that observes user behavior, sets identifiers, and forwards data to an external company. Even with privacy-conscious configuration, the surface area for unintentional PII leakage to a third party is large — and the COPPA exposure is non-trivial.

## Decision

No third-party analytics SDK will be added to the client bundle without explicit written approval from the project maintainer (currently malakaidmj@gmail.com). This applies to product analytics, session replay, heatmaps, error tracking with built-in analytics (e.g. Sentry session replay), and any "free tier" offered by a vendor.

Server-side analytics derived from our own database — aggregating lesson completions, WPM trends, etc. — are fine and encouraged, because the data never leaves our infrastructure.

## Consequences

- We have less visibility into how students actually use the app. Acceptable.
- Future PRs adding such SDKs must be rejected or held until maintainer approval is documented.
- The PR template includes a checkbox confirming no new analytics SDKs were added. Reviewers should treat it as load-bearing.
- This decision is broader than ADR-0002 (Sentry removal). Even after Sentry is re-added at launch, Sentry's session replay feature stays off.
