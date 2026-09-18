<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between pb-6 border-b border-slate-100 dark:border-slate-800"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"
          ></span>
          <span
            class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400"
            >Attendance Monitoring Hub</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Nexus Team Attendance
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Monitor employee punctuality, real check-in times, and daily attendance logs centrally.
        </p>
      </Motion>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto items-stretch">
        <div
          class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs text-center space-y-1 h-full flex flex-col justify-center"
        >
          <div
            class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest min-h-[28px] flex items-center justify-center line-clamp-2 leading-tight"
          >
            Attendance Rate
          </div>
          <div class="text-2xl font-black text-emerald-500 truncate">
            {{ summaryLoading ? "..." : (todayStats.hadir_percent || 0) + "%" }}
          </div>
        </div>
        <div
          class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs text-center space-y-1 h-full flex flex-col justify-center"
        >
          <div
            class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest min-h-[28px] flex items-center justify-center line-clamp-2 leading-tight"
          >
            Present Today
          </div>
          <div class="text-2xl font-black text-amber-500 truncate">
            {{ summaryLoading ? "..." : (todayStats.hadir || 0) + "/" + (todayStats.total_active || 0) }}
          </div>
        </div>
        <div
          class="p-5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none text-center space-y-1 text-white col-span-2 sm:col-span-1 h-full flex flex-col justify-center"
        >
          <div
            class="text-[9px] font-black text-indigo-200 uppercase tracking-widest min-h-[28px] flex items-center justify-center line-clamp-2 leading-tight"
          >
            Total Activity Logs
          </div>
          <div class="text-2xl font-black truncate">{{ totalAttendances }}</div>
        </div>
      </div>
    </div>

    <!-- Filters & Actions Bar -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-4 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Search Members</label>
          <div class="relative group">
            <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search Name / NIP..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-white focus:!ring-2 focus:!ring-indigo-500/20"
            />
          </div>
        </div>

        <div class="md:col-span-2 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Month</label>
          <Select
            v-model="selectedMonth"
            :options="monthOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !shadow-none !text-xs !font-bold !text-slate-800 dark:!text-slate-200"
          />
        </div>

        <div class="md:col-span-2 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Year</label>
          <Select
            v-model="selectedYear"
            :options="yearOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !shadow-none !text-xs !font-bold !text-slate-800 dark:!text-slate-200"
          />
        </div>

        <div class="md:col-span-2 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Status"
            class="w-full !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !shadow-none !text-xs !font-bold !text-slate-800 dark:!text-slate-200"
          />
        </div>

        <div class="md:col-span-2">
          <Button
            icon="bi bi-file-earmark-spreadsheet-fill"
            label="Export Report"
            class="!rounded-xl !h-[46px] !w-full !bg-white dark:!bg-slate-800 !text-indigo-600 dark:!text-indigo-400 border border-indigo-100 dark:border-slate-700 !font-black !uppercase !text-[10px] !tracking-widest shadow-xs hover:!bg-indigo-50 dark:hover:!bg-slate-700 transition-all"
            @click="exportExcel"
            :loading="loading"
          />
        </div>
      </div>
    </Motion>

    <!-- Table Section -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.3 }"
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <DataTable
        :value="attendances"
        class="p-datatable-overhaul"
        :loading="loading"
        :rows="itemsPerPage"
        :pt="{
          wrapper: { class: '!bg-transparent' },
          footer: { class: '!bg-transparent' },
          footerRow: { class: '!bg-transparent' },
          footerCell: { class: '!bg-transparent !p-0 !border-none' },
        }"
      >
        <Column header="Team Member">
          <template #body="slotProps">
            <div class="flex items-center gap-4">
              <Avatar
                :image="
                  slotProps.data.photo_url ||
                  getAvatarUrl(slotProps.data.name || slotProps.data.employee_name || 'User', 'random')
                "
                shape="circle"
                class="!w-10 !h-10 border-2 border-white dark:border-slate-800 shadow-xs ring-2 ring-slate-100 dark:ring-slate-700"
              />
              <div class="flex flex-col">
                <span
                  class="text-sm font-black text-slate-800 dark:text-white leading-tight"
                  >{{ slotProps.data.name || slotProps.data.employee_name }}</span
                >
                <span
                  class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >{{ slotProps.data.nip }}</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column header="Schedule & Arrival">
          <template #body="slotProps">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <i class="bi bi-clock-fill text-indigo-500 text-[10px]"></i>
                <span
                  class="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter"
                  >{{ slotProps.data.time_in || slotProps.data.clock_in || '-' }}</span
                >
              </div>
              <span
                class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >{{ formatDate(slotProps.data.date) }}</span
              >
            </div>
          </template>
        </Column>

        <Column header="Check-in Status">
          <template #body="slotProps">
            <div class="flex items-center gap-2.5">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  slotProps.data.status === 'Hadir' || slotProps.data.status === 'Present'
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-200'
                    : 'bg-rose-500 shadow-sm shadow-rose-200',
                ]"
              ></div>
              <Tag
                :value="formatStatus(slotProps.data.status)"
                :class="
                  slotProps.data.status === 'Hadir' || slotProps.data.status === 'Present'
                    ? '!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border !border-emerald-100 dark:!border-emerald-500/20'
                    : '!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !border !border-rose-100 dark:!border-rose-500/20'
                "
                class="!text-[9px] !font-black !px-2.5 !py-1 !rounded-lg !uppercase !tracking-wider"
              />
            </div>
          </template>
        </Column>

        <Column header="Clock-in Location">
          <template #body="slotProps">
            <div
              class="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit"
            >
              <i class="bi bi-geo-alt-fill text-indigo-400 text-[10px]"></i>
              <span
                class="text-[10px] font-bold text-slate-500 dark:text-slate-400"
                >{{ slotProps.data.location === 'Kantor Pusat' ? 'HQ Office' : (slotProps.data.location || 'HQ Office') }}</span
              >
            </div>
          </template>
        </Column>

        <Column header="Actions" class="!text-right">
          <template #body="slotProps">
            <Button
              icon="bi bi-info-circle-fill"
              text
              severity="secondary"
              class="!w-9 !h-9 !rounded-xl !text-slate-400 dark:!text-slate-500 hover:!text-indigo-600 dark:hover:!text-indigo-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/10 transition-colors"
              v-tooltip.top="'Inspect Details'"
              @click="openDetailModal(slotProps.data)"
            />
          </template>
        </Column>

        <template #footer>
          <div
            class="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 bg-white dark:bg-slate-900/50"
          >
            <span
              class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >Realtime Attendance Database Sync</span
            >
            <Paginator
              :first="(page - 1) * itemsPerPage"
              :rows="itemsPerPage"
              :totalRecords="totalAttendances"
              template="PrevPageLink PageLinks NextPageLink"
              class="!bg-transparent !p-0"
              @page="onPageChange"
              :pt="{
                root: { class: '!bg-transparent !p-0 !border-none flex items-center gap-1.5' },
                pages: { class: 'flex items-center gap-1.5' },
                page: ({ context }: any) => ({
                  class: [
                    '!w-8 !h-8 !rounded-xl !text-xs !font-black !min-w-0 !transition-all !flex !items-center !justify-center',
                    context.active
                      ? '!bg-indigo-600 dark:!bg-indigo-500 !text-white dark:!text-white !shadow-md !shadow-indigo-500/30'
                      : '!bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white',
                  ],
                }),
                prev: { class: '!w-8 !h-8 !rounded-xl !bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white !transition-colors !flex !items-center !justify-center disabled:!opacity-30 disabled:!pointer-events-none' },
                next: { class: '!w-8 !h-8 !rounded-xl !bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white !transition-colors !flex !items-center !justify-center disabled:!opacity-30 disabled:!pointer-events-none' },
              }"
            />
          </div>
        </template>

        <template #empty>
          <div
            class="flex flex-col items-center justify-center py-20 px-6 text-center"
          >
            <div class="relative mb-6">
              <div
                class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"
              ></div>
              <div
                class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700"
              >
                <i class="bi bi-clock-history text-4xl text-indigo-500"></i>
              </div>
              <div
                class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg dark:shadow-none z-20"
              >
                <i class="bi bi-search text-xs"></i>
              </div>
            </div>
            <h3
              class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
            >
              No Attendance Records Found
            </h3>
            <p
              class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8"
            >
              The system has not recorded any attendance activity matching your criteria.
            </p>
            <Button
              v-if="searchQuery"
              label="Clear Search"
              icon="bi bi-arrow-counterclockwise"
              class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform"
              @click="searchQuery = ''"
            />
          </div>
        </template>
      </DataTable>
    </Motion>

    <!-- Detail Inspection Dialog -->
    <Dialog
      v-model:visible="detailModalOpen"
      modal
      class="w-full max-w-md"
      :pt="{
        root: { class: '!rounded-3xl !border !border-slate-100 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !shadow-2xl overflow-hidden' },
        header: { class: 'px-7 pt-7 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:text-white' },
        content: { class: 'px-7 py-6 !bg-transparent' },
        footer: { class: 'px-7 pb-7 pt-2 !bg-transparent !border-none' },
      }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            <i class="bi bi-person-badge-fill"></i>
          </div>
          <div>
            <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Attendance Inspection
            </span>
            <h3 class="text-base font-black text-slate-800 dark:text-white tracking-tight leading-tight">
              Attendance Log Details
            </h3>
          </div>
        </div>
      </template>

      <div v-if="selectedRecord" class="space-y-5">
        <!-- User Profile Card -->
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <Avatar
            :image="selectedRecord.photo_url || getAvatarUrl(selectedRecord.name || selectedRecord.employee_name || 'User', 'random')"
            shape="circle"
            class="!w-12 !h-12 border-2 border-white dark:border-slate-700 shadow-xs"
          />
          <div>
            <div class="text-sm font-black text-slate-800 dark:text-white">
              {{ selectedRecord.name || selectedRecord.employee_name }}
            </div>
            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              NIP: {{ selectedRecord.nip }}
            </div>
          </div>
        </div>

        <!-- Schedule & Check-in Details -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span class="text-[9px] font-bold text-slate-400 uppercase">Clock In</span>
            <div class="text-sm font-black text-slate-800 dark:text-white">
              {{ selectedRecord.time_in || selectedRecord.clock_in || '-' }}
            </div>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span class="text-[9px] font-bold text-slate-400 uppercase">Clock Out</span>
            <div class="text-sm font-black text-slate-800 dark:text-white">
              {{ selectedRecord.time_out || selectedRecord.clock_out || '-' }}
            </div>
          </div>
        </div>

        <!-- Location & Status Details -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-400">Attendance Date:</span>
            <span class="font-black text-slate-700 dark:text-slate-300">{{ formatDate(selectedRecord.date) }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-400">Logged Location:</span>
            <span class="font-black text-slate-700 dark:text-slate-300">{{ selectedRecord.location === 'Kantor Pusat' ? 'HQ Office' : (selectedRecord.location || 'HQ Office') }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-400">Attendance Status:</span>
            <Tag
              :value="formatStatus(selectedRecord.status)"
              class="!text-[9px] !font-black !px-2.5 !py-0.5 !rounded-md !uppercase"
              :class="selectedRecord.status === 'Hadir' || selectedRecord.status === 'Present' ? '!bg-emerald-50 !text-emerald-600' : '!bg-rose-50 !text-rose-600'"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end pt-2">
          <Button
            label="Close"
            severity="secondary"
            text
            @click="detailModalOpen = false"
            class="!rounded-xl !px-6 !py-2.5 !font-bold !text-xs"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAttendance } from "~/composables/useAttendance";

definePageMeta({ layout: "default" });

const {
  attendances,
  totalAttendances,
  loading,
  currentPage: page,
  searchQuery,
  selectedStatus,
  selectedMonth,
  selectedYear,
  fetchAttendances,
  fetchSummary,
  exportExcel,
} = useAttendance();

const itemsPerPage = ref(10);
const summaryLoading = ref(false);
const todayStats = ref({ hadir: 0, total_active: 0, hadir_percent: 0 });

const detailModalOpen = ref(false);
const selectedRecord = ref<any>(null);

const openDetailModal = (record: any) => {
  selectedRecord.value = record;
  detailModalOpen.value = true;
};

const formatStatus = (status: string) => {
  if (!status) return "Present";
  if (status === "Hadir" || status === "Present") return "Present";
  if (status === "Izin" || status === "Permit") return "Permit";
  if (status === "Sakit" || status === "Sick") return "Sick";
  if (status === "Alpha" || status === "Absent") return "Absent";
  return status;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const onPageChange = (event: any) => {
  page.value = event.page + 1;
};

const loadSummary = async () => {
  summaryLoading.value = true;
  try {
    const data = await fetchSummary();
    if (data?.todayStats) todayStats.value = data.todayStats;
  } finally {
    summaryLoading.value = false;
  }
};

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

const currentYear = new Date().getFullYear();
const yearOptions = [
  { label: 'All Years', value: 0 },
  { label: currentYear.toString(), value: currentYear },
  { label: (currentYear - 1).toString(), value: currentYear - 1 },
  { label: (currentYear - 2).toString(), value: currentYear - 2 },
];

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Present', value: 'Hadir' },
  { label: 'Permit', value: 'Izin' },
  { label: 'Sick', value: 'Sakit' },
  { label: 'Absent', value: 'Alpha' },
];

onMounted(() => {
  fetchAttendances();
  loadSummary();
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (newVal) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  const delay = newVal ? 400 : 0;
  searchDebounce = setTimeout(() => {
    page.value = 1;
    fetchAttendances();
  }, delay);
});

watch([page, selectedStatus, selectedMonth, selectedYear], () => fetchAttendances());
</script>

<style>
.p-datatable-overhaul .p-datatable-thead > tr > th {
  @apply !bg-slate-50/80 dark:!bg-slate-800/80 !text-slate-400 dark:!text-slate-500 !text-[11px] !font-black !uppercase !tracking-[0.25em] !px-12 !py-10 !border-b !border-slate-100 dark:!border-slate-800;
}
.p-datatable-overhaul .p-datatable-tbody > tr > td {
  @apply !px-12 !py-8 !border-b !border-slate-50 dark:!border-slate-800 !bg-white dark:!bg-slate-900 transition-all duration-300;
}
.p-datatable-overhaul .p-datatable-tbody > tr:hover > td {
  @apply !bg-slate-50/30 dark:!bg-slate-800/30;
}

.p-paginator {
  @apply !bg-transparent !p-0 !border-none;
}
.p-paginator .p-paginator-page,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-prev {
  @apply !w-8 !h-8 !rounded-xl !text-xs !font-black !min-w-0 !bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white transition-all !flex !items-center !justify-center;
}
.p-paginator .p-paginator-page.p-highlight,
.p-paginator .p-paginator-page.p-paginator-page-selected {
  @apply !bg-indigo-600 dark:!bg-indigo-500 !text-white dark:!text-white !shadow-md !shadow-indigo-500/30 !border-none;
}
</style>
