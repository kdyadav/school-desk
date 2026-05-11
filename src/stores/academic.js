import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  academicYearRepo,
  classRepo,
  sectionRepo,
  subjectRepo,
  teacherRepo,
} from '../repositories'

const RESOURCES = {
  years: academicYearRepo,
  classes: classRepo,
  sections: sectionRepo,
  subjects: subjectRepo,
  teachers: teacherRepo,
}

export const useAcademicStore = defineStore('academic', () => {
  const years = ref([])
  const classes = ref([])
  const sections = ref([])
  const subjects = ref([])
  const teachers = ref([])

  const collections = { years, classes, sections, subjects, teachers }

  const loading = ref(false)
  const error = ref(null)

  const activeYear = computed(() => years.value.find((y) => y.isActive) || years.value[0] || null)

  const classesByYear = (yearId) =>
    classes.value.filter((c) => c.academicYearId === yearId)

  const sectionsByClass = (classId) =>
    sections.value.filter((s) => s.classId === classId)

  const teacherById = (id) => teachers.value.find((t) => t.id === id) || null
  const classById = (id) => classes.value.find((c) => c.id === id) || null
  const yearById = (id) => years.value.find((y) => y.id === id) || null

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      const [y, c, s, sub, t] = await Promise.all([
        academicYearRepo.list(),
        classRepo.list(),
        sectionRepo.list(),
        subjectRepo.list(),
        teacherRepo.list(),
      ])
      years.value = y
      classes.value = c
      sections.value = s
      subjects.value = sub
      teachers.value = t
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  async function reload(key) {
    const repo = RESOURCES[key]
    if (!repo) throw new Error(`Unknown academic collection: ${key}`)
    collections[key].value = await repo.list()
  }

  async function saveItem(key, payload) {
    const repo = RESOURCES[key]
    if (!repo) throw new Error(`Unknown academic collection: ${key}`)
    if (payload.id) {
      const { id, ...patch } = payload
      await repo.update(id, patch)
    } else {
      await repo.create(payload)
    }
    await reload(key)
  }

  async function deleteItem(key, id) {
    const repo = RESOURCES[key]
    if (!repo) throw new Error(`Unknown academic collection: ${key}`)
    await repo.remove(id)
    await reload(key)
  }

  async function setActiveYear(id) {
    for (const y of years.value) {
      if (y.id === id && !y.isActive) await academicYearRepo.update(y.id, { isActive: true })
      if (y.id !== id && y.isActive) await academicYearRepo.update(y.id, { isActive: false })
    }
    await reload('years')
  }

  return {
    years,
    classes,
    sections,
    subjects,
    teachers,
    loading,
    error,
    activeYear,
    classesByYear,
    sectionsByClass,
    teacherById,
    classById,
    yearById,
    loadAll,
    reload,
    saveItem,
    deleteItem,
    setActiveYear,
  }
})
