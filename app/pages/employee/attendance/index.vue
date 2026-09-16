<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
      <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }" class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Realtime Geofence Attendance
          </span>
        </div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Self-Service Attendance
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Log your daily check-in and check-out times while monitoring work consistency.
        </p>
      </Motion>

      <!-- Office Geolocation Badge -->
      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <div class="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
            <i class="bi bi-geo-alt-fill"></i>
          </div>
          <div>
            <div class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Office Geolocation</div>
            <div class="text-xs font-black text-slate-800 dark:text-slate-200">HQ Office (50m Radius - Verified)</div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Interactive Clock In / Out Hero Section -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      class="bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-10 border border-slate-100 dark:border-slate-800 shadow-xs relative overflow-hidden"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-16 -top-16 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        <!-- Live Clock & Date -->
        <div class="flex items-center gap-6 text-center lg:text-left flex-col sm:flex-row">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-slate-800 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl shadow-inner border border-indigo-100 dark:border-indigo-900/50">
              <i class="bi bi-clock-history"></i>
            </div>
            <span class="absolute -top-1 -right-1 flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          <div class="space-y-1">
            <div class="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {{ currentTime }}
            </div>
            <div class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              {{ currentDate }}
            </div>
            <div class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <i class="bi bi-shield-check"></i>
              <span>Operational Hours: 08:00 AM - 05:00 PM</span>
            </div>
          </div>
        </div>

        <!-- Shift & Clock Status Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div v-if="!hasClockedIn" class="w-full sm:w-auto">
            <Button
              label="Clock In Now"
              icon="bi bi-box-arrow-in-right"
              class="!w-full sm:!w-auto !px-8 !py-4 !rounded-2xl !font-black !text-xs !tracking-widest !uppercase !bg-emerald-600 hover:!bg-emerald-700 !border-none shadow-lg shadow-emerald-500/20 dark:shadow-none hover:scale-105 transition-all"
              @click="handleClock('in')"
              :loading="actionLoading"
            />
          </div>

          <div v-else-if="!hasClockedOut" class="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div class="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center gap-2">
              <i class="bi bi-check2-circle"></i>
              <span>Clock In: {{ todayClockInTime || 'Recorded' }}</span>
            </div>
            <Button
              label="Clock Out Now"
              icon="bi bi-box-arrow-right"
              class="!w-full sm:!w-auto !px-8 !py-4 !rounded-2xl !font-black !text-xs !tracking-widest !uppercase !bg-amber-600 hover:!bg-amber-700 !border-none shadow-lg shadow-amber-500/20 dark:shadow-none hover:scale-105 transition-all"
              @click="handleClock('out')"
              :loading="actionLoading"
            />
          </div>

          <div
            v-else
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs tracking-wider flex items-center justify-center gap-2.5 shadow-xs"
          >
            <i class="bi bi-patch-check-fill text-emerald-500 text-lg"></i>
            <span>Today's Attendance Completed</span>
          </div>
        </div>
      </div>
    </Motion>

    <!-- Attendance Performance Stats Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Motion
        v-for="(st, idx) in attendanceStats"
        :key="st.label"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.08 }"
      >
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
          <div :class="[st.color, 'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs']">
            <i :class="st.icon"></i>
          </div>
          <div>
            <div class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {{ st.label }}
            </div>
            <div class="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
              {{ st.value }}
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- History Table Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.25 }"
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
            Attendance & Presence History
          </h3>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative group">
            <i class="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search date or status..."
              class="!pl-10 !py-2 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !w-56"
            />
          </div>
        </div>
      </div>

      <DataTable
        :value="filteredAttendances"
        :loading="loading"
        class="p-datatable-overhaul"
        :pt="{
          wrapper: { class: '!bg-transparent' },
          footer: { class: '!bg-transparent' },
          footerRow: { class: '!bg-transparent' },
          footerCell: { class: '!bg-transparent !p-0 !border-none' },
        }"
      >
        <Column header="Day & Date">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs">
                <i class="bi bi-calendar-event"></i>
              </div>
              <div class="flex flex-col">
                <span class="font-black text-sm text-slate-800 dark:text-white">
                  {{ formatDate(slotProps.data.date) }}
                </span>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {{ getDayName(slotProps.data.date) }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Clock In">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-1 rounded-lg text-xs font-black tracking-tight"
                :class="slotProps.data.clock_in ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
              >
                <i class="bi bi-box-arrow-in-right mr-1"></i>
                {{ slotProps.data.clock_in ? formatTime(slotProps.data.clock_in) : '--:--' }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Clock Out">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-1 rounded-lg text-xs font-black tracking-tight"
                :class="slotProps.data.clock_out ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-400'"
              >
                <i class="bi bi-box-arrow-right mr-1"></i>
                {{ slotProps.data.clock_out ? formatTime(slotProps.data.clock_out) : '--:--' }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Status">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.status || 'Present'"
              class="!rounded-lg !px-3 !py-1 !text-[10px] !font-black !uppercase !tracking-wider flex items-center gap-1.5 w-fit"
              :class="getStatusClass(slotProps.data.status)"
            >
              <template #icon>
                <i :class="getStatusIcon(slotProps.data.status)"></i>
              </template>
            </Tag>
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-3xl text-indigo-500 mb-3 shadow-inner">
              <i class="bi bi-inbox"></i>
            </div>
            <h3 class="text-base font-black text-slate-800 dark:text-white mb-1">
              No Attendance Records Found
            </h3>
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm">
              Your attendance will be recorded automatically upon your daily Clock In.
            </p>
          </div>
        </template>
      </DataTable>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '~/stores/notification';

definePageMeta({ layout: 'default' });

const notificationStore = useNotificationStore();

const loading = ref(false);
const actionLoading = ref(false);
const attendances = ref<any[]>([]);
const searchQuery = ref('');

const hasClockedIn = ref(false);
const hasClockedOut = ref(false);
const todayClockInTime = ref('');

const currentTime = ref('');
const currentDate = ref('');
let timer: any;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const attendanceStats = computed(() => {
  const totalRecords = attendances.value.length;
  const hadirCount = attendances.value.filter((a) => a.status === 'Hadir' || a.status === 'Present').length;
  const lateCount = attendances.value.filter((a) => a.status === 'Terlambat' || a.status === 'Late').length;
  const izinCount = attendances.value.filter((a) => a.status === 'Izin' || a.status === 'Cuti' || a.status === 'Leave').length;
  const hadirPercent = totalRecords > 0 ? Math.round(((hadirCount + lateCount) / totalRecords) * 100) : 100;

  return [
    {
      label: 'Attendance Rate',
      value: `${hadirPercent}%`,
      icon: 'bi bi-pie-chart-fill',
      color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'On-time Check-ins',
      value: hadirCount,
      icon: 'bi bi-check2-all',
      color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Late Check-ins',
      value: lateCount,
      icon: 'bi bi-clock-history',
      color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Recorded Leaves',
      value: izinCount,
      icon: 'bi bi-calendar2-week-fill',
      color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];
});

const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);

const filteredAttendances = computed(() => {
  if (!debouncedSearchQuery.value.trim()) return attendances.value;
  const query = debouncedSearchQuery.value.toLowerCase().trim();
  return attendances.value.filter((a) => {
    return (
      (a.status && a.status.toLowerCase().includes(query)) ||
      (a.date && a.date.includes(query))
    );
  });
});

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Hadir':
    case 'Present':
      return '!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border !border-emerald-200 dark:!border-emerald-500/20';
    case 'Terlambat':
    case 'Late':
      return '!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border !border-amber-200 dark:!border-amber-500/20';
    case 'Alpa':
    case 'Absent':
      return '!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:text-rose-400 !border !border-rose-200 dark:!border-rose-500/20';
    default:
      return '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-200 dark:!border-indigo-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Hadir':
    case 'Present':
      return 'bi bi-check-circle-fill';
    case 'Terlambat':
    case 'Late':
      return 'bi bi-exclamation-circle-fill';
    case 'Alpa':
    case 'Absent':
      return 'bi bi-x-circle-fill';
    default:
      return 'bi bi-info-circle-fill';
  }
};

const fetchHistory = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/employee/attendance');
    attendances.value = res.data.attendances || [];

    // Check today's status
    const today = attendances.value.find((a: any) => {
      const aDate = new Date(a.date).toDateString();
      const tDate = new Date().toDateString();
      return aDate === tDate;
    });

    if (today) {
      hasClockedIn.value = !!today.clock_in;
      hasClockedOut.value = !!today.clock_out;
      if (today.clock_in) {
        todayClockInTime.value = formatTime(today.clock_in);
      }
    }
  } catch (error) {
    console.error('Failed to load attendance history', error);
  } finally {
    loading.value = false;
  }
};

const handleClock = async (type: 'in' | 'out') => {
  actionLoading.value = true;
  try {
    await $fetch('/api/employee/attendance/clock', {
      method: 'POST',
      body: { type },
    });

    notificationStore.showSuccess(
      'Success',
      `Clock ${type === 'in' ? 'In' : 'Out'} successfully recorded!`
    );
    await fetchHistory();
  } catch (error) {
    console.error('Clock action failed', error);
    notificationStore.showError('Failed', `Failed to record Clock ${type.toUpperCase()}`);
  } finally {
    actionLoading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDayName = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr.substring(0, 5);
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
  fetchHistory();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
