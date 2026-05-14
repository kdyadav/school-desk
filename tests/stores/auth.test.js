import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth'

// Tiny in-memory stand-in for server/src/auth/routes.js. We mock global fetch
// so the auth store exercises the real apiFetch helper (headers, JSON encode,
// error envelope) end-to-end.
const users = []

const toPublic = (u) => ({
  id: u.id, uuid: u.uuid, email: u.email, role: u.role,
  name: u.name || u.email.split('@')[0], linkedId: u.linkedId ?? null,
})

const jsonResponse = (status, payload) => ({
  ok: status < 400,
  status,
  headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null) },
  text: async () => JSON.stringify(payload),
})

function fakeServer(input, init = {}) {
  const url = typeof input === 'string' ? input : input.url
  const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '')
  const method = (init.method || 'GET').toUpperCase()
  const body = init.body ? JSON.parse(init.body) : null

  if (path === '/auth/needs-setup' && method === 'GET') {
    return Promise.resolve(jsonResponse(200, { needsSetup: users.length === 0 }))
  }
  if (path === '/auth/setup' && method === 'POST') {
    if (users.length > 0) return Promise.resolve(jsonResponse(409, { error: 'already_initialised' }))
    const u = {
      id: users.length + 1, uuid: `uuid-${users.length + 1}`, role: 'owner',
      email: body.email, name: body.name, linkedId: null, _pw: body.password,
    }
    users.push(u)
    return Promise.resolve(jsonResponse(200, { token: `token-${u.id}`, user: toPublic(u) }))
  }
  if (path === '/auth/login' && method === 'POST') {
    const u = users.find((x) => x.email === body.email)
    if (!u || u._pw !== body.password) {
      return Promise.resolve(jsonResponse(401, { error: 'invalid_credentials' }))
    }
    return Promise.resolve(jsonResponse(200, { token: `token-${u.id}`, user: toPublic(u) }))
  }
  if (path === '/auth/logout' && method === 'POST') {
    return Promise.resolve(jsonResponse(200, { ok: true }))
  }
  return Promise.resolve(jsonResponse(404, { error: 'not_found' }))
}

const seedOwner = (email = 'owner@school.local', password = 'owner123') => {
  users.push({
    id: users.length + 1, uuid: `uuid-${users.length + 1}`, role: 'owner',
    email, name: 'Owner', linkedId: null, _pw: password,
  })
}

describe('auth store', () => {
  beforeEach(() => {
    users.length = 0
    localStorage.clear()
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn(fakeServer))
    seedOwner()
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
  beforeEach(() => {
    users.length = 0
    localStorage.clear()
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn(fakeServer))
    // No seed — empty user table
  })

  it('needsSetup returns true on empty DB', async () => {
    const auth = useAuthStore()
    expect(await auth.needsSetup()).toBe(true)
  })

  it('createOwner creates owner and logs in', async () => {
    const auth = useAuthStore()
    const ok = await auth.createOwner('Test Owner', 'owner@test.local', 'password123')
    expect(ok).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('owner')
    expect(auth.user.email).toBe('owner@test.local')
    expect(auth.user.name).toBe('Test Owner')
    expect(JSON.parse(localStorage.getItem('school.session'))).toBeTruthy()
    expect(await auth.needsSetup()).toBe(false)
  })

  it('createOwner fails if users already exist', async () => {
    const auth = useAuthStore()
    await auth.createOwner('First Owner', 'first@test.local', 'password123')
    // Reset pinia + localStorage so the second store starts unauthenticated.
    setActivePinia(createPinia())
    localStorage.clear()
    const auth2 = useAuthStore()
    const ok = await auth2.createOwner('Second Owner', 'second@test.local', 'password123')
    expect(ok).toBe(false)
    expect(auth2.isAuthenticated).toBe(false)
  })
})
