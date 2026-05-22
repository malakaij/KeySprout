import pino from 'pino'

/**
 * Structured logger for all server-side code.
 * Outputs JSON in production; colorized human-readable output in development.
 * Log level is controlled by the LOG_LEVEL environment variable (default: "info").
 *
 * Rules:
 * - Never log real names, email addresses, or Google sub values.
 * - Always include a `requestId` field when one is available (passed from route handler).
 * - Internal UUIDs (user.id, lesson.id) are safe to log — they are opaque without DB access.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname' },
    },
  }),
})

/** Returns a child logger pre-bound to a specific request ID. */
export function requestLogger(requestId: string) {
  return logger.child({ requestId })
}
