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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Motion
        v-for="(stat, idx) in leaveStats"
        :key="stat.label"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.08 }"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
        >
          <div
            :class="[
              stat.color,
              'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs',
            ]"
          >
            <i :class="stat.icon"></i>
          </div>
          <div>
            <div
              class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >
              {{ stat.label }}
            </div>
            <div
              class="text-2xl font-black text-slate-800 dark:text-white mt-0.5"
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
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 focus:!ring-2 focus:!ring-indigo-500/20"
            />
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
          Total {{ filteredLeaves.length }} Requests
        </span>
      </div>

      <DataTable
        :value="filteredLeaves"
        :loading="loading"
        class="p-datatable-overhaul"
        :pt="{
          wrapper: { class: '!bg-transparent' },
          footer: { class: '!bg-transparent' },
          footerRow: { class: '!bg-transparent' },
          footerCell: { class: '!bg-transparent !p-0 !border-none' },
        }"
      >
        <Column header="Leave Type">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold"
              >
                <i :class="getLeaveTypeIcon(slotProps.data.type)"></i>
              </div>
              <div>
                <div class="font-black text-sm text-slate-800 dark:text-white">
                  {{ slotProps.data.type }}
                </div>
                <span
                  class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >
                  ID: #LV-{{ slotProps.data.id }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Date Range">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-400 uppercase"
                  >Start</span
                >
                <span
                  class="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  {{ formatDate(slotProps.data.start_date) }}
                </span>
              </div>
              <i
                class="bi bi-arrow-right text-slate-300 dark:text-slate-600 text-xs"
              ></i>
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-400 uppercase"
                  >End</span
                >
                <span
                  class="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  {{ formatDate(slotProps.data.end_date) }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Reason">
          <template #body="slotProps">
            <div class="max-w-xs">
              <p
                class="text-xs font-medium text-slate-600 dark:text-slate-300 truncate"
                :title="slotProps.data.reason"
              >
                {{ slotProps.data.reason }}
              </p>
              <div
                v-if="slotProps.data.rejection_reason"
                class="mt-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit"
              >
                <i class="bi bi-info-circle-fill"></i>
                Note: {{ slotProps.data.rejection_reason }}
              </div>
            </div>
          </template>
        </Column>

        <Column header="Application Status">
          <template #body="slotProps">
            <Tag
              :value="statusLabel(slotProps.data.status)"
              class="!rounded-lg !px-3 !py-1 !text-[10px] !font-black !uppercase !tracking-wider flex items-center gap-1.5 w-fit"
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
              @click="
                searchQuery = '';
                selectedFilterStatus = 'All';
              "
            />
          </div>
        </template>
      </DataTable>
    </Motion>

    <!-- Request Leave Dialog (PrimeVue 4 Form Components) -->
    <Dialog
      v-model:visible="showRequestModal"
      modal
      header="Self-Service Leave Request Form"
      class="w-full max-w-lg"
      :pt="{
        root: {
          class:
            '!rounded-3xl !border !border-slate-100 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !shadow-2xl overflow-hidden',
        },
        header: {
          class:
            'px-7 pt-7 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:!text-white',
        },
        content: { class: 'px-7 py-6 !bg-transparent' },
        footer: { class: 'px-7 pb-7 pt-2 !bg-transparent !border-none' },
      }"
    >
      <form @submit.prevent="submitRequest" class="space-y-5">
        <!-- Tipe Cuti Select -->
        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
          >
            Leave Type <span class="text-rose-500">*</span>
          </label>
          <Select
            v-model="form.type"
            :options="leaveTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Leave Type"
            class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/80 !border-none !text-xs !font-bold !text-slate-800 dark:!text-slate-200"
            :class="{ '!ring-2 !ring-rose-500/20': errors.type }"
          />
          <small
            v-if="errors.type"
            class="text-[10px] font-black text-rose-500 ml-1 flex items-center gap-1"
          >
            <i class="bi bi-exclamation-circle"></i> {{ errors.type }}
          </small>
        </div>

        <!-- Date Pickers Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >
              Start Date <span class="text-rose-500">*</span>
            </label>
            <DatePicker
              v-model="form.start_date"
              dateFormat="yy-mm-dd"
              placeholder="Select Date"
              showIcon
              iconDisplay="input"
              class="w-full"
              inputClass="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/80 !border-none !text-xs !font-bold !py-3 !text-slate-800 dark:!text-slate-200"
            />
            <small
              v-if="errors.start_date"
              class="text-[10px] font-black text-rose-500 ml-1 flex items-center gap-1"
            >
              <i class="bi bi-exclamation-circle"></i> {{ errors.start_date }}
            </small>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >
              End Date <span class="text-rose-500">*</span>
            </label>
            <DatePicker
              v-model="form.end_date"
              dateFormat="yy-mm-dd"
              :minDate="form.start_date || undefined"
              placeholder="Select Date"
              showIcon
              iconDisplay="input"
              class="w-full"
              inputClass="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/80 !border-none !text-xs !font-bold !py-3 !text-slate-800 dark:!text-slate-200"
            />
            <small
              v-if="errors.end_date"
              class="text-[10px] font-black text-rose-500 ml-1 flex items-center gap-1"
            >
              <i class="bi bi-exclamation-circle"></i> {{ errors.end_date }}
            </small>
          </div>
        </div>

        <!-- Duration calculation preview -->
        <div
          v-if="calculatedDays > 0"
          class="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <i
              class="bi bi-clock-history text-indigo-600 dark:text-indigo-400"
            ></i>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300"
              >Estimated Duration:</span
            >
          </div>
          <span class="text-xs font-black text-indigo-600 dark:text-indigo-400"
            >{{ calculatedDays }} Days</span
          >
        </div>

        <!-- Reason Input -->
        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
          >
            Reason for Request <span class="text-rose-500">*</span>
          </label>
          <Textarea
            v-model="form.reason"
            rows="3"
            placeholder="Briefly explain the reason for your time-off request..."
            class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/80 !border-none !text-xs !font-medium !p-3 !text-slate-800 dark:!text-slate-200 resize-none focus:!ring-2 focus:!ring-indigo-500/20"
            :class="{ '!ring-2 !ring-rose-500/20': errors.reason }"
          />
          <div class="flex items-center justify-between">
            <small
              v-if="errors.reason"
              class="text-[10px] font-black text-rose-500 ml-1 flex items-center gap-1"
            >
              <i class="bi bi-exclamation-circle"></i> {{ errors.reason }}
            </small>
            <span v-else class="text-[9px] font-medium text-slate-400 ml-1"
              >Min. 5 characters</span
            >
            <span class="text-[9px] font-bold text-slate-400"
              >{{ form.reason.length }} characters</span
            >
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800"
        >
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            text
            @click="showRequestModal = false"
            class="!rounded-xl !px-5 !py-2.5 !font-bold !text-xs"
          />
          <Button
            type="submit"
            label="Submit Request"
            icon="bi bi-send-fill"
            :loading="submitting"
            class="!rounded-xl !px-6 !py-2.5 !bg-indigo-600 hover:!bg-indigo-700 !border-none !font-black !text-xs !tracking-widest shadow-md shadow-indigo-100 dark:shadow-none"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNotificationStore } from "~/stores/notification";

