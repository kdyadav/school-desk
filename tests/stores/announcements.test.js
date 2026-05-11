import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useAnnouncementsStore } from '../../src/stores/announcements'

describe('announcements store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('creates and lists announcements sorted by newest first', async () => {
    const store = useAnnouncementsStore()
    await store.create({ title: 'Old', body: 'first', audience: 'all', createdBy: null })
    // Tiny delay to ensure different createdAt
    await new Promise((r) => setTimeout(r, 10))
    await store.create({ title: 'New', body: 'second', audience: 'all', createdBy: null })
    expect(store.items).toHaveLength(2)
    expect(store.items[0].title).toBe('New')
  })

  it('deletes an announcement', async () => {
    const store = useAnnouncementsStore()
    await store.create({ title: 'Temp', body: 'will delete', audience: 'all', createdBy: null })
    expect(store.items).toHaveLength(1)
    await store.remove(store.items[0].id)
    expect(store.items).toHaveLength(0)
  })

  it('forRole returns "all" + role-specific items', async () => {
    const store = useAnnouncementsStore()
    await store.create({ title: 'For everyone', body: '.', audience: 'all', createdBy: null })
    await store.create({ title: 'Teachers only', body: '.', audience: 'teacher', createdBy: null })
    await store.create({ title: 'Students only', body: '.', audience: 'student', createdBy: null })

    const teacherView = store.forRole('teacher')
    expect(teacherView).toHaveLength(2) // 'all' + 'teacher'
    expect(teacherView.some((a) => a.title === 'Students only')).toBe(false)

    const studentView = store.forRole('student')
    expect(studentView).toHaveLength(2) // 'all' + 'student'
  })

  it('recent limits to N items', async () => {
    const store = useAnnouncementsStore()
    for (let i = 0; i < 8; i++) {
      await store.create({ title: `Ann ${i}`, body: '.', audience: 'all', createdBy: null })
    }
    const top3 = store.recent('admin', 3)
    expect(top3).toHaveLength(3)
  })
})
