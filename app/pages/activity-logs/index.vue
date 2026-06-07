<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800"
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
            >System Logs</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Log Aktivitas
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Rekam jejak seluruh interaksi pengguna dalam ekosistem sistem.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <Button
          label="Segarkan Log"
          icon="bi bi-arrow-clockwise"
          class="!rounded-xl !px-6 !py-3 !bg-slate-50 dark:!bg-slate-800 !border-none !text-slate-600 dark:!text-slate-300 !font-black !uppercase !text-[10px] !tracking-widest hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
          @click="fetchLogs"
          :loading="loading"
        />
      </Motion>
    </div>

    <!-- Quick Stats -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 dark:shadow-none"
      >
        <i
          class="bi bi-activity absolute -right-8 -bottom-8 text-[12rem] opacity-10 rotate-12"
        ></i>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <div
              class="text-xs font-bold text-indigo-200 uppercase tracking-[0.2em] mb-1"
            >
              Status Keamanan
            </div>
            <div class="text-4xl font-black">
              {{ pagination.total }}
              <span class="text-lg font-medium text-indigo-100/60 ml-2"
                >Total Transaksi Log</span
              >
            </div>
          </div>
          <div class="hidden md:flex flex-col items-end">
            <span class="text-xs font-bold text-indigo-200 uppercase mb-2"
              >Live Monitoring</span
            >
            <div class="flex gap-1">
              <div
                v-for="i in 5"
                :key="i"
                class="w-1.5 h-6 bg-white/20 rounded-full animate-pulse"
                :style="{ animationDelay: i * 0.2 + 's' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Motion>

    <!-- Logs Table -->
    <Motion
      :initial="{ opacity: 0, scale: 0.98 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ delay: 0.3 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <DataTable :value="logs" class="p-datatable-premium" :loading="loading">
          <Column header="Waktu Kejadian">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center"
                >
                  <i class="bi bi-clock"></i>
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {{ formatDate(slotProps.data.created_at) }}
                  </div>
                  <div
                    class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter"
                  >
                    {{ formatTime(slotProps.data.created_at) }} WIB
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Pelaku Aktivitas">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.user_name?.charAt(0).toUpperCase()"
                  shape="circle"
                  class="!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !font-bold"
                />
                <div>
                  <div class="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {{ slotProps.data.user_name }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    @{{ slotProps.data.username }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Aksi & Modul">
            <template #body="slotProps">
              <div class="flex flex-col gap-1.5">
                <Tag
                  :value="slotProps.data.action"
                  class="!rounded-lg !px-3 !py-1 !text-[9px] !font-black !w-fit"
                  :class="getActionClass(slotProps.data.action)"
                />
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-widest"
                  >{{ slotProps.data.module }}</span
                >
              </div>
            </template>
          </Column>

          <Column header="Deskripsi Operasional">
            <template #body="slotProps">
              <div class="max-w-md">
                <p class="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  {{ slotProps.data.description }}
                </p>
                <div
                  v-if="slotProps.data.metadata?.ip"
                  class="mt-1 flex items-center gap-1.5"
                >
                  <span class="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase"
                    >IP: {{ slotProps.data.metadata.ip }}</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div class="relative mb-6">
                <div class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700">
                  <i class="bi bi-shield-slash text-4xl text-indigo-500"></i>
                </div>
                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg dark:shadow-none z-20">
                  <i class="bi bi-search text-xs"></i>
                </div>
              </div>
              <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Log Aktivitas Kosong</h3>
              <p class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8">
                Belum ada aktivitas yang tercatat di dalam sistem untuk periode ini.
              </p>
            </div>
          </template>

          <template #footer>
            <div
              class="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <span class="text-xs font-bold text-slate-400 dark:text-slate-500"
                >MENAMPILKAN {{ logs.length }} DARI
                {{ pagination.total }} DATA</span
              >
              <div class="flex items-center gap-2">
                <Button
                  icon="bi bi-chevron-left"
                  @click="prevPage"
                  :disabled="pagination.offset === 0"
                  text
                  rounded
                  size="small"
                  class="!bg-white dark:!bg-slate-800 shadow-sm dark:!text-slate-400"
                />
                <Button
                  icon="bi bi-chevron-right"
                  @click="nextPage"
                  :disabled="
                    pagination.offset + pagination.limit >= pagination.total
                  "
                  text
                  rounded
                  size="small"
                  class="!bg-white dark:!bg-slate-800 shadow-sm dark:!text-slate-400"
                />
              </div>
            </div>
          </template>
        </DataTable>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

const { $axios } = useNuxtApp();

const logs = ref<any[]>([]);
const loading = ref(true);
const pagination = reactive({
  limit: 15,
  offset: 0,
  total: 0,
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
    logs.value = res.data.rows;
    pagination.total = res.data.total;
  } catch (e) {
    console.error("Failed to fetch logs:", e);
  } finally {
    loading.value = false;
  }
};

const nextPage = () => {
  pagination.offset += pagination.limit;
  fetchLogs();
};

const prevPage = () => {
  if (pagination.offset >= pagination.limit) {
    pagination.offset -= pagination.limit;
    fetchLogs();
  }
};

const getActionClass = (action: string) => {
  switch (action) {
    case "CREATE":
      return "!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border-emerald-100 dark:!border-emerald-500/20";
    case "UPDATE":
      return "!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border-amber-100 dark:!border-amber-500/20";
    case "DELETE":
      return "!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !border-rose-100 dark:!border-rose-500/20";
    case "LOGIN":
      return "!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border-indigo-100 dark:!border-indigo-500/20";
    case "LOGOUT":
      return "!bg-slate-50 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400 !border-slate-100 dark:!border-slate-700";
    default:
      return "!bg-slate-50 dark:!bg-slate-800 !text-slate-400 dark:!text-slate-500";
  }
};

const monthNamesId = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
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
  return `${wibDate.getUTCDate()} ${monthNamesId[wibDate.getUTCMonth()] || "-"} ${wibDate.getUTCFullYear()}`;
};

const formatTime = (dateStr: string) => {
  const wibDate = toWibDate(dateStr);
  if (!wibDate) return "-";
  const h = String(wibDate.getUTCHours()).padStart(2, "0");
  const m = String(wibDate.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

onMounted(fetchLogs);

definePageMeta({ layout: "default" });
</script>