definePageMeta({ layout: "default" });

const notificationStore = useNotificationStore();

const loading = ref(false);
const submitting = ref(false);
const showRequestModal = ref(false);
const leaves = ref<any[]>([]);
const searchQuery = ref("");
const selectedFilterStatus = ref("All");

const leaveTypeOptions = [
  { label: "Annual Leave", value: "Tahunan" },
  { label: "Sick Leave", value: "Sakit" },
  { label: "Maternity Leave", value: "Melahirkan" },
  { label: "Urgent Personal Leave", value: "Penting" },
  { label: "Other Leave", value: "Lainnya" },
];

const errors = ref<any>({});

const form = ref<{
  type: string;
  start_date: Date | null;
  end_date: Date | null;
  reason: string;
}>({
  type: "",
  start_date: null,
  end_date: null,
  reason: "",
});

const openRequestModal = () => {
  errors.value = {};
  form.value = {
    type: "",
    start_date: null,
    end_date: null,
    reason: "",
  };
  showRequestModal.value = true;
};

// Calculate requested days
const calculatedDays = computed(() => {
  if (!form.value.start_date || !form.value.end_date) return 0;
  const start = new Date(form.value.start_date).getTime();
  const end = new Date(form.value.end_date).getTime();
  if (end < start) return 0;
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
});

