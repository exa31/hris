<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0}"
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
            >Allowance System</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Tunjangan Transport
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Kalkulasi otomatis tunjangan transport harian berdasarkan kehadiran riil & jarak tempuh.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <Button
          v-if="hasPermission('transport_setting', 'create')"
          label="Generate Tunjangan"
          icon="bi bi-lightning-charge"
          :loading="generating"
          class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          @click="openGenerateModal"
        />
      </Motion>
    </div>

    <!-- Quick Insights -->
    <div
      v-if="allowances.length > 0"
      class="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <Motion
        v-for="(insight, idx) in transportInsights"
        :key="insight.label"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.1 }"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all"
        >
          <div
            :class="[
              insight.bg,
              'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm',
            ]"
          >
            <i :class="insight.icon"></i>
          </div>
          <div>
            <div
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >
              {{ insight.label }}
            </div>
            <div class="text-2xl font-black text-slate-800 dark:text-white">
              {{ insight.value }}
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Filters -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div class="md:col-span-6 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Nama / NIP Pegawai</label
          >
          <span class="relative block group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              placeholder="Cari pegawai..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !text-xs !font-bold dark:!text-white"
            />
          </span>
        </div>

        <div class="md:col-span-4 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Periode Pembayaran</label
          >
          <div
            class="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border-none p-1"
          >
            <Select
              v-model="filterMonth"
              :options="monthOptions"
              optionLabel="label"
              optionValue="value"
              class="!flex-1 !bg-transparent !border-none !shadow-none !text-xs font-bold dark:!text-white"
            />
            <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <InputText
              v-model.number="filterYear"
              type="number"
              class="!w-20 !bg-transparent !border-none !shadow-none !text-xs font-bold !p-0 !text-center dark:!text-white"
            />
          </div>
        </div>

        <div class="md:col-span-2">
          <Button
            icon="bi bi-arrow-clockwise"
            severity="secondary"
            text
            class="!rounded-xl !h-[46px] !w-full !bg-slate-50 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
            @click="resetFilters"
            v-tooltip="'Reset Filter'"
          />
        </div>
      </div>
    </Motion>

    <!-- Table Section -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.3 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <DataTable
          :value="allowances"
          class="p-datatable-overhaul"
          :loading="loading"
          :pt="{
            footer: { class: '!bg-transparent' },
            footerRow: { class: '!bg-transparent' },
            footerCell: { class: '!bg-transparent !p-0 !border-none' },
          }"
        >
          <Column header="No." class="!w-20">
            <template #body="slotProps">
              <span class="text-slate-400 dark:text-slate-600 font-bold text-xs">{{
                (currentPage - 1) * itemsPerPage + slotProps.index + 1
              }}</span>
            </template>
          </Column>

          <Column header="Pegawai">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :image="
                    slotProps.data.photo_url ||
                    'https://ui-avatars.com/api/?name=' +
                      slotProps.data.employeeName +
                      '&background=random&size=40'
                  "
                  shape="circle"
                  class="shadow-sm"
                />
                <div>
                  <div
                    class="text-sm font-black text-slate-800 dark:text-white leading-tight"
                  >
                    {{ slotProps.data.employeeName }}
                  </div>
                  <div
                    class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >
                    NIP: {{ slotProps.data.nip }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Tipe Pegawai">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.employee_type"
                :severity="
                  slotProps.data.employee_type === 'Tetap'
                    ? 'success'
                    : 'secondary'
                "
                class="!rounded-lg !px-2.5 !py-1 !text-[9px] !font-black !uppercase"
              />
            </template>
          </Column>

          <Column header="Metrik Perhitungan" class="!text-center">
            <template #body="slotProps">
              <div class="flex items-center justify-center gap-4">
                <div class="flex flex-col items-center">
                  <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    >Hadir</span
                  >
                  <span
                    :class="[
                      'text-xs font-black',
                      Number(slotProps.data.working_days) < 19
                        ? 'text-rose-500'
                        : 'text-slate-700 dark:text-slate-300',
                    ]"
                    >{{ slotProps.data.working_days }} Hari</span
                  >
                </div>
                <div class="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>
                <div class="flex flex-col items-center">
                  <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    >Jarak</span
                  >
                  <span
                    :class="[
                      'text-xs font-black',
                      Number(slotProps.data.distance_km) <= 5
                        ? 'text-rose-500'
                        : 'text-slate-700 dark:text-slate-300',
                    ]"
                    >{{ Number(slotProps.data.distance_km).toFixed(1) }} KM</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <Column header="Nominal Tunjangan" class="!text-right">
            <template #body="slotProps">
              <div class="flex flex-col items-end px-4">
                <span
                  :class="[
                    'text-sm font-black',
                    Number(slotProps.data.amount) === 0
                      ? 'text-slate-300 dark:text-slate-600 line-through'
                      : 'text-indigo-600 dark:text-indigo-400',
                  ]"
                >
                  {{ formatCurrency(Number(slotProps.data.amount)) }}
                </span>
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >Rate:
                  {{ formatCurrency(Number(slotProps.data.base_fare)) }} / KM</span
                >
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div class="relative mb-6">
                <div class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700">
                  <i class="bi bi-car-front text-4xl text-indigo-500"></i>
                </div>
                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg dark:shadow-none z-20">
                  <i class="bi bi-search text-xs"></i>
                </div>
              </div>
              <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Data Tunjangan Belum Tersedia</h3>
              <p class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8">
                Silakan generate data untuk periode ini atau periksa parameter pencarian Anda.
              </p>
              <Button 
                v-if="searchQuery"
                label="Reset Filter" 
                icon="bi bi-arrow-counterclockwise" 
                class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform"
                @click="resetFilters"
              />
              <Button 
                v-else-if="hasPermission('transport_setting', 'create')"
                label="Generate Tunjangan" 
                icon="bi bi-lightning-charge" 
                class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform"
                @click="openGenerateModal"
              />
            </div>
          </template>

          <template #footer>
            <div
              class="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900/50"
              >
                <span
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >Periode Aktif: {{ getMonthYear() }}</span
                >
                <Paginator
                  v-model:first="first"
                  :rows="itemsPerPage"
                  :totalRecords="totalAllowances"
                  template="PrevPageLink PageLinks NextPageLink"
                  @page="(e) => (currentPage = e.page + 1)"
                  class="!bg-transparent !p-0"
                  :pt="{
                    page: ({ context }: any) => ({
                      class: [
                        '!w-8 !h-8 !rounded-lg !text-[11px] !font-black !min-w-0 !transition-colors',
                        context.active
                          ? '!text-indigo-600 dark:!text-indigo-400'
                          : '!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800',
                      ],
                    }),
                    prev: { class: '!w-8 !h-8 !rounded-lg !text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800 !transition-colors' },
                    next: { class: '!w-8 !h-8 !rounded-lg !text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800 !transition-colors' },
                  }"
                />
            </div>
          </template>
        </DataTable>
      </div>
    </Motion>

    <!-- Generate Modal -->
    <Dialog
      v-model:visible="showGenerateModal"
      modal
      header="Automatisasi Tunjangan"
      class="w-full max-w-lg !rounded-[32px] !border-none !shadow-2xl overflow-hidden"
      :pt="{
        root: { class: 'bg-white dark:bg-slate-900' },
        header: { class: 'px-8 pt-8 pb-4 !bg-transparent !border-none !text-slate-800 dark:!text-white' },
        content: { class: 'px-8 pb-8 !bg-transparent dark:!text-slate-300' },
        footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
      }"
    >
      <div class="space-y-6">
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Sistem akan memindai data absensi dan profil pegawai untuk
          mengkalkulasi tunjangan transport secara presisi.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Bulan Target</label
            >
            <Select
              v-model="genMonth"
              :options="monthOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-none"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Tahun Target</label
            >
            <InputText
              v-model.number="genYear"
              type="number"
              class="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-none !font-bold dark:!text-white"
            />
          </div>
        </div>

        <div
          class="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex gap-3"
        >
          <ToggleSwitch v-model="genForce" />
          <div class="flex flex-col">
            <span class="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase"
              >Force Regenerate</span
            >
            <span class="text-[10px] font-medium text-indigo-500 dark:text-indigo-300"
              >Timpa data lama jika sudah ada di sistem.</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3"
        >
          <div
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2"
          >
            Business Logic Overview
          </div>
          <ul class="space-y-2">
            <li
              v-for="rule in businessRules"
              :key="rule"
              class="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400"
            >
              <i class="bi bi-check-circle-fill text-indigo-500"></i> {{ rule }}
            </li>
          </ul>
        </div>

        <Transition name="fade">
          <div
            v-if="genError"
            class="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-100 dark:border-rose-500/20 flex items-center gap-2"
          >
            <i class="bi bi-exclamation-triangle-fill"></i> {{ genError }}
          </div>
          <div
            v-else-if="genSuccess"
            class="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2"
          >
            <i class="bi bi-check-circle-fill"></i> {{ genSuccess }}
          </div>
        </Transition>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 mt-4">
          <Button
            label="Batal"
            text
            severity="secondary"
            @click="showGenerateModal = false"
            class="!rounded-2xl !font-bold dark:!text-slate-400"
          />
          <Button
            label="Mulai Kalkulasi"
            icon="bi bi-lightning-charge-fill"
            :loading="generating"
            @click="handleGenerate"
            class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useTransportAllowance } from "~/composables/useTransportAllowance";
