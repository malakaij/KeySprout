import { prisma } from '@/lib/db'

interface RateLimitResult {
  allowed: boolean
  /** Seconds until the current window resets. Only present when allowed is false. */
  retryAfter?: number
}

/**
 * Checks and increments a sliding-window rate limit counter stored in Postgres.
 * Creates the window on first call; resets automatically when the window expires.
 * Uses a transaction to prevent race conditions under concurrent requests.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } })

    if (!existing || existing.windowEnd < now) {
      await tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowEnd: new Date(now.getTime() + windowMs) },
        update: { count: 1, windowEnd: new Date(now.getTime() + windowMs) },
      })
      return { allowed: true }
    }

    if (existing.count >= limit) {
      const retryAfter = Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000)
      return { allowed: false, retryAfter }
    }

    await tx.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })
    return { allowed: true }
  })
}
