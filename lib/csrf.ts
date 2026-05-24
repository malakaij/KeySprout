import { NextResponse } from 'next/server'

/**
 * Returns a 403 response if the request Origin header does not match the app's
 * own origin. Returns null if the check passes (call-site should return early on
 * non-null). Absent Origin headers are allowed — browsers always set Origin on
 * cross-site requests, so absence implies same-origin or a non-browser client.
 *
 * Accepts the origin if it matches either:
 * 1. The request Host header (handles preview/staging deployments whose URL
 *    differs from NEXTAUTH_URL), or
 * 2. NEXTAUTH_URL (the canonical production origin).
 */
export function verifySameOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get('origin')
  if (!origin) return null

  try {
    const originHost = new URL(origin).host

    // Same-origin: Origin host matches the server's own Host header.
    const host = req.headers.get('host')
    if (host && originHost === host) return null

    // Also accept the configured canonical URL (e.g. production on a custom domain).
    const appUrl = process.env.NEXTAUTH_URL
    if (appUrl && originHost === new URL(appUrl).host) return null
  } catch {
    // Malformed origin or NEXTAUTH_URL — deny.
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