import { useAuth } from "~/composables/useAuth";
import { getErrorMessageAxios } from "~/utils/handleError";

const { hasPermission } = useAuth();
const {
  allowances,
  loading,
  generating,
  searchQuery,
  filterMonth,
  filterYear,
  currentPage,
  itemsPerPage,
  totalAllowances,
  fetchAllowances,
  generateAllowances,
  getMonthYear,
  formatCurrency,
} = useTransportAllowance();

const first = ref(0);
const showGenerateModal = ref(false);
const genMonth = ref(new Date().getMonth() + 1);
const genYear = ref(new Date().getFullYear());
const genForce = ref(false);
const genError = ref<string | null>(null);
const genSuccess = ref<string | null>(null);

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(2026, i).toLocaleDateString("id-ID", { month: "long" }),
  value: i + 1,
}));

const businessRules = [
  'Tipe pegawai harus "Tetap"',
  "Minimal hari kerja: 19 hari",
  "Jarak rumah-kantor > 5 km",
  "Maksimal perhitungan: 25 km",
];

const transportInsights = computed(() => [
  {
    label: "Total Penyaluran",
    value: formatCurrency(totalAmount.value),
    icon: "bi bi-wallet2",
    bg: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Pegawai Eligible",
    value: eligibleCount.value + " JIWA",
    icon: "bi bi-person-check",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Tidak Eligible",
    value: skippedCount.value + " JIWA",
    icon: "bi bi-person-x",
    bg: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    textColor: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Rata-rata / Pegawai",
    value: formatCurrency(totalAmount.value / (eligibleCount.value || 1)),
    icon: "bi bi-graph-up",
    bg: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    textColor: "text-slate-600 dark:text-slate-400",
  },
]);

