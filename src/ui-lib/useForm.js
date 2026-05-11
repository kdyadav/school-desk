import { reactive, computed, toRefs } from 'vue'

export function useForm(initialValues = {}, fieldValidators = {}) {
  // Deep-clone initial values so reset works correctly
  const _initial = JSON.parse(JSON.stringify(initialValues))

  const values  = reactive({ ...initialValues })
  const errors  = reactive(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: '' }), {}))
  const touched = reactive(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {}))
  const dirty   = reactive(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {}))

  // ─── Core validators ─────────────────────────────────────────────────────

  function validateField(key) {
    const validators = fieldValidators[key] || []
    const value = values[key]

    for (const validator of validators) {
      const error = validator(value)
      if (error) {
        errors[key] = error
        return false
      }
    }

    errors[key] = ''
    return true
  }

  function validateAll() {
    let pass = true
    for (const key of Object.keys(fieldValidators)) {
      if (!validateField(key)) pass = false
    }
    return pass
  }

  // ─── Field setters ────────────────────────────────────────────────────────

  function setField(key, value) {
    values[key] = value
    dirty[key]  = JSON.stringify(value) !== JSON.stringify(_initial[key])
    if (touched[key]) validateField(key)
  }

  function touch(key) {
    touched[key] = true
    validateField(key)
  }

  // ─── Reset helpers ────────────────────────────────────────────────────────

  function resetField(key) {
    values[key]  = JSON.parse(JSON.stringify(_initial[key]))
    errors[key]  = ''
    touched[key] = false
    dirty[key]   = false
  }

  function reset() {
    Object.keys(initialValues).forEach(resetField)
  }

  // ─── Computed state ───────────────────────────────────────────────────────

  const isValid = computed(() =>
    Object.values(errors).every((e) => e === '') &&
    Object.keys(fieldValidators).every((key) => values[key] !== undefined)
  )

  const isDirty = computed(() => Object.values(dirty).some(Boolean))

  return {
    ...toRefs(values),
    values,
    errors,
    touched,
    dirty,
    isValid,
    isDirty,
    validateField,
    validateAll,
    setField,
    touch,
    reset,
    resetField,
  }
}
