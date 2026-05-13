<template>
    <div class="min-h-screen flex justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div class="max-w-xl w-full">
            <div class="text-center my-6 sm:my-8">
                <div class="inline-flex items-center justify-center mb-3 sm:mb-4">
                    <BrandMark size="lg" />
                </div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">Welcome to skoolDesk</h1>
                <p class="text-sm sm:text-base text-gray-600">
                    {{ step === 1 ? 'Tell us about your school.' : 'Create the owner account to launch the app.' }}
                </p>
            </div>

            <ol class="flex items-center justify-center gap-2 mb-4 sm:mb-6 text-xs font-medium">
                <li :class="step >= 1 ? 'text-indigo-700' : 'text-slate-400'">1. School profile</li>
                <li class="text-slate-300">→</li>
                <li :class="step >= 2 ? 'text-indigo-700' : 'text-slate-400'">2. Owner account</li>
            </ol>

            <div class="bg-white rounded-2xl shadow-xl p-5 sm:p-8">
                <!-- Step 1: school profile -->
                <form v-if="step === 1" @submit.prevent="handleSchoolNext" class="space-y-5">
                    <BaseInput id="setup-school-name" name="schoolName" label="School name"
                        placeholder="e.g. Greenfield Academy" :modelValue="school.schoolName"
                        @update:modelValue="(v) => setSchool('schoolName', v)" @blur="() => touchSchool('schoolName')"
                        :error="schoolErrors.schoolName" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BaseInput id="setup-short-name" name="shortName" label="Short name" placeholder="e.g. Greenfield"
                            :modelValue="school.shortName" @update:modelValue="(v) => setSchool('shortName', v)"
                            @blur="() => touchSchool('shortName')" :error="schoolErrors.shortName" />
                        <BaseInput id="setup-established" name="established" label="Established (year)" type="number"
                            placeholder="2010" :modelValue="school.established"
                            @update:modelValue="(v) => setSchool('established', v)" />
                    </div>
                    <BaseInput id="setup-tagline" name="tagline" label="Tagline (optional)"
                        placeholder="A short line that captures your school" :modelValue="school.tagline"
                        @update:modelValue="(v) => setSchool('tagline', v)" />
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BaseInput id="setup-phone" name="phone" label="Phone (optional)" placeholder="+1 (555) 010-2840"
                            :modelValue="school.phone" @update:modelValue="(v) => setSchool('phone', v)" />
                        <BaseInput id="setup-contact-email" name="contactEmail" label="Contact email (optional)"
                            type="email" placeholder="hello@yourschool.com" :modelValue="school.contactEmail"
                            @update:modelValue="(v) => setSchool('contactEmail', v)"
                            @blur="() => touchSchool('contactEmail')" :error="schoolErrors.contactEmail" />
                    </div>
                    <BaseTextarea id="setup-address" name="address"
                        label="Address (optional, one line per row)" :rows="2"
                        :modelValue="school.address" @update:modelValue="(v) => setSchool('address', v)" />

                    <div class="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-start">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo (optional)</label>
                            <div class="flex items-center gap-3">
                                <div class="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    <img v-if="school.logoDataUrl" :src="school.logoDataUrl" alt="Logo preview"
                                        class="w-full h-full object-cover" />
                                    <span v-else class="text-[10px] text-slate-400">No logo</span>
                                </div>
                                <div class="flex flex-col gap-1.5">
                                    <input ref="logoInput" type="file" accept="image/*" class="hidden"
                                        @change="onPickLogo" />
                                    <button type="button" @click="logoInput?.click()"
                                        class="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 hover:bg-slate-50">
                                        {{ school.logoDataUrl ? 'Replace' : 'Upload image' }}
                                    </button>
                                    <button v-if="school.logoDataUrl" type="button"
                                        @click="setSchool('logoDataUrl', null)"
                                        class="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <p v-if="logoError" class="mt-1 text-xs text-red-600">{{ logoError }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Primary color</label>
                            <div class="flex items-center gap-3">
                                <input type="color" :value="school.primaryColor"
                                    @input="(e) => setSchool('primaryColor', e.target.value)"
                                    class="w-12 h-10 rounded-md border border-slate-300 bg-white cursor-pointer" />
                                <BaseInput id="setup-primary-hex" name="primaryColor"
                                    :modelValue="school.primaryColor"
                                    @update:modelValue="(v) => setSchool('primaryColor', v)" placeholder="#4f46e5" />
                            </div>
                        </div>
                    </div>

                    <BaseButton type="submit" variant="primary">Continue</BaseButton>
                </form>

                <!-- Step 2: owner account -->
                <form v-else @submit.prevent="handleSetup" class="space-y-5">
                    <BaseInput id="setup-name" name="name" label="Full Name" type="text"
                        placeholder="Enter your full name" :modelValue="owner.name"
                        @update:modelValue="(v) => setOwner('name', v)" @blur="() => touchOwner('name')"
                        :error="ownerErrors.name" />
                    <BaseInput id="setup-email" name="email" label="Email" type="email" placeholder="Enter your email"
                        :modelValue="owner.email" @update:modelValue="(v) => setOwner('email', v)"
                        @blur="() => touchOwner('email')" :error="ownerErrors.email" />
                    <BaseInput id="setup-password" name="password" label="Password" type="password"
                        placeholder="Create a password (min. 8 characters)" :modelValue="owner.password"
                        @update:modelValue="(v) => setOwner('password', v)" @blur="() => touchOwner('password')"
                        :error="ownerErrors.password" />
                    <BaseInput id="setup-confirm" name="confirmPassword" label="Confirm Password" type="password"
                        placeholder="Repeat your password" :modelValue="owner.confirmPassword"
                        @update:modelValue="(v) => setOwner('confirmPassword', v)"
                        @blur="() => touchOwner('confirmPassword')" :error="ownerErrors.confirmPassword" />

                    <div class="flex flex-col-reverse sm:flex-row gap-3">
                        <button type="button" @click="step = 1"
                            class="px-4 py-3 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50">
                            Back
                        </button>
                        <BaseButton type="submit" :loading="loading" :disabled="loading" variant="primary">
                            Create Owner &amp; Launch App
                        </BaseButton>
                    </div>

                    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                        {{ error }}
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSchoolStore } from '../stores/school'
import { useForm } from '../ui-lib/useForm'
import { required, email as emailValidator, minLength, sameAs } from '../ui-lib/validators'
import BaseInput from '../ui-lib/BaseInput.vue'
import BaseTextarea from '../ui-lib/BaseTextarea.vue'
import BaseButton from '../ui-lib/BaseButton.vue'
import BrandMark from './BrandMark.vue'
import { fileToDataUrl } from '../composables/useBranding'

