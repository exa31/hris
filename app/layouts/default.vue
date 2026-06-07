<template>
  <div class="min-h-screen transition-colors duration-500">
    <div
      class="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-500/30 selection:text-indigo-700 dark:selection:text-indigo-200"
    >
      <!-- Sidebar -->
      <Motion
        :initial="{ x: -280 }"
        :animate="{ x: sidebarCollapsed ? (isMobile ? -280 : 0) : 0 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
        class="fixed inset-y-0 left-0 z-[60] flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none"
        :class="[
          sidebarCollapsed && !isMobile ? 'w-20' : 'w-[280px]',
          isMobile && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0',
        ]"
      >
        <!-- Sidebar Header -->
        <div
          class="h-20 flex items-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 dark:from-slate-900 to-white dark:to-slate-900 relative transition-all duration-300"
          :class="
            sidebarCollapsed && !isMobile
              ? 'justify-center px-0'
              : 'justify-between px-6'
          "
        >
          <div
            class="flex items-center gap-3 overflow-hidden w-full"
            :class="sidebarCollapsed && !isMobile ? 'justify-center' : ''"
          >
            <NexusLogo :size="40" class="flex-shrink-0" />
            <span
              v-if="!sidebarCollapsed || isMobile"
              class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 truncate tracking-tight"
            >
              NexusHR
            </span>
          </div>

          <button
            v-if="!isMobile"
            class="absolute -right-4 top-6 z-50 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 shadow-sm transition-colors"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <i
              class="bi"
              :class="sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"
            ></i>
          </button>
        </div>

        <!-- Navigation -->
        <nav
          class="flex-1 overflow-y-auto py-8 px-4 space-y-10 custom-scrollbar"
        >
          <!-- Main Menu (Admin) -->
          <div v-if="!isEmployee" class="space-y-2">
            <div
              v-if="!sidebarCollapsed || isMobile"
              class="px-4 mb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]"
            >
              Primary
            </div>

            <NuxtLink
              v-for="item in mainMenu"
              v-show="
                !item.permission ||
                hasPermission(item.permission.module, item.permission.action)
              "
              :key="item.to"
              :to="item.to"
              class="group flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden"
              :class="[
                isActive(item.to)
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400',
              ]"
            >
              <i
                class="text-xl transition-transform duration-300 group-hover:scale-110"
                :class="[
                  item.icon,
                  isActive(item.to)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-indigo-500',
                ]"
              ></i>
              <span
                v-if="!sidebarCollapsed || isMobile"
                class="text-sm font-bold truncate"
                >{{ item.label }}</span
              >
              <div
                v-if="isActive(item.to)"
                class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
              ></div>
            </NuxtLink>
          </div>

          <!-- Employee Menu -->
          <div v-if="isEmployee" class="space-y-2">
            <div
              v-if="!sidebarCollapsed || isMobile"
              class="px-4 mb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]"
            >
              Self Service
            </div>

            <NuxtLink
              v-for="item in employeeMenu"
              :key="item.to"
              :to="item.to"
              class="group flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden"
              :class="[
                isActive(item.to)
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400',
              ]"
            >
              <i
                class="text-xl transition-transform duration-300 group-hover:scale-110"
                :class="[
                  item.icon,
                  isActive(item.to)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-indigo-500',
                ]"
              ></i>
              <span
                v-if="!sidebarCollapsed || isMobile"
                class="text-sm font-bold truncate"
                >{{ item.label }}</span
              >
              <div
                v-if="isActive(item.to)"
                class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
              ></div>
            </NuxtLink>
          </div>

          <!-- Management Menu -->
          <div
            v-if="
              !isEmployee &&
              hasAnyPermission([
                'transport',
                'users',
                'roles',
                'logs',
                'transport_setting',
              ])
            "
            class="space-y-2"
          >
            <div
              v-if="!sidebarCollapsed || isMobile"
              class="px-4 mb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]"
            >
              Governance
            </div>

            <NuxtLink
              v-for="item in managementMenu"
              v-show="
                !item.permission ||
                hasPermission(item.permission.module, item.permission.action)
              "
              :key="item.to"
              :to="item.to"
              class="group flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden"
              :class="[
                isActive(item.to)
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400',
              ]"
            >
              <i
                class="text-xl transition-transform duration-300 group-hover:scale-110"
                :class="[
                  item.icon,
                  isActive(item.to)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-indigo-500',
                ]"
              ></i>
              <span
                v-if="!sidebarCollapsed || isMobile"
                class="text-sm font-bold truncate"
                >{{ item.label }}</span
              >
              <div
                v-if="isActive(item.to)"
                class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full"
              ></div>
            </NuxtLink>
          </div>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            class="flex items-center gap-4 w-full px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-300 group"
            @click="handleLogout"
          >
            <i
              class="bi bi-box-arrow-right text-xl transition-transform group-hover:translate-x-1"
            ></i>
            <span
              v-if="!sidebarCollapsed || isMobile"
              class="font-black text-xs uppercase tracking-widest"
              >Logout</span
            >
          </button>
        </div>
      </Motion>

      <!-- Overlay -->
      <div
        v-if="isMobile && !sidebarCollapsed"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[55] transition-opacity duration-300"
        @click="sidebarCollapsed = true"
      ></div>

      <!-- Main Container -->
      <div
        class="transition-all duration-500 ease-in-out"
        :class="[
          sidebarCollapsed || isMobile ? 'ml-0' : 'ml-[280px]',
          sidebarCollapsed && !isMobile
            ? 'ml-20'
            : !isMobile
              ? 'ml-[280px]'
              : 'ml-0',
        ]"
      >
        <!-- Header -->
        <header
          class="sticky top-0 z-30 h-24 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-6 md:px-12"
        >
          <div class="flex items-center gap-6">
            <button
              v-if="isMobile"
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
              @click="sidebarCollapsed = false"
            >
              <i class="bi bi-list text-xl"></i>
            </button>

            <div class="hidden md:block space-y-1">
              <h2
                class="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none"
              >
                {{ pageTitle }}
              </h2>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <p
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >
                  System Health: Optimal
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 md:gap-8">
            <!-- Search & Dark Mode & Notification -->
            <div
              class="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50"
            >
              <button
                v-tooltip.bottom="isDarkMode ? 'Light Mode' : 'Dark Mode'"
                class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group"
                @click="toggleDarkMode"
              >
                <i
                  class="bi transition-transform duration-500 group-hover:rotate-[360deg]"
                  :class="isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'"
                ></i>
              </button>
              <div class="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
              <button
                class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <i class="bi bi-bell text-lg"></i>
                <span
                  class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"
                ></span>
              </button>
            </div>

            <div
              class="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"
            ></div>

            <!-- User Profile -->
            <div class="flex items-center gap-4 cursor-pointer group">
              <div class="hidden md:block text-right">
                <div
                  class="text-sm font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {{ userName }}
                </div>
                <div
                  class="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-0.5"
                >
                  {{ userRole }}
                </div>
              </div>

              <Avatar
                :image="userPhotoUrl"
                :label="userInitial"
                shape="circle"
                size="large"
                class="!w-10 text-black dark:text-white !h-10 border-2 border-white dark:border-slate-800 shadow-lg ring-2 ring-indigo-50 dark:ring-indigo-900 ring-offset-2 dark:ring-offset-slate-950 transition-transform group-hover:scale-110"
              />
            </div>
          </div>
        </header>

        <!-- Content -->
        <main
          class="p-6 md:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-96px)]"
        >
          <Motion
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, ease: 'easeOut' }"
          >
            <slot />
          </Motion>
        </main>
      </div>

      <!-- Global Modals -->
      <GlobalNotificationModal />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const sidebarCollapsed = ref(false);
