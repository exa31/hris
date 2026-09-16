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
            >Audit Trail & Security Telemetry</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          System Activity Logs
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Forensic audit trail of all user interactions, authentications, and data mutations across Nexus.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, scale: 0.95 }" :animate="{ opacity: 1, scale: 1 }">
        <Button
          label="Refresh Logs"
          icon="bi bi-arrow-clockwise"
          class="!rounded-xl !px-6 !py-3.5 !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 !text-slate-700 dark:!text-slate-200 !font-black !uppercase !text-[10px] !tracking-widest shadow-xs hover:!bg-slate-50 dark:hover:!bg-slate-700 transition-colors"
          @click="fetchLogs"
          :loading="loading"
        />
      </Motion>
    </div>

    <!-- Quick Telemetry Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Motion
        v-for="(st, idx) in auditStats"
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

    <!-- Filters & Search Toolbar -->
    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3 flex-1 min-w-[260px]">
          <div class="relative flex-1 max-w-md group">
            <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search user, module, or activity description..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 focus:!ring-2 focus:!ring-indigo-500/20"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Action:</span>
          <button
            v-for="act in ['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']"
            :key="act"
            type="button"
            @click="selectedActionFilter = act"
            class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            :class="[
              selectedActionFilter === act
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            {{ act }}
          </button>
        </div>
      </div>
    </Motion>

    <!-- Table Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.25 }"
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <DataTable
        :value="filteredLogs"
        class="p-datatable-overhaul"
        :loading="loading"
        :rows="pagination.limit"
        :pt="{
          wrapper: { class: '!bg-transparent' },
          footer: { class: '!bg-transparent' },
          footerRow: { class: '!bg-transparent' },
          footerCell: { class: '!bg-transparent !p-0 !border-none' },
        }"
      >
        <Column header="Timestamp">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs"
              >
                <i class="bi bi-clock-history"></i>
              </div>
              <div>
                <div class="text-xs font-black text-slate-700 dark:text-slate-200">
                  {{ formatDate(slotProps.data.created_at) }}
                </div>
                <div
                  class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-tight"
                >
                  {{ formatTime(slotProps.data.created_at) }} UTC+7
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column header="User / Operator">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <Avatar
                :label="slotProps.data.user_name?.charAt(0).toUpperCase() || 'U'"
                shape="circle"
                class="!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !font-black !w-8 !h-8 !text-xs"
              />
              <div>
                <div class="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">
                  {{ slotProps.data.user_name || "System" }}
                </div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                  @{{ slotProps.data.username || "system" }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Action & Module">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <Tag
                :value="slotProps.data.action"
                class="!rounded-lg !px-2.5 !py-0.5 !text-[9px] !font-black !w-fit !uppercase !tracking-wider"
                :class="getActionClass(slotProps.data.action)"
              />
              <span
                class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                >{{ slotProps.data.module }}</span
              >
            </div>
          </template>
        </Column>

        <Column header="Activity Description">
          <template #body="slotProps">
            <div class="max-w-md">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed truncate" :title="slotProps.data.description">
                {{ slotProps.data.description }}
              </p>
              <div
                v-if="slotProps.data.metadata?.ip"
                class="mt-0.5 flex items-center gap-1.5"
              >
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase"
                  >IP: {{ slotProps.data.metadata.ip }}</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column header="Details" class="!text-right">
          <template #body="slotProps">
            <Button
              icon="bi bi-code-square"
              text
              severity="secondary"
              class="!w-8 !h-8 !rounded-xl !text-slate-400 dark:!text-slate-500 hover:!text-indigo-600 dark:hover:!text-indigo-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/10 transition-colors"
              v-tooltip.top="'Inspect Payload'"
              @click="openPayloadModal(slotProps.data)"
            />
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-3xl text-indigo-500 mb-3 shadow-inner">
              <i class="bi bi-shield-check"></i>
            </div>
            <h3 class="text-base font-black text-slate-800 dark:text-white mb-1">No Activity Logs Found</h3>
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-4">
              No activity history matches your search or active filters.
            </p>
            <Button
              v-if="searchQuery || selectedActionFilter !== 'All'"
              label="Reset Filters"
              icon="bi bi-arrow-counterclockwise"
              class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 !border-none !text-[10px] !font-black !uppercase !tracking-widest"
              @click="searchQuery = ''; selectedActionFilter = 'All'"
            />
          </div>
        </template>

        <template #footer>
          <div
            class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-4"
          >
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >Total {{ pagination.total }} Audit Records</span
            >
            <Paginator
              :first="pagination.offset"
              :rows="pagination.limit"
              :totalRecords="pagination.total"
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
      </DataTable>
    </Motion>

    <!-- Inspection Modal (Structured Payload Viewer) -->
    <Dialog
      v-model:visible="payloadModalOpen"
      modal
      class="w-full max-w-xl"
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
            <i class="bi bi-shield-lock-fill"></i>
          </div>
          <div>
            <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Audit Event Forensics
            </span>
            <h3 class="text-base font-black text-slate-800 dark:text-white tracking-tight leading-tight">
              Payload & Parameters Inspection
            </h3>
          </div>
        </div>
      </template>

      <div v-if="selectedLog" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase">Operator:</span>
            <div class="font-black text-slate-800 dark:text-slate-200">{{ selectedLog.user_name }} (@{{ selectedLog.username }})</div>
          </div>
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase">Transaction Time:</span>
            <div class="font-black text-slate-800 dark:text-slate-200">{{ formatDate(selectedLog.created_at) }} {{ formatTime(selectedLog.created_at) }} UTC+7</div>
          </div>
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase">Mutation Type:</span>
            <div>
              <Tag :value="selectedLog.action" :class="getActionClass(selectedLog.action)" class="!text-[9px] !font-black !px-2 !py-0.5" />
            </div>
          </div>
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase">Target Module:</span>
            <div class="font-black text-slate-800 dark:text-slate-200 uppercase">{{ selectedLog.module }}</div>
          </div>
        </div>

        <div class="space-y-1.5">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Description:</span>
          <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {{ selectedLog.description }}
          </div>
        </div>

        <div class="space-y-1.5" v-if="selectedLog.metadata">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Metadata & Payload Parameters (JSON):</span>
          <pre class="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800 custom-scrollbar">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end pt-2">
          <Button
            label="Close"
            severity="secondary"
            text
            @click="payloadModalOpen = false"
            class="!rounded-xl !px-6 !py-2.5 !font-bold !text-xs"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";

definePageMeta({ layout: "default" });

const { $axios } = useNuxtApp();

const logs = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedActionFilter = ref("All");

const payloadModalOpen = ref(false);
const selectedLog = ref<any>(null);

const openPayloadModal = (log: any) => {
  selectedLog.value = log;
  payloadModalOpen.value = true;
};

const pagination = reactive({
  limit: 15,
  offset: 0,
  total: 0,
});

const auditStats = computed(() => {
  const mutations = logs.value.filter(
    (l) => l.action === "CREATE" || l.action === "UPDATE" || l.action === "DELETE"
  ).length;
  const authEvents = logs.value.filter(
    (l) => l.action === "LOGIN" || l.action === "LOGOUT"
  ).length;

  return [
    {
      label: "Total Audit Records",
      value: pagination.total || logs.value.length,
      icon: "bi bi-journal-check",
      color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Data Mutations",
      value: mutations,
      icon: "bi bi-database-gear",
      color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Auth Sessions",
      value: authEvents,
      icon: "bi bi-shield-check",
      color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Realtime Audit",
      value: "Live",
      icon: "bi bi-activity",
      color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];
});

const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);

const filteredLogs = computed(() => {
  return logs.value.filter((l) => {
    const matchAction =
      selectedActionFilter.value === "All" ||
      l.action?.toUpperCase() === selectedActionFilter.value.toUpperCase();
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    const matchQuery =
      !query ||
      l.description?.toLowerCase().includes(query) ||
      l.user_name?.toLowerCase().includes(query) ||
      l.username?.toLowerCase().includes(query) ||
      l.module?.toLowerCase().includes(query);
    return matchAction && matchQuery;
  });
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await ($axios as any).get("/api/activity-logs", {
      params: {
        limit: pagination.limit,
        offset: pagination.offset,
      },
    });
    logs.value = res.data.rows || [];
    pagination.total = res.data.total || 0;
  } catch (e) {
    console.error("Failed to fetch logs:", e);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.offset = event.first;
  pagination.limit = event.rows;
  fetchLogs();
};

const getActionClass = (action: string) => {
  switch (action) {
    case "CREATE":
      return "!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border !border-emerald-100 dark:!border-emerald-500/20";
    case "UPDATE":
      return "!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border !border-amber-100 dark:!border-amber-500/20";
    case "DELETE":
      return "!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !border !border-rose-100 dark:!border-rose-500/20";
    case "LOGIN":
      return "!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-100 dark:!border-indigo-500/20";
    case "LOGOUT":
      return "!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400 !border !border-slate-200 dark:!border-slate-700";
    default:
      return "!bg-slate-50 dark:!bg-slate-800 !text-slate-400 dark:!text-slate-500";
  }
};

const monthNamesEn = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const parseRawTimestamp = (dateStr: string) => {
  const raw = String(dateStr || "").trim();
  if (!raw) return null;
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/,
  );
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: match[4],
    minute: match[5],
    second: Number(match[6] || "0"),
  };
};

