<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800"
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
          >
            Employee Self-Service
          </span>
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Self-Service Leave Requests
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Manage leave balances, track approval status, and submit time-off
          requests.
        </p>
      </Motion>

      <Motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
      >
        <Button
          label="Request Leave"
          icon="bi bi-calendar-plus-fill"
          class="!rounded-xl !px-6 !py-3.5 !font-black !uppercase !text-[10px] !tracking-widest !bg-indigo-600 hover:!bg-indigo-700 !border-none shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
          @click="openRequestModal"
        />
      </Motion>
    </div>

    <!-- Quick Bento Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      <Motion
        v-for="(stat, idx) in leaveStats"
        :key="stat.label"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.08 }"
        class="h-full flex flex-col"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all h-full"
        >
          <div
            :class="[
              stat.color,
              'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs',
            ]"
          >
            <i :class="stat.icon"></i>
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <div
              class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest min-h-[28px] flex items-center line-clamp-2 leading-tight"
            >
              {{ stat.label }}
            </div>
            <div
              class="text-2xl font-black text-slate-800 dark:text-white mt-0.5 truncate"
            >
              {{ stat.value }}
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Filter & Search Toolbar -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xs"
      >
        <div class="flex items-center gap-3 flex-1 min-w-[280px]">
          <div class="relative flex-1 max-w-md group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search reason or leave type..."
              class="w-full !pl-11 !pr-10 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 focus:!ring-2 focus:!ring-indigo-500/20"
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
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1"
            >Status:</span
          >
          <button
            v-for="st in ['All', 'Pending', 'Approved', 'Rejected']"
            :key="st"
            type="button"
            @click="selectedFilterStatus = st"
            class="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            :class="[
              selectedFilterStatus === st
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
            ]"
          >
            {{ st }}
          </button>
        </div>
      </div>
    </Motion>

    <!-- History Table -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.25 }"
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div
        class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <h3
            class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider"
          >
            Leave Application History
          </h3>
        </div>
        <span
          class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
        >
          Total {{ totalLeaves }} Requests
        </span>
      </div>

      <DataTable
        :value="leaves"
        :loading="loading"
        class="p-datatable-overhaul"
        :pt="{
          wrapper: { class: '!bg-transparent' },
          footer: { class: '!bg-transparent' },
          footerRow: { class: '!bg-transparent' },
          footerCell: { class: '!bg-transparent !p-0 !border-none' },
        }"
      >
        <Column header="Type & Duration">
          <template #body="slotProps">
            <div class="space-y-1">
              <Tag
                :value="slotProps.data.leave_type_name || slotProps.data.type || 'Leave'"
                class="!rounded-lg !px-2 !py-0.5 !text-[10px] !font-bold !bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400"
              />
              <div
                class="text-sm font-black text-slate-700 dark:text-slate-300 ml-1"
              >
                {{ slotProps.data.total_days }} DAYS
              </div>
            </div>
          </template>
        </Column>

        <Column header="Date Range">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >Start</span
                >
                <span
                  class="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >{{ formatDate(slotProps.data.start_date) }}</span
                >
              </div>
              <i
                class="bi bi-arrow-right text-slate-300 dark:text-slate-600 text-xs"
              ></i>
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >End</span
                >
                <span
                  class="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >{{ formatDate(slotProps.data.end_date) }}</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column header="Reason">
          <template #body="slotProps">
            <div class="max-w-xs">
              <p
                class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate"
                :title="slotProps.data.reason"
              >
                {{ slotProps.data.reason }}
              </p>
              <div
                v-if="slotProps.data.rejection_reason"
                class="mt-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1"
              >
                <i class="bi bi-x-circle"></i>
                {{ slotProps.data.rejection_reason }}
              </div>
            </div>
          </template>
        </Column>

        <Column header="Status">
          <template #body="slotProps">
            <Tag
              :value="statusLabel(slotProps.data.status)"
              class="!rounded-lg !px-3 !py-1 !text-[10px] !font-bold flex items-center gap-1.5"
              :class="statusClass(slotProps.data.status)"
            >
              <template #icon>
                <i :class="statusIcon(slotProps.data.status)"></i>
              </template>
            </Tag>
          </template>
        </Column>

        <template #empty>
          <div
            class="flex flex-col items-center justify-center py-16 px-6 text-center"
          >
            <div
              class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-3xl text-indigo-500 mb-3 shadow-inner"
            >
              <i class="bi bi-calendar2-check"></i>
            </div>
            <h3
              class="text-base font-black text-slate-800 dark:text-white mb-1"
            >
              No Leave Requests Found
            </h3>
            <p
              class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-4"
            >
              {{
                searchQuery || selectedFilterStatus !== "All"
                  ? "No request records match your active filters."
                  : "You have not submitted any leave requests yet."
              }}
            </p>
            <Button
              v-if="searchQuery || selectedFilterStatus !== 'All'"
              label="Reset Filters"
              icon="bi bi-arrow-counterclockwise"
              class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 !border-none !text-[10px] !font-black !uppercase !tracking-widest"
              @click="resetFilters"
            />
          </div>
        </template>
      </DataTable>

      <!-- Table Pagination -->
      <div
        v-if="totalLeaves > itemsPerPage"
        class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-3"
      >
        <div class="text-xs font-bold text-slate-400">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalLeaves) }} of {{ totalLeaves }}
        </div>
        <Paginator
          :rows="itemsPerPage"
          :totalRecords="totalLeaves"
          :first="(currentPage - 1) * itemsPerPage"
          template="PrevPageLink PageLinks NextPageLink"
          @page="(e) => (currentPage = e.page + 1)"
          class="!bg-transparent !p-0"
        />
      </div>
    </Motion>

    <!-- Request Leave Dialog -->
    <Dialog
      v-model:visible="createModalOpen"
      modal
      header="Apply Leave Request"
      :style="{ width: '38rem' }"
      :pt="{
        root: {
          class:
            '!rounded-2xl !border !border-slate-100 dark:!border-slate-800 !shadow-2xl overflow-hidden !bg-white dark:!bg-slate-900',
        },
        header: {
          class:
            'px-8 pt-8 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:!text-white',
        },
        content: { class: 'px-8 py-6 !bg-transparent' },
        footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
      }"
    >
      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Leave Type <span class="text-rose-500">*</span></label
            >
            <Select
              v-model="createForm.leave_type_id"
              @change="formErrors.leave_type_id = ''"
              :options="leaveTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Type"
              class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !text-slate-800 dark:!text-slate-200 transition-all"
              :class="[
                formErrors.leave_type_id
                  ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                  : '!border-none',
              ]"
            />
            <small
              v-if="formErrors.leave_type_id"
              class="text-rose-500 text-xs mt-1 ml-1 block"
              >{{ formErrors.leave_type_id }}</small
            >
          </div>
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Total Days</label
            >
            <div
              class="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-black text-center text-sm"
            >
              {{ dateRangeInfo.workingDays }} DAYS
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Date / Date Range <span class="text-rose-500">*</span></label
          >
          <DatePicker
            v-model="createForm.date_range"
            @update:model-value="formErrors.date_range = ''"
            selectionMode="range"
            dateFormat="yy-mm-dd"
            placeholder="Select single date or date range"
            class="w-full"
            :inputClass="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !text-slate-800 dark:!text-white transition-all',
              formErrors.date_range
                ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                : '!border-none',
            ]"
          />

          <!-- Info banner for working days & off-days -->
          <div
            v-if="dateRangeInfo.calendarDays > 0"
            class="p-3 rounded-xl text-xs font-bold border transition-all mt-2"
            :class="[
              dateRangeInfo.workingDays > 0
                ? 'bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
            ]"
          >
            <div class="flex items-center gap-2.5">
              <i
                class="bi text-sm mt-0.5"
                :class="dateRangeInfo.workingDays > 0 ? 'bi-info-circle-fill text-indigo-500' : 'bi-exclamation-triangle-fill text-rose-500'"
              ></i>
              <div>
                <div>
                  <span class="font-black">{{ dateRangeInfo.calendarDays }} Calendar Days</span>:
                  <span class="font-black text-emerald-600 dark:text-emerald-400"> {{ dateRangeInfo.workingDays }} Work Days </span>
                  <span v-if="dateRangeInfo.offDays + dateRangeInfo.holidayDays > 0" class="text-slate-500 dark:text-slate-400">
                    ({{ dateRangeInfo.offDays + dateRangeInfo.holidayDays }} holidays / off-days automatically skipped)
                  </span>
                </div>
                <div v-if="dateRangeInfo.holidayNames.length > 0" class="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                  Public Holidays: {{ dateRangeInfo.holidayNames.join(', ') }}
                </div>
                <div v-if="dateRangeInfo.workingDays === 0" class="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  All selected dates are holidays / off-days. Cannot submit leave request.
                </div>
              </div>
            </div>
          </div>

          <small
            v-if="formErrors.date_range"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.date_range }}</small
          >
        </div>

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Reason for Request <span class="text-rose-500">*</span></label
          >
          <Textarea
            v-model="createForm.reason"
            @input="formErrors.reason = ''"
            rows="3"
            placeholder="Briefly explain your leave reason..."
            class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !p-4 !text-slate-800 dark:!text-white !placeholder:text-slate-400 dark:placeholder:!text-slate-500 transition-all"
            :class="[
              formErrors.reason
                ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                : '!border-none',
            ]"
          />
          <small
            v-if="formErrors.reason"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.reason }}</small
          >
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button
            label="Cancel"
            text
            severity="secondary"
            @click="createModalOpen = false"
            class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest dark:!text-slate-400"
          />
          <Button
            label="Submit Request"
            :loading="submitting"
            @click="handleCreate"
            class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useNotificationStore } from "~/stores/notification";