const isMobile = ref(false);

const { user, hasPermission } = useAuth();
const { isDarkMode, toggleDarkMode, initTheme } = useTheme();

const userName = computed(() => user.value?.employee?.name || "User");
const userRole = computed(() => user.value?.role?.name || "");
const userPhotoUrl = computed(
  () => (user.value?.employee as any)?.photo_url || "",
);
const userInitial = computed(() => {
  const name = user.value?.employee?.name || "U";
  return name.charAt(0).toUpperCase();
});

const isEmployee = computed(
  () => user.value?.role?.name?.toLowerCase() === "pegawai",
);

const pageTitle = computed(() => {
  const path = route.path;
  if (path === "/dashboard") return "Intelligence Center";
  if (path.includes("/employees")) return "Talent Directory";
  if (path.includes("/attendance")) return "Presence Flow";
  if (path.includes("/leaves")) return "Leave Governance";
  if (path.includes("/announcements")) return "Broadcasting";
  if (path.includes("/user-management")) return "Identity Hub";
  if (path.includes("/roles")) return "Access Permissions";
  if (path.includes("/activity-logs")) return "Security Audit";
  if (path.includes("/transport-allowance")) return "Financial Logistics";
  if (path.includes("/recovery")) return "Data Recovery";
  if (path.includes("/settings")) return "System Config";
  return "Nexus HRIS";
});

