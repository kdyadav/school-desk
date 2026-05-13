<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <SectionHeading
                    eyebrow="Faculty"
                    title="The teachers who make this place."
                    description="Our faculty bring deep subject expertise and an even deeper commitment to knowing every student."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="d in departments"
                    :key="d"
                    type="button"
                    :class="[
                        'px-3 py-1.5 text-sm rounded-full border transition-colors',
                        active === d
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    ]"
                    @click="active = d"
                >
                    {{ d }}
                </button>
            </div>

            <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <article v-for="t in filtered" :key="t.name" class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                        {{ t.initials }}
                    </div>
                    <h3 class="mt-4 font-semibold text-slate-900 dark:text-white">{{ t.name }}</h3>
                    <p class="text-sm text-indigo-600 dark:text-indigo-300">{{ t.title }}</p>
                    <p class="mt-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t.department }}</p>
                </article>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SectionHeading from '../components/SectionHeading.vue'

const teachers = [
    { initials: 'EM', name: 'Elena Marquez', title: 'Department Chair, English', department: 'Humanities' },
    { initials: 'TN', name: 'Theo Nakamura', title: 'History Teacher', department: 'Humanities' },
    { initials: 'PR', name: 'Priya Ramanathan', title: 'Mathematics Teacher', department: 'STEM' },
    { initials: 'BC', name: 'Ben Chen', title: 'Physics Teacher', department: 'STEM' },
    { initials: 'AO', name: 'Adaeze Obi', title: 'Biology Teacher', department: 'STEM' },
    { initials: 'LK', name: 'Liam Kelly', title: 'Visual Arts Teacher', department: 'Arts' },
    { initials: 'MS', name: 'Mei Shimizu', title: 'Music Director', department: 'Arts' },
    { initials: 'JF', name: 'Jamal Foster', title: 'Athletic Director', department: 'Athletics' },
    { initials: 'HR', name: 'Hannah Rivera', title: 'Spanish Teacher', department: 'World Languages' },
    { initials: 'KO', name: 'Kenji Ono', title: 'Mandarin Teacher', department: 'World Languages' },
    { initials: 'NW', name: 'Nina Walsh', title: 'Lower School Lead', department: 'Lower School' },
    { initials: 'RG', name: 'Rafael Gomes', title: 'Counselor', department: 'Student Life' },
]

const departments = ['All', 'Humanities', 'STEM', 'Arts', 'Athletics', 'World Languages', 'Lower School', 'Student Life']
const active = ref('All')

const filtered = computed(() =>
    active.value === 'All' ? teachers : teachers.filter((t) => t.department === active.value)
)
</script>
