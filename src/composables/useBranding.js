// Helpers for tenant branding wiring shared across components.
// Kept dependency-light so it can be used from both the app shell and the
// public marketing site without pulling extra modules.

// Read a File as a data URL. Resolves with the data URL string or rejects on
// load error. Caller is expected to validate size/type beforehand.
export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('File read failed'))
    reader.readAsDataURL(file)
  })

// Apply a tenant's primary color to the document as a CSS variable so any
// component opting in via `var(--brand-primary)` updates instantly. No-op on
// the server / in tests without a DOM.
export const applyPrimaryColor = (hex) => {
  if (typeof document === 'undefined' || !hex) return
  document.documentElement.style.setProperty('--brand-primary', hex)
}

// Swap the document favicon to a (data) URL. Falls back to the bundled
// favicon when called with a falsy value.
export const applyFavicon = (href) => {
  if (typeof document === 'undefined') return
  const url = href || '/favicon.svg'
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  // For data URLs the type can be inferred from the prefix; for the bundled
  // svg fallback we set the explicit type so browsers don't re-sniff.
  if (url.startsWith('data:')) {
    const m = /^data:([^;]+);/.exec(url)
    link.type = m ? m[1] : 'image/png'
  } else {
    link.type = 'image/svg+xml'
  }
  link.href = url
}

// Compose the document title from a page label and the school name.
export const composeTitle = (pageTitle, schoolName) => {
  const parts = []
  if (pageTitle) parts.push(pageTitle)
  if (schoolName) parts.push(schoolName)
  return parts.length ? parts.join(' · ') : 'skoolDesk'
}
