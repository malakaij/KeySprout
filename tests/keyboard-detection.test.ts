import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  looksLikeNoKeyboard,
  getKeyboardOverride,
  setKeyboardOverride,
  clearKeyboardOverride,
} from '@/lib/keyboard-detection'

// ---------------------------------------------------------------------------
// looksLikeNoKeyboard
// ---------------------------------------------------------------------------

describe('looksLikeNoKeyboard — SSR (window undefined)', () => {
  it('returns false when window is not defined', () => {
    // Tests run in Node — window is undefined, so the guard exits early.
    expect(looksLikeNoKeyboard()).toBe(false)
  })
})

describe('looksLikeNoKeyboard — browser stubs', () => {
  beforeEach(() => {
    // Expose a minimal window object so the function proceeds past the SSR guard.
    vi.stubGlobal('window', {
      matchMedia: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubDevice({
    coarsePointer,
    maxTouchPoints,
  }: {
    coarsePointer: boolean
    maxTouchPoints: number
  }) {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: coarsePointer } as MediaQueryList)
    vi.stubGlobal('navigator', { maxTouchPoints })
  }

  it('returns false for a desktop with a fine pointer and no touch points', () => {
    stubDevice({ coarsePointer: false, maxTouchPoints: 0 })
    expect(looksLikeNoKeyboard()).toBe(false)
  })

  it('returns true for a touch-only phone (coarse pointer, touch points > 0)', () => {
    stubDevice({ coarsePointer: true, maxTouchPoints: 5 })
    expect(looksLikeNoKeyboard()).toBe(true)
  })

  it('returns false when pointer is coarse but there are no touch points', () => {
    // Unusual but possible; absence of touch points means no virtual keyboard either.
    stubDevice({ coarsePointer: true, maxTouchPoints: 0 })
    expect(looksLikeNoKeyboard()).toBe(false)
  })

  it('returns false for a tablet with a Bluetooth keyboard — initial detection is coarse+touch (warning shows, auto-dismissed by keypress)', () => {
    // An iPad always has a coarse pointer and touch points regardless of whether a
    // Bluetooth keyboard is paired.  The detection intentionally flags it so the
    // KeyboardGuard can listen for the first trusted keydown and dismiss itself.
    stubDevice({ coarsePointer: true, maxTouchPoints: 5 })
    expect(looksLikeNoKeyboard()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// localStorage override helpers
// ---------------------------------------------------------------------------

describe('keyboard override helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      _store: {} as Record<string, string>,
      getItem(key: string) { return (this._store as Record<string, string>)[key] ?? null },
      setItem(key: string, value: string) { (this._store as Record<string, string>)[key] = value },
      removeItem(key: string) { delete (this._store as Record<string, string>)[key] },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getKeyboardOverride returns false when no key is stored', () => {
    expect(getKeyboardOverride()).toBe(false)
  })

  it('setKeyboardOverride persists a truthy flag', () => {
    setKeyboardOverride()
    expect(getKeyboardOverride()).toBe(true)
  })

  it('clearKeyboardOverride removes the flag', () => {
    setKeyboardOverride()
    clearKeyboardOverride()
    expect(getKeyboardOverride()).toBe(false)
  })

  it('getKeyboardOverride returns false if localStorage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem() { throw new Error('storage denied') },
    })
    expect(getKeyboardOverride()).toBe(false)
  })
})
