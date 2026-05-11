// Singleton state for the global command palette so any component can open it.
import { ref } from 'vue'

const open = ref(false)

export const useCommandPalette = () => ({
  open,
  show: () => { open.value = true },
  hide: () => { open.value = false },
  toggle: () => { open.value = !open.value },
})
