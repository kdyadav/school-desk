import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/main.css'
import App from './App.vue'

import router from './router'
import uiLib from './ui-lib'
import { setAuditActorProvider } from './audit'
import { useAuthStore } from './stores/auth'
import './composables/useTheme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(uiLib)

// The audit logger needs to know who performed each action. Resolve the actor
// lazily from the auth store on every call so the onboarding can happen
// before any user has logged in.
const auth = useAuthStore()
setAuditActorProvider(() => {
    const u = auth.user
    if (!u) return null
    return { id: u.id, role: u.role, name: u.name }
})

app.mount('#app')