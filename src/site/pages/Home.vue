<template>
    <div>
        <!-- Hero -->
        <section class="relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-500/10 dark:via-slate-950 dark:to-violet-500/10" />
            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
                <div class="lg:col-span-7">
                    <p class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Admissions open · 2026–27
                    </p>
                    <h1 class="mt-5 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {{ tagline }}
                    </h1>
                    <p class="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                        {{ schoolName }} is a K–12 community where rigorous academics, the arts, and
                        athletics come together to shape thoughtful, capable young people ready for what's next.
                    </p>
                    <div class="mt-8 flex flex-wrap gap-3">
                        <router-link to="/admissions"
                            class="inline-flex items-center px-5 py-3 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm">
                            Start your application
                        </router-link>
                        <router-link to="/about"
                            class="inline-flex items-center px-5 py-3 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                            Discover our story
                        </router-link>
                    </div>
                </div>
                <div class="lg:col-span-5">
                    <div class="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-xl overflow-hidden">
                        <svg viewBox="0 0 400 300" class="absolute inset-0 w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="g" cx="50%" cy="40%">
                                    <stop offset="0%" stop-color="#fff" stop-opacity="0.45" />
                                    <stop offset="100%" stop-color="#fff" stop-opacity="0" />
                                </radialGradient>
                            </defs>
                            <rect width="400" height="300" fill="url(#g)" />
                            <g fill="#fff" opacity="0.85">
                                <circle cx="80" cy="220" r="6" />
                                <circle cx="140" cy="200" r="4" />
                                <circle cx="320" cy="80" r="5" />
                                <circle cx="280" cy="50" r="3" />
                            </g>
                            <path d="M40 250 Q120 180 200 220 T380 200" stroke="#fff" stroke-opacity="0.6" stroke-width="2" fill="none" />
                        </svg>
                        <div class="absolute bottom-5 left-5 right-5 text-white">
                            <div v-if="established" class="text-xs uppercase tracking-widest opacity-80">Founded {{ established }}</div>
                            <div class="text-2xl font-semibold mt-1">A campus built for curiosity.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stats -->
        <section class="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                <div v-for="s in stats" :key="s.label">
                    <div class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ s.value }}</div>
                    <div class="mt-1 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ s.label }}</div>
                </div>
            </div>
        </section>

        <!-- Highlights -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <SectionHeading
                eyebrow="Why families choose us"
                title="A complete education, thoughtfully designed."
                description="Small classes, dedicated faculty, and programs that meet every student where they are."
                center
            />
            <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <FeatureCard v-for="f in highlights" :key="f.title" :icon="f.icon" :title="f.title">
                    {{ f.description }}
                </FeatureCard>
            </div>
        </section>

        <!-- CTA -->
        <section class="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
                <h2 class="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Visit campus this season.
                </h2>
                <p class="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Open houses run every other Saturday. Walk the halls, meet our teachers, and see a day in
                    the life of a {{ shortName }} student.
                </p>
                <div class="mt-7 flex flex-wrap justify-center gap-3">
                    <router-link to="/contact"
                        class="inline-flex items-center px-5 py-3 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm">
                        Reserve a spot
                    </router-link>
                    <router-link to="/academics"
                        class="inline-flex items-center px-5 py-3 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800">
                        See programs
                    </router-link>
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
import FeatureCard from '../components/FeatureCard.vue'

const school = useSchoolStore()
const schoolName = computed(() => school.profile?.schoolName || siteConfig.schoolName)
const shortName = computed(() => school.profile?.shortName || siteConfig.shortName)
const tagline = computed(() => school.profile?.tagline || siteConfig.tagline)
const established = computed(() => school.profile?.established ?? siteConfig.established)

const stats = [
    { value: '850+', label: 'Students K–12' },
    { value: '12:1', label: 'Student–teacher ratio' },
    { value: '60+', label: 'Courses & electives' },
    { value: '98%', label: 'College placement' },
]

const highlights = [
    { icon: '📚', title: 'Rigorous academics', description: 'A core curriculum that builds strong readers, writers, and problem-solvers from day one.' },
    { icon: '🎨', title: 'Arts & creativity', description: 'Studio art, theater, music ensembles, and design — every student finds their medium.' },
    { icon: '⚽', title: 'Athletics for all', description: '20+ teams across three seasons, with no-cut policies in middle school.' },
    { icon: '🔬', title: 'STEM you can touch', description: 'Hands-on labs, robotics, and a maker space woven into the daily schedule.' },
    { icon: '🌍', title: 'Global perspective', description: 'World languages from grade 1 and exchange programs across four continents.' },
    { icon: '🤝', title: 'A close community', description: 'Advisory groups, mentorship, and an open-door faculty culture.' },
]
</script>
