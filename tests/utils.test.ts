import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatDuration } from '@/lib/utils'

describe('cn', () => {
  it('concatenates simple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves Tailwind conflicts — last value wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', false, undefined, null, '', 'bar')).toBe('foo bar')
  })

  it('handles a single class', () => {
    expect(cn('only')).toBe('only')
  })

  it('returns empty string when given no truthy classes', () => {
    expect(cn(false, undefined, '')).toBe('')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })
})

describe('formatDate', () => {
  it('formats a date as "MMM d, yyyy"', () => {
    expect(formatDate(new Date('2025-01-15'))).toBe('Jan 15, 2025')
  })

  it('handles single-digit day without zero-padding', () => {
    expect(formatDate(new Date('2025-03-05'))).toBe('Mar 5, 2025')
  })
})

describe('formatDuration', () => {
  it('formats seconds under 60 as "Xs"', () => {
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats exactly 60 seconds as "1m"', () => {
    expect(formatDuration(60)).toBe('1m')
  })

  it('formats minutes with no remainder as "Xm"', () => {
    expect(formatDuration(120)).toBe('2m')
  })

  it('formats minutes with remainder as "Xm Ys"', () => {
    expect(formatDuration(90)).toBe('1m 30s')
  })

  it('formats 0 seconds as "0s"', () => {
    expect(formatDuration(0)).toBe('0s')
  })
})
