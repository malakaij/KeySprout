import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAdminToken, verifyAdminToken } from '@/lib/admin-auth'

// NEXTAUTH_SECRET is set to 'test-secret-for-vitest-do-not-use-in-production'
// by tests/setup.ts

describe('createAdminToken', () => {
  it('returns a string with exactly one dot', () => {
    const token = createAdminToken()
    expect(token.split('.').length).toBe(2)
  })

  it('starts with a numeric timestamp', () => {
    const token = createAdminToken()
    const ts = token.split('.')[0]
    expect(Number.isFinite(Number(ts))).toBe(true)
  })

  it('timestamp is close to Date.now()', () => {
    const before = Date.now()
    const token = createAdminToken()
    const after = Date.now()
    const ts = parseInt(token.split('.')[0])
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })
})

describe('verifyAdminToken', () => {
  it('accepts a freshly created token', () => {
    const token = createAdminToken()
    expect(verifyAdminToken(token)).toBe(true)
  })

  it('rejects an empty string', () => {
    expect(verifyAdminToken('')).toBe(false)
  })

  it('rejects a token with no dot', () => {
    expect(verifyAdminToken('nodothere')).toBe(false)
  })

  it('rejects a token with a forged HMAC', () => {
    const token = createAdminToken()
    const ts = token.split('.')[0]
    expect(verifyAdminToken(`${ts}.deadbeefdeadbeef`)).toBe(false)
  })

  it('rejects a token with a tampered timestamp', () => {
    const token = createAdminToken()
    const sig = token.split('.')[1]
    expect(verifyAdminToken(`9999999999999.${sig}`)).toBe(false)
  })

  it('rejects an expired token (older than 4 hours)', async () => {
    const fourHoursAgo = (Date.now() - 4 * 60 * 60 * 1000 - 1000).toString()
    // Build a valid HMAC for the old timestamp using the test secret
    const { createHmac } = await import('crypto')
    const sig = createHmac('sha256', 'test-secret-for-vitest-do-not-use-in-production')
      .update(`admin:${fourHoursAgo}`)
      .digest('hex')
    expect(verifyAdminToken(`${fourHoursAgo}.${sig}`)).toBe(false)
  })

  it('tokens from different secrets do not cross-verify', () => {
    const original = process.env.NEXTAUTH_SECRET
    process.env.NEXTAUTH_SECRET = 'secret-one'
    const token = createAdminToken()

    process.env.NEXTAUTH_SECRET = 'secret-two'
    expect(verifyAdminToken(token)).toBe(false)

    process.env.NEXTAUTH_SECRET = original
  })

  it('accepts a future-dated token if HMAC is valid', async () => {
    // Future timestamps are allowed — clocks can drift
    const { createHmac } = await import('crypto')
    const futureTs = (Date.now() + 60_000).toString()
    const sig = createHmac('sha256', 'test-secret-for-vitest-do-not-use-in-production')
      .update(`admin:${futureTs}`)
      .digest('hex')
    expect(verifyAdminToken(`${futureTs}.${sig}`)).toBe(true)
  })
})
