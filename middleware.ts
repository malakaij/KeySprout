import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'

// Attach a request ID to every API call so log lines from the same request
// can be correlated. Reads the incoming x-request-id header if present (useful
// when a reverse proxy or Vercel sets one upstream).
export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? nanoid(12)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-request-id', requestId)
  return response
}

export const config = {
  matcher: '/api/:path*',
}
