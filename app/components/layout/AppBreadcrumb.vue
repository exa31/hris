<template>
  <nav aria-label="Breadcrumb" class="hidden md:flex items-center gap-1.5 text-xs">
    <NuxtLink
      to="/dashboard"
      class="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
    >
      <i class="bi bi-house-door text-sm"></i>
      <span>Nexus</span>
    </NuxtLink>

    <template v-for="(item, index) in breadcrumbs" :key="item.path">
      <i class="bi bi-chevron-right text-[10px] text-slate-300 dark:text-slate-600 font-bold"></i>
      
      <NuxtLink
        v-if="index < breadcrumbs.length - 1"
        :to="item.path"
        class="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
      >
        {{ item.label }}
      </NuxtLink>
      
      <span
        v-else
        class="text-slate-900 dark:text-white font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-1 px-2.5 rounded-lg border border-indigo-100/80 dark:border-indigo-500/20 shadow-xs"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const routeLabels: Record<string, string> = {
  dashboard: "Intelligence Center",
  employees: "Talent Directory",
  new: "Onboard Talent",
  attendance: "Presence Flow",
  leaves: "Leave Governance",
  announcements: "Broadcasting",
  "transport-allowance": "Financial Logistics",
  "user-management": "Identity Hub",
  roles: "Access Permissions",
  "activity-logs": "Security Audit",
  recovery: "Data Recovery",
  settings: "System Config",
  "transport-settings": "Transport Settings",
  "work-schedule": "Work Schedule",
  holidays: "Holidays Calendar",
  employee: "Employee Portal",
};

const breadcrumbs = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return [{ label: "Dashboard", path: "/dashboard" }];
  }

  let accumulatedPath = "";
  return segments.map((seg) => {
    accumulatedPath += `/${seg}`;
    const label = routeLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      label,
      path: accumulatedPath,
    };
  });
});
</script>
