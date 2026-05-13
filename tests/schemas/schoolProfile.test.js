import { describe, it, expect } from 'vitest'
import { schoolProfileSchema } from '../../src/schemas/schoolProfile'

const minimal = () => ({
  schoolName: 'Greenwood Academy',
  shortName: 'GA',
})

describe('schoolProfileSchema', () => {
  it('accepts a minimal profile and applies defaults', () => {
    const parsed = schoolProfileSchema.parse(minimal())
    expect(parsed.key).toBe(1)
    expect(parsed.tagline).toBe('')
    expect(parsed.primaryColor).toBe('#4f46e5')
    expect(parsed.locale).toBe('en')
    expect(parsed.currency).toBe('USD')
    expect(parsed.contact.addressLines).toEqual([])
    expect(parsed.social).toEqual([])
    expect(parsed.nav).toEqual([])
  })

  it('rejects empty schoolName', () => {
    const result = schoolProfileSchema.safeParse({ ...minimal(), schoolName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty shortName', () => {
    const result = schoolProfileSchema.safeParse({ ...minimal(), shortName: '' })
    expect(result.success).toBe(false)
  })

  it('accepts a 3- and 6-digit hex primary colour', () => {
    expect(schoolProfileSchema.safeParse({ ...minimal(), primaryColor: '#abc' }).success).toBe(true)
    expect(schoolProfileSchema.safeParse({ ...minimal(), primaryColor: '#A1B2C3' }).success).toBe(true)
  })

  it('rejects non-hex primary colours', () => {
    expect(schoolProfileSchema.safeParse({ ...minimal(), primaryColor: 'red' }).success).toBe(false)
    expect(schoolProfileSchema.safeParse({ ...minimal(), primaryColor: '#12' }).success).toBe(false)
    expect(schoolProfileSchema.safeParse({ ...minimal(), primaryColor: '#12345' }).success).toBe(false)
  })

  it('accepts an empty contact email and a valid email but rejects garbage', () => {
    expect(schoolProfileSchema.safeParse({ ...minimal(), contact: { email: '' } }).success).toBe(true)
    expect(schoolProfileSchema.safeParse({ ...minimal(), contact: { email: 'a@b.co' } }).success).toBe(true)
    expect(schoolProfileSchema.safeParse({ ...minimal(), contact: { email: 'not-an-email' } }).success).toBe(false)
  })

  it('accepts an image data URL for logo and favicon', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9ZqvR+IAAAAASUVORK5CYII='
    const result = schoolProfileSchema.safeParse({
      ...minimal(),
      logoDataUrl: dataUrl,
      faviconDataUrl: dataUrl,
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-image data URLs', () => {
    const result = schoolProfileSchema.safeParse({
      ...minimal(),
      logoDataUrl: 'data:text/plain;base64,aGVsbG8=',
    })
    expect(result.success).toBe(false)
  })

  it('rejects established years outside the four-digit range', () => {
    expect(schoolProfileSchema.safeParse({ ...minimal(), established: 1999 }).success).toBe(true)
    expect(schoolProfileSchema.safeParse({ ...minimal(), established: 999 }).success).toBe(false)
    expect(schoolProfileSchema.safeParse({ ...minimal(), established: 12345 }).success).toBe(false)
    expect(schoolProfileSchema.safeParse({ ...minimal(), established: null }).success).toBe(true)
  })

  it('caps social and nav arrays', () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ label: `n${i}`, to: `/x/${i}` }))
    expect(schoolProfileSchema.safeParse({ ...minimal(), nav: items }).success).toBe(false)
    const links = Array.from({ length: 21 }, (_, i) => ({ label: `l${i}`, href: `https://x/${i}` }))
    expect(schoolProfileSchema.safeParse({ ...minimal(), social: links }).success).toBe(false)
  })
})
