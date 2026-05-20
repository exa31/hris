<template>
  <div class="space-y-12 transition-colors duration-500">
    <!-- Loading State -->
    <div
      v-if="authLoading || loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="h-48 rounded-2xl bg-white dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700 shadow-sm"
      ></div>
    </div>

    <div v-else class="space-y-12">
      <!-- Welcome Hero Section (Glassmorphism Overhaul) -->
      <Motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
        class="relative overflow-hidden rounded-3xl bg-indigo-950 dark:bg-slate-900 p-10 md:p-12 text-white shadow-xl shadow-indigo-200 dark:shadow-none border border-white/10"
      >
        <!-- Abstract Animated Background -->
        <div
          class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-500/20 via-violet-500/10 to-transparent skew-x-12 translate-x-1/4"
        ></div>
        <div
          class="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/ 20 rounded-full blur-[120px]"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"
        ></div>

        <div
          class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12"
        >
          <div class="space-y-8 max-w-2xl text-center md:text-left">
            <div
              class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl"
            >
              <span
                class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"
              ></span>
              <span
                class="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100"
                >JMC Engine Active • {{ todayFormatted }}</span
              >
            </div>

            <div class="space-y-4">
              <h1
                class="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]"
              >
                Elevate <br />
                <span
                  class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400"
                  >Your Vision.</span
                >
              </h1>
              <p
                class="text-indigo-100/60 font-medium text-lg md:text-xl leading-relaxed"
              >
                Selamat datang kembali,
                <span class="text-white font-bold">{{
                  currentUser?.employee?.name
                }}</span
                >. Sistem HRIS siap mengelola potensi terbaik tim Anda hari ini.
              </p>
            </div>

            <div
              class="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-4"
            >
              <NuxtLink to="/employees">
                <Button
                  label="Buka Direktori"
                  icon="bi bi-grid-1x2-fill"
                  class="!rounded-xl !px-8 !py-4 !bg-white !text-indigo-950 !border-none !font-black !text-xs !tracking-widest shadow-lg hover:!scale-105 transition-transform"
                />
              </NuxtLink>
              <NuxtLink to="/attendance">
                <Button
                  label="Laporan Presensi"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-8 !py-4 !text-white !font-black !uppercase !text-[10px] !tracking-widest !bg-white/5 border border-white/10 backdrop-blur-md hover:!bg-white/10 transition-colors"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Stats Overlay Card -->
          <div class="hidden xl:grid grid-cols-1 gap-6 w-80">
            <div
              class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-between group hover:bg-white/10 transition-all duration-500"
            >
              <div class="space-y-1">
                <div
                  class="text-[10px] font-black text-indigo-300 uppercase tracking-widest"
                >
                  Total Squad
                </div>
                <div class="text-3xl font-black tracking-tighter">
                  {{ stats?.total ?? 0 }}
                </div>
              </div>
              <div
                class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl group-hover:rotate-12 transition-transform"
              >
                <i class="bi bi-people"></i>
              </div>
            </div>
            <div
              class="p-6 rounded-2xl bg-indigo-500/20 border border-white/10 backdrop-blur-2xl flex items-center justify-between group hover:bg-indigo-500/30 transition-all duration-500 shadow-lg shadow-indigo-950/20"
            >
              <div class="space-y-1">
                <div
                  class="text-[10px] font-black text-emerald-300 uppercase tracking-widest"
                >
                  Real-time Activity
                </div>
                <div
                  class="text-3xl font-black text-emerald-400 tracking-tighter"
                >
                  98.4%
                </div>
              </div>
              <div
                class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
              >
                <i class="bi bi-lightning-charge"></i>
              </div>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Main Dashboard Content (Accessible to All Roles) -->
      <div class="space-y-12">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Motion
            v-for="(stat, idx) in statCards"
            :key="stat.label"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: idx * 0.1 }"
            class="group"
          >
            <div
              class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all duration-500 relative overflow-hidden h-full"
            >
              <!-- Animated Background Glow on Hover -->
              <div
                class="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"
              ></div>

              <div
                :class="[
                  stat.color,
                  'w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500',
                ]"
              >
                <i :class="stat.icon"></i>
              </div>
              <div class="space-y-2 relative z-10">
                <h4
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]"
                >
                  {{ stat.label }}
                </h4>
                <div
                  class="text-4xl font-black text-slate-800 dark:text-white tracking-tighter"
                >
                  {{ stat.value }}
                </div>
              </div>
              <div class="mt-6 flex items-center gap-3 relative z-10">
                <span
                  class="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20"
                  >+4.2%</span
                >
                <span
                  class="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest"
                  >Growth Factor</span
                >
              </div>
            </div>
          </Motion>
        </div>

        <!-- Analytical Visuals -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <!-- Status Distribution -->
          <Motion
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.4 }"
            class="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8"
          >
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <h3
                  class="text-2xl font-black text-slate-800 dark:text-white tracking-tight"
                >
                  Status Kepegawaian
                </h3>
                <p
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                >
                  Distribusi Kontrak Aktif Global
                </p>
              </div>
              <div
                class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400"
              >
                <i class="bi bi-pie-chart-fill"></i>
              </div>
            </div>
            <div class="h-[350px] flex items-center justify-center">
              <DoughnutChart
                v-if="stats"
                :kontrak="stats.kontrak"
                :tetap="stats.tetap"
                :magang="stats.magang"
              />
            </div>
          </Motion>

          <!-- Gender Diversity (Dark Theme Optimized) -->
          <Motion
            :initial="{ opacity: 0, x: 20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.5 }"
            class="lg:col-span-5 bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-8 shadow-xl shadow-indigo-200 dark:shadow-none space-y-8 text-white relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"
            ></div>

            <div class="flex items-center justify-between relative z-10">
              <div class="space-y-1">
                <h3 class="text-2xl font-black tracking-tight">
                  Keseimbangan Gender
                </h3>
                <p
                  class="text-[10px] font-bold text-indigo-200/60 uppercase tracking-[0.2em]"
                >
                  Statistik Diversitas Inklusif
                </p>
              </div>
              <div
                class="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white"
              >
                <i class="bi bi-gender-ambiguous text-xl"></i>
              </div>
            </div>
            <div
              class="h-[350px] flex items-center justify-center relative z-10"
            >
              <GenderChart
                v-if="stats"
                :male="stats.male"
                :female="stats.female"
              />
            </div>
          </Motion>
        </div>

        <!-- Recent Talents Section -->
        <Motion
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.6 }"
          class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
        >
          <div
            class="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between flex-wrap gap-8"
          >
            <div class="space-y-2">
              <h3
                class="text-3xl font-black text-slate-800 dark:text-white tracking-tighter"
              >
                Anggota Tim Terbaru
              </h3>
              <p
                class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
              >
                5 Personil terakhir yang bergabung dalam ekosistem
              </p>
            </div>
            <NuxtLink to="/employees">
              <Button
                label="Seluruh Direktori"
                icon="bi bi-arrow-right"
                iconPos="right"
                severity="secondary"
                text
                class="!rounded-2xl !font-black !uppercase !text-xs !tracking-[0.2em] !text-indigo-600 dark:!text-indigo-400"
              />
            </NuxtLink>
          </div>

          <DataTable
            :value="newEmployees"
            class="p-datatable-dashboard-overhaul"
            :loading="loading"
          >
            <Column header="Personil">
              <template #body="slotProps">
                <div class="flex items-center gap-5">
                  <div class="relative">
                    <Avatar
                      :image="
                        slotProps.data.photo_url ||
                        'https://ui-avatars.com/api/?name=' +
                          slotProps.data.name +
                          '&background=random&size=100'
                      "
                      shape="circle"
                      class="!w-14 !h-14 border-4 border-white dark:border-slate-800 shadow-xl ring-2 ring-slate-100 dark:ring-slate-700"
                    />
                    <div
                      class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full"
                    ></div>
                  </div>
                  <div>
                    <div
                      class="text-base font-black text-slate-800 dark:text-white leading-tight"
                    >
                      {{ slotProps.data.name }}
                    </div>
                    <div
                      class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    >
                      {{ slotProps.data.nip }}
                    </div>
                  </div>
                </div>
              </template>
            </Column>
            <Column header="Peran & Departemen">
              <template #body="slotProps">
                <div class="flex flex-col gap-1.5">
                  <span
                    class="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none"
                    >{{ slotProps.data.position }}</span
                  >
                  <span
                    class="text-xs font-bold text-slate-400 dark:text-slate-500"
                    >{{ slotProps.data.department }}</span
                  >
                </div>
              </template>
            </Column>
            <Column header="Join Date">
              <template #body="slotProps">
                <div
                  class="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400"
                >
                  <div
                    class="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400"
                  >
                    <i class="bi bi-calendar-check"></i>
                  </div>
                  {{ formatDate(slotProps.data.join_date) }}
                </div>
              </template>
            </Column>
            <Column header="Tipe Kontrak" class="!text-right">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.type"
                  class="!rounded-xl !px-4 !py-2 !text-[10px] !font-black !uppercase !tracking-widest"
                  :class="
                    slotProps.data.type === 'Kontrak'
                      ? '!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border !border-amber-100 dark:!border-amber-500/20'
                      : '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-100 dark:!border-indigo-500/20'
                  "
                />
              </template>
            </Column>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div class="relative mb-6">
                  <div class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                  <div class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700">
                    <i class="bi bi-people text-4xl text-indigo-500"></i>
                  </div>
                </div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Tidak Ada Data Baru</h3>
                <p class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest">
                  Belum ada personil baru yang ditambahkan ke dalam ekosistem.
                </p>
              </div>
            </template>
          </DataTable>
        </Motion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import DoughnutChart from "~/components/dashboard/DoughnutChart.vue";
