<template>
  <div class="space-y-8">
    <!-- Loading State Skeleton -->
    <div v-if="authLoading || loading" class="space-y-8">
      <div class="h-44 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="i in 4" :key="i" class="h-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 h-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
        <div class="lg:col-span-5 h-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-8">
      <!-- ── Hero Banner Section ──────────────────────────────────────── -->
      <Motion
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4 }"
        class="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border border-indigo-500/30 dark:border-slate-800 shadow-xl dark:shadow-none"
      >
        <!-- Ambient decorative blurs -->
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div class="space-y-4 max-w-2xl">
            <!-- Active Status Badge -->
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-100">
                Nexus Engine Active • {{ todayFormatted }}
              </span>
            </div>

            <div class="space-y-2">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Welcome back,
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-violet-200">
                  {{ currentUser?.employee?.name || currentUser?.username || 'Executive' }}
                </span>
              </h1>
              <p class="text-indigo-100/70 font-medium text-sm sm:text-base leading-relaxed">
                Monitor organizational dynamics, employment status, and team attendance with real-time intelligence.
              </p>
            </div>

            <!-- Quick Action Buttons -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <NuxtLink to="/employees">
                <Button
                  label="Talent Directory"
                  icon="bi bi-people-fill"
                  class="!rounded-xl !px-6 !py-3 !bg-white !text-indigo-900 !border-none !font-black !text-xs !tracking-wider hover:!bg-indigo-50 !shadow-lg transition-all"
                />
              </NuxtLink>
              <NuxtLink to="/attendance">
                <Button
                  label="Attendance Logs"
                  icon="bi bi-calendar-check-fill"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-6 !py-3 !text-white !font-black !text-xs !tracking-wider !bg-white/10 hover:!bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
                />
              </NuxtLink>
              <NuxtLink to="/leaves">
                <Button
                  label="Leave Hub"
                  icon="bi bi-calendar2-week-fill"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-6 !py-3 !text-white !font-black !text-xs !tracking-wider !bg-white/10 hover:!bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Stat Pill Card -->
          <div class="hidden xl:flex flex-col gap-3.5 w-64 flex-shrink-0">
            <div class="p-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md flex items-center justify-between group">
              <div>
                <div class="text-[10px] font-black text-white/70 uppercase tracking-widest">Total Workforce</div>
                <div class="text-3xl font-black text-white tracking-tight">{{ stats?.total ?? 0 }}</div>
              </div>
              <div class="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-lg text-white">
                <i class="bi bi-people"></i>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-md flex items-center justify-between">
              <div>
                <div class="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Infrastructure</div>
                <div class="text-xl font-black text-emerald-300">99.9% Uptime</div>
              </div>
              <div class="w-11 h-11 rounded-xl bg-emerald-400/20 flex items-center justify-center text-lg text-emerald-300">
                <i class="bi bi-activity"></i>
              </div>
            </div>
          </div>
        </div>
      </Motion>

      <!-- ── Metric Cards Grid ───────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        <Motion
          v-for="(stat, idx) in statCards"
          :key="stat.label"
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.06 }"
          class="group h-full flex flex-col"
        >
          <div
            class="relative overflow-hidden h-full rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <!-- Hover ambient glow -->
            <div
              class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-500"
              :class="stat.glow"
            ></div>

            <div>
              <div class="flex items-center justify-between mb-4">
                <div :class="[stat.color, 'w-11 h-11 rounded-xl flex items-center justify-center text-base shadow-sm group-hover:scale-110 transition-transform']">
                  <i :class="stat.icon"></i>
                </div>
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Realtime
                </span>
              </div>

              <div class="space-y-1 relative z-10">
                <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 min-h-[28px] flex items-center line-clamp-2 leading-tight">
                  {{ stat.label }}
                </h4>
                <div class="text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  {{ stat.value }}
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
              <span class="font-bold text-slate-400 dark:text-slate-500">Category</span>
              <span class="font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {{ stat.subtitle }}
              </span>
            </div>
          </div>
        </Motion>
      </div>

      <!-- ── Visual Analytics Row ───────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Kepegawaian Doughnut -->
        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.25 }"
          class="lg:col-span-7 rounded-3xl p-7 space-y-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs"
        >
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div class="space-y-0.5">
              <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Employment Distribution
              </h3>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Contract & Permanent Allocation
              </p>
            </div>
            <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm">
              <i class="bi bi-pie-chart-fill"></i>
            </div>
          </div>

          <div class="h-[280px] flex items-center justify-center">
            <DoughnutChart v-if="stats" :kontrak="stats.kontrak" :tetap="stats.tetap" :magang="stats.magang" />
            <div v-else class="text-slate-400 text-xs">Loading visualization...</div>
          </div>
        </Motion>

        <!-- Keseimbangan Gender Card -->
        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3 }"
          class="lg:col-span-5 rounded-3xl p-7 space-y-6 relative overflow-hidden text-white bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-slate-900 dark:to-indigo-950 border border-indigo-400/20 dark:border-slate-800 shadow-lg shadow-indigo-200/20 dark:shadow-none"
        >
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div class="flex items-center justify-between border-b border-white/15 dark:border-slate-800 pb-4 relative z-10">
            <div class="space-y-0.5">
              <h3 class="text-lg font-black tracking-tight text-white">
                Gender Balance
              </h3>
              <p class="text-[10px] font-bold text-indigo-200/80 dark:text-slate-400 uppercase tracking-[0.2em]">
                Team Diversity Metrics
              </p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-white/15 dark:bg-white/10 flex items-center justify-center text-sm">
              <i class="bi bi-gender-ambiguous"></i>
            </div>
          </div>

          <div class="h-[280px] flex items-center justify-center relative z-10">
            <GenderChart v-if="stats" :male="stats.male" :female="stats.female" />
            <div v-else class="text-white/60 text-xs">Loading visualization...</div>
          </div>
        </Motion>
      </div>

      <!-- ── Anggota Tim Terbaru DataTable ───────────────────────────── -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.35 }"
        class="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs"
      >
        <div class="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
          <div class="space-y-0.5">
            <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Recently Onboarded Talent
            </h3>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Last 5 team members registered in the organization
            </p>
          </div>

          <NuxtLink to="/employees">
            <Button
              label="Explore Full Directory"
              icon="bi bi-arrow-right"
              iconPos="right"
              severity="secondary"
              text
              class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest !text-indigo-600 dark:!text-indigo-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/10"
            />
          </NuxtLink>
        </div>

        <DataTable
          :value="newEmployees"
          class="p-datatable-dashboard"
          :loading="loading"
          :pt="{ wrapper: { class: '!bg-transparent' } }"
        >
          <Column header="Employee">
            <template #body="slotProps">
              <div class="flex items-center gap-3.5 py-1">
                <Avatar
                  :image="slotProps.data.photo_url || getAvatarUrl(slotProps.data.name, 'random')"
                  shape="circle"
                  class="!w-10 !h-10 border-2 border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0"
                />
                <div class="overflow-hidden">
                  <div class="text-xs font-black text-slate-900 dark:text-white truncate">
                    {{ slotProps.data.name }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {{ slotProps.data.nip }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Role & Department">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {{ slotProps.data.position }}
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ slotProps.data.department }}
                </span>
              </div>
            </template>
          </Column>

          <Column header="Join Date">
            <template #body="slotProps">
              <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
                {{ formatDate(slotProps.data.join_date) }}
              </span>
            </template>
          </Column>

          <Column header="Employment Status">
            <template #body="slotProps">
              <Tag
                :value="formatEmployeeType(slotProps.data.type)"
                class="!rounded-lg !px-2.5 !py-1 !text-[10px] !font-black !uppercase !tracking-wider"
                :class="slotProps.data.type === 'Kontrak'
                  ? '!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border !border-amber-200/60 dark:!border-amber-500/20'
                  : '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-200/60 dark:!border-indigo-500/20'"
              />
            </template>
          </Column>

          <Column header="Action" class="w-24 text-right">
            <template #body="slotProps">
              <NuxtLink :to="`/employees/${slotProps.data.id}`">
                <Button
                  icon="bi bi-chevron-right"
                  severity="secondary"
                  text
                  rounded
                  class="!w-8 !h-8 !text-slate-400 hover:!text-indigo-600"
                  v-tooltip.top="'View Employee Profile'"
                />
              </NuxtLink>
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <i class="bi bi-people text-3xl mb-2 text-slate-300 dark:text-slate-600"></i>
              <div class="text-xs font-bold text-slate-700 dark:text-slate-300">No Recent Onboardings</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Newly joined team members will appear here.</div>
            </div>
          </template>
        </DataTable>
      </Motion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import DoughnutChart from "~/components/dashboard/DoughnutChart.vue";