const toWibDate = (dateStr: string) => {
  const parsed = parseRawTimestamp(dateStr);
  if (!parsed) return null;
  const utcMs = Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    Number(parsed.hour),
    Number(parsed.minute),
    parsed.second,
  );
  return new Date(utcMs + 7 * 60 * 60 * 1000);
};

const formatDate = (dateStr: string) => {
  const wibDate = toWibDate(dateStr);
  if (!wibDate) return dateStr || "-";
  return `${wibDate.getUTCDate()} ${monthNamesEn[wibDate.getUTCMonth()] || "-"} ${wibDate.getUTCFullYear()}`;
};

const formatTime = (dateStr: string) => {
  const wibDate = toWibDate(dateStr);
  if (!wibDate) return "-";
  const h = String(wibDate.getUTCHours()).padStart(2, "0");
  const m = String(wibDate.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

onMounted(fetchLogs);
</script>

<style>
.p-datatable-overhaul .p-datatable-thead > tr > th {
  @apply !bg-slate-50/80 dark:!bg-slate-800/80 !text-slate-400 dark:!text-slate-500 !text-[11px] !font-black !uppercase !tracking-[0.25em] !px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800;
}
.p-datatable-overhaul .p-datatable-tbody > tr > td {
  @apply !px-8 !py-5 !border-b !border-slate-50 dark:!border-slate-800 !bg-white dark:!bg-slate-900 transition-all duration-300;
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
