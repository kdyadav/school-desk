<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <SectionHeading
                    eyebrow="News & events"
                    title="What's happening on campus."
                    description="Performances, athletics, awards, and the small moments that add up to a great year."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 space-y-6">
                <article v-for="(p, i) in posts" :key="p.title"
                    :class="['rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden', i === 0 ? 'lg:flex' : '']">
                    <div :class="['bg-gradient-to-br', p.gradient, i === 0 ? 'lg:w-1/2 aspect-[4/3] lg:aspect-auto' : 'aspect-[16/7]']" />
                    <div :class="['p-6', i === 0 ? 'lg:w-1/2 lg:p-8' : '']">
                        <p class="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-300 font-semibold">{{ p.tag }}</p>
                        <h3 :class="['mt-2 font-semibold text-slate-900 dark:text-white', i === 0 ? 'text-2xl' : 'text-lg']">
                            {{ p.title }}
                        </h3>
                        <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ p.excerpt }}</p>
                        <div class="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span>{{ p.date }}</span>
                            <span aria-hidden="true">·</span>
                            <span>{{ p.author }}</span>
                        </div>
                    </div>
                </article>
            </div>

            <aside>
                <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                    <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Upcoming events</h4>
                    <ul class="mt-4 space-y-4">
                        <li v-for="e in events" :key="e.title" class="flex gap-4">
                            <div class="flex-shrink-0 w-14 text-center rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div class="bg-indigo-600 text-white text-[10px] uppercase tracking-wider py-0.5">{{ e.month }}</div>
                                <div class="text-xl font-semibold py-1.5 text-slate-900 dark:text-white">{{ e.day }}</div>
                            </div>
                            <div class="text-sm">
                                <div class="font-semibold text-slate-900 dark:text-white">{{ e.title }}</div>
                                <div class="text-slate-500 dark:text-slate-400">{{ e.time }} · {{ e.location }}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </aside>
        </section>
    </div>
</template>

<script setup>
import SectionHeading from '../components/SectionHeading.vue'

const posts = [
    {
        tag: 'Athletics',
        title: 'Varsity crew brings home regional gold',
        excerpt: 'Our boys and girls eights swept the Regional Sprints in record-setting time, capping a season of relentless work on the river.',
        date: 'May 4, 2026',
        author: 'Communications Office',
        gradient: 'from-indigo-500 via-violet-500 to-fuchsia-500',
    },
    {
        tag: 'Arts',
        title: 'Spring musical: "Into the Woods"',
        excerpt: 'A cast of 38 students brings Sondheim to the main stage for three nights — tickets on sale Friday.',
        date: 'April 28, 2026',
        author: 'Performing Arts',
        gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
    },
    {
        tag: 'STEM',
        title: 'Robotics team advances to nationals',
        excerpt: 'Team 7421 placed second in the regional FIRST competition, qualifying for the national event in Houston.',
        date: 'April 14, 2026',
        author: 'STEM Department',
        gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    },
    {
        tag: 'Community',
        title: 'Alumni weekend draws record crowd',
        excerpt: 'More than 400 alumni returned for tours, the all-class reception, and a faculty-led panel on the future of school.',
        date: 'April 6, 2026',
        author: 'Alumni Relations',
        gradient: 'from-amber-400 via-orange-500 to-rose-500',
    },
]

const events = [
    { month: 'May', day: '18', title: 'Spring open house', time: '10:00 AM', location: 'Front lawn' },
    { month: 'May', day: '24', title: 'Choral concert', time: '7:00 PM', location: 'Anderson Hall' },
    { month: 'Jun', day: '02', title: 'Field day', time: 'All day', location: 'Athletic complex' },
    { month: 'Jun', day: '12', title: 'Class of 2026 commencement', time: '4:00 PM', location: 'Main quad' },
]
</script>
