<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isMobile && !collapsed"
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[65] transition-opacity duration-300"
      @click="emit('close-mobile')"
    ></div>

    <!-- Sidebar Container -->
    <aside
      class="fixed inset-y-0 left-0 z-[70] flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none"
      :class="[
        collapsed && !isMobile ? 'w-20' : 'w-72',
        isMobile && collapsed ? '-translate-x-full' : 'translate-x-0',
      ]"
    >
      <!-- Brand & Header -->
      <div
        class="h-20 flex items-center border-b border-slate-100 dark:border-slate-800/80 px-4 transition-all"
        :class="collapsed && !isMobile ? 'justify-center' : 'justify-between px-6'"
      >
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 overflow-hidden group"
          :class="collapsed && !isMobile ? 'justify-center' : ''"
        >
          <NexusLogo :size="36" class="flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <div v-if="!collapsed || isMobile" class="overflow-hidden flex flex-col">
            <span class="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 tracking-tight leading-none">
              NexusHR
            </span>
            <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              Intelligence
            </span>
          </div>
        </NuxtLink>

        <!-- Toggle Collapse Button (Desktop) -->
        <button
          v-if="!isMobile"
          type="button"
          v-tooltip.right="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-all shadow-2xs cursor-pointer"
          :class="collapsed ? 'mt-0' : ''"
          @click="emit('toggle')"
        >
          <i
            class="bi text-xs transition-transform duration-300"
            :class="collapsed ? 'bi-chevron-right' : 'bi-chevron-left'"
          ></i>
        </button>

        <!-- Close Button (Mobile) -->
        <button
          v-if="isMobile"
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          @click="emit('close-mobile')"
        >
          <i class="bi bi-x-lg text-sm"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
        <!-- Main Menu (Admin / Manager) -->
        <div v-if="!isEmployee" class="space-y-1">
          <div
            v-if="!collapsed || isMobile"
            class="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]"
          >
            Main
          </div>

          <NuxtLink
            v-for="item in filteredMainMenu"
            :key="item.to"
            :to="item.to"
            v-tooltip.right="collapsed && !isMobile ? item.label : null"
            class="group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="[
              isActive(item.to)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium',
              collapsed && !isMobile ? 'justify-center px-0' : ''
            ]"
            @click="isMobile && emit('close-mobile')"
          >
            <i
              class="text-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
              :class="[
                item.icon,
                isActive(item.to)
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 group-hover:text-indigo-500'
              ]"
            ></i>
            
            <span v-if="!collapsed || isMobile" class="text-xs truncate">
              {{ item.label }}
            </span>

            <!-- Active glowing indicator -->
            <div
              v-if="isActive(item.to)"
              class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            ></div>
          </NuxtLink>
        </div>

        <!-- Self Service Menu (For all employees) -->
        <div class="space-y-1">
          <div
            v-if="!collapsed || isMobile"
            class="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]"
          >
            Self Service
          </div>

          <NuxtLink
            v-for="item in employeeMenu"
            :key="item.to"
            :to="item.to"
            v-tooltip.right="collapsed && !isMobile ? item.label : null"
            class="group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="[
              isActive(item.to)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium',
              collapsed && !isMobile ? 'justify-center px-0' : ''
            ]"
            @click="isMobile && emit('close-mobile')"
          >
            <i
              class="text-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
              :class="[
                item.icon,
                isActive(item.to)
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 group-hover:text-indigo-500'
              ]"
            ></i>
            
            <span v-if="!collapsed || isMobile" class="text-xs truncate">
              {{ item.label }}
            </span>

            <div
              v-if="isActive(item.to)"
              class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            ></div>
          </NuxtLink>
        </div>

        <!-- Governance / Management Menu -->
        <div
          v-if="!isEmployee && filteredManagementMenu.length > 0"
          class="space-y-1"
        >
          <div
            v-if="!collapsed || isMobile"
            class="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]"
          >
            Governance
          </div>

          <NuxtLink
            v-for="item in filteredManagementMenu"
            :key="item.to"
            :to="item.to"
            v-tooltip.right="collapsed && !isMobile ? item.label : null"
            class="group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="[
              isActive(item.to)
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium',
              collapsed && !isMobile ? 'justify-center px-0' : ''
            ]"
            @click="isMobile && emit('close-mobile')"
          >
            <i
              class="text-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
              :class="[
                item.icon,
                isActive(item.to)
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 group-hover:text-indigo-500'
              ]"
            ></i>
            
            <span v-if="!collapsed || isMobile" class="text-xs truncate">
              {{ item.label }}
            </span>

            <div
              v-if="isActive(item.to)"
              class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            ></div>
          </NuxtLink>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          v-tooltip.right="collapsed && !isMobile ? 'Sign Out' : null"
          class="flex items-center gap-3 w-full px-3.5 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all group cursor-pointer"
          :class="collapsed && !isMobile ? 'justify-center px-0' : ''"
          @click="handleLogout"
        >
          <i class="bi bi-box-arrow-right text-lg transition-transform group-hover:translate-x-1 flex-shrink-0"></i>
          <span
            v-if="!collapsed || isMobile"
            class="font-bold text-xs uppercase tracking-wider"
          >
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "~/composables/useAuth";

const props = defineProps<{
  collapsed: boolean;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "close-mobile"): void;
}>();

const route = useRoute();
const { user, hasPermission, logout } = useAuth();

const isEmployee = computed(
  () => user.value?.role?.name?.toLowerCase() === "pegawai"
);

const isActive = (path: string) => {
  if (path === "/dashboard") return route.path === "/dashboard";
  if (path === "/employee/dashboard") return route.path === "/employee/dashboard";
  return route.path.startsWith(path);
};

const handleLogout = async () => {
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
    label: "Work Schedule",
    to: "/settings/work-schedule",
    icon: "bi bi-clock-history",
    permission: { module: "attendance", action: "read" },
  },
  {
    label: "Holidays",
    to: "/settings/holidays",
    icon: "bi bi-calendar-event-fill",
    permission: { module: "attendance", action: "read" },
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

const filteredMainMenu = computed(() => {
  return mainMenu.filter(
    (item) => !item.permission || hasPermission(item.permission.module, item.permission.action)
  );
});

const filteredManagementMenu = computed(() => {
  return managementMenu.filter(
    (item) => !item.permission || hasPermission(item.permission.module, item.permission.action)
  );
});
</script>
