<template>
    <div class="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 antialiased">
        <SiteHeader />
        <main class="flex-1">
            <router-view />
        </main>
        <SiteFooter />
    </div>
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>
