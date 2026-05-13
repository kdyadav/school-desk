<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                <SectionHeading
                    eyebrow="Academics"
                    title="A program that grows with your child."
                    description="From early literacy to advanced research, our curriculum is sequenced, hands-on, and taught by teachers who love their subjects."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 sm:space-y-12">
            <article v-for="d in divisions" :key="d.name" class="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">{{ d.grades }}</p>
                    <h3 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{{ d.name }}</h3>
                    <p class="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{{ d.summary }}</p>
                </div>
                <div class="lg:col-span-2 grid sm:grid-cols-2 gap-3">
                    <div v-for="h in d.highlights" :key="h" class="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-300">
                        {{ h }}
                    </div>
                </div>
            </article>
        </section>

        <section class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <SectionHeading eyebrow="Beyond the classroom" title="Programs that round out the day." />
                <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard v-for="p in programs" :key="p.title" :icon="p.icon" :title="p.title">
                        {{ p.description }}
                    </FeatureCard>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import SectionHeading from '../components/SectionHeading.vue'
import FeatureCard from '../components/FeatureCard.vue'

const divisions = [
    {
        grades: 'Grades K–4',
        name: 'Lower School',
        summary: 'A joyful, structured start. Students build strong foundations in reading, writing, math, and science through hands-on work and lots of time outdoors.',
        highlights: ['Daily literacy & math blocks', 'Spanish from grade 1', 'Science specialists weekly', 'Recess twice a day'],
    },
    {
        grades: 'Grades 5–8',
        name: 'Middle School',
        summary: 'A program designed for the way middle schoolers actually learn — with advisors, project-based units, and room to discover passions.',
        highlights: ['Advisory groups of 8', 'STEM design lab', 'Trimester elective wheels', 'Outdoor education trips'],
    },
    {
        grades: 'Grades 9–12',
        name: 'Upper School',
        summary: 'A college-prep curriculum with serious depth. Honors and advanced courses across disciplines, capped by a senior research project.',
        highlights: ['25+ advanced courses', 'Senior capstone', 'College counseling from grade 10', 'Community-engaged learning'],
    },
]

const programs = [
    { icon: '🎭', title: 'Performing arts', description: 'Two main-stage productions a year, plus jazz band, orchestra, and chorus.' },
    { icon: '🏊', title: 'Athletics', description: 'No-cut middle school teams; varsity competition in 14 sports.' },
    { icon: '🤖', title: 'Robotics & maker', description: 'Open studio hours, FIRST Robotics, and a fully equipped fabrication lab.' },
    { icon: '🌱', title: 'Outdoor program', description: 'Backpacking, canoeing, and field studies built into the calendar.' },
    { icon: '✍️', title: 'Writing center', description: 'Peer and faculty support for writers in every discipline.' },
    { icon: '🌐', title: 'Global studies', description: 'Spring exchange programs with partner schools on four continents.' },
]
</script>
