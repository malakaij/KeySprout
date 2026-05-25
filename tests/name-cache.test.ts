import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getNames, setName, setNames, clearNames } from '@/lib/name-cache'

// Provide a minimal localStorage shim — vitest runs in Node where it's absent.
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
}
vi.stubGlobal('window', { localStorage: localStorageMock })
vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => localStorageMock.clear())

describe('getNames', () => {
  it('returns empty object when nothing is stored', () => {
    expect(getNames('class-1')).toEqual({})
  })

  it('returns stored mapping for the correct classroom', () => {
    localStorage.setItem('kq-names-class-1', JSON.stringify({ uid1: 'Alice' }))
    expect(getNames('class-1')).toEqual({ uid1: 'Alice' })
  })

  it('does not bleed between classrooms', () => {
    localStorage.setItem('kq-names-class-1', JSON.stringify({ uid1: 'Alice' }))
    expect(getNames('class-2')).toEqual({})
  })

  it('returns empty object when stored value is malformed JSON', () => {
    localStorage.setItem('kq-names-class-1', 'not json')
    expect(getNames('class-1')).toEqual({})
  })
})

describe('setName', () => {
  it('persists a single name entry', () => {
    setName('class-1', 'uid1', 'Alice')
    expect(getNames('class-1')).toEqual({ uid1: 'Alice' })
  })

  it('merges with existing entries rather than replacing them', () => {
    setName('class-1', 'uid1', 'Alice')
    setName('class-1', 'uid2', 'Bob')
    expect(getNames('class-1')).toEqual({ uid1: 'Alice', uid2: 'Bob' })
  })

  it('overwrites a name for the same userId', () => {
    setName('class-1', 'uid1', 'Alice')
    setName('class-1', 'uid1', 'Alicia')
    expect(getNames('class-1')['uid1']).toBe('Alicia')
  })

  it('does not affect other classrooms', () => {
    setName('class-1', 'uid1', 'Alice')
    expect(getNames('class-2')).toEqual({})
  })
})

describe('setNames', () => {
  it('replaces the entire mapping', () => {
    setName('class-1', 'uid1', 'Alice')
    setNames('class-1', { uid2: 'Bob', uid3: 'Carol' })
    expect(getNames('class-1')).toEqual({ uid2: 'Bob', uid3: 'Carol' })
  })

  it('stores an empty mapping without error', () => {
    setNames('class-1', {})
    expect(getNames('class-1')).toEqual({})
  })
})

describe('clearNames', () => {
  it('removes all names for a classroom', () => {
    setName('class-1', 'uid1', 'Alice')
    clearNames('class-1')
    expect(getNames('class-1')).toEqual({})
  })

  it('does not affect other classrooms', () => {
    setName('class-1', 'uid1', 'Alice')
    setName('class-2', 'uid2', 'Bob')
    clearNames('class-1')
    expect(getNames('class-2')).toEqual({ uid2: 'Bob' })
  })

  it('does not throw when clearing a classroom with no stored names', () => {
    expect(() => clearNames('class-nonexistent')).not.toThrow()
  })
})
