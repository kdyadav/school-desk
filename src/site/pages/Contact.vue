<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <SectionHeading
                    eyebrow="Contact"
                    title="We'd love to hear from you."
                    description="Questions about admissions, a tour request, or anything else — send us a note and a real person will get back to you within two business days."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-3 gap-10">
            <div class="space-y-6">
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Visit</h3>
                    <address class="mt-3 not-italic text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        <div v-for="line in siteConfig.contact.addressLines" :key="line">{{ line }}</div>
                    </address>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reach out</h3>
                    <dl class="mt-3 space-y-2 text-sm">
                        <div>
                            <dt class="text-slate-500">Phone</dt>
                            <dd class="text-slate-900 dark:text-white">{{ siteConfig.contact.phone }}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Email</dt>
                            <dd>
                                <a :href="`mailto:${siteConfig.contact.email}`" class="text-indigo-600 dark:text-indigo-300 hover:underline">
                                    {{ siteConfig.contact.email }}
                                </a>
                            </dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Office hours</dt>
                            <dd class="text-slate-900 dark:text-white">{{ siteConfig.contact.officeHours }}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <form class="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-white dark:bg-slate-900/60 space-y-5"
                @submit.prevent="onSubmit" novalidate>
                <div v-if="submitted" class="rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-sm text-emerald-800 dark:text-emerald-300">
                    Thanks, {{ form.name || 'friend' }} — your message has been recorded. We'll get back to you shortly.
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <label class="block">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
                        <input v-model="form.name" type="text" required
                            class="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20" />
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
                        <input v-model="form.email" type="email" required
                            class="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20" />
                    </label>
                </div>
                <label class="block">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">I'm writing about</span>
                    <select v-model="form.topic"
                        class="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20">
                        <option>Admissions</option>
                        <option>Tour request</option>
                        <option>Academics</option>
                        <option>Other</option>
                    </select>
                </label>
                <label class="block">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Message</span>
                    <textarea v-model="form.message" rows="5" required
                        class="mt-1 w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20" />
                </label>

                <div class="flex justify-end">
                    <button type="submit"
                        class="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm">
                        Send message
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { siteConfig } from '../siteConfig'
import SectionHeading from '../components/SectionHeading.vue'

const form = reactive({ name: '', email: '', topic: 'Admissions', message: '' })
const submitted = ref(false)

const onSubmit = () => {
    if (!form.name || !form.email || !form.message) return
    submitted.value = true
}
</script>
