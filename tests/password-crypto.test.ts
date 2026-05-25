import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { encryptPassword, decryptPassword } from '@/lib/password-crypto'

// Valid 32-byte key as 64-char hex
const TEST_KEY = 'a'.repeat(64)

beforeEach(() => {
  vi.stubEnv('PASSWORD_ENCRYPTION_KEY', TEST_KEY)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('encryptPassword', () => {
  it('returns a non-empty hex string', () => {
    const result = encryptPassword('HELLO123')
    expect(result).toBeTruthy()
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('produces different ciphertext each call (random IV)', () => {
    const a = encryptPassword('HELLO123')
    const b = encryptPassword('HELLO123')
    expect(a).not.toBe(b)
  })

  it('returns null when PASSWORD_ENCRYPTION_KEY is not set', () => {
    vi.stubEnv('PASSWORD_ENCRYPTION_KEY', '')
    expect(encryptPassword('HELLO123')).toBeNull()
  })

  it('returns null when key is wrong length', () => {
    vi.stubEnv('PASSWORD_ENCRYPTION_KEY', 'tooshort')
    expect(encryptPassword('HELLO123')).toBeNull()
  })
})

describe('decryptPassword', () => {
  it('round-trips a password correctly', () => {
    const plain = 'ABC2DEF3'
    const encrypted = encryptPassword(plain)!
    expect(decryptPassword(encrypted)).toBe(plain)
  })

  it('returns null when PASSWORD_ENCRYPTION_KEY is not set', () => {
    const encrypted = encryptPassword('ABC2DEF3')!
    vi.stubEnv('PASSWORD_ENCRYPTION_KEY', '')
    expect(decryptPassword(encrypted)).toBeNull()
  })

  it('returns null for tampered ciphertext', () => {
    const encrypted = encryptPassword('ABC2DEF3')!
    // Flip the last character
    const tampered = encrypted.slice(0, -1) + (encrypted.endsWith('f') ? '0' : 'f')
    expect(decryptPassword(tampered)).toBeNull()
  })

  it('returns null for random garbage input', () => {
    expect(decryptPassword('deadbeef')).toBeNull()
  })
})
