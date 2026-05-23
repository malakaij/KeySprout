import { describe, it, expect, vi, afterEach } from 'vitest'
import { verifySameOrigin } from '@/lib/csrf'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('verifySameOrigin', () => {
  function makeRequest(origin?: string) {
    return new Request('http://localhost/api/test', {
      method: 'POST',
      headers: origin ? { origin } : {},
    })
  }

  it('returns null when no Origin header is present', () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    expect(verifySameOrigin(makeRequest())).toBeNull()
  })

  it('returns null when NEXTAUTH_URL is not set', () => {
    vi.stubEnv('NEXTAUTH_URL', '')
    expect(verifySameOrigin(makeRequest('http://evil.com'))).toBeNull()
  })

  it('returns null when Origin matches the app origin', () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    expect(verifySameOrigin(makeRequest('http://localhost:3000'))).toBeNull()
  })

  it('returns null when Origin matches a production https origin', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://app.example.com')
    expect(verifySameOrigin(makeRequest('https://app.example.com'))).toBeNull()
  })

  it('returns a 403 response when Origin does not match', async () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    const result = verifySameOrigin(makeRequest('http://evil.com'))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
    const body = await result!.json()
    expect(body.error).toBe('Forbidden')
  })

  it('returns a 403 response for a malformed Origin header', () => {
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
    const result = verifySameOrigin(makeRequest('not-a-url'))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(403)
  })
})