const isActive = (path: string) => {
  if (path === "/dashboard") return route.path === "/dashboard";
  return route.path.startsWith(path);
};

const hasAnyPermission = (modules: string[]) => {
  return modules.some((m) => hasPermission(m, "read"));
};

const handleLogout = async () => {
  const { logout } = useAuth();
  await logout();
};

const mainMenu = [
  { label: "Intelligence", to: "/dashboard", icon: "bi bi-grid-fill" },
  {
    label: "Talent Directory",
    to: "/employees",
    icon: "bi bi-people-fill",
    permission: { module: "employees", action: "read" },
  },
  {
    label: "Presence Flow",
    to: "/attendance",
    icon: "bi bi-calendar-check-fill",
    permission: { module: "attendance", action: "read" },
  },
  {
    label: "Leave Governance",
    to: "/leaves",
    icon: "bi bi-calendar2-week-fill",
    permission: { module: "leaves", action: "read" },
  },
  {
    label: "Broadcasting",
    to: "/announcements",
    icon: "bi bi-megaphone-fill",
    permission: { module: "announcements", action: "read" },
  },
];

const managementMenu = [
  {
    label: "Financial Logistics",
    to: "/transport-allowance",
    icon: "bi bi-cash-stack",
    permission: { module: "transport", action: "read" },
  },
  {
    label: "Identity Hub",
    to: "/user-management",
    icon: "bi bi-person-badge-fill",
    permission: { module: "users", action: "read" },
  },
  {
    label: "Access Permissions",
    to: "/roles",
    icon: "bi bi-shield-lock-fill",
    permission: { module: "roles", action: "read" },
  },
  {
    label: "Security Audit",
    to: "/activity-logs",
    icon: "bi bi-shield-shaded",
    permission: { module: "logs", action: "read" },
  },
  {
    label: "Data Recovery",
    to: "/recovery",
    icon: "bi bi-arrow-counterclockwise",
    permission: { module: "employees", action: "read" },
  },
  {
    label: "System Config",
    to: "/settings/transport-settings",
    icon: "bi bi-gear-fill",
    permission: { module: "transport_setting", action: "read" },
  },
];

const employeeMenu = [
  { label: "My Dashboard", to: "/employee/dashboard", icon: "bi bi-grid-fill" },
  {
    label: "My Attendance",
    to: "/employee/attendance",
    icon: "bi bi-calendar-check-fill",
  },
  {
    label: "My Leaves",
    to: "/employee/leaves",
    icon: "bi bi-calendar2-week-fill",
  },
  {
    label: "Announcements",
    to: "/employee/announcements",
    icon: "bi bi-megaphone-fill",
  },
];

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
  if (isMobile.value) sidebarCollapsed.value = true;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Initialize theme from localStorage / system preference
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
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

/* Global PrimeVue Dark Mode Overrides */
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
