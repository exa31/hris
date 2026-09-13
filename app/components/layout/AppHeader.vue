<template>
  <header
    class="sticky top-0 z-30 h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-6 lg:px-10 transition-colors"
  >
    <!-- Left Area: Mobile Trigger & Breadcrumbs -->
    <div class="flex items-center gap-4 min-w-0">
      <button
        type="button"
        class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        aria-label="Open Sidebar"
        @click="emit('open-sidebar')"
      >
        <i class="bi bi-list text-2xl"></i>
      </button>

      <AppBreadcrumb />
    </div>

    <!-- Right Area: Global Actions & User Menu -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Quick Search / Command Palette Trigger -->
      <button
        type="button"
        class="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer text-xs"
        @click="emit('open-command-palette')"
      >
        <i class="bi bi-search text-xs"></i>
        <span class="font-medium pr-2">Quick search...</span>
        <kbd class="px-1.5 py-0.5 text-[10px] font-bold font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-2xs">
          Ctrl K
        </kbd>
      </button>

      <!-- Mobile Search Icon Button -->
      <button
        type="button"
        class="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 cursor-pointer"
        aria-label="Search"
        @click="emit('open-command-palette')"
      >
        <i class="bi bi-search text-base"></i>
      </button>

      <!-- Theme Switcher -->
      <AppThemeToggle />

      <!-- Notification Center -->
      <AppNotifications />

      <!-- Vertical Divider -->
      <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

      <!-- User Profile Menu -->
      <AppUserMenu />
    </div>
  </header>
</template>

<script setup lang="ts">
import AppBreadcrumb from "./AppBreadcrumb.vue";
import AppThemeToggle from "./AppThemeToggle.vue";
import AppNotifications from "./AppNotifications.vue";
import AppUserMenu from "./AppUserMenu.vue";

defineProps<{
  isMobile?: boolean;
}>();

const emit = defineEmits<{
  (e: "open-sidebar"): void;
  (e: "open-command-palette"): void;
}>();
</script>
