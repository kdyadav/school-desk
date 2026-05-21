import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { schoolProfileRepo } from '../repositories'
import { siteConfig } from '../site/siteConfig'

// Build a defaults object from the static siteConfig so the app keeps rendering
// before the user has configured anything (and inside tests that never run the
// onboarding flow).
const buildDefaults = () => ({
  schoolName: siteConfig.schoolName,
  shortName: siteConfig.shortName,
  tagline: siteConfig.tagline,
  established: siteConfig.established ?? null,
  contact: {
    addressLines: [...(siteConfig.contact?.addressLines || [])],
    phone: siteConfig.contact?.phone || '',
    email: siteConfig.contact?.email || '',
    officeHours: siteConfig.contact?.officeHours || '',
  },
  social: (siteConfig.social || []).map((s) => ({ ...s })),
  nav: (siteConfig.nav || []).map((n) => ({ ...n })),
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#4f46e5',
  locale: 'en',
  currency: 'USD',
  timezone: '',
})

// Shallow-merge a stored profile row over the defaults; nested `contact` is
// merged one level deep so partially-saved profiles don't blow away defaults.
const mergeWithDefaults = (row) => {
  const defaults = buildDefaults()
  if (!row) return defaults
  return {
    ...defaults,
    ...row,
    contact: { ...defaults.contact, ...(row.contact || {}) },
    social: row.social ?? defaults.social,
    nav: row.nav ?? defaults.nav,
  }
}

export const useSchoolStore = defineStore('school', () => {
  const profile = ref(buildDefaults())
  const loaded = ref(false)
  const saving = ref(false)

  // The singleton row is keyed on `key`, not `id` — presence of that key is
  // what tells us a profile has been persisted.
  const isConfigured = computed(() => loaded.value && profile.value?.key === 1)

  const load = async () => {
    const row = await schoolProfileRepo.get(1)
    profile.value = mergeWithDefaults(row)
    loaded.value = true
    return profile.value
  }

  // Persist the supplied patch onto the singleton row, creating it on first
  // save. Returns the merged-with-defaults profile.
  const save = async (patch) => {
    saving.value = true
    try {
      const existing = await schoolProfileRepo.get(1)
      let row
      if (existing) {
        row = await schoolProfileRepo.update(1, { ...patch, key: 1 })
      } else {
        row = await schoolProfileRepo.create({ ...buildDefaults(), ...patch, key: 1 })
      }
      profile.value = mergeWithDefaults(row)
      loaded.value = true
      return profile.value
    } finally {
      saving.value = false
    }
  }

  // Reset in-memory state to defaults; used in tests when wiping the DB.
  const reset = () => {
    profile.value = buildDefaults()
    loaded.value = false
  }

  return { profile, loaded, saving, isConfigured, load, save, reset }
})

export default useSchoolStore