const totalAmount = computed(() =>
  allowances.value.reduce((sum, a) => sum + parseFloat(a.amount as any), 0),
);
const eligibleCount = computed(
  () => allowances.value.filter((a) => parseFloat(a.amount as any) > 0).length,
);
const skippedCount = computed(
  () =>
    allowances.value.filter((a) => parseFloat(a.amount as any) === 0).length,
);

onMounted(() => fetchAllowances());
watch([filterMonth, filterYear, currentPage, searchQuery], () =>
  fetchAllowances(),
);

const resetFilters = () => {
  searchQuery.value = "";
  filterMonth.value = new Date().getMonth() + 1;
  filterYear.value = new Date().getFullYear();
  currentPage.value = 1;
};

const openGenerateModal = () => {
  genMonth.value = filterMonth.value;
  genYear.value = filterYear.value;
  genForce.value = false;
  genError.value = null;
  genSuccess.value = null;
  showGenerateModal.value = true;
};

const handleGenerate = async () => {
  genError.value = null;
  genSuccess.value = null;
  try {
    const result = await generateAllowances(
      genMonth.value,
      genYear.value,
      genForce.value,
    );
    genSuccess.value = "Data tunjangan berhasil dikalkulasi!";
    fetchAllowances();
    setTimeout(() => {
      showGenerateModal.value = false;
    }, 1500);
  } catch (err: any) {
    genError.value = getErrorMessageAxios(err) || "Gagal generate data";
  }
};

definePageMeta({ layout: "default" });
</script>

<style>
.p-paginator {
  @apply !bg-transparent !p-0 !border-none;
}
.p-paginator .p-paginator-page,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-prev {
  @apply !w-8 !h-8 !rounded-lg !text-[11px] !font-black !min-w-0 !bg-transparent !text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800 transition-colors;
}
.p-paginator .p-paginator-page.p-highlight {
  @apply !bg-transparent !text-indigo-600 dark:!text-indigo-400 !shadow-none;
}
</style>
