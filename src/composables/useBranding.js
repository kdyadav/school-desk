// Helpers for tenant branding wiring shared across components.
// Kept dependency-light so it can be used from both the app shell and the
// public marketing site without pulling extra modules.

import { supabase } from '../supabase'

const ALLOWED_MIME = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon',
])
const MAX_BYTES = 4 * 1024 * 1024 // mirrors the old multipart cap

const extFor = (mime) => ({
  'image/png':  'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
})[mime] || 'bin'

// Upload a branding asset to Supabase Storage and return its public URL.
// `kind` is just used as a path prefix so logo/favicon stay grouped.
// RLS on the `branding` bucket restricts writes to admin/owner roles.
export const uploadBrandingImage = async (file, kind = 'logo') => {
  if (!file) throw new Error('No file supplied.')
  if (!ALLOWED_MIME.has(file.type)) throw new Error(`Unsupported image type: ${file.type}`)
  if (file.size > MAX_BYTES) throw new Error('Image is larger than 4 MB.')

  const name = `${kind}/${crypto.randomUUID()}.${extFor(file.type)}`
  const { error } = await supabase.storage
    .from('branding')
    .upload(name, file, { contentType: file.type, upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('branding').getPublicUrl(name)
  return { url: data.publicUrl, path: name, mimetype: file.type }
}

// Extract the storage path (e.g. `logo/uuid.png`) from a public URL produced
// by `getPublicUrl`. Returns null if the URL doesn't look like one of ours.
const pathFromPublicUrl = (url) => {
  if (!url || typeof url !== 'string') return null
  const marker = '/storage/v1/object/public/branding/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]) || null
}

// Best-effort delete of a previously-uploaded branding asset. Returns true if
// a delete was attempted (regardless of outcome) so callers can log. Silently
// returns false for URLs that aren't ours (e.g. a hand-pasted external link).
export const deleteBrandingImage = async (url) => {
  const path = pathFromPublicUrl(url)
  if (!path) return false
  const { error } = await supabase.storage.from('branding').remove([path])
  if (error) console.warn('Failed to delete old branding asset', path, error)
  return true
}

// Apply a tenant's primary color to the document as a CSS variable so any
// component opting in via `var(--brand-primary)` updates instantly. No-op on
// the server / in tests without a DOM.
export const applyPrimaryColor = (hex) => {
  if (typeof document === 'undefined' || !hex) return
  document.documentElement.style.setProperty('--brand-primary', hex)
}

// Swap the document favicon to a URL. Falls back to the bundled favicon when
// called with a falsy value.
export const applyFavicon = (href) => {
  if (typeof document === 'undefined') return
  const url = href || '/favicon.svg'
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  // We can't always infer the type from a Supabase Storage URL extension, so
  // let the browser sniff for hosted assets and only force a type for the
  // bundled SVG fallback.
  if (url === '/favicon.svg') link.type = 'image/svg+xml'
  else link.removeAttribute('type')
  link.href = url
}

// Compose the document title from a page label and the school name.
export const composeTitle = (pageTitle, schoolName) => {
  const parts = []
  if (pageTitle) parts.push(pageTitle)
  if (schoolName) parts.push(schoolName)
  return parts.length ? parts.join(' · ') : 'skoolDesk'
}
