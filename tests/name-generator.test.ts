import { describe, it, expect } from 'vitest'
import { generateDisplayName } from '@/lib/name-generator'

describe('generateDisplayName', () => {
  it('returns a non-empty string', () => {
    expect(generateDisplayName('user123')).toBeTruthy()
  })

  it('produces two capitalized words separated by a space', () => {
    const name = generateDisplayName('user123')
    const parts = name.split(' ')
    expect(parts).toHaveLength(2)
    expect(parts[0][0]).toBe(parts[0][0].toUpperCase())
    expect(parts[1][0]).toBe(parts[1][0].toUpperCase())
  })

  it('contains no digits or PII', () => {
    const name = generateDisplayName('1234567890')
    expect(name).not.toMatch(/\d/)
  })

  it('is deterministic — same sub always yields the same nickname', () => {
    const sub = 'google-sub-abc-123'
    const first = generateDisplayName(sub)
    for (let i = 0; i < 100; i++) {
      expect(generateDisplayName(sub)).toBe(first)
    }
  })

  it('produces different names for different subs (collision rate check)', () => {
    const subs = Array.from({ length: 200 }, (_, i) => `sub_${i}`)
    const names = new Set(subs.map(generateDisplayName))
    // Allow a small collision rate but expect the vast majority to be unique
    expect(names.size).toBeGreaterThan(150)
  })

  it('covers both adjective and animal pools across many subs', () => {
    const subs = Array.from({ length: 500 }, (_, i) => `sub_${i}`)
    const names = subs.map(generateDisplayName)
    const adjectives = new Set(names.map((n) => n.split(' ')[0]))
    const animals = new Set(names.map((n) => n.split(' ')[1]))
    // Should draw from more than one adjective and more than one animal
    expect(adjectives.size).toBeGreaterThan(10)
    expect(animals.size).toBeGreaterThan(10)
  })

  it('handles empty string sub without throwing', () => {
    expect(() => generateDisplayName('')).not.toThrow()
  })

  it('handles very long sub strings', () => {
    const longSub = 'a'.repeat(1000)
    expect(() => generateDisplayName(longSub)).not.toThrow()
    expect(generateDisplayName(longSub).split(' ')).toHaveLength(2)
  })
})