import { useWorkSchedule } from "~/composables/useWorkSchedule";
import { useHolidays } from "~/composables/useHolidays";
import { useLeaveRequests } from "~/composables/useLeaveRequests";

definePageMeta({ layout: "default" });

const notificationStore = useNotificationStore();
const { $axios } = useNuxtApp();
const { schedules: workSchedules, fetchWorkSchedules } = useWorkSchedule();
const { holidays: allHolidays, fetchHolidays } = useHolidays();
const { leaveTypes, fetchLeaveTypes } = useLeaveRequests();

const loading = ref(false);
const submitting = ref(false);
const createModalOpen = ref(false);
const leaves = ref<any[]>([]);
const searchQuery = ref("");
const selectedFilterStatus = ref("All");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalLeaves = ref(0);

const serverStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  used_annual: 0,
  annual_balance: 12,
});

const leaveTypeOptions = computed(() => {
  return leaveTypes.value.map((lt) => ({
    label: `${lt.name} (max. ${lt.max_days} days)`,
    value: lt.id,
  }));
});

const createForm = reactive({
  leave_type_id: null as number | null,
  date_range: null as Date[] | null,
  reason: "",
});

const formErrors = reactive({
  leave_type_id: "",
  date_range: "",
  reason: "",
});

const openRequestModal = () => {
  formErrors.leave_type_id = "";
  formErrors.date_range = "";
  formErrors.reason = "";
  createForm.leave_type_id = null;
  createForm.date_range = null;
  createForm.reason = "";
  createModalOpen.value = true;
};

