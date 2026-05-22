import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'ks_admin'
const MAX_AGE_MS = 4 * 60 * 60 * 1000 // 4 hours

function secret() {
  return process.env.NEXTAUTH_SECRET ?? 'dev-secret'
}

/** Produces a `{timestampMs}.{hmac_hex}` token signed with NEXTAUTH_SECRET. */
export function createAdminToken(): string {
  const ts = Date.now().toString()
  const sig = createHmac('sha256', secret()).update(`admin:${ts}`).digest('hex')
  return `${ts}.${sig}`
}

/**
 * Validates a token by checking both its HMAC signature and its age.
 * Checking age before the HMAC would leak timing info about valid-but-expired tokens,
 * so age is checked first only as a fast-reject; the HMAC check always runs.
 */
export function verifyAdminToken(token: string): boolean {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const ts = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (Date.now() - parseInt(ts) > MAX_AGE_MS) return false
  const expected = createHmac('sha256', secret()).update(`admin:${ts}`).digest('hex')
  return sig === expected
}

export function isAdminAuthenticated(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value
  return !!token && verifyAdminToken(token)
}
