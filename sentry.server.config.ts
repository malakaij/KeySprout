import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  // Never log PII — student names, emails, or Google sub values must not reach Sentry
  beforeSend(event) {
    // Strip user identity fields before the event leaves the server
    if (event.user) {
      delete event.user.email
      delete event.user.username
      event.user = { id: event.user.id }
    }
    return event
  },
})
