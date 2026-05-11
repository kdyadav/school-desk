// ─── Primitive validators ────────────────────────────────────────────────────

export const required = (value) => {
  if (Array.isArray(value)) return value.length > 0 ? null : 'This field is required.'
  if (value instanceof FileList || value instanceof File) return value ? null : 'This field is required.'
  const normalized = value === 0 ? '0' : value
  return normalized ? null : 'This field is required.'
}

export const email = (value) => {
  if (!value) return null
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value) ? null : 'Please enter a valid email address.'
}

export const url = (value) => {
  if (!value) return null
  try { new URL(value); return null } catch { return 'Please enter a valid URL.' }
}

export const phone = (value) => {
  if (!value) return null
  const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/
  return phonePattern.test(value.replace(/\s/g, '')) ? null : 'Please enter a valid phone number.'
}

export const numeric = (value) => {
  if (value === '' || value === null || value === undefined) return null
  return isNaN(Number(value)) ? 'Please enter a valid number.' : null
}

export const integer = (value) => {
  if (value === '' || value === null || value === undefined) return null
  return Number.isInteger(Number(value)) ? null : 'Please enter a whole number.'
}

// ─── Length validators ────────────────────────────────────────────────────────

export const minLength = (min) => (value) => {
  if (!value) return null
  return value.length >= min ? null : `Minimum ${min} characters required.`
}

export const maxLength = (max) => (value) => {
  if (!value) return null
  return value.length <= max ? null : `Maximum ${max} characters allowed.`
}

// ─── Numeric range validators ─────────────────────────────────────────────────

export const min = (minVal) => (value) => {
  if (value === '' || value === null || value === undefined) return null
  return Number(value) >= minVal ? null : `Value must be at least ${minVal}.`
}

export const max = (maxVal) => (value) => {
  if (value === '' || value === null || value === undefined) return null
  return Number(value) <= maxVal ? null : `Value must be at most ${maxVal}.`
}

// ─── Pattern validator ────────────────────────────────────────────────────────

export const pattern = (regex, message = 'Invalid format.') => (value) => {
  if (!value) return null
  return regex.test(value) ? null : message
}

// ─── Cross-field validator ────────────────────────────────────────────────────

export const sameAs = (fieldLabel, getOtherValue) => (value) => {
  if (!value) return null
  return value === getOtherValue() ? null : `Must match ${fieldLabel}.`
}

// ─── Array (checkbox / tag) validators ───────────────────────────────────────

export const minItems = (min) => (value) => {
  const arr = Array.isArray(value) ? value : []
  return arr.length >= min ? null : `Please select at least ${min} option${min > 1 ? 's' : ''}.`
}

export const maxItems = (max) => (value) => {
  const arr = Array.isArray(value) ? value : []
  return arr.length <= max ? null : `You can select at most ${max} option${max > 1 ? 's' : ''}.`
}

// ─── File validators ──────────────────────────────────────────────────────────

export const fileSize = (maxMB) => (value) => {
  if (!value) return null
  const files = value instanceof FileList ? Array.from(value) : [value]
  const tooBig = files.find((f) => f.size > maxMB * 1024 * 1024)
  return tooBig ? `File "${tooBig.name}" exceeds ${maxMB} MB.` : null
}

export const fileType = (acceptedTypes) => (value) => {
  if (!value) return null
  const files = value instanceof FileList ? Array.from(value) : [value]
  const invalid = files.find((f) => !acceptedTypes.some((t) => f.type.startsWith(t) || f.name.endsWith(t)))
  return invalid ? `File type "${invalid.name.split('.').pop()}" is not allowed.` : null
}

