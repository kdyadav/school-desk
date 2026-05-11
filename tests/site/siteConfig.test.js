import { describe, it, expect } from 'vitest'
import { siteConfig } from '../../src/site/siteConfig'

describe('siteConfig', () => {
  it('exposes the school identity fields', () => {
    expect(siteConfig.schoolName).toBeTruthy()
    expect(siteConfig.shortName).toBeTruthy()
    expect(siteConfig.tagline).toBeTruthy()
    expect(typeof siteConfig.established).toBe('number')
  })

  it('exposes contact details', () => {
    expect(Array.isArray(siteConfig.contact.addressLines)).toBe(true)
    expect(siteConfig.contact.addressLines.length).toBeGreaterThan(0)
    expect(siteConfig.contact.phone).toMatch(/[0-9]/)
    expect(siteConfig.contact.email).toMatch(/@/)
    expect(siteConfig.contact.officeHours).toBeTruthy()
  })

  it('exposes the public navigation in the expected order', () => {
    expect(siteConfig.nav.map((n) => n.to)).toEqual([
      '/',
      '/about',
      '/academics',
      '/admissions',
      '/faculty',
      '/news',
      '/contact',
    ])
    for (const item of siteConfig.nav) {
      expect(item.label).toBeTruthy()
      expect(item.to.startsWith('/')).toBe(true)
    }
  })

  it('keeps social links well-formed', () => {
    expect(Array.isArray(siteConfig.social)).toBe(true)
    for (const s of siteConfig.social) {
      expect(s.label).toBeTruthy()
      expect(typeof s.href).toBe('string')
    }
  })
})
