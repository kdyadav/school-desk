<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <SectionHeading
                    eyebrow="Contact"
                    title="We'd love to hear from you."
                    description="Questions about admissions, a tour request, or anything else — send us a note and a real person will get back to you within two business days."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-3 gap-8 lg:gap-10">
            <div class="space-y-6">
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Visit</h3>
                    <address class="mt-3 not-italic text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        <div v-for="line in contact.addressLines" :key="line">{{ line }}</div>
                    </address>
                </div>
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60">
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reach out</h3>
                    <dl class="mt-3 space-y-2 text-sm">
                        <div v-if="contact.phone">
                            <dt class="text-slate-500">Phone</dt>
                            <dd class="text-slate-900 dark:text-white">{{ contact.phone }}</dd>
                        </div>
                        <div v-if="contact.email">
                            <dt class="text-slate-500">Email</dt>
                            <dd>
                                <a :href="`mailto:${contact.email}`" class="text-indigo-600 dark:text-indigo-300 hover:underline">
                                    {{ contact.email }}
                                </a>
                            </dd>
                        </div>
                        <div v-if="contact.officeHours">
                            <dt class="text-slate-500">Office hours</dt>
                            <dd class="text-slate-900 dark:text-white">{{ contact.officeHours }}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <form class="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900/60 space-y-5"
                @submit.prevent="onSubmit" novalidate>
                <div v-if="submitted" class="rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-sm text-emerald-800 dark:text-emerald-300">
                    Thanks, {{ values.name || 'friend' }} — your message has been recorded. We'll get back to you shortly.
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <BaseInput id="name" label="Name" placeholder="Your full name" required
                        :modelValue="values.name" :error="errors.name"
                        @update:modelValue="(v) => setField('name', v)" @blur="() => touch('name')" />

                    <BaseInput id="email" label="Email" type="email" placeholder="you@example.com" required
                        :modelValue="values.email" :error="errors.email"
                        @update:modelValue="(v) => setField('email', v)" @blur="() => touch('email')" />
                </div>

                <BaseSelect id="topic" label="I'm writing about" :options="topicOptions"
                    :modelValue="values.topic" :error="errors.topic"
                    @update:modelValue="(v) => setField('topic', v)" @blur="() => touch('topic')" />

                <BaseTextarea id="message" label="Message" :rows="5" required
                    :modelValue="values.message" :error="errors.message"
                    @update:modelValue="(v) => setField('message', v)" @blur="() => touch('message')" />

                <div class="flex justify-end">
                    <BaseButton type="submit" :full-width="false">Send message</BaseButton>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSchoolStore } from '../../stores/school'
import { siteConfig } from '../siteConfig'
import SectionHeading from '../components/SectionHeading.vue'

const school = useSchoolStore()
const contact = computed(() => school.profile?.contact || siteConfig.contact)
import { BaseInput, BaseSelect, BaseTextarea, BaseButton } from '../../ui-lib'
import { useForm } from '../../ui-lib/useForm'
import { required, email, minLength } from '../../ui-lib/validators'

const topicOptions = [
    { label: 'Admissions', value: 'Admissions' },
    { label: 'Tour request', value: 'Tour request' },
    { label: 'Academics', value: 'Academics' },
    { label: 'Other', value: 'Other' },
]

const { values, errors, setField, touch, validateAll, reset } = useForm(
    { name: '', email: '', topic: 'Admissions', message: '' },
    {
        name: [required, minLength(2)],
        email: [required, email],
        message: [required, minLength(10)],
    }
)

const submitted = ref(false)

const onSubmit = () => {
    if (!validateAll()) return
    submitted.value = true
    reset()
}
</script>
