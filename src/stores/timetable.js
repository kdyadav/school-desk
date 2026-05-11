import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { periodRepo, timetableRepo } from '../repositories'
import { DAYS } from '../schemas/timetableEntry'

export { DAYS }

export const useTimetableStore = defineStore('timetable', () => {
  const periods = ref([])
  const entries = ref([])         // entries for the current section
  const allEntries = ref([])      // ALL timetable entries (for conflict checks across sections)
  const loading = ref(false)
  const error = ref(null)

  const selectedSectionId = ref(null)

  // ── Periods ───────────────────────────────────────────────────────────

  async function loadPeriods() {
    periods.value = await periodRepo.list()
    periods.value.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  async function savePeriod(payload) {
    if (payload.id) {
      const { id, ...patch } = payload
      await periodRepo.update(id, patch)
    } else {
      await periodRepo.create(payload)
    }
    await loadPeriods()
  }

  async function deletePeriod(id) {
    await periodRepo.remove(id)
    await loadPeriods()
  }

  // ── Timetable grid ────────────────────────────────────────────────────

  async function loadGrid(sectionId) {
    selectedSectionId.value = sectionId
    loading.value = true
    error.value = null
    try {
      const [sec, all] = await Promise.all([
        timetableRepo.where('sectionId', sectionId),
        timetableRepo.list(),
      ])
      entries.value = sec
      allEntries.value = all
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Get the timetable entry for a specific cell */
  function getSlot(dayOfWeek, periodId) {
    return entries.value.find(
      (e) => e.dayOfWeek === dayOfWeek && e.periodId === periodId
    ) || null
  }

  /**
   * Check if a teacher is already booked in another section on the same day+period.
   * Returns the conflicting entry or null.
   */
  function teacherConflict(teacherId, dayOfWeek, periodId, excludeEntryId) {
    return allEntries.value.find(
      (e) =>
        e.teacherId === teacherId &&
        e.dayOfWeek === dayOfWeek &&
        e.periodId === periodId &&
        e.sectionId !== selectedSectionId.value &&
        e.id !== excludeEntryId
    ) || null
  }

  /** Save (or update) a slot. Returns { ok, conflict? } */
  async function saveSlot({ dayOfWeek, periodId, subjectId, teacherId }) {
    const conflict = teacherConflict(teacherId, dayOfWeek, periodId)
    if (conflict) return { ok: false, conflict }

    const existing = getSlot(dayOfWeek, periodId)
    if (existing) {
      await timetableRepo.update(existing.id, {
        subjectId, teacherId, sectionId: selectedSectionId.value, dayOfWeek, periodId,
      })
    } else {
      await timetableRepo.create({
        sectionId: selectedSectionId.value,
        dayOfWeek, periodId, subjectId, teacherId,
      })
    }
    await loadGrid(selectedSectionId.value)
    return { ok: true }
  }

  /** Clear a slot */
  async function clearSlot(dayOfWeek, periodId) {
    const existing = getSlot(dayOfWeek, periodId)
    if (existing) {
      await timetableRepo.remove(existing.id)
      await loadGrid(selectedSectionId.value)
    }
  }

  /** Get all entries for a teacher (their schedule view) */
  const teacherSchedule = (teacherId) =>
    allEntries.value.filter((e) => e.teacherId === teacherId)

  return {
    periods,
    entries,
    allEntries,
    loading,
    error,
    selectedSectionId,
    loadPeriods,
    savePeriod,
    deletePeriod,
    loadGrid,
    getSlot,
    teacherConflict,
    saveSlot,
    clearSlot,
    teacherSchedule,
    DAYS,
  }
})
