<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <SectionHeading
                    eyebrow="About"
                    :title="`Inside ${schoolName}`"
                    description="A K–12 independent school built on the simple idea that great teaching, in a community that knows you, changes everything."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-3 gap-8 lg:gap-10">
            <div class="lg:col-span-2 space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                <h3 class="text-2xl font-semibold text-slate-900 dark:text-white">Our story</h3>
                <p v-if="established">
                    Founded in {{ established }} by a small group of educators and parents, our
                    school began as a single building serving 60 students. Today we welcome more than 850
                    learners across three divisions on a 14-acre campus, while keeping the close community
                    feel that defined our earliest years.
                </p>
                <p>
                    Through every chapter, our commitment has stayed the same: meet each student as an
                    individual, expect the very best of them, and give them the tools — academic,
                    creative, and personal — to grow into capable, kind adults.
                </p>

                <h3 class="pt-4 text-2xl font-semibold text-slate-900 dark:text-white">Mission</h3>
                <p>
                    To inspire students to think rigorously, act with integrity, and contribute meaningfully
                    to the communities they belong to — locally and globally.
                </p>

                <h3 class="pt-4 text-2xl font-semibold text-slate-900 dark:text-white">Values</h3>
                <ul class="grid sm:grid-cols-2 gap-3 pt-2">
                    <li v-for="v in values" :key="v.title" class="flex gap-3">
                        <span class="text-indigo-500 mt-1">●</span>
                        <div>
                            <div class="font-semibold text-slate-900 dark:text-white">{{ v.title }}</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">{{ v.description }}</div>
                        </div>
                    </li>
                </ul>
            </div>

            <aside class="space-y-4">
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60">
                    <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">At a glance</h4>
                    <dl class="mt-4 space-y-3 text-sm">
                        <div v-if="established" class="flex justify-between gap-4"><dt class="text-slate-500">Founded</dt><dd class="text-slate-900 dark:text-white font-medium">{{ established }}</dd></div>
                        <div class="flex justify-between gap-4"><dt class="text-slate-500">Enrollment</dt><dd class="text-slate-900 dark:text-white font-medium">850+</dd></div>
                        <div class="flex justify-between gap-4"><dt class="text-slate-500">Grades</dt><dd class="text-slate-900 dark:text-white font-medium">K–12</dd></div>
                        <div class="flex justify-between gap-4"><dt class="text-slate-500">Campus</dt><dd class="text-slate-900 dark:text-white font-medium">14 acres</dd></div>
                        <div class="flex justify-between gap-4"><dt class="text-slate-500">Accreditation</dt><dd class="text-slate-900 dark:text-white font-medium">NAIS, WASC</dd></div>
                    </dl>
                </div>
                <div class="rounded-xl border border-indigo-200 dark:border-indigo-500/30 p-6 bg-indigo-50/60 dark:bg-indigo-500/5">
                    <h4 class="font-semibold text-slate-900 dark:text-white">Plan a visit</h4>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">The best way to understand our school is to walk the halls.</p>
                    <router-link to="/contact" class="mt-4 inline-flex items-center text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:underline">
                        Schedule a tour →
                    </router-link>
                </div>
            </aside>
        </section>

        <section class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <SectionHeading eyebrow="Leadership" title="Meet the team guiding our school." />
                <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <article v-for="p in leadership" :key="p.name" class="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                            {{ p.initials }}
                        </div>
                        <h3 class="mt-4 font-semibold text-slate-900 dark:text-white">{{ p.name }}</h3>
                        <p class="text-sm text-indigo-600 dark:text-indigo-300">{{ p.role }}</p>
                        <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">{{ p.bio }}</p>
                    </article>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSchoolStore } from '../../stores/school'
import { siteConfig } from '../siteConfig'
import SectionHeading from '../components/SectionHeading.vue'

const school = useSchoolStore()
const schoolName = computed(() => school.profile?.schoolName || siteConfig.schoolName)
const established = computed(() => school.profile?.established ?? siteConfig.established)

const values = [
    { title: 'Curiosity', description: 'Question everything; ask one more.' },
    { title: 'Integrity', description: 'Do the right thing, especially when no one is watching.' },
    { title: 'Excellence', description: 'Care about craft in everything we make.' },
    { title: 'Belonging', description: 'A school where every student is known and valued.' },
]

const leadership = [
    { initials: 'AM', name: 'Dr. Asha Mehta', role: 'Head of School', bio: 'Twenty years in independent education, with a focus on inclusive curriculum design.' },
    { initials: 'JC', name: 'Jordan Carter', role: 'Lower School Principal', bio: 'Champion of literacy and play-based learning in early grades.' },
    { initials: 'SO', name: 'Samuel Okafor', role: 'Upper School Principal', bio: 'Mathematics teacher turned administrator; loves robotics and crew.' },
]
</script>
