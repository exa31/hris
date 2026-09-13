<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
    <!-- Modular Sidebar Navigation -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :is-mobile="isMobile"
      @toggle="toggleSidebar"
      @close-mobile="sidebarCollapsed = true"
    />

    <!-- Main Content Shell -->
    <div
      class="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
      :class="[
        sidebarCollapsed && !isMobile ? 'lg:pl-20' : !isMobile ? 'lg:pl-72' : 'pl-0'
      ]"
    >
      <!-- Modular Top Header -->
      <AppHeader
        :is-mobile="isMobile"
        @open-sidebar="sidebarCollapsed = false"
        @open-command-palette="commandPaletteOpen = true"
      />

      <!-- Page Content with Smooth Motion -->
      <main class="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
        <Motion
          :key="$route.fullPath"
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.35, ease: 'easeOut' }"
        >
          <slot />
        </Motion>
      </main>
    </div>

    <!-- Global Command Palette Modal (Ctrl+K) -->
    <AppCommandPalette v-model:visible="commandPaletteOpen" />

    <!-- Global System Notifications / Alerts Modal -->
    <GlobalNotificationModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import AppSidebar from "~/components/layout/AppSidebar.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppCommandPalette from "~/components/layout/AppCommandPalette.vue";
import GlobalNotificationModal from "~/components/GlobalNotificationModal.vue";
import { useTheme } from "~/composables/useTheme";

const sidebarCollapsed = ref(false);
const isMobile = ref(false);
const commandPaletteOpen = ref(false);

const { initTheme } = useTheme();

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  initTheme();
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");

body {
  font-family: "Plus Jakarta Sans", sans-serif;
  @apply antialiased overflow-x-hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 dark:bg-slate-800 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-indigo-500/50;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* PrimeVue Overrides */
.dark .p-datatable {
  @apply bg-slate-900 border-slate-800;
}
.dark .p-datatable-thead > tr > th {
  @apply bg-slate-800 text-slate-400 border-slate-700;
}
.dark .p-datatable-tbody > tr {
  @apply bg-slate-900 text-slate-300 border-slate-800;
}
.dark .p-paginator {
  @apply bg-slate-900 border-slate-800;
}
</style>