// Calculate requested work days and off days matching admin
const dateRangeInfo = computed(() => {
  const range = createForm.date_range;
  if (!range || !range[0]) {
    return {
      calendarDays: 0,
      workingDays: 0,
      offDays: 0,
      holidayDays: 0,
      holidayNames: [] as string[],
    };
  }

  const start = new Date(range[0]);
  const end = range[1] ? new Date(range[1]) : new Date(range[0]);
  if (end < start) {
    return {
      calendarDays: 0,
      workingDays: 0,
      offDays: 0,
      holidayDays: 0,
      holidayNames: [] as string[],
    };
  }

  const scheduleMap = new Map<number, boolean>();
  workSchedules.value.forEach((s) => {
    scheduleMap.set(s.day_of_week, s.is_work_day);
  });

  const holidayMap = new Map<string, string>();
  allHolidays.value.forEach((h) => {
    holidayMap.set(h.date, h.name);
  });

  let calendarDays = 0;
  let workingDays = 0;
  let offDays = 0;
  let holidayDays = 0;
  const holidayNames: string[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    calendarDays++;
    const dayOfWeek = cur.getDay();
    const isWeeklyWorkDay = scheduleMap.has(dayOfWeek)
      ? scheduleMap.get(dayOfWeek)!
      : dayOfWeek !== 0 && dayOfWeek !== 6;

    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    const curDateStr = `${y}-${m}-${d}`;

    const holidayName = holidayMap.get(curDateStr);

    if (!isWeeklyWorkDay) {
      offDays++;
    } else if (holidayName) {
      holidayDays++;
      if (!holidayNames.includes(holidayName)) {
        holidayNames.push(holidayName);
      }
    } else {
      workingDays++;
    }

    cur.setDate(cur.getDate() + 1);
  }

  return {
    calendarDays,
    workingDays,
    offDays,
    holidayDays,
    holidayNames,
  };
});

