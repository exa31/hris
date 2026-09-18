<template>
  <div class="space-y-8">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8">
      <div class="h-44 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="h-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-8">
      <!-- Welcome Hero Section -->
      <Motion
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4 }"
        class="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 border border-emerald-500/30 dark:border-slate-800 shadow-xl dark:shadow-none"
      >
        <!-- Background Ambient Accents -->
        <div class="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-10 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="space-y-4 max-w-2xl text-center md:text-left">
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-200">
                Employee Self-Service Portal • {{ todayFormatted }}
              </span>
            </div>

            <div class="space-y-2">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Welcome,
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
                  {{ currentUser?.employee?.name || currentUser?.username || 'Colleague' }}
                </span>
              </h1>
              <p class="text-emerald-100/70 font-medium text-sm sm:text-base leading-relaxed">
                Manage daily presence logs, monitor leave quotas, and review company announcements in real time.
              </p>
            </div>

            <!-- Action shortcuts -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <NuxtLink to="/employee/attendance">
                <Button
                  label="Log Presence"
                  icon="bi bi-fingerprint"
                  class="!rounded-xl !px-6 !py-3 !bg-emerald-500 hover:!bg-emerald-400 !text-white !border-none !font-black !text-xs !tracking-wider !shadow-lg shadow-emerald-500/30 transition-all"
                />
              </NuxtLink>
              <NuxtLink to="/employee/leaves">
                <Button
                  label="Request Leave"
                  icon="bi bi-calendar2-plus-fill"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-6 !py-3 !text-white !font-black !text-xs !tracking-wider !bg-white/10 hover:!bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
                />
              </NuxtLink>
              <NuxtLink to="/employee/announcements">
                <Button
                  label="Announcements"
                  icon="bi bi-megaphone-fill"
                  severity="secondary"
                  text
                  class="!rounded-xl !px-6 !py-3 !text-white !font-black !text-xs !tracking-wider !bg-white/10 hover:!bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Profile Badge Card -->
          <div class="hidden lg:flex items-center gap-4 p-5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md">
            <Avatar
              :image="(currentUser?.employee as any)?.photo_url || ''"
              :label="(currentUser?.employee?.name || currentUser?.username || 'U').charAt(0).toUpperCase()"
              shape="circle"
              class="!w-14 !h-14 border-2 border-white/30 shadow-md !bg-emerald-500 !text-white font-black text-xl"
            />
            <div class="space-y-0.5">
              <div class="text-sm font-black text-white">
                {{ currentUser?.employee?.name || currentUser?.username }}
              </div>
              <div class="text-xs text-emerald-200">
                {{ (currentUser?.employee as any)?.position || 'Employee' }}
              </div>
              <span class="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40">
                {{ currentUser?.role?.name || 'Employee' }}
              </span>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <Motion
          v-for="(stat, idx) in statCards"
          :key="stat.label"
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.08 }"
          class="group h-full flex flex-col"
        >
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-xs border border-slate-200/70 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <div :class="[stat.color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform']">
                  <i :class="stat.icon"></i>
                </div>
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {{ stat.pill }}
                </span>
              </div>

              <div class="space-y-1 relative z-10">
                <h4 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] min-h-[28px] flex items-center line-clamp-2 leading-tight">
                  {{ stat.label }}
                </h4>
                <div class="text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {{ stat.value }}
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span class="text-slate-400">{{ stat.desc }}</span>
              <NuxtLink :to="stat.link" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <span>Details</span>
                <i class="bi bi-arrow-right text-[10px]"></i>
              </NuxtLink>
            </div>
          </div>
        </Motion>
      </div>

      <!-- Quick Guidance Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-start gap-4 h-full">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg flex-shrink-0 mt-1">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="space-y-1.5 flex-1">
            <h4 class="text-sm font-black text-slate-800 dark:text-white">Work Hours & Schedule Policy</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ stats?.workSchedule?.text || 'Standard work hours start from 08:00 AM to 05:00 PM. Grace period for late arrivals is 15 minutes.' }}
            </p>
            <div v-if="stats?.workSchedule" class="pt-1 flex items-center gap-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span class="inline-block w-1.5 h-1.5 rounded-full" :class="stats.workSchedule.todayIsWorkDay ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
              <span>Today: {{ stats.workSchedule.todayHours }}</span>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-start gap-4 h-full">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg flex-shrink-0 mt-1">
            <i class="bi bi-info-circle"></i>
          </div>
          <div class="space-y-1.5 flex-1">
            <h4 class="text-sm font-black text-slate-800 dark:text-white">Annual Leave Policy</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ stats?.annualLeavePolicy?.text || 'Annual leave applications should ideally be submitted at least 3 business days in advance for management approval.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: 'default' });

const { user: currentUser } = useAuth();
const loading = ref(false);

const stats = ref<any>({
  attendancePercentage: 0,
  leavesRemaining: 12,
  pendingLeaves: 0,
});

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
);

const statCards = computed(() => [
  {
    label: 'Monthly Presence',
    value: `${stats.value?.attendancePercentage ?? 0}%`,
    icon: 'bi bi-calendar-check-fill',
    color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    pill: 'Presence Rate',
    desc: 'Based on active workdays',
    link: '/employee/attendance',
  },
  {
    label: 'Remaining Leave Balance',
    value: `${stats.value?.leavesRemaining ?? 0} Days`,
    icon: 'bi bi-calendar2-week-fill',
    color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    pill: 'Leave Quota',
    desc: 'Active annual entitlement',
    link: '/employee/leaves',
  },
  {
    label: 'Pending Leave Requests',
    value: stats.value?.pendingLeaves ?? 0,
    icon: 'bi bi-hourglass-split',
    color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    pill: 'Approval Pipeline',
    desc: 'Under manager / HR review',
    link: '/employee/leaves',
  },
]);

const { $axios } = useNuxtApp();

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await $axios.get('/api/employee/dashboard');
    stats.value = res.data?.data || res.data;
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
