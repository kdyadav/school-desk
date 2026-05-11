import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  studentRepo,
  guardianRepo,
  teacherRepo,
} from '../repositories'

const RESOURCES = {
  students: studentRepo,
  guardians: guardianRepo,
  teachers: teacherRepo,
}

export const usePeopleStore = defineStore('people', () => {
  const students = ref([])
  const guardians = ref([])
  const teachers = ref([])

  const collections = { students, guardians, teachers }

  const loading = ref(false)
  const error = ref(null)

  const guardianById = (id) => guardians.value.find((g) => g.id === id) || null
  const teacherById = (id) => teachers.value.find((t) => t.id === id) || null
  const studentById = (id) => students.value.find((s) => s.id === id) || null

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      const [s, g, t] = await Promise.all([
        studentRepo.list(),
        guardianRepo.list(),
        teacherRepo.list(),
      ])
      students.value = s
      guardians.value = g
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
    if (!repo) throw new Error(`Unknown people collection: ${key}`)
    collections[key].value = await repo.list()
  }

  async function saveItem(key, payload) {
    const repo = RESOURCES[key]
    if (!repo) throw new Error(`Unknown people collection: ${key}`)
    let saved
    if (payload.id) {
      const { id, ...patch } = payload
      saved = await repo.update(id, patch)
    } else {
      saved = await repo.create(payload)
    }
    await reload(key)
    return saved
  }

  async function deleteItem(key, id) {
    const repo = RESOURCES[key]
    if (!repo) throw new Error(`Unknown people collection: ${key}`)
    await repo.remove(id)
    await reload(key)
  }

  /** Convenience: create student + (optionally) a guardian in one call. */
  async function createStudentWithGuardian(studentData, guardianData) {
    let guardianId = studentData.guardianId || null
    if (guardianData && !guardianId) {
      const g = await guardianRepo.create(guardianData)
      guardianId = g.id
      guardians.value = await guardianRepo.list()
    }
    const created = await studentRepo.create({ ...studentData, guardianId })
    students.value = await studentRepo.list()
    return created
  }

  return {
    students,
    guardians,
    teachers,
    loading,
    error,
    guardianById,
    teacherById,
    studentById,
    loadAll,
    reload,
    saveItem,
    deleteItem,
    createStudentWithGuardian,
  }
})
