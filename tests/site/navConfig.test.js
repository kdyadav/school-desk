import { describe, it, expect } from 'vitest'
import { navGroups, navItems } from '../../src/layouts/navConfig'

describe('management nav config', () => {
  it('places every nav item under /app', () => {
    for (const item of navItems) {
      expect(item.to.startsWith('/app')).toBe(true)
    }
  })

  it('uses /app exactly for the Dashboard entry', () => {
    const dashboard = navItems.find((i) => i.label === 'Dashboard')
    expect(dashboard).toBeTruthy()
    expect(dashboard.to).toBe('/app')
  })

  it('keeps groups and items non-empty', () => {
    expect(navGroups.length).toBeGreaterThan(0)
    for (const g of navGroups) {
      expect(g.key).toBeTruthy()
      expect(Array.isArray(g.items)).toBe(true)
      expect(g.items.length).toBeGreaterThan(0)
    }
  })
})
