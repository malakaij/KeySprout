import { NextResponse } from 'next/server'

/**
 * Returns a 403 response if the request Origin header does not match the app's
 * own origin. Returns null if the check passes (call-site should return early on
 * non-null). Absent Origin headers are allowed — browsers always set Origin on
 * cross-site requests, so absence implies same-origin or a non-browser client.
 */
export function verifySameOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get('origin')
  if (!origin) return null

  const appUrl = process.env.NEXTAUTH_URL
  if (!appUrl) return null

  try {
    if (new URL(origin).origin === new URL(appUrl).origin) return null
  } catch {
    // Malformed origin or app URL — deny.
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
