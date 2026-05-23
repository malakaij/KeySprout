import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

const mockTx = {
  rateLimit: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('@/lib/db', () => ({
  prisma: {
    $transaction: vi.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('checkRateLimit', () => {
  const key = 'test:user-123'
  const limit = 5
  const windowMs = 60_000

  it('allows the request and creates a new window when no record exists', async () => {
    mockTx.rateLimit.findUnique.mockResolvedValue(null)
    mockTx.rateLimit.upsert.mockResolvedValue({})

    const result = await checkRateLimit(key, limit, windowMs)

    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
    expect(mockTx.rateLimit.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key },
        create: expect.objectContaining({ key, count: 1 }),
        update: expect.objectContaining({ count: 1 }),
      }),
    )
  })

  it('allows the request and resets an expired window', async () => {
    const pastEnd = new Date(Date.now() - 1000)
    mockTx.rateLimit.findUnique.mockResolvedValue({
      key,
      count: 99,
      windowEnd: pastEnd,
    })
    mockTx.rateLimit.upsert.mockResolvedValue({})

    const result = await checkRateLimit(key, limit, windowMs)

    expect(result.allowed).toBe(true)
    expect(mockTx.rateLimit.upsert).toHaveBeenCalled()
    expect(mockTx.rateLimit.update).not.toHaveBeenCalled()
  })

  it('allows the request and increments when count is below the limit', async () => {
    const futureEnd = new Date(Date.now() + 30_000)
    mockTx.rateLimit.findUnique.mockResolvedValue({
      key,
      count: 3,
      windowEnd: futureEnd,
    })
    mockTx.rateLimit.update.mockResolvedValue({})

    const result = await checkRateLimit(key, limit, windowMs)

    expect(result.allowed).toBe(true)
    expect(mockTx.rateLimit.update).toHaveBeenCalledWith({
      where: { key },
      data: { count: { increment: 1 } },
    })
    expect(mockTx.rateLimit.upsert).not.toHaveBeenCalled()
  })

  it('blocks the request when count equals the limit', async () => {
    const futureEnd = new Date(Date.now() + 45_000)
    mockTx.rateLimit.findUnique.mockResolvedValue({
      key,
      count: 5,
      windowEnd: futureEnd,
    })

    const result = await checkRateLimit(key, limit, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.retryAfter).toBeLessThanOrEqual(45)
    expect(mockTx.rateLimit.update).not.toHaveBeenCalled()
    expect(mockTx.rateLimit.upsert).not.toHaveBeenCalled()
  })

  it('blocks the request when count exceeds the limit', async () => {
    const futureEnd = new Date(Date.now() + 10_000)
    mockTx.rateLimit.findUnique.mockResolvedValue({
      key,
      count: 20,
      windowEnd: futureEnd,
    })

    const result = await checkRateLimit(key, limit, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('returns retryAfter of 1 when the window expires in less than a second', async () => {
    const nearlyExpired = new Date(Date.now() + 100)
    mockTx.rateLimit.findUnique.mockResolvedValue({
      key,
      count: 5,
      windowEnd: nearlyExpired,
    })

    const result = await checkRateLimit(key, limit, windowMs)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBe(1)
  })
})
