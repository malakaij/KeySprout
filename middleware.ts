import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'

/**
 * Builds the Content-Security-Policy header value for a given nonce.
 *
 * Design notes:
 * - script-src: nonce + strict-dynamic covers Next.js runtime and all
 *   dynamically-loaded scripts. 'unsafe-inline' is included as a fallback
 *   for browsers without CSP3 support; CSP3-capable browsers ignore it when
 *   a nonce is present.
 * - style-src: 'unsafe-inline' is required — Next.js injects inline styles,
 *   Tailwind v4 uses @layer, and LessonsClient has a <style> tag for the
 *   pulse-ring keyframe animation.
 * - font-src: Google Fonts files (fonts.gstatic.com) and jsDelivr for
 *   OpenDyslexic (cdn.jsdelivr.net).
 * - img-src: Google user avatars served from *.googleusercontent.com;
 *   data: and blob: for Next.js image optimisation.
 * - form-action: accounts.google.com for the OAuth redirect POST.
 * - upgrade-insecure-requests: skipped in development to avoid breaking
 *   the local http server.
 */
function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production'

  const directives: string[] = [
    `default-src 'self'`,
    // 'unsafe-inline' ignored by CSP3 browsers when a nonce is present.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net`,
    `img-src 'self' https://*.googleusercontent.com data: blob:`,
    `connect-src 'self'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://accounts.google.com`,
    ...(isProd ? [`upgrade-insecure-requests`] : []),
  ]

  return directives.join('; ')
}

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? nanoid(12)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)
  // x-nonce is read by the root layout to forward the nonce to <Script> components.
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('x-request-id', requestId)
  response.headers.set('Content-Security-Policy', csp)

  // Companion security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Run on every route except Next.js internals and static assets so the
     * CSP header is present on all HTML responses.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
