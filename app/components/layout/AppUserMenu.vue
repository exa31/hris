<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-3 p-1.5 md:pr-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all shadow-xs cursor-pointer group"
      @click="toggleUserMenu"
    >
      <div class="relative">
        <Avatar
          :image="userPhotoUrl"
          :label="userInitial"
          shape="circle"
          class="!w-9 !h-9 border-2 border-white dark:border-slate-800 shadow-sm font-bold text-xs !bg-indigo-100 dark:!bg-indigo-900/50 !text-indigo-600 dark:!text-indigo-300 ring-2 ring-indigo-500/20"
        />
        <span
          class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 ring-1 ring-emerald-400/50"
        ></span>
      </div>

      <div class="hidden sm:block text-left">
        <div
          class="text-xs font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[140px]"
        >
          {{ userName }}
        </div>
        <div
          class="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"
        >
          {{ userRole }}
        </div>
      </div>

      <i
        class="bi bi-chevron-down text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-xs transition-transform duration-300 hidden sm:block"
        :class="{ 'rotate-180': isOpen }"
      ></i>
    </button>

    <Popover
      ref="popoverRef"
      class="!rounded-2xl !p-0 !shadow-2xl !border !border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 overflow-hidden min-w-[280px]"
      @hide="isOpen = false"
      @show="isOpen = true"
    >
      <div class="p-4 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-white dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3.5">
          <Avatar
            :image="userPhotoUrl"
            :label="userInitial"
            shape="circle"
            class="!w-12 !h-12 border-2 border-white dark:border-slate-800 shadow-md !bg-indigo-600 !text-white font-black text-base ring-2 ring-indigo-400/30"
          />
          <div class="overflow-hidden">
            <div class="text-sm font-black text-slate-800 dark:text-white truncate">
              {{ userName }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ userEmail }}
            </div>
            <span
              class="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
            >
              {{ userRole }}
            </span>
          </div>
        </div>
      </div>

      <div class="p-2 space-y-1">
        <NuxtLink
          :to="isEmployee ? '/employee/dashboard' : '/dashboard'"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          @click="closePopover"
        >
          <i class="bi bi-grid-fill text-slate-400 text-sm"></i>
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink
          v-if="hasPermission('employees', 'read')"
          to="/employees"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          @click="closePopover"
        >
          <i class="bi bi-person-lines-fill text-slate-400 text-sm"></i>
          <span>Talent Directory</span>
        </NuxtLink>

        <NuxtLink
          v-if="hasPermission('transport_setting', 'read')"
          to="/settings/transport-settings"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          @click="closePopover"
        >
          <i class="bi bi-gear-fill text-slate-400 text-sm"></i>
          <span>System Settings</span>
        </NuxtLink>
      </div>

      <div class="p-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group cursor-pointer"
          @click="confirmLogout"
        >
          <i class="bi bi-box-arrow-right text-sm transition-transform group-hover:translate-x-0.5"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "~/composables/useAuth";

const { user, hasPermission, logout } = useAuth();

const popoverRef = ref<any>(null);
const isOpen = ref(false);

const userName = computed(() => user.value?.employee?.name || user.value?.username || "User");
const userRole = computed(() => user.value?.role?.name || "Employee");
const userEmail = computed(() => user.value?.employee?.email || user.value?.username || "-");
const userPhotoUrl = computed(() => (user.value?.employee as any)?.photo_url || "");
const userInitial = computed(() => {
  const name = user.value?.employee?.name || user.value?.username || "U";
  return name.charAt(0).toUpperCase();
});

const isEmployee = computed(
  () => user.value?.role?.name?.toLowerCase() === "pegawai"
);

const toggleUserMenu = (event: Event) => {
  popoverRef.value?.toggle(event);
};

const closePopover = () => {
  popoverRef.value?.hide();
};

const confirmLogout = async () => {
  closePopover();
  await logout();
};
</script>
