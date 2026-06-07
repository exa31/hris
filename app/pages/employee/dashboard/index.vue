<template>
  <div class="space-y-12 transition-colors duration-500">
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-emerald-500/20 via-teal-500/10 to-transparent skew-x-12 translate-x-1/4"
        ></div>
        <div
          class="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"
        ></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div class="space-y-8 max-w-2xl text-center md:text-left">
            <div
              class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100"
                >Self Service Portal Active • {{ todayFormatted }}</span
              >
            </div>

            <div class="space-y-4">
              <h1 class="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                Welcome to <br />
                <span
                  class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"
                  >Your Workspace.</span
                >
              </h1>
              <p class="text-indigo-100/60 font-medium text-lg md:text-xl leading-relaxed">
                Halo,
                <span class="text-white font-bold">{{
                  currentUser?.employee?.name || 'Kawan'
                }}</span
                >. Lihat ringkasan kehadiran, cuti, dan informasi terbaru di sini.
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-4">
              <NuxtLink to="/employee/attendance">
                <Button
                  label="Catat Presensi"
                  icon="bi bi-fingerprint"
                  class="!rounded-xl !px-8 !py-4 !bg-emerald-500 !text-white !border-none !font-black !text-xs !tracking-widest shadow-lg shadow-emerald-500/30 dark:shadow-none hover:!scale-105 transition-transform"
                />
              </NuxtLink>
              <NuxtLink to="/employee/leaves">
                <Button
                  label="Pengajuan Cuti"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-8 !py-4 !text-white !font-black !uppercase !text-[10px] !tracking-widest !bg-white/5 border border-white/10 backdrop-blur-md hover:!bg-white/10 transition-colors"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Motion
          v-for="(stat, idx) in statCards"
          :key="stat.label"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.1 }"
          class="group"
        >
          <div
            class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-500 transition-all duration-500 relative overflow-hidden h-full"
          >
            <!-- Animated Background Glow on Hover -->
            <div
              :class="`absolute -right-10 -bottom-10 w-32 h-32 ${stat.glowColor} rounded-full blur-3xl transition-all duration-700`"
            ></div>

            <div
              :class="[
                stat.color,
                'w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-lg dark:shadow-none mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500',
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
              <div class="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                {{ stat.value }}
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

definePageMeta({ layout: 'default' });

const { user: currentUser } = useAuth();
const loading = ref(false);

const stats = ref<any>({
  attendancePercentage: 0,
  leavesRemaining: 12,
  pendingLeaves: 0,
});

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
);

const statCards = computed(() => [
  {
    label: 'Kehadiran Bulan Ini',
    value: `${stats.value?.attendancePercentage ?? 0}%`,
    icon: 'bi bi-calendar-check-fill',
    color: 'bg-emerald-500 text-white',
    glowColor: 'bg-emerald-500/5 group-hover:bg-emerald-500/20',
  },
  {
    label: 'Sisa Cuti',
    value: `${stats.value?.leavesRemaining ?? 0} Hari`,
    icon: 'bi bi-calendar2-week-fill',
    color: 'bg-amber-500 text-white',
    glowColor: 'bg-amber-500/5 group-hover:bg-amber-500/20',
  },
  {
    label: 'Cuti Menunggu Persetujuan',
    value: stats.value?.pendingLeaves ?? 0,
    icon: 'bi bi-hourglass-split',
    color: 'bg-indigo-500 text-white',
    glowColor: 'bg-indigo-500/5 group-hover:bg-indigo-500/20',
  },
]);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/employee/dashboard');
    stats.value = res.data;
  } catch (e) {
    console.error('Failed to fetch employee dashboard data', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>