// Leave Quick Stats
const leaveStats = computed(() => {
  const approved = leaves.value.filter((l) => l.status === "Approved").length;
  const pending = leaves.value.filter((l) => l.status === "Pending").length;
  const rejected = leaves.value.filter((l) => l.status === "Rejected").length;
  // Standard annual allowance is 12 days minus approved annual leaves
  const usedAnnual = leaves.value
    .filter((l) => l.status === "Approved" && l.type === "Tahunan")
    .reduce((acc, curr) => acc + (curr.total_days || 1), 0);
  const remainingAnnual = Math.max(0, 12 - usedAnnual);

  return [
    {
      label: "Annual Leave Balance",
      value: `${remainingAnnual} Days`,
      icon: "bi bi-calendar-heart-fill",
      color:
        "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Pending Approval",
      value: pending,
      icon: "bi bi-hourglass-split",
      color:
        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Approved Leaves",
      value: approved,
      icon: "bi bi-check-circle-fill",
      color:
        "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Rejected Requests",
      value: rejected,
      icon: "bi bi-x-circle-fill",
      color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];
});

// Filtered Leaves List
const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);

const filteredLeaves = computed(() => {
  return leaves.value.filter((leave) => {
    const matchStatus =
      selectedFilterStatus.value === "All" ||
      leave.status?.toLowerCase() === selectedFilterStatus.value.toLowerCase();
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    const matchQuery =
      !query ||
      leave.reason?.toLowerCase().includes(query) ||
      leave.type?.toLowerCase().includes(query);
    return matchStatus && matchQuery;
  });
});

const getLeaveTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "sakit":
      return "bi-bandaid-fill";
    case "melahirkan":
      return "bi-heart-pulse-fill";
    case "penting":
      return "bi-exclamation-octagon-fill";
    default:
      return "bi-briefcase-fill";
  }
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
    default:
      return "bi bi-clock-history";
  }
};

const validateForm = () => {
  errors.value = {};
  if (!form.value.type) errors.value.type = "Leave type is required";
  if (!form.value.start_date)
    errors.value.start_date = "Start date is required";
  if (!form.value.end_date) errors.value.end_date = "End date is required";
  if (
    form.value.start_date &&
    form.value.end_date &&
    form.value.end_date < form.value.start_date
  ) {
    errors.value.end_date = "End date cannot be earlier than start date";
  }
  if (!form.value.reason || form.value.reason.length < 5) {
    errors.value.reason = "Reason is required (min. 5 characters)";
  }
  return Object.keys(errors.value).length === 0;
};

const fetchLeaves = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>("/api/employee/leaves");
    leaves.value = res.data.leaves || [];
  } catch (error) {
    console.error("Failed to fetch leaves", error);
  } finally {
    loading.value = false;
  }
};

const submitRequest = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  try {
    const formatPayloadDate = (d: Date | null) => {
      if (!d) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    await $fetch("/api/employee/leaves", {
      method: "POST",
      body: {
        type: form.value.type,
        start_date: formatPayloadDate(form.value.start_date),
        end_date: formatPayloadDate(form.value.end_date),
        reason: form.value.reason,
      },
    });

    notificationStore.showSuccess(
      "Success",
      "Leave request successfully submitted for approval",
    );
    showRequestModal.value = false;

    // Reset form
    form.value = {
      type: "",
      start_date: null,
      end_date: null,
      reason: "",
    };

    await fetchLeaves();
  } catch (error) {
    console.error("Failed to submit leave", error);
    notificationStore.showError(
      "Failed",
      "An error occurred while submitting leave request",
    );
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

onMounted(() => {
  fetchLeaves();
});
</script>
