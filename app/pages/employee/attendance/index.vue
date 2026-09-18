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
              <span>{{ todayOperationalHours }}</span>
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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      <Motion
        v-for="(st, idx) in attendanceStats"
        :key="st.label"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.08 }"
        class="h-full flex flex-col"
      >
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all h-full">
          <div :class="[st.color, 'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs']">
            <i :class="st.icon"></i>
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <div class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest min-h-[28px] flex items-center line-clamp-2 leading-tight">
              {{ st.label }}
            </div>
            <div class="text-2xl font-black text-slate-800 dark:text-white mt-0.5 truncate">
              {{ st.value }}
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Search & Filter Controls Toolbar -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <!-- Smart Search Bar -->
          <div class="relative flex-1 group">
            <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search day (e.g. Monday), date (e.g. 18 Sep), or notes..."
              class="w-full !pl-11 !pr-10 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 focus:!ring-2 focus:!ring-indigo-500/20 transition-all"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
              title="Clear search"
            >
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </div>

          <!-- Month & Year Filter Dropdowns -->
          <div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div class="w-full sm:w-44">
              <Select
                v-model="selectedMonth"
                :options="monthOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !shadow-none !text-xs !font-bold !text-slate-800 dark:!text-slate-200"
              />
            </div>
            <div class="w-full sm:w-32">
              <Select
                v-model="selectedYear"
                :options="yearOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !shadow-none !text-xs !font-bold !text-slate-800 dark:!text-slate-200"
              />
            </div>
            <Button
              v-if="hasActiveFilter"
              icon="bi bi-arrow-counterclockwise"
              label="Reset"
              text
              size="small"
              class="!text-xs !font-bold !text-slate-400 hover:!text-rose-500 !px-3"
              @click="resetFilters"
            />
          </div>
        </div>

        <!-- Status Quick Pills Filter -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1.5">
              Status:
            </span>
            <button
              v-for="st in statusPills"
              :key="st.key"
              type="button"
              @click="selectedStatus = st.key"
              class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              :class="[
                selectedStatus === st.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              ]"
            >
              <span v-if="st.dot" :class="[st.dot, 'w-1.5 h-1.5 rounded-full']"></span>
              <span>{{ st.label }}</span>
              <span v-if="st.count !== undefined" class="ml-1 opacity-70 text-[9px]">({{ st.count }})</span>
            </button>
          </div>

          <!-- Total Records Indicator -->
          <div class="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            Showing <span class="font-black text-slate-700 dark:text-slate-200">{{ attendances.length }}</span> of {{ totalAttendances }} records
          </div>
        </div>
      </div>
    </Motion>

    <!-- History Table Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.25 }"
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
            Attendance & Presence History
          </h3>
        </div>
      </div>

      <DataTable
        :value="attendances"
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
              <div class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
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

        <Column header="Work Duration">
          <template #body="slotProps">
            <span
              v-if="slotProps.data.clock_in && slotProps.data.clock_out"
              class="text-xs font-black text-slate-700 dark:text-slate-300"
            >
              {{ getWorkDuration(slotProps.data.clock_in, slotProps.data.clock_out) }}
            </span>
            <span v-else class="text-xs text-slate-400 font-medium">
              -
            </span>
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

        <Column header="Notes / Remarks">
          <template #body="slotProps">
            <span
              v-if="slotProps.data.notes"
              class="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-1"
              :title="slotProps.data.notes"
            >
              {{ slotProps.data.notes }}
            </span>
            <span v-else class="text-xs text-slate-300 dark:text-slate-600">
              -
            </span>
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
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-4">
              {{ hasActiveFilter ? 'No attendance records match your current filters. Try resetting the filters or changing your search.' : 'Your attendance will be recorded automatically upon your daily Clock In.' }}
            </p>
            <Button
              v-if="hasActiveFilter"
              label="Clear All Filters"
              icon="bi bi-arrow-counterclockwise"
              size="small"
              outlined
              class="!rounded-xl !text-xs !font-bold"
              @click="resetFilters"
            />
          </div>
        </template>
      </DataTable>

      <!-- Table Pagination -->
      <div
        v-if="totalAttendances > itemsPerPage"
        class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-3"
      >
        <div class="text-xs font-bold text-slate-400">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalAttendances) }} of {{ totalAttendances }}
        </div>
        <Paginator
          :rows="itemsPerPage"
          :totalRecords="totalAttendances"
          :first="(currentPage - 1) * itemsPerPage"
          template="PrevPageLink PageLinks NextPageLink"
          @page="(e) => (currentPage = e.page + 1)"
          class="!bg-transparent !p-0"
        />
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useNotificationStore } from '~/stores/notification';
import { useWorkSchedule } from '~/composables/useWorkSchedule';

