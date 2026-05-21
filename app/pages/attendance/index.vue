<template>
  <div class="space-y-12">
    <!-- Header Section -->
    <div
      class="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between"
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
            >Attendance Monitoring</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Presensi Tim Nexus
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Pantau kedisiplinan dan riwayat kehadiran harian pegawai.
        </p>
      </Motion>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
        <div
          class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-1"
        >
          <div
            class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
          >
            Hadir Hari Ini
          </div>
          <div class="text-xl font-black text-emerald-500">
            {{ summaryLoading ? "..." : todayStats.hadir_percent + "%" }}
          </div>
        </div>
        <div
          class="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-1"
        >
          <div
            class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
          >
            Total Hadir
          </div>
          <div class="text-xl font-black text-amber-500">
            {{ summaryLoading ? "..." : todayStats.hadir + "/" + todayStats.total_active }}
          </div>
        </div>
        <div
          class="p-5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none text-center space-y-1 text-white hidden md:block"
        >
          <div
            class="text-[9px] font-black text-indigo-200 uppercase tracking-widest"
          >
            Total Data
          </div>
          <div class="text-xl font-black">{{ totalAttendances }}</div>
        </div>
      </div>
    </div>

    <!-- Filters & Actions -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-4 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pencarian</label>
          <div class="relative group">
            <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Cari Nama / NIP..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !text-xs !font-bold dark:text-white"
            />
          </div>
        </div>

        <div class="md:col-span-2 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Bulan</label>
          <Select
            v-model="selectedMonth"
            :options="monthOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none"
          />
        </div>

        <div class="md:col-span-2 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tahun</label>
          <Select
            v-model="selectedYear"
            :options="yearOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none"
          />
        </div>

        <div class="md:col-span-2 space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none"
          />
        </div>

        <div class="md:col-span-2">
          <Button
            icon="bi bi-download"
            label="Export"
            class="!rounded-xl !h-[46px] !w-full !bg-white dark:!bg-slate-800 !text-indigo-600 dark:!text-indigo-400 border border-indigo-100 dark:border-slate-700 !font-black !uppercase !text-[10px] !tracking-widest shadow-sm hover:!bg-indigo-50 dark:hover:!bg-slate-700"
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
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <DataTable
        :value="attendances"
        class="p-datatable-overhaul"
        :loading="loading"
        :rows="itemsPerPage"
      >
        <Column header="Anggota Tim">
          <template #body="slotProps">
            <div class="flex items-center gap-4">
              <Avatar
                :image="
                  slotProps.data.photo_url ||
                  'https://ui-avatars.com/api/?name=' +
                    slotProps.data.name +
                    '&background=random&size=100'
                "
                shape="circle"
                class="!w-10 !h-10 border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-slate-100 dark:ring-slate-700"
              />
              <div class="flex flex-col">
                <span
                  class="text-sm font-black text-slate-800 dark:text-white leading-tight"
                  >{{ slotProps.data.name }}</span
                >
                <span
                  class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >{{ slotProps.data.nip }}</span
                >
              </div>
            </div>
          </template>
        </Column>

        <Column header="Jadwal & Kedatangan">
          <template #body="slotProps">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <i class="bi bi-clock-fill text-indigo-500 text-[10px]"></i>
                <span
                  class="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter"
                  >{{ slotProps.data.time_in }}</span
                >
              </div>
              <span
                class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >{{ formatDate(slotProps.data.date) }}</span
              >
            </div>
          </template>
        </Column>

        <Column header="Status Check-in">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  slotProps.data.status === 'Hadir'
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                    : 'bg-rose-500 shadow-lg shadow-rose-200',
                ]"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="
                  slotProps.data.status === 'Hadir'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ slotProps.data.status }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Lokasi Presensi">
          <template #body="slotProps">
            <div
              class="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit"
            >
              <i class="bi bi-geo-alt-fill text-indigo-400 text-[10px]"></i>
              <span
                class="text-[10px] font-bold text-slate-500 dark:text-slate-400"
                >{{ slotProps.data.location || "Kantor Pusat" }}</span
              >
            </div>
          </template>
        </Column>

        <Column header="Action" class="!text-right">
          <template #body="slotProps">
            <Button
              icon="bi bi-info-circle"
              text
              severity="secondary"
              class="!rounded-xl !text-slate-400 dark:!text-slate-500 hover:!text-indigo-600"
            />
          </template>
        </Column>

        <template #footer>
          <div
            class="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50"
          >
            <span
              class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >Database Syncing Real-time</span
            >
            <Paginator
              :rows="itemsPerPage"
              :totalRecords="totalAttendances"
              template="PrevPageLink PageLinks NextPageLink"
              class="!bg-transparent !p-0"
              @page="onPageChange"
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
                class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg z-20"
              >
                <i class="bi bi-search text-xs"></i>
              </div>
            </div>
            <h3
              class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
            >
              Belum Ada Data Presensi
            </h3>
            <p
              class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8"
            >
              Sistem belum merekam aktivitas presensi yang sesuai dengan filter
              Anda.
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

const activeTab = ref("all");
const itemsPerPage = ref(10);
const summaryLoading = ref(false);
const todayStats = ref({ hadir: 0, total_active: 0, hadir_percent: 0 });

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
];

const currentYear = new Date().getFullYear();
const yearOptions = [
  { label: currentYear.toString(), value: currentYear },
  { label: (currentYear - 1).toString(), value: currentYear - 1 },
  { label: (currentYear - 2).toString(), value: currentYear - 2 },
];

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Hadir', value: 'Hadir' },
  { label: 'Izin', value: 'Izin' },
  { label: 'Sakit', value: 'Sakit' },
  { label: 'Alpha', value: 'Alpha' },
];

onMounted(() => {
  fetchAttendances();
  loadSummary();
});
watch([searchQuery, page, selectedStatus, selectedMonth, selectedYear], () => fetchAttendances());
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
</style>
