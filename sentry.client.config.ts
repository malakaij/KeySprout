import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Disabled when DSN is absent (local dev without .env.local entry)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  // No session replay — students are minors; keep data collection minimal
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
})
