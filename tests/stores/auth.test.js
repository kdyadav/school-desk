import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useAuthStore } from '../../src/stores/auth'
import { seedDatabase } from '../../src/db/seed'

describe('auth store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    await seedDatabase()
  })

  it('logs in the seeded owner with correct credentials', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('owner@school.local', 'owner123')
    expect(ok).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('owner')
    expect(auth.user.email).toBe('owner@school.local')
    expect(JSON.parse(localStorage.getItem('school.session'))).toBeTruthy()
  })

  it('rejects wrong password', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('owner@school.local', 'wrong')
    expect(ok).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
  })

  it('logout clears state and storage', async () => {
    const auth = useAuthStore()
    await auth.login('owner@school.local', 'owner123')
    auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('school.session')).toBeNull()
  })

  it('hasRole works for arrays and missing roles', () => {
    const auth = useAuthStore()
    expect(auth.hasRole(['admin'])).toBe(false)
    expect(auth.hasRole([])).toBe(true)
    expect(auth.hasRole()).toBe(true)
  })

  it('owner satisfies any role check', async () => {
    const auth = useAuthStore()
    await auth.login('owner@school.local', 'owner123')
    expect(auth.hasRole(['admin'])).toBe(true)
    expect(auth.hasRole(['teacher'])).toBe(true)
    expect(auth.hasRole(['student', 'parent'])).toBe(true)
  })

  it('needsSetup returns false when users exist', async () => {
    const auth = useAuthStore()
    expect(await auth.needsSetup()).toBe(false)
  })
})

describe('owner onboarding', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    // No seed — empty DB
  })

  it('needsSetup returns true on empty DB', async () => {
    const auth = useAuthStore()
    expect(await auth.needsSetup()).toBe(true)
  })

  it('createOwner creates owner, seeds data, and logs in', async () => {
    const auth = useAuthStore()
    const ok = await auth.createOwner('Test Owner', 'owner@test.local', 'password123')
    expect(ok).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('owner')
    expect(auth.user.email).toBe('owner@test.local')
    expect(auth.user.name).toBe('Test Owner')
    expect(JSON.parse(localStorage.getItem('school.session'))).toBeTruthy()
    // Seed data should have been created
    expect(await auth.needsSetup()).toBe(false)
  })

  it('createOwner fails if users already exist', async () => {
    const auth = useAuthStore()
    await auth.createOwner('First Owner', 'first@test.local', 'password123')
    // Reset pinia to clear in-memory state
    setActivePinia(createPinia())
    localStorage.clear()
    const auth2 = useAuthStore()
    const ok = await auth2.createOwner('Second Owner', 'second@test.local', 'password123')
    expect(ok).toBe(false)
    expect(auth2.isAuthenticated).toBe(false)
  })
})
