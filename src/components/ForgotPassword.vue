<template>
    <div class="min-h-screen flex justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div class="max-w-md w-full">
            <!-- Logo/Brand Section -->
            <div class="text-center my-6 sm:my-8">
                <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
                        class="w-full h-full drop-shadow-lg">
                        <defs>
                            <linearGradient id="fp-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#4f46e5" />
                                <stop offset="100%" stop-color="#7c3aed" />
                            </linearGradient>
                            <linearGradient id="fp-spark" x1="24" y1="4" x2="24" y2="18" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#fbbf24" />
                                <stop offset="100%" stop-color="#f59e0b" />
                            </linearGradient>
                        </defs>
                        <rect width="48" height="48" rx="12" fill="url(#fp-bg)" />
                        <path
                            d="M10 34V18a1 1 0 0 1 .553-.894C13.5 15.5 18 15 24 18c6-3 10.5-2.5 13.447-1.106A1 1 0 0 1 38 18v16a1 1 0 0 1-1.368.929C33.5 33.5 29 33 24 36c-5-3-9.5-2.5-12.632-1.071A1 1 0 0 1 10 34z"
                            fill="white" fill-opacity="0.2" />
                        <path d="M24 18v18" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M12 19c3-1.5 6.5-1.8 12 1v16c-5.5-2.8-9-2.5-12-1V19z" fill="white"
                            fill-opacity="0.85" />
                        <path d="M36 19c-3-1.5-6.5-1.8-12 1v16c5.5-2.8 9-2.5 12-1V19z" fill="white"
                            fill-opacity="0.65" />
                        <path d="M24 5l1.8 4.5L30 11l-4.2 1.5L24 17l-1.8-4.5L18 11l4.2-1.5L24 5z"
                            fill="url(#fp-spark)" />
                        <circle cx="17" cy="8" r="1" fill="#fbbf24" opacity="0.7" />
                        <circle cx="31" cy="7" r="0.8" fill="#fbbf24" opacity="0.5" />
                    </svg>
                </div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">Forgot Password?</h1>
                <p class="text-sm sm:text-base text-gray-600">Enter your email and we'll send you a reset link.</p>
            </div>

            <!-- Card -->
            <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">

                <!-- Success state -->
                <div v-if="submitted" class="text-center py-4">
                    <div class="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                        <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">Check your inbox</h2>
                    <p class="text-sm text-gray-600 mb-6">
                        If <span class="font-medium text-gray-800">{{ email }}</span> is registered, you'll receive a
                        password reset link shortly.
                    </p>
                    <router-link to="/login"
                        class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 text-sm">
                        Back to Sign In
                    </router-link>
                </div>

                <!-- Form state -->
                <form v-else @submit.prevent="handleForgotPassword" class="space-y-6">
                    <BaseInput id="email" name="email" label="Email" type="email"
                        placeholder="Enter your registered email" :modelValue="email"
                        @update:modelValue="(value) => setField('email', value)" @blur="() => touch('email')"
                        :error="errors.email" />

                    <BaseButton type="submit" :loading="loading" :disabled="loading" variant="primary"
                        loadingText="Sending...">
                        Send Reset Link
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

                <div v-if="!submitted" class="mt-6 text-center">
                    <router-link to="/login"
                        class="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                        ← Back to Sign In
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useForm } from '../ui-lib/useForm'
import { required, email as emailValidator } from '../ui-lib/validators'
import BaseInput from '../ui-lib/BaseInput.vue'
import BaseButton from '../ui-lib/BaseButton.vue'

const authStore = useAuthStore()

const { email, errors, validateAll, setField, touch } = useForm(
    { email: '' },
    { email: [required, emailValidator] }
)

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const handleForgotPassword = async () => {
    loading.value = true
    error.value = ''

    if (!validateAll()) {
        loading.value = false
        return
    }

    try {
        await authStore.forgotPassword(email.value)
        submitted.value = true
    } catch (err) {
        error.value = 'Something went wrong. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>
