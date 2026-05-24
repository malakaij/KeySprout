import { describe, it, expect, vi, afterEach } from 'vitest'
import { verifySameOrigin } from '@/lib/csrf'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('verifySameOrigin', () => {
  function makeRequest(origin?: string, host?: string) {
    const headers: Record<string, string> = {}
    if (origin) headers['origin'] = origin
    if (host) headers['host'] = host
    return new Request('http://localhost/api/test', { method: 'POST', headers })
  }

  it('returns null when no Origin header is present', () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    expect(verifySameOrigin(makeRequest())).toBeNull()
  })

  it('returns null when NEXTAUTH_URL is not set and Origin matches Host', () => {
    vi.stubEnv('NEXTAUTH_URL', '')
    expect(verifySameOrigin(makeRequest('http://localhost', 'localhost'))).toBeNull()
  })

  it('returns null when Origin host matches the request Host header (preview deployment)', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://app.example.com')
    expect(verifySameOrigin(makeRequest('https://preview.vercel.app', 'preview.vercel.app'))).toBeNull()
  })

  it('returns null when Origin matches NEXTAUTH_URL even without Host match', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://app.example.com')
    expect(verifySameOrigin(makeRequest('https://app.example.com'))).toBeNull()
  })

  it('returns null when Origin matches a production https origin', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://app.example.com')
    expect(verifySameOrigin(makeRequest('https://app.example.com', 'app.example.com'))).toBeNull()
  })

  it('returns a 403 response when Origin matches neither Host nor NEXTAUTH_URL', async () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    const result = verifySameOrigin(makeRequest('http://evil.com', 'localhost:3000'))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
    const body = await result!.json()
    expect(body.error).toBe('Forbidden')
  })

  it('returns a 403 response for a malformed Origin header', () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    const result = verifySameOrigin(makeRequest('not-a-url', 'localhost:3000'))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
  })
})
