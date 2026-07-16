import { describe, expect, it } from 'vitest'
import { ensureHttps, generateSlug, isValidUrl } from './utils'

describe('URL utilities', () => {
  it('accepts only HTTP and HTTPS destinations', () => {
    expect(isValidUrl('https://example.com/path')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
    expect(isValidUrl('not a url')).toBe(false)
  })

  it('adds HTTPS without changing an explicit HTTP scheme', () => {
    expect(ensureHttps('example.com')).toBe('https://example.com')
    expect(ensureHttps('http://example.com')).toBe('http://example.com')
    expect(ensureHttps('https://example.com')).toBe('https://example.com')
  })
})

describe('slug generation', () => {
  it('uses the requested length and URL-safe alphabet', () => {
    const slug = generateSlug(24)
    expect(slug).toHaveLength(24)
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/)
  })
})
