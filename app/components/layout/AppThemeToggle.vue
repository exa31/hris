<template>
  <button
    v-tooltip.bottom="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm border border-slate-200/60 dark:border-slate-800/60 group relative overflow-hidden"
    aria-label="Toggle Theme"
    @click="toggleDarkMode"
  >
    <i
      class="bi transition-all duration-500 group-hover:scale-110 group-hover:rotate-[360deg] text-base"
      :class="isDarkMode ? 'bi-sun-fill text-amber-400' : 'bi-moon-stars-fill text-indigo-600'"
    ></i>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";

const { isDarkMode, toggleDarkMode } = useTheme();
</script>
