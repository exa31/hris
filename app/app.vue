<template>
  <div class="transition-colors duration-300 min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
    <!-- Inline script to prevent dark mode flash before hydration -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <component :is="'script'" v-html="themeInitScript" />

    <!-- Top Loading Indicator for Page Navigation Transitions -->
    <NuxtLoadingIndicator
      color="linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)"
      :height="3"
      :duration="2000"
    />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Dialogs and Feedback Toasts -->
    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
// This script runs immediately (before Vue hydration) to prevent flash of wrong theme
const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch(e) {}
  })();
`;
</script>