const router = useRouter()
const authStore = useAuthStore()
const schoolStore = useSchoolStore()

const step = ref(1)
const loading = ref(false)
const error = ref('')
const logoError = ref('')
const logoInput = ref(null)
const MAX_LOGO_BYTES = 1024 * 1024

const {
    values: school, errors: schoolErrors,
    setField: setSchool, touch: touchSchool, validateAll: validateSchool,
} = useForm(
    {
        schoolName: '', shortName: '', tagline: '', established: '',
        phone: '', contactEmail: '', address: '',
        logoDataUrl: null, primaryColor: '#4f46e5',
    },
    {
        schoolName: [required],
        shortName: [required],
        contactEmail: [(v) => (!v ? '' : emailValidator(v))],
    }
)

const {
    values: owner, errors: ownerErrors,
    setField: setOwner, touch: touchOwner, validateAll: validateOwner,
} = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
        name: [required],
        email: [required, emailValidator],
        password: [required, minLength(8)],
        confirmPassword: [required, sameAs('Password', () => owner.password)],
    }
)

const onPickLogo = async (e) => {
    logoError.value = ''
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
        logoError.value = 'Please choose an image file.'
        e.target.value = ''
        return
    }
    if (file.size > MAX_LOGO_BYTES) {
        logoError.value = 'Image is too large (max 1 MB).'
        e.target.value = ''
        return
    }
    try {
        const dataUrl = await fileToDataUrl(file)
        setSchool('logoDataUrl', dataUrl)
    } catch {
        logoError.value = 'Could not read that file.'
    } finally {
        e.target.value = ''
    }
}

const handleSchoolNext = () => {
    if (!validateSchool()) return
    step.value = 2
}

// Build the persisted school-profile patch from the wizard's flat shape.
const buildSchoolPatch = () => {
    const addressLines = (school.address || '')
        .split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    return {
        schoolName: school.schoolName.trim(),
        shortName: school.shortName.trim(),
        tagline: school.tagline?.trim() || '',
        established: school.established ? Number(school.established) : null,
        contact: {
            addressLines,
            phone: school.phone?.trim() || '',
            email: school.contactEmail?.trim() || '',
            officeHours: '',
        },
        logoDataUrl: school.logoDataUrl || null,
        primaryColor: school.primaryColor || '#4f46e5',
    }
}

const handleSetup = async () => {
    loading.value = true
    error.value = ''
    if (!validateOwner()) { loading.value = false; return }

    try {
        // Persist the school profile first so seed/audit happen against the
        // correct branding. createOwner stays unchanged.
        await schoolStore.save(buildSchoolPatch())
        const ok = await authStore.createOwner(owner.name, owner.email, owner.password)
        if (ok) {
            router.push({ name: 'Dashboard' })
        } else {
            error.value = 'Setup failed. An owner account may already exist.'
        }
    } catch (err) {
        error.value = 'Setup failed. Please try again.'
        console.error(err)
    } finally {
        loading.value = false
    }
}
</script>
