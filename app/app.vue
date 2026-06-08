<script setup lang="ts"></script>

<template>
  <div class="transition-all duration-300">
    <!-- Inline script to prevent dark mode flash before hydration -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <component :is="'script'" v-html="themeInitScript" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
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
