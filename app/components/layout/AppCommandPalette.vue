<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    :closable="false"
    :dismissableMask="true"
    :showHeader="false"
    class="!rounded-2xl !p-0 !border !border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !shadow-2xl overflow-hidden max-w-xl w-full"
    :pt="{
      mask: { class: 'backdrop-blur-md bg-slate-900/40' },
      content: { class: '!p-0' },
    }"
  >
    <div class="flex flex-col">
      <!-- Search Input Area -->
      <div class="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <i class="bi bi-search text-slate-400 text-lg ml-1"></i>
        <input
          ref="searchInputRef"
          v-model="query"
          type="text"
          placeholder="Type to search navigation, modules, or quick actions..."
          class="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          @keydown.down.prevent="navigateResults(1)"
          @keydown.up.prevent="navigateResults(-1)"
          @keydown.enter.prevent="selectActiveItem"
          @keydown.esc.prevent="isOpen = false"
        />
        <kbd class="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs">
          ESC
        </kbd>
      </div>

      <!-- Quick Category / Results -->
      <div class="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <div
          v-if="filteredItems.length === 0"
          class="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2"
        >
          <i class="bi bi-search text-2xl"></i>
          <span class="text-xs font-semibold">No results found for "{{ query }}"</span>
        </div>

        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          class="flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer group"
          :class="[
            selectedIndex === index
              ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          ]"
          @mouseenter="selectedIndex = index"
          @click="executeItem(item)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 transition-colors',
                selectedIndex === index
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
              ]"
            >
              <i :class="item.icon"></i>
            </div>
            <div class="truncate">
              <div class="text-xs font-bold truncate">
                {{ item.title }}
              </div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {{ item.subtitle }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
            >
              {{ item.category }}
            </span>
            <i
              class="bi bi-arrow-return-left text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              :class="{ 'opacity-100': selectedIndex === index }"
            ></i>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[9px] font-mono">↑↓</kbd>
            Navigation
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[9px] font-mono">↵</kbd>
            Select
          </span>
        </div>
        <span class="font-bold text-indigo-600 dark:text-indigo-400">NexusHR Command</span>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";
import { useTheme } from "~/composables/useTheme";

const props = defineProps<{
  visible?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const router = useRouter();
const { hasPermission } = useAuth();
const { toggleDarkMode } = useTheme();

const isOpen = computed({
  get: () => !!props.visible,
  set: (val: boolean) => emit("update:visible", val),
});

const query = ref("");
const selectedIndex = ref(0);
const searchInputRef = ref<HTMLInputElement | null>(null);

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Quick Action";
  icon: string;
  to?: string;
  action?: () => void;
  permission?: { module: string; action: string };
}

const allItems: CommandItem[] = [
  {
    id: "nav-dash",
    title: "Intelligence Center",
    subtitle: "Open metrics summary & dashboard overview",
    category: "Navigation",
    icon: "bi bi-grid-fill",
    to: "/dashboard",
  },
  {
    id: "nav-emp",
    title: "Talent Directory",
    subtitle: "Manage employee records, profiles, and documents",
    category: "Navigation",
    icon: "bi bi-people-fill",
    to: "/employees",
    permission: { module: "employees", action: "read" },
  },
  {
    id: "act-new-emp",
    title: "Onboard New Talent",
    subtitle: "Registration form for new hires",
    category: "Quick Action",
    icon: "bi bi-person-plus-fill",
    to: "/employees/new",
    permission: { module: "employees", action: "create" },
  },
  {
    id: "nav-att",
    title: "Presence Flow",
    subtitle: "Monitor time logs & workforce attendance",
    category: "Navigation",
    icon: "bi bi-calendar-check-fill",
    to: "/attendance",
    permission: { module: "attendance", action: "read" },
  },
  {
    id: "nav-leaves",
    title: "Leave Governance",
    subtitle: "Approve and track leave requests",
    category: "Navigation",
    icon: "bi bi-calendar2-week-fill",
    to: "/leaves",
    permission: { module: "leaves", action: "read" },
  },
  {
    id: "nav-ann",
    title: "Broadcasting",
    subtitle: "Company-wide announcements and notices",
    category: "Navigation",
    icon: "bi bi-megaphone-fill",
    to: "/announcements",
    permission: { module: "announcements", action: "read" },
  },
  {
    id: "nav-trans",
    title: "Financial Logistics",
    subtitle: "Transport allowance calculation and distribution",
    category: "Navigation",
    icon: "bi bi-cash-stack",
    to: "/transport-allowance",
    permission: { module: "transport", action: "read" },
  },
  {
    id: "nav-users",
    title: "Identity Hub",
    subtitle: "Manage login accounts and security credentials",
    category: "Navigation",
    icon: "bi bi-person-badge-fill",
    to: "/user-management",
    permission: { module: "users", action: "read" },
  },
  {
    id: "nav-roles",
    title: "Access Permissions",
    subtitle: "Configure RBAC permission matrix and roles",
    category: "Navigation",
    icon: "bi bi-shield-lock-fill",
    to: "/roles",
    permission: { module: "roles", action: "read" },
  },
  {
    id: "nav-logs",
    title: "Security Audit",
    subtitle: "Examine system forensic and mutation logs",
    category: "Navigation",
    icon: "bi bi-shield-shaded",
    to: "/activity-logs",
    permission: { module: "logs", action: "read" },
  },
  {
    id: "act-theme",
    title: "Toggle Dark / Light Mode",
    subtitle: "Switch application visual theme",
    category: "Quick Action",
    icon: "bi bi-circle-half",
    action: () => toggleDarkMode(),
  },
];

const availableItems = computed(() => {
  return allItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission.module, item.permission.action);
  });
});

const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return availableItems.value;
  return availableItems.value.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
});

watch(isOpen, (val) => {
  if (val) {
    query.value = "";
    selectedIndex.value = 0;
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

watch(filteredItems, () => {
  selectedIndex.value = 0;
});

const navigateResults = (direction: number) => {
  const max = filteredItems.value.length;
  if (max === 0) return;
  selectedIndex.value = (selectedIndex.value + direction + max) % max;
};

const selectActiveItem = () => {
  const item = filteredItems.value[selectedIndex.value];
  if (item) executeItem(item);
};

const executeItem = (item: CommandItem) => {
  isOpen.value = false;
  if (item.action) {
    item.action();
  } else if (item.to) {
    router.push(item.to);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