// Leave Quick Stats from Server
const leaveStats = computed(() => {
  return [
    {
      label: "Annual Leave Balance",
      value: `${serverStats.value.annual_balance} Days`,
      icon: "bi bi-calendar-heart-fill",
      color:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Pending Approval",
      value: serverStats.value.pending,
      icon: "bi bi-hourglass-split",
      color:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Approved Leaves",
      value: serverStats.value.approved,
      icon: "bi bi-check-circle-fill",
      color:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Rejected Requests",
      value: serverStats.value.rejected,
      icon: "bi bi-x-circle-fill",
      color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];
});

// Watchers for Server-side Filtering & Pagination
const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);
let isMounted = false;

watch(debouncedSearchQuery, () => {
  if (!isMounted) return;
  currentPage.value = 1;
  fetchLeaves();
});

watch(selectedFilterStatus, () => {
  if (!isMounted) return;
  currentPage.value = 1;
  fetchLeaves();
});

watch(currentPage, () => {
  if (!isMounted) return;
  fetchLeaves();
});

const resetFilters = () => {
  searchQuery.value = "";
  selectedFilterStatus.value = "All";
  currentPage.value = 1;
  fetchLeaves();
};

const statusLabel = (status: string) => {
  switch (status) {
    case "Approved":
      return "Approved";
    case "Rejected":
      return "Rejected";
    default:
      return "Pending";
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case "Approved":
      return "!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border !border-emerald-200 dark:!border-emerald-500/20";
    case "Rejected":
      return "!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !border !border-rose-200 dark:!border-rose-500/20";
    default:
      return "!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border !border-amber-200 dark:!border-amber-500/20";
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case "Approved":
      return "bi bi-check-circle-fill";
    case "Rejected":
      return "bi bi-x-circle-fill";
  }
  return "bi bi-clock-history";
};

const validateForm = () => {
  let valid = true;
  formErrors.leave_type_id = "";
  formErrors.date_range = "";
  formErrors.reason = "";

  if (!createForm.leave_type_id) {
    formErrors.leave_type_id = "Leave type must be selected";
    valid = false;
  }
  if (!createForm.date_range || !createForm.date_range[0]) {
    formErrors.date_range = "Date selection is required";
    valid = false;
  } else if (dateRangeInfo.value.workingDays <= 0) {
    formErrors.date_range =
      "Selected dates are all holidays / off-days (0 work days)";
    valid = false;
  }
  if (!createForm.reason || createForm.reason.trim().length === 0) {
    formErrors.reason = "Reason cannot be empty";
    valid = false;
  }
  return valid;
};

const fetchLeaves = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      limit: itemsPerPage.value,
      offset: (currentPage.value - 1) * itemsPerPage.value,
    };
    if (selectedFilterStatus.value && selectedFilterStatus.value !== "All") {
      params.status = selectedFilterStatus.value;
    }
    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    const res = await $axios.get("/api/employee/leaves", { params });
    const data = res.data?.data || res.data || {};
    leaves.value = data.leaves || [];
    totalLeaves.value = data.pagination?.total || 0;
    if (data.stats) {
      serverStats.value = data.stats;
    }
  } catch (error) {
    console.error("Failed to fetch leaves", error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  try {
    const range = createForm.date_range!;
    const start = new Date(range[0]);
    const end = range[1] ? new Date(range[1]) : new Date(range[0]);

    const formatDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      leave_type_id: createForm.leave_type_id,
      start_date: formatDateStr(start),
      end_date: formatDateStr(end),
      total_days: dateRangeInfo.value.workingDays,
      reason: createForm.reason.trim(),
    };

    await $axios.post("/api/employee/leaves", payload);

    notificationStore.showSuccess(
      "Success",
      "Leave request submitted successfully",
    );
    createModalOpen.value = false;

    await fetchLeaves();
  } catch (error: any) {
    console.error("Failed to submit leave", error);
    const errorMsg =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      "An error occurred while submitting leave request";
    notificationStore.showError("Failed", errorMsg);
  } finally {
    submitting.value = false;
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

onMounted(async () => {
  await Promise.all([
    fetchLeaves(),
    fetchLeaveTypes(),
    fetchWorkSchedules(),
    fetchHolidays(),
  ]);
  isMounted = true;
});
</script>
