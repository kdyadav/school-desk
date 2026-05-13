import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useSchoolStore } from '../../src/stores/school'
import { schoolProfileRepo } from '../../src/repositories'
import { siteConfig } from '../../src/site/siteConfig'

describe('school store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    setActivePinia(createPinia())
  })

  it('falls back to siteConfig defaults before load', () => {
    const school = useSchoolStore()
    expect(school.loaded).toBe(false)
    expect(school.profile.schoolName).toBe(siteConfig.schoolName)
    expect(school.profile.shortName).toBe(siteConfig.shortName)
    expect(school.profile.contact.email).toBe(siteConfig.contact.email)
    expect(school.profile.primaryColor).toBe('#4f46e5')
  })

  it('load on empty DB keeps defaults and marks loaded', async () => {
    const school = useSchoolStore()
    await school.load()
    expect(school.loaded).toBe(true)
    expect(school.isConfigured).toBe(false)
    expect(school.profile.schoolName).toBe(siteConfig.schoolName)
  })

  it('save persists the profile and surfaces it on the store', async () => {
    const school = useSchoolStore()
    const result = await school.save({
      schoolName: 'Greenwood Academy',
      shortName: 'GA',
      tagline: 'Learn. Grow. Lead.',
      primaryColor: '#0ea5e9',
      contact: {
        addressLines: ['1 Oak Lane'],
        phone: '555-0100',
        email: 'hello@greenwood.test',
        officeHours: '9-5',
      },
    })
    expect(result.schoolName).toBe('Greenwood Academy')
    expect(result.primaryColor).toBe('#0ea5e9')
    expect(result.contact.email).toBe('hello@greenwood.test')
    expect(result.contact.addressLines).toEqual(['1 Oak Lane'])
    expect(school.isConfigured).toBe(true)
    const row = await schoolProfileRepo.get(1)
    expect(row.schoolName).toBe('Greenwood Academy')
  })

  it('save without a contact patch keeps siteConfig contact defaults visible', async () => {
    const school = useSchoolStore()
    const result = await school.save({ schoolName: 'No Contact', shortName: 'NC' })
    // The stored row carries siteConfig defaults because save() spreads them
    // before the patch when creating the singleton.
    expect(result.contact.addressLines).toEqual(siteConfig.contact.addressLines)
    expect(result.contact.email).toBe(siteConfig.contact.email)
  })

  it('subsequent save updates the singleton row in place', async () => {
    const school = useSchoolStore()
    await school.save({ schoolName: 'First Name', shortName: 'FN' })
    await school.save({ schoolName: 'Second Name', shortName: 'SN' })
    expect(school.profile.schoolName).toBe('Second Name')
    expect(await schoolProfileRepo.count()).toBe(1)
  })

  it('load picks up a row written directly to the repo', async () => {
    await schoolProfileRepo.create({
      key: 1,
      schoolName: 'Saved Name',
      shortName: 'SN',
      primaryColor: '#10b981',
    })
    const school = useSchoolStore()
    await school.load()
    expect(school.profile.schoolName).toBe('Saved Name')
    expect(school.profile.primaryColor).toBe('#10b981')
    expect(school.isConfigured).toBe(true)
  })

  it('reset returns the store to defaults', async () => {
    const school = useSchoolStore()
    await school.save({ schoolName: 'Temp', shortName: 'T' })
    school.reset()
    expect(school.loaded).toBe(false)
    expect(school.profile.schoolName).toBe(siteConfig.schoolName)
  })
})
