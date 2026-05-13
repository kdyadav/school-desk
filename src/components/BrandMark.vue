<template>
    <span :class="['inline-flex items-center justify-center overflow-hidden rounded-lg', sizeClass, !logo ? 'shadow-sm' : '']"
        :style="!logo ? { background: gradient } : null">
        <img v-if="logo" :src="logo" :alt="alt" class="w-full h-full object-cover" />
        <template v-else>
            <span v-if="initials" class="text-white font-bold tracking-tight" :class="textClass">
                {{ initials }}
            </span>
        </template>
    </span>
</template>

<script setup>
import { computed } from 'vue'
import { useSchoolStore } from '../stores/school'

// Reusable school logo / brand mark. When a logo data URL is configured on the
// tenant profile it is rendered as-is; otherwise we fall back to a coloured
// square showing the short-name initials so the UI never looks unbranded.
const props = defineProps({
    size: { type: String, default: 'md' }, // sm | md | lg
})

const school = useSchoolStore()

const logo = computed(() => school.profile?.logoDataUrl || null)
const alt = computed(() => school.profile?.schoolName || 'School')

const initials = computed(() => {
    const src = school.profile?.shortName || school.profile?.schoolName || 'sD'
    // Take up to 2 letters: first letter of first two words, else first 2 chars.
    const parts = String(src).trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return src.slice(0, 2)
})

const primary = computed(() => school.profile?.primaryColor || '#4f46e5')

// Build a subtle 2-stop gradient from the primary colour by darkening it
// slightly. Falls back to the historical indigo→violet gradient if the colour
// can't be parsed.
const gradient = computed(() => {
    const hex = primary.value
    const dark = darken(hex, 0.18)
    return `linear-gradient(135deg, ${hex} 0%, ${dark} 100%)`
})

const sizeClass = computed(() => ({
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-16 h-16',
}[props.size] || 'w-9 h-9'))

const textClass = computed(() => ({
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xl',
}[props.size] || 'text-xs'))

function darken(hex, amount) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || '')
    if (!m) return '#7c3aed'
    let h = m[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount)))
    const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount)))
    const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount)))
    const toHex = (n) => n.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
</script>
