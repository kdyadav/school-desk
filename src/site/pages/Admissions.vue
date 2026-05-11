<template>
    <div>
        <section class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <SectionHeading
                    eyebrow="Admissions · 2026–27"
                    title="A welcoming process, every step of the way."
                    description="We admit students based on fit, curiosity, and a love of learning — not test scores alone. Here is how to apply."
                />
            </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <ol class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <li v-for="(s, i) in steps" :key="s.title" class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
                    <div class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                        {{ i + 1 }}
                    </div>
                    <h3 class="mt-4 font-semibold text-slate-900 dark:text-white">{{ s.title }}</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ s.description }}</p>
                    <p class="mt-3 text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-300">{{ s.deadline }}</p>
                </li>
            </ol>
        </section>

        <section class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10">
                <div>
                    <SectionHeading eyebrow="Tuition" title="Investing in your child's education." />
                    <p class="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Tuition includes books, technology, lunch, and most field trips. We are proud that
                        more than a third of our students receive financial assistance.
                    </p>
                    <div class="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <table class="w-full text-sm">
                            <thead class="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th class="text-left font-medium px-4 py-3">Division</th>
                                    <th class="text-left font-medium px-4 py-3">Grades</th>
                                    <th class="text-right font-medium px-4 py-3">Annual tuition</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white/60 dark:bg-slate-900/40 divide-y divide-slate-200 dark:divide-slate-800">
                                <tr v-for="t in tuition" :key="t.division">
                                    <td class="px-4 py-3 text-slate-900 dark:text-white font-medium">{{ t.division }}</td>
                                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ t.grades }}</td>
                                    <td class="px-4 py-3 text-right text-slate-900 dark:text-white">{{ t.amount }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <SectionHeading eyebrow="Financial aid" title="Need-based, confidential, and welcomed." />
                    <p class="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Families apply for financial aid through the Clarity Tuition application. Awards are
                        based on demonstrated need and reviewed annually. Aid status has no bearing on
                        admissions decisions.
                    </p>
                    <ul class="mt-6 space-y-3 text-sm">
                        <li v-for="f in faqs" :key="f.q" class="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60">
                            <div class="font-semibold text-slate-900 dark:text-white">{{ f.q }}</div>
                            <p class="mt-1 text-slate-600 dark:text-slate-400">{{ f.a }}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Ready to apply?</h2>
            <p class="mt-3 text-slate-600 dark:text-slate-400">Our admissions team is here to help — no question too small.</p>
            <div class="mt-7 flex justify-center gap-3">
                <router-link to="/contact" class="inline-flex items-center px-5 py-3 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm">
                    Contact admissions
                </router-link>
                <a href="#" class="inline-flex items-center px-5 py-3 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Download viewbook
                </a>
            </div>
        </section>
    </div>
</template>

<script setup>
import SectionHeading from '../components/SectionHeading.vue'

const steps = [
    { title: 'Inquire', description: 'Submit a quick inquiry form so we can get to know your family.', deadline: 'Open year-round' },
    { title: 'Visit', description: 'Tour campus, attend an open house, and meet faculty.', deadline: 'Sept – Jan' },
    { title: 'Apply', description: 'Complete the application, including student writing and recommendations.', deadline: 'Due Jan 15' },
    { title: 'Decide', description: 'Decisions released March 10. Enrollment contracts due April 5.', deadline: 'March – April' },
]

const tuition = [
    { division: 'Lower School', grades: 'K–4', amount: '$22,400' },
    { division: 'Middle School', grades: '5–8', amount: '$26,800' },
    { division: 'Upper School', grades: '9–12', amount: '$31,200' },
]

const faqs = [
    { q: 'When should we apply?', a: 'Most families apply in the fall of the year before enrollment. Rolling admissions continues if seats remain.' },
    { q: 'Do you offer financial aid?', a: 'Yes — about 35% of students receive need-based aid. Awards are determined separately from admissions.' },
    { q: 'What does the visit involve?', a: 'A campus tour with admissions, a class observation, and an age-appropriate student visit day.' },
]
</script>
