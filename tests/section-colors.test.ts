import { describe, it, expect } from 'vitest'
import { SECTION_PALETTE, sectionColor } from '@/lib/section-colors'

describe('SECTION_PALETTE', () => {
  it('has 6 entries', () => {
    expect(SECTION_PALETTE).toHaveLength(6)
  })

  it('every entry has all required keys', () => {
    for (const entry of SECTION_PALETTE) {
      expect(entry).toHaveProperty('bg')
      expect(entry).toHaveProperty('solid')
      expect(entry).toHaveProperty('border')
      expect(entry).toHaveProperty('badgeClass')
      expect(entry).toHaveProperty('accentText')
      expect(entry).toHaveProperty('hex')
    }
  })

  it('every hex value is a valid 6-digit hex color', () => {
    for (const entry of SECTION_PALETTE) {
      expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('sectionColor', () => {
  it('returns the first palette entry for index 0', () => {
    expect(sectionColor(0)).toBe(SECTION_PALETTE[0])
  })

  it('returns the correct entry for each index within range', () => {
    for (let i = 0; i < SECTION_PALETTE.length; i++) {
      expect(sectionColor(i)).toBe(SECTION_PALETTE[i])
    }
  })

  it('wraps cyclically when index equals palette length', () => {
    expect(sectionColor(SECTION_PALETTE.length)).toBe(SECTION_PALETTE[0])
  })

  it('wraps cyclically for large indices', () => {
    expect(sectionColor(100)).toBe(SECTION_PALETTE[100 % SECTION_PALETTE.length])
  })
})