definePageMeta({ layout: 'default' });

const notificationStore = useNotificationStore();
const { $axios } = useNuxtApp();
const { schedules: workSchedules, fetchWorkSchedules } = useWorkSchedule();

const loading = ref(false);
const actionLoading = ref(false);
const attendances = ref<any[]>([]);

const todayOperationalHours = computed(() => {
  const dayOfWeek = new Date().getDay();
  const schedule = workSchedules.value.find((s) => s.day_of_week === dayOfWeek);
  if (!schedule) return 'Operational Hours: 08:00 AM - 05:00 PM';
  if (!schedule.is_work_day) return 'Today: Scheduled Company Day Off';

  const formatAmPm = (t: string) => {
    if (!t) return '';
    const parts = t.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h < 10 ? '0' + h : h}:${m} ${ampm}`;
  };
  return `Operational Hours: ${formatAmPm(schedule.start_time)} - ${formatAmPm(schedule.end_time)}`;
});

// Filter & Search States
const searchQuery = ref('');
const now = new Date();
const selectedMonth = ref<number>(now.getMonth() + 1); // Default to current month
const selectedYear = ref<number>(now.getFullYear());
const selectedStatus = ref<string>('All');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalAttendances = ref(0);
const serverStats = ref({
  on_time: 0,
  late: 0,
  leave: 0,
  sick: 0,
  absent: 0,
  total: 0,
});

const hasClockedIn = ref(false);
const hasClockedOut = ref(false);
const todayClockInTime = ref('');

const currentTime = ref('');
const currentDate = ref('');
let timer: any;

const updateClock = () => {
  const currentNow = new Date();
  currentTime.value = currentNow.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  currentDate.value = currentNow.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Month options
const monthOptions = [
  { label: 'All Months', value: 0 },
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

// Year options (last 3 years)
const currentYearNum = new Date().getFullYear();
const yearOptions = [
  { label: 'All Years', value: 0 },
  { label: String(currentYearNum), value: currentYearNum },
  { label: String(currentYearNum - 1), value: currentYearNum - 1 },
  { label: String(currentYearNum - 2), value: currentYearNum - 2 },
];

// Quick status pills with server counts
const statusPills = computed(() => {
  const all = serverStats.value.total;
  const present = serverStats.value.on_time;
  const late = serverStats.value.late;
  const leave = serverStats.value.leave;
  const sick = serverStats.value.sick;
  const absent = serverStats.value.absent;

  return [
    { key: 'All', label: 'All', count: all, dot: '' },
    { key: 'Present', label: 'Present', count: present, dot: 'bg-emerald-500' },
    { key: 'Late', label: 'Late', count: late, dot: 'bg-amber-500' },
    { key: 'Leave', label: 'Leave', count: leave, dot: 'bg-indigo-500' },
    { key: 'Sick', label: 'Sick', count: sick, dot: 'bg-purple-500' },
    { key: 'Absent', label: 'Absent', count: absent, dot: 'bg-rose-500' },
  ];
});

// Has any active filter
const hasActiveFilter = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedStatus.value !== 'All' ||
    selectedMonth.value !== 0 ||
    selectedYear.value !== currentYearNum
  );
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedStatus.value = 'All';
  selectedMonth.value = 0;
  selectedYear.value = currentYearNum;
  currentPage.value = 1;
  fetchHistory();
  fetchStats();
};

// Quick KPI Stats from Server
const attendanceStats = computed(() => {
  const total = serverStats.value.total;
  const hadir = serverStats.value.on_time;
  const late = serverStats.value.late;
  const leaves = serverStats.value.leave + serverStats.value.sick;
  const hadirPercent = total > 0 ? Math.round(((hadir + late) / total) * 100) : 100;

  return [
    {
      label: 'Attendance Rate',
      value: `${hadirPercent}%`,
      icon: 'bi bi-pie-chart-fill',
      color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'On-time Check-ins',
      value: hadir,
      icon: 'bi bi-check2-all',
      color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Late Check-ins',
      value: late,
      icon: 'bi bi-clock-history',
      color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Recorded Leaves',
      value: leaves,
      icon: 'bi bi-calendar2-week-fill',
      color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];
});

const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);

let isMounted = false;

// Watch search and status filters to re-fetch from server (page resets to 1) - lightweight list only
watch(debouncedSearchQuery, () => {
  if (!isMounted) return;
  currentPage.value = 1;
  fetchHistory();
});

watch(selectedStatus, () => {
  if (!isMounted) return;
  currentPage.value = 1;
  fetchHistory();
});

// Watch month & year filter changes to re-fetch attendances AND stats
watch([selectedMonth, selectedYear], () => {
  if (!isMounted) return;
  currentPage.value = 1;
  fetchHistory();
  fetchStats();
});

// Watch page change to re-fetch with new offset - lightweight list only
watch(currentPage, () => {
  if (!isMounted) return;
  fetchHistory();
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
    case 'Alpha':
    case 'Absent':
      return '!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:text-rose-400 !border !border-rose-200 dark:!border-rose-500/20';
    case 'Sakit':
    case 'Sick':
      return '!bg-purple-50 dark:!bg-purple-500/10 !text-purple-600 dark:text-purple-400 !border !border-purple-200 dark:!border-purple-500/20';
    case 'Izin':
    case 'Leave':
      return '!bg-blue-50 dark:!bg-blue-500/10 !text-blue-600 dark:text-blue-400 !border !border-blue-200 dark:!border-blue-500/20';
    default:
      return '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:text-indigo-400 !border !border-indigo-200 dark:!border-indigo-500/20';
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
    case 'Alpha':
    case 'Absent':
      return 'bi bi-x-circle-fill';
    case 'Sakit':
    case 'Sick':
      return 'bi bi-bandaid-fill';
    case 'Izin':
    case 'Leave':
      return 'bi bi-calendar2-check-fill';
    default:
      return 'bi bi-info-circle-fill';
  }
};

const getWorkDuration = (clockIn: string, clockOut: string) => {
  if (!clockIn || !clockOut) return '-';
  try {
    const parseTime = (str: string) => {
      if (str.includes('T')) {
        const d = new Date(str);
        return d.getHours() * 60 + d.getMinutes();
      }
      const parts = str.split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const diff = parseTime(clockOut) - parseTime(clockIn);
    if (diff <= 0) return '-';
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  } catch {
    return '-';
  }
};

const fetchStats = async () => {
  try {
    const params: Record<string, any> = {};
    if (selectedMonth.value && selectedMonth.value > 0) {
      params.month = selectedMonth.value;
    }
    if (selectedYear.value && selectedYear.value > 0) {
      params.year = selectedYear.value;
    }

    const res = await $axios.get('/api/employee/attendance/stats', { params });
    const resData = res.data?.data || res.data;
    if (resData) {
      serverStats.value = resData;
    }
  } catch (error) {
    console.error('Failed to load attendance stats', error);
  }
};

const fetchHistory = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      limit: itemsPerPage.value,
      offset: (currentPage.value - 1) * itemsPerPage.value,
    };
    if (selectedMonth.value && selectedMonth.value > 0) {
      params.month = selectedMonth.value;
    }
    if (selectedYear.value && selectedYear.value > 0) {
      params.year = selectedYear.value;
    }
    if (selectedStatus.value && selectedStatus.value !== 'All') {
      params.status = selectedStatus.value;
    }
    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    const res = await $axios.get('/api/employee/attendance', { params });
    const data = res.data?.data || res.data || {};
    attendances.value = data.attendances || [];
    totalAttendances.value = data.pagination?.total || 0;

    // Check today's clock status from dedicated backend field
    if (data.today) {
      hasClockedIn.value = !!data.today.hasClockedIn;
      hasClockedOut.value = !!data.today.hasClockedOut;
      if (data.today.clock_in) {
        todayClockInTime.value = formatTime(data.today.clock_in);
      }
    } else {
      // Fallback: check if today's record exists in current list
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
    await $axios.post('/api/employee/attendance/clock', { type });

    notificationStore.showSuccess(
      'Success',
      `Clock ${type === 'in' ? 'In' : 'Out'} successfully recorded!`
    );
    await Promise.all([
      fetchHistory(),
      fetchStats(),
    ]);
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

onMounted(async () => {
  updateClock();
  timer = setInterval(updateClock, 1000);
  await Promise.all([
    fetchHistory(),
    fetchStats(),
    fetchWorkSchedules(),
  ]);
  nextTick(() => {
    isMounted = true;
  });
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
