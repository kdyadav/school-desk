// Light/dark theme manager. The selected theme is persisted in localStorage
// under THEME_KEY and applied to <html> via the `dark` class so Tailwind's
// `dark:` variants take effect.
import { ref, watch } from 'vue'

const THEME_KEY = 'theme'

const readStored = () => {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

const systemPrefersDark = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

const initial = readStored() || (systemPrefersDark() ? 'dark' : 'light')
const theme = ref(initial)

const apply = (t) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (t === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

apply(theme.value)

watch(theme, (t) => {
  apply(t)
  try { localStorage.setItem(THEME_KEY, t) } catch { /* ignore */ }
})

export const useTheme = () => ({
  theme,
  setTheme: (t) => { if (t === 'dark' || t === 'light') theme.value = t },
  toggle: () => { theme.value = theme.value === 'dark' ? 'light' : 'dark' },
})
