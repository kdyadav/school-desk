<template>
    <div class="max-w-3xl space-y-6">
        <header class="flex items-start gap-4">
            <BrandMark size="lg" />
            <div>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    School profile
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                    These details appear across the public site, login, and app shell.
                </p>
            </div>
        </header>

        <form @submit.prevent="onSave"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
            <BaseInput id="ss-name" label="School name" :modelValue="form.schoolName"
                @update:modelValue="(v) => setField('schoolName', v)" @blur="() => touch('schoolName')"
                :error="errors.schoolName" />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput id="ss-short" label="Short name" :modelValue="form.shortName"
                    @update:modelValue="(v) => setField('shortName', v)" @blur="() => touch('shortName')"
                    :error="errors.shortName" />
                <BaseInput id="ss-est" label="Established (year)" type="number" :modelValue="form.established"
                    @update:modelValue="(v) => setField('established', v)" />
            </div>
            <BaseInput id="ss-tagline" label="Tagline" :modelValue="form.tagline"
                @update:modelValue="(v) => setField('tagline', v)" />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput id="ss-phone" label="Phone" :modelValue="form.phone"
                    @update:modelValue="(v) => setField('phone', v)" />
                <BaseInput id="ss-cemail" label="Contact email" type="email" :modelValue="form.contactEmail"
                    @update:modelValue="(v) => setField('contactEmail', v)" @blur="() => touch('contactEmail')"
                    :error="errors.contactEmail" />
            </div>
            <BaseInput id="ss-hours" label="Office hours" :modelValue="form.officeHours"
                @update:modelValue="(v) => setField('officeHours', v)" />
            <BaseTextarea id="ss-address" label="Address (one line per row)" :rows="3"
                :modelValue="form.address" @update:modelValue="(v) => setField('address', v)" />

            <div class="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-start">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        Logo
                    </label>
                    <div class="flex items-center gap-3">
                        <div class="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            <img v-if="form.logoDataUrl" :src="form.logoDataUrl" alt="Logo" class="w-full h-full object-cover" />
                            <span v-else class="text-[10px] text-slate-400">No logo</span>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="onPickLogo" />
                            <button type="button" @click="logoInput?.click()"
                                class="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
                                {{ form.logoDataUrl ? 'Replace' : 'Upload' }}
                            </button>
                            <button v-if="form.logoDataUrl" type="button"
                                @click="setField('logoDataUrl', null)"
                                class="px-3 py-1 text-xs font-medium text-slate-500 hover:text-red-600">
                                Remove
                            </button>
                        </div>
                    </div>
                    <p v-if="logoError" class="mt-1 text-xs text-red-600">{{ logoError }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Primary color</label>
                    <div class="flex items-center gap-3">
                        <input type="color" :value="form.primaryColor"
                            @input="(e) => setField('primaryColor', e.target.value)"
                            class="w-12 h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white cursor-pointer" />
                        <BaseInput id="ss-color" :modelValue="form.primaryColor"
                            @update:modelValue="(v) => setField('primaryColor', v)" placeholder="#4f46e5" />
                    </div>
                    <p class="mt-1 text-xs text-slate-500">Used in the brand mark and accents.</p>
                </div>
            </div>

            <div class="flex items-center justify-between pt-2">
                <p v-if="savedAt" class="text-xs text-emerald-600">Saved at {{ savedAt }}</p>
                <span v-else />
                <BaseButton type="submit" :loading="saving" :disabled="saving" variant="primary" :full-width="false">
                    Save changes
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSchoolStore } from '../../stores/school'
import { useForm } from '../../ui-lib/useForm'
import { required, email as emailValidator } from '../../ui-lib/validators'
import { fileToDataUrl } from '../../composables/useBranding'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseTextarea from '../../ui-lib/BaseTextarea.vue'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BrandMark from '../../components/BrandMark.vue'

const school = useSchoolStore()
const saving = ref(false)
const savedAt = ref('')
const logoInput = ref(null)
const logoError = ref('')
const MAX_LOGO_BYTES = 1024 * 1024

const { values: form, errors, setField, touch, validateAll, reset } = useForm(
    {
        schoolName: '', shortName: '', tagline: '', established: '',
        phone: '', contactEmail: '', officeHours: '', address: '',
        logoDataUrl: null, primaryColor: '#4f46e5',
    },
    {
        schoolName: [required],
        shortName: [required],
        contactEmail: [(v) => (!v ? '' : emailValidator(v))],
    }
)

const hydrate = () => {
    const p = school.profile || {}
    setField('schoolName', p.schoolName || '')
    setField('shortName', p.shortName || '')
    setField('tagline', p.tagline || '')
    setField('established', p.established ?? '')
    setField('phone', p.contact?.phone || '')
    setField('contactEmail', p.contact?.email || '')
    setField('officeHours', p.contact?.officeHours || '')
    setField('address', (p.contact?.addressLines || []).join('\n'))
    setField('logoDataUrl', p.logoDataUrl || null)
    setField('primaryColor', p.primaryColor || '#4f46e5')
}

onMounted(async () => {
    if (!school.loaded) await school.load()
    hydrate()
})

const onPickLogo = async (e) => {
    logoError.value = ''
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { logoError.value = 'Please choose an image file.'; e.target.value = ''; return }
    if (file.size > MAX_LOGO_BYTES) { logoError.value = 'Image is too large (max 1 MB).'; e.target.value = ''; return }
    try { setField('logoDataUrl', await fileToDataUrl(file)) }
    catch { logoError.value = 'Could not read that file.' }
    finally { e.target.value = '' }
}

const onSave = async () => {
    if (!validateAll()) return
    saving.value = true
    try {
        const addressLines = (form.address || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
        await school.save({
            schoolName: form.schoolName.trim(),
            shortName: form.shortName.trim(),
            tagline: form.tagline?.trim() || '',
            established: form.established ? Number(form.established) : null,
            contact: {
                addressLines,
                phone: form.phone?.trim() || '',
                email: form.contactEmail?.trim() || '',
                officeHours: form.officeHours?.trim() || '',
            },
            logoDataUrl: form.logoDataUrl || null,
            primaryColor: form.primaryColor || '#4f46e5',
        })
        savedAt.value = new Date().toLocaleTimeString()
    } finally {
        saving.value = false
    }
}

// keep `reset` referenced so the linter doesn't warn — exposed for future use
void reset
</script>
