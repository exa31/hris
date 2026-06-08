<template>
  <div class="space-y-8">

    <!-- ── Loading Skeleton ────────────────────────────────────── -->
    <div v-if="authLoading || loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="h-40 rounded-2xl animate-pulse
               bg-slate-200 dark:bg-slate-800"
      ></div>
    </div>

    <div v-else class="space-y-8">

      <!-- ── Hero Banner ──────────────────────────────────────── -->
      <Motion
        :initial="{ opacity: 0, scale: 0.97 }"
        :animate="{ opacity: 1, scale: 1 }"
        class="relative overflow-hidden rounded-3xl p-10 md:p-12 text-white
               bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800
               dark:from-slate-800 dark:via-slate-850 dark:to-slate-900
               border border-indigo-500/40 dark:border-slate-700
               shadow-2xl shadow-indigo-400/20 dark:shadow-none"
      >
        <!-- decorative blobs -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 dark:bg-white/5 blur-3xl"></div>
          <div class="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-violet-400/20 dark:bg-violet-900/30 blur-3xl"></div>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div class="space-y-6 max-w-2xl text-center md:text-left">

            <!-- status pill -->
            <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
                        bg-white/15 dark:bg-white/10
                        border border-white/25 dark:border-white/15
                        backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                Nexus Engine Active • {{ todayFormatted }}
              </span>
            </div>

            <div class="space-y-3">
              <h1 class="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-white drop-shadow">
                Elevate <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r
                             from-indigo-200 to-violet-300
                             dark:from-indigo-300 dark:to-violet-400">
                  Your Vision.
                </span>
              </h1>
              <p class="text-white/60 font-medium text-base md:text-lg leading-relaxed">
                Selamat datang kembali,
                <span class="text-white font-bold">{{ currentUser?.employee?.name }}</span>.
                Sistem HRIS siap mengelola potensi terbaik tim Anda.
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <NuxtLink to="/employees">
                <Button
                  label="Buka Direktori"
                  icon="bi bi-grid-1x2-fill"
                  class="!rounded-xl !px-7 !py-3.5
                         !bg-white !text-indigo-900
                         !border-none !font-black !text-xs !tracking-widest
                         hover:!bg-indigo-50 !shadow-lg transition-all"
                />
              </NuxtLink>
              <NuxtLink to="/attendance">
                <Button
                  label="Laporan Presensi"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-7 !py-3.5
                         !text-white !font-black !uppercase !text-[10px] !tracking-widest
                         !bg-white/10 dark:!bg-white/5
                         border border-white/20
                         hover:!bg-white/20 dark:hover:!bg-white/10
                         transition-colors"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Quick stat cards -->
          <div class="hidden xl:grid grid-cols-1 gap-4 w-68 flex-shrink-0">
            <div class="p-5 rounded-2xl flex items-center justify-between group
                        bg-white/10 dark:bg-white/5
                        border border-white/15 dark:border-white/10
                        hover:bg-white/20 dark:hover:bg-white/10
                        backdrop-blur-xl transition-all duration-300">
              <div>
                <div class="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Total Squad</div>
                <div class="text-3xl font-black text-white tracking-tighter">{{ stats?.total ?? 0 }}</div>
              </div>
              <div class="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-lg group-hover:rotate-12 transition-transform">
                <i class="bi bi-people"></i>
              </div>
            </div>
            <div class="p-5 rounded-2xl flex items-center justify-between group
                        bg-emerald-500/20 dark:bg-emerald-500/10
                        border border-white/15 dark:border-emerald-500/20
                        hover:bg-emerald-500/30 dark:hover:bg-emerald-500/20
                        backdrop-blur-xl transition-all duration-300">
              <div>
                <div class="text-[10px] font-black text-emerald-300/80 uppercase tracking-widest mb-0.5">Uptime</div>
                <div class="text-3xl font-black text-emerald-300 tracking-tighter">98.4%</div>
              </div>
              <div class="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="bi bi-lightning-charge text-emerald-300"></i>
              </div>
            </div>
          </div>
        </div>
      </Motion>

      <!-- ── Stats Grid ───────────────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Motion
          v-for="(stat, idx) in statCards"
          :key="stat.label"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.08 }"
          class="group"
        >
          <div class="relative overflow-hidden h-full rounded-2xl p-6
                      bg-white dark:bg-slate-900
                      border border-slate-200 dark:border-slate-700
                      shadow-sm dark:shadow-none
                      hover:border-indigo-300 dark:hover:border-indigo-500/50
                      hover:shadow-md dark:hover:shadow-none
                      transition-all duration-300">

            <!-- hover glow blob -->
            <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                 :class="stat.glow"></div>

            <!-- icon -->
            <div :class="[stat.color, 'w-12 h-12 rounded-xl flex items-center justify-center text-base mb-5 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300']">
              <i :class="stat.icon"></i>
            </div>

            <div class="space-y-1 relative z-10">
              <h4 class="text-[10px] font-black uppercase tracking-[0.2em]
                         text-slate-400 dark:text-slate-500">
                {{ stat.label }}
              </h4>
              <div class="text-4xl font-black tracking-tighter
                          text-slate-900 dark:text-white">
                {{ stat.value }}
              </div>
            </div>

            <div class="mt-5 flex items-center gap-2 relative z-10">
              <span class="text-[10px] font-black px-2.5 py-1 rounded-lg border
                           text-emerald-600 dark:text-emerald-400
                           bg-emerald-100 dark:bg-emerald-500/10
                           border-emerald-200 dark:border-emerald-500/20">
                +4.2%
              </span>
              <span class="text-[10px] font-bold uppercase tracking-widest
                           text-slate-400 dark:text-slate-600">
                vs last month
              </span>
            </div>
          </div>
        </Motion>
      </div>

      <!-- ── Charts Row ───────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <!-- Doughnut -->
        <Motion
          :initial="{ opacity: 0, x: -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: 0.35 }"
          class="lg:col-span-7 rounded-2xl p-7 space-y-6
                 bg-white dark:bg-slate-900
                 border border-slate-200 dark:border-slate-700
                 shadow-sm dark:shadow-none"
        >
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h3 class="text-xl font-black tracking-tight
                         text-slate-900 dark:text-white">
                Status Kepegawaian
              </h3>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em]
                        text-slate-400 dark:text-slate-500">
                Distribusi Kontrak Aktif
              </p>
            </div>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center
                        bg-slate-100 dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        text-slate-500 dark:text-slate-400">
              <i class="bi bi-pie-chart-fill"></i>
            </div>
          </div>
          <div class="h-[300px] flex items-center justify-center">
            <DoughnutChart v-if="stats" :kontrak="stats.kontrak" :tetap="stats.tetap" :magang="stats.magang" />
          </div>
        </Motion>

        <!-- Gender — always accent card, looks good in both modes -->
        <Motion
          :initial="{ opacity: 0, x: 20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: 0.45 }"
          class="lg:col-span-5 rounded-2xl p-7 space-y-6 relative overflow-hidden text-white
                 bg-gradient-to-br from-indigo-500 to-violet-600
                 dark:from-indigo-600 dark:to-violet-800
                 border border-indigo-400/30 dark:border-indigo-600/30
                 shadow-lg shadow-indigo-300/25 dark:shadow-none"
        >
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="flex items-center justify-between relative z-10">
            <div class="space-y-1">
              <h3 class="text-xl font-black tracking-tight">Keseimbangan Gender</h3>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Statistik Diversitas</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center">
              <i class="bi bi-gender-ambiguous text-lg"></i>
            </div>
          </div>
          <div class="h-[300px] flex items-center justify-center relative z-10">
            <GenderChart v-if="stats" :male="stats.male" :female="stats.female" />
          </div>
        </Motion>
      </div>

      <!-- ── Recent Employees Table ───────────────────────────── -->
      <Motion
        :initial="{ opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.55 }"
        class="rounded-2xl overflow-hidden
               bg-white dark:bg-slate-900
               border border-slate-200 dark:border-slate-700
               shadow-sm dark:shadow-none"
      >
        <div class="px-7 py-5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-5">
          <div class="space-y-1">
            <h3 class="text-xl font-black tracking-tighter
                       text-slate-900 dark:text-white">
              Anggota Tim Terbaru
            </h3>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em]
                      text-slate-400 dark:text-slate-500">
              5 personil terakhir bergabung
            </p>
          </div>
          <NuxtLink to="/employees">
            <Button
              label="Seluruh Direktori"
              icon="bi bi-arrow-right"
              iconPos="right"
              severity="secondary"
              text
              class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-[0.2em]
                     !text-indigo-600 dark:!text-indigo-400
                     hover:!bg-indigo-50 dark:hover:!bg-indigo-500/10"
            />
          </NuxtLink>
        </div>

        <DataTable :value="newEmployees" class="p-datatable-dashboard" :loading="loading" :pt="{ wrapper: { class: '!bg-transparent' } }">

          <Column header="Personil">
            <template #body="slotProps">
              <div class="flex items-center gap-4">
                <div class="relative flex-shrink-0">
                  <Avatar
                    :image="slotProps.data.photo_url || 'https://ui-avatars.com/api/?name=' + slotProps.data.name + '&background=random&size=100'"
                    shape="circle"
                    class="!w-11 !h-11 border-2 border-slate-200 dark:border-slate-700 shadow"
                  />
                  <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <div class="text-sm font-black text-slate-900 dark:text-white leading-tight">{{ slotProps.data.name }}</div>
                  <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ slotProps.data.nip }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Peran & Departemen">
            <template #body="slotProps">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-black uppercase tracking-wider
                             text-indigo-600 dark:text-indigo-400">
                  {{ slotProps.data.position }}
                </span>
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ slotProps.data.department }}</span>
              </div>
            </template>
          </Column>

          <Column header="Join Date">
            <template #body="slotProps">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center
                            bg-slate-100 dark:bg-slate-800
                            text-slate-500 dark:text-slate-400">
                  <i class="bi bi-calendar-check text-xs"></i>
                </div>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {{ formatDate(slotProps.data.join_date) }}
                </span>
              </div>
            </template>
          </Column>

          <Column header="Tipe Kontrak">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.type"
                class="!rounded-lg !px-3 !py-1 !text-[10px] !font-black !uppercase !tracking-widest"
                :class="slotProps.data.type === 'Kontrak'
                  ? '!bg-amber-100 dark:!bg-amber-500/15 !text-amber-700 dark:!text-amber-400 !border !border-amber-200 dark:!border-amber-500/25'
                  : '!bg-indigo-100 dark:!bg-indigo-500/15 !text-indigo-700 dark:!text-indigo-400 !border !border-indigo-200 dark:!border-indigo-500/25'"
              />
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-14 text-center">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4
                          bg-slate-100 dark:bg-slate-800
                          border border-slate-200 dark:border-slate-700">
                <i class="bi bi-people text-2xl text-slate-400 dark:text-slate-500"></i>
              </div>
              <h3 class="text-base font-black mb-1 text-slate-800 dark:text-white">Tidak Ada Data Baru</h3>
              <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed">
                Belum ada personil baru yang ditambahkan.
              </p>
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
  })
);

