// Minimal fetch wrapper used by the http adapter. Centralises the base URL,
// the bearer-token header, and JSON encode/decode + error handling so the
// adapter itself stays focused on URL/verb mapping.

// Same localStorage key the auth store uses (src/stores/auth.js). Kept as a
// constant here so the adapter doesn't pull in the pinia store directly —
// importing the store would create a circular import via repositories.
const SESSION_KEY = 'school.session'

const baseUrl = () => {
  // Trim trailing slashes so callers can rely on `${base}/${path}` joins.
  const raw = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000'
  return raw.replace(/\/+$/, '')
}

const getToken = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw)?.token || null : null
  } catch {
    return null
  }
}

// Build a URL-encoded query string from a plain object.
// Supports nested `where: { field: value }` by emitting `where[field]=value`,
// which matches the qs-style parser the server registers in src/app.js.
const encodeQuery = (params) => {
  if (!params) return ''
  const parts = []
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    if (k === 'where' && v && typeof v === 'object') {
      for (const [wk, wv] of Object.entries(v)) {
        if (wv === undefined || wv === null) continue
        parts.push(`${encodeURIComponent(`where[${wk}]`)}=${encodeURIComponent(String(wv))}`)
      }
      continue
    }
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// One request helper, used by every method on the adapter. JSON-encodes the
// body when supplied as a plain object; passes through Blobs / FormData / etc
// untouched so callers can ship multipart uploads through the same pipe.
export async function apiFetch(path, {
  method = 'GET',
  body,
  query,
  headers,
  signal,
} = {}) {
  const url = `${baseUrl()}${path}${encodeQuery(query)}`
  const finalHeaders = { ...(headers || {}) }
  const token = getToken()
  if (token && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  let payload = body
  const isPlainObject =
    body && typeof body === 'object' &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  if (isPlainObject) {
    payload = JSON.stringify(body)
    if (!finalHeaders['Content-Type']) finalHeaders['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, { method, headers: finalHeaders, body: payload, signal })
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()
  let parsed = null
  if (text && contentType.includes('application/json')) {
    try { parsed = JSON.parse(text) } catch { parsed = text }
  } else if (text) {
    parsed = text
  }

  if (!res.ok) {
    const message = (parsed && typeof parsed === 'object' && parsed.error)
      ? parsed.error
      : `HTTP ${res.status} ${method} ${path}`
    throw new ApiError(message, { status: res.status, body: parsed })
  }
  return parsed
}

export default apiFetch
