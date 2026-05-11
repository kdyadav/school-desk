<template>
    <div class="min-h-screen flex justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div class="max-w-md w-full mx-4">
            <!-- Logo/Brand Section -->
            <div class="text-center my-8">
                <div class="inline-flex items-center justify-center w-16 h-16 mb-4">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
                        class="w-full h-full drop-shadow-lg">
                        <defs>
                            <linearGradient id="setup-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#4f46e5" />
                                <stop offset="100%" stop-color="#7c3aed" />
                            </linearGradient>
                            <linearGradient id="setup-spark" x1="24" y1="4" x2="24" y2="18"
                                gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fbbf24" />
                                <stop offset="100%" stop-color="#f59e0b" />
                            </linearGradient>
                        </defs>
                        <rect width="48" height="48" rx="12" fill="url(#setup-bg)" />
                        <path
                            d="M10 34V18a1 1 0 0 1 .553-.894C13.5 15.5 18 15 24 18c6-3 10.5-2.5 13.447-1.106A1 1 0 0 1 38 18v16a1 1 0 0 1-1.368.929C33.5 33.5 29 33 24 36c-5-3-9.5-2.5-12.632-1.071A1 1 0 0 1 10 34z"
                            fill="white" fill-opacity="0.2" />
                        <path d="M24 18v18" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M12 19c3-1.5 6.5-1.8 12 1v16c-5.5-2.8-9-2.5-12-1V19z" fill="white"
                            fill-opacity="0.85" />
                        <path d="M36 19c-3-1.5-6.5-1.8-12 1v16c5.5-2.8 9-2.5 12-1V19z" fill="white"
                            fill-opacity="0.65" />
                        <path d="M24 5l1.8 4.5L30 11l-4.2 1.5L24 17l-1.8-4.5L18 11l4.2-1.5L24 5z"
                            fill="url(#setup-spark)" />
                        <circle cx="17" cy="8" r="1" fill="#fbbf24" opacity="0.7" />
                        <circle cx="31" cy="7" r="0.8" fill="#fbbf24" opacity="0.5" />
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to SchoolDesk</h1>
                <p class="text-gray-600">Set up your owner account to get started.</p>
            </div>

            <!-- Setup Card -->
            <div class="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
                <form @submit.prevent="handleSetup" class="space-y-5">
                    <BaseInput id="setup-name" name="name" label="Full Name" type="text"
                        placeholder="Enter your full name" :modelValue="name"
                        @update:modelValue="(v) => setField('name', v)" @blur="() => touch('name')"
                        :error="errors.name" />

                    <BaseInput id="setup-email" name="email" label="Email" type="email" placeholder="Enter your email"
                        :modelValue="email" @update:modelValue="(v) => setField('email', v)"
                        @blur="() => touch('email')" :error="errors.email" />

                    <BaseInput id="setup-password" name="password" label="Password" type="password"
                        placeholder="Create a password (min. 8 characters)" :modelValue="password"
                        @update:modelValue="(v) => setField('password', v)" @blur="() => touch('password')"
                        :error="errors.password" />

                    <BaseInput id="setup-confirm" name="confirmPassword" label="Confirm Password" type="password"
                        placeholder="Repeat your password" :modelValue="confirmPassword"
                        @update:modelValue="(v) => setField('confirmPassword', v)"
                        @blur="() => touch('confirmPassword')" :error="errors.confirmPassword" />

                    <BaseButton type="submit" :loading="loading" :disabled="loading" variant="primary">
                        Create Owner &amp; Launch App
                    </BaseButton>

                    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div class="flex">
                            <svg class="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p class="ml-3 text-sm text-red-800">{{ error }}</p>
                        </div>
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
import { useForm } from '../ui-lib/useForm'
import { required, email as emailValidator, minLength, sameAs } from '../ui-lib/validators'
import BaseInput from '../ui-lib/BaseInput.vue'
import BaseButton from '../ui-lib/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const { name, email, password, confirmPassword, errors, validateAll, setField, touch } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
        name: [required],
        email: [required, emailValidator],
        password: [required, minLength(8)],
        confirmPassword: [required, sameAs('Password', () => password.value)],
    }
)

const loading = ref(false)
const error = ref('')

const handleSetup = async () => {
    loading.value = true
    error.value = ''

    if (!validateAll()) {
        loading.value = false
        return
    }

    try {
        const success = await authStore.createOwner(name.value, email.value, password.value)
        if (success) {
            router.push('/')
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