const statCards = computed(() => [
  {
    label: "Total Squad",
    value: stats.value?.total ?? "0",
    icon: "bi bi-people-fill",
    color: "bg-indigo-600 text-white",
    glow: "bg-indigo-400",
  },
  {
    label: "Under Contract",
    value: stats.value?.kontrak ?? "0",
    icon: "bi bi-file-earmark-text-fill",
    color: "bg-amber-500 text-white",
    glow: "bg-amber-400",
  },
  {
    label: "Permanent Team",
    value: stats.value?.tetap ?? "0",
    icon: "bi bi-patch-check-fill",
    color: "bg-emerald-500 text-white",
    glow: "bg-emerald-400",
  },
  {
    label: "Active Interns",
    value: stats.value?.magang ?? "0",
    icon: "bi bi-mortarboard-fill",
    color: "bg-violet-600 text-white",
    glow: "bg-violet-400",
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

watch(
  () => currentUser.value,
  (newUser) => {
    if (newUser) fetchDashboardData();
  }
);
</script>

<style>
/* ── DataTable overrides ─────────────────────────────────── */
.p-datatable-dashboard .p-datatable-thead > tr > th {
  @apply !bg-slate-50 dark:!bg-slate-800/60
         !text-slate-400 dark:!text-slate-500
         !text-[10px] !font-black !uppercase !tracking-[0.2em]
         !px-8 !py-5
         !border-b !border-slate-100 dark:!border-slate-700;
}
.p-datatable-dashboard .p-datatable-tbody > tr > td {
  @apply !px-8 !py-5
         !border-b !border-slate-100 dark:!border-slate-700/60
         !bg-white dark:!bg-slate-900
         !text-slate-700 dark:!text-slate-200
         transition-colors duration-200;
}
.p-datatable-dashboard .p-datatable-tbody > tr:last-child > td {
  @apply !border-b-0;
}
.p-datatable-dashboard .p-datatable-tbody > tr:hover > td {
  @apply !bg-slate-50 dark:!bg-slate-800/60;
}
</style>
