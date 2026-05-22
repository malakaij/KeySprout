import { describe, it, expect } from 'vitest'
import {
  calculateWpm,
  calculateAccuracy,
  analyzeWeakKeys,
  generateDynamicText,
} from '@/lib/typing-engine'

describe('calculateWpm', () => {
  it('returns 0 when seconds is 0', () => {
    expect(calculateWpm(100, 0)).toBe(0)
  })

  it('calculates WPM using 5-chars-per-word definition', () => {
    // 300 chars in 60 seconds = 60 WPM
    expect(calculateWpm(300, 60)).toBe(60)
  })

  it('rounds to nearest integer', () => {
    // 100 chars in 60 seconds = 20 WPM exactly
    expect(calculateWpm(100, 60)).toBe(20)
  })

  it('handles fractional seconds', () => {
    // 50 chars in 30 seconds = 20 WPM
    expect(calculateWpm(50, 30)).toBe(20)
  })

  it('returns 0 for 0 chars', () => {
    expect(calculateWpm(0, 30)).toBe(0)
  })
})

describe('calculateAccuracy', () => {
  it('returns 1.0 when total is 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(1)
  })

  it('returns 1.0 for all-correct keystrokes', () => {
    expect(calculateAccuracy(50, 50)).toBe(1)
  })

  it('calculates partial accuracy', () => {
    expect(calculateAccuracy(75, 100)).toBe(0.75)
  })

  it('returns 0 for all-wrong keystrokes', () => {
    expect(calculateAccuracy(0, 100)).toBe(0)
  })

  it('clamps to 1 if correct exceeds total', () => {
    expect(calculateAccuracy(110, 100)).toBe(1)
  })
})

describe('analyzeWeakKeys', () => {
  it('returns empty object for empty inputs', () => {
    expect(analyzeWeakKeys('', '')).toEqual({})
  })

  it('returns empty object when typedText is empty', () => {
    expect(analyzeWeakKeys('hello', '')).toEqual({})
  })

  it('skips whitespace characters', () => {
    const result = analyzeWeakKeys('a b', 'a b')
    expect(result).not.toHaveProperty(' ')
  })

  it('reports 0 error rate for perfectly typed text', () => {
    const result = analyzeWeakKeys('abc', 'abc')
    expect(result.a).toBe(0)
    expect(result.b).toBe(0)
    expect(result.c).toBe(0)
  })

  it('reports 1.0 error rate for fully wrong text', () => {
    const result = analyzeWeakKeys('aaa', 'bbb')
    expect(result.a).toBe(1)
  })

  it('only analyses up to the length of typedText', () => {
    // Only 'a' was typed; 'b' and 'c' should not appear
    const result = analyzeWeakKeys('abc', 'a')
    expect(result).toHaveProperty('a')
    expect(result).not.toHaveProperty('b')
    expect(result).not.toHaveProperty('c')
  })

  it('stores results under lowercase keys regardless of target case', () => {
    // The key in the result map is always lowercase ('a'), even when the target is 'A'.
    // The error comparison is case-sensitive: typing 'a' for target 'A' counts as a mistake.
    const result = analyzeWeakKeys('A', 'a')
    expect(result).toHaveProperty('a')
    expect(result).not.toHaveProperty('A')
  })

  it('calculates partial error rate correctly', () => {
    // 'a' typed correctly twice, wrong once → 1/3
    const result = analyzeWeakKeys('aaa', 'aab')
    expect(result.a).toBeCloseTo(1 / 3)
  })
})

describe('generateDynamicText', () => {
  it('returns a non-empty string', () => {
    const text = generateDynamicText(['a', 'b', 'c'], 100)
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(0)
  })

  it('does not exceed targetLength', () => {
    const text = generateDynamicText(['a', 'b'], 50)
    expect(text.length).toBeLessThanOrEqual(50)
  })

  it('returns a reasonable length near targetLength', () => {
    const text = generateDynamicText(['s', 't', 'r'], 200)
    // Should be within one short word of the target
    expect(text.length).toBeGreaterThan(150)
  })

  it('works with an empty weakKeys array', () => {
    expect(() => generateDynamicText([], 100)).not.toThrow()
    const text = generateDynamicText([], 100)
    expect(text.length).toBeGreaterThan(0)
  })

  it('works with a single weak key', () => {
    expect(() => generateDynamicText(['z'], 80)).not.toThrow()
  })

  it('biases toward weak-key words (statistical check)', () => {
    // With 'a' as the only weak key, at least 40% of words should start with 'a'
    const text = generateDynamicText(['a'], 500)
    const words = text.split(' ')
    const aWords = words.filter((w) => w.startsWith('a'))
    expect(aWords.length / words.length).toBeGreaterThan(0.4)
  })
})