import GenderChart from "~/components/dashboard/GenderChart.vue";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: "default" });

const { user: currentUser, loading: authLoading } = useAuth();
const loading = ref(false);

interface DashboardStats {
  total: number;
  kontrak: number;
  tetap: number;
  magang: number;
  male: number;
  female: number;
}

const stats = ref<DashboardStats | null>(null);
const newEmployees = ref<any[]>([]);

const todayFormatted = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const statCards = computed(() => [
  {
    label: "Total Workforce",
    value: stats.value?.total ?? "0",
    subtitle: "All Active Personnel",
    icon: "bi bi-people-fill",
    color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    glow: "bg-indigo-500",
  },
  {
    label: "Permanent Staff",
    value: stats.value?.tetap ?? "0",
    subtitle: "Permanent Core",
    icon: "bi bi-patch-check-fill",
    color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500",
  },
  {
    label: "Contract Staff",
    value: stats.value?.kontrak ?? "0",
    subtitle: "Fixed-Term Contract",
    icon: "bi bi-file-earmark-text-fill",
    color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500",
  },
  {
    label: "Internship",
    value: stats.value?.magang ?? "0",
    subtitle: "Internship Track",
    icon: "bi bi-mortarboard-fill",
    color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "bg-violet-500",
  },
]);

const formatEmployeeType = (type: string) => {
  if (type === "Tetap") return "Permanent";
  if (type === "Kontrak") return "Contract";
  if (type === "Magang") return "Internship";
  return type || "Permanent";
};

const { $axios } = useNuxtApp();

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await $axios.get("/api/dashboard/stats");
    const data = res.data?.data || res.data || {};
    stats.value = data.stats;
    newEmployees.value = data.latestEmployees;
  } catch (e) {
    console.error("Failed to fetch dashboard data:", e);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  fetchDashboardData();
});

watch(
  () => currentUser.value,
  (newUser) => {
    if (newUser) fetchDashboardData();
  }
);
</script>