import GenderChart from "~/components/dashboard/GenderChart.vue";

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
  new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
);

const statCards = computed(() => [
  {
    label: "Total Squad",
    value: stats.value?.total ?? "0",
    icon: "bi bi-people-fill",
    color: "bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none",
  },
  {
    label: "Under Contract",
    value: stats.value?.kontrak ?? "0",
    icon: "bi bi-file-earmark-text-fill",
    color: "bg-amber-500 text-white shadow-amber-200 dark:shadow-none",
  },
  {
    label: "Permanent Team",
    value: stats.value?.tetap ?? "0",
    icon: "bi bi-patch-check-fill",
    color: "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none",
  },
  {
    label: "Active Interns",
    value: stats.value?.magang ?? "0",
    icon: "bi bi-mortarboard-fill",
    color: "bg-violet-600 text-white shadow-violet-200 dark:shadow-none",
  },
]);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>("/api/dashboard/stats");
    stats.value = res.data.stats;
    newEmployees.value = res.data.latestEmployees;
  } catch (e) {
    console.error("Failed to fetch dashboard data:", e);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  fetchDashboardData();
});

// Refresh data when user changes
watch(
  () => currentUser.value,
  (newUser) => {
    if (newUser) fetchDashboardData();
  },
);
</script>

<style>
.p-datatable-dashboard-overhaul .p-datatable-thead > tr > th {
  @apply !bg-slate-50/50 dark:!bg-slate-900/50 !text-slate-400 dark:!text-slate-500 !text-[11px] !font-black !uppercase !tracking-[0.25em] !px-12 !py-10 !border-b !border-slate-50 dark:!border-slate-700;
}
.p-datatable-dashboard-overhaul .p-datatable-tbody > tr > td {
  @apply !px-12 !py-8 !border-b !border-slate-50 dark:!border-slate-700 !bg-white dark:!bg-slate-800 transition-colors duration-300;
}
.p-datatable-dashboard-overhaul .p-datatable-tbody > tr:hover > td {
  @apply !bg-slate-50/50 dark:!bg-slate-900/30;
}

/* Custom transitions for Dark Mode */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}
</style>
