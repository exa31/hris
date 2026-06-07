<template>
  <form @submit.prevent="submitForm" class="space-y-10">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left Column: Settings -->
      <div class="lg:col-span-7 space-y-10">
        <div class="space-y-10">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm"
            >
              <i class="bi bi-person-badge"></i>
            </div>
            <h3
              class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
            >
              Parameter Tunjangan
            </h3>
            <div class="h-px flex-1 bg-slate-50 dark:bg-slate-800"></div>
          </div>

          <div class="space-y-2">
            <label
              class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Pilih Pegawai <span class="text-rose-500">*</span></label
            >
            <Select
              v-model="formData.employee_id"
              :options="employees"
              optionLabel="name"
              optionValue="id"
              placeholder="Cari Pegawai..."
              filter
              class="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !shadow-none !py-1"
            >
              <template #option="slotProps">
                <div class="flex items-center gap-3 py-1">
                  <Avatar
                    :label="slotProps.option.name.charAt(0)"
                    shape="circle"
                    class="!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 !font-bold"
                  />
                  <div>
                    <div class="text-xs font-black text-slate-700 dark:text-slate-300">
                      {{ slotProps.option.name }}
                    </div>
                    <div
                      class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter"
                    >
                      {{ slotProps.option.nip }} •
                      {{ slotProps.option.position }}
                    </div>
                  </div>
                </div>
              </template>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-2">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
                >Bulan Pelaporan</label
              >
              <Select
                v-model="formData.month"
                :options="monthOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !shadow-none"
              />
            </div>
            <div class="space-y-2">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
                >Tahun</label
              >
              <InputNumber
                v-model="formData.year"
                :useGrouping="false"
                class="w-full"
                inputClass="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !py-3.5 !font-bold"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-2">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
                >Jarak Tempuh (KM) <span class="text-rose-500">*</span></label
              >
              <InputNumber
                v-model="formData.distance_km"
                :minFractionDigits="1"
                class="w-full"
                inputClass="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !py-3.5 !font-bold"
                suffix=" KM"
              />
            </div>
            <div class="space-y-2">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
                >Hari Kerja <span class="text-rose-500">*</span></label
              >
              <InputNumber
                v-model="formData.working_days"
                :min="0"
                :max="31"
                class="w-full"
                inputClass="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !py-3.5 !font-bold"
                suffix=" HARI"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Keterangan Opsional</label
            >
            <Textarea
              v-model="formData.keterangan"
              rows="3"
              placeholder="Tambahkan catatan khusus jika diperlukan..."
              class="w-full !rounded-2xl !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !p-4 !font-medium"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Calculation Preview -->
      <div class="lg:col-span-5 space-y-8">
        <div
          class="bg-indigo-950 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-100 dark:shadow-none space-y-10 relative overflow-hidden"
        >
          <i
            class="bi bi-calculator absolute -right-6 -bottom-6 text-[10rem] opacity-5"
          ></i>

          <div class="space-y-6 relative z-10">
            <h4
              class="text-xs font-black uppercase tracking-[0.2em] text-indigo-300"
            >
              Simulasi Perhitungan
            </h4>

            <div class="space-y-4">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-indigo-400 uppercase tracking-widest"
                  >Tarif Dasar</span
                >
                <span class="text-white">{{
                  formatCurrency(settings.baseFare)
                }}</span>
              </div>
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-indigo-400 uppercase tracking-widest"
                  >Tarif per KM</span
                >
                <span class="text-white">{{
                  formatCurrency(settings.tariffPerKm)
                }}</span>
              </div>
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-indigo-400 uppercase tracking-widest"
                  >Jarak Efektif</span
                >
                <span class="text-white">{{ effectiveKm }} KM</span>
              </div>
              <div class="h-px bg-white/10"></div>
              <div class="flex justify-between items-center text-xs font-black">
                <span class="text-indigo-300 uppercase tracking-widest"
                  >Subtotal / Hari</span
                >
                <span class="text-emerald-400">{{
                  formatCurrency(
                    settings.baseFare + settings.tariffPerKm * effectiveKm,
                  )
                }}</span>
              </div>
            </div>

            <div
              class="p-6 rounded-[32px] bg-white/5 border border-white/10 text-center space-y-2"
            >
              <div
                class="text-[10px] font-black uppercase tracking-widest text-indigo-300"
              >
                Estimasi Total Tunjangan
              </div>
              <div class="text-4xl font-black text-emerald-400 tracking-tight">
                {{ formatCurrency(calculatedAmount) }}
              </div>
              <div
                class="text-[10px] font-bold text-indigo-200/50 uppercase mt-2"
              >
                Dihitung untuk {{ formData.working_days }} hari kerja
              </div>
            </div>
          </div>

          <div
            v-if="validationNote"
            class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 relative z-10"
          >
            <i class="bi bi-exclamation-triangle text-amber-400"></i>
            <p
              class="text-[10px] font-bold text-amber-200 uppercase leading-relaxed"
            >
              {{ validationNote }}
            </p>
          </div>

          <div class="pt-4 relative z-10">
            <Button
              type="submit"
              label="Simpan Data Tunjangan"
              icon="bi bi-shield-check"
              class="w-full !rounded-2xl !py-4 !bg-indigo-600 !border-none !font-black !shadow-xl"
              :loading="loading"
            />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useEmployees } from "~/composables/useEmployees";

const props = defineProps<{
  initialData?: any;
  isEdit?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: any];
}>();

const { employees, fetchEmployees } = useEmployees();

const settings = ref({
  baseFare: 5000,
  tariffPerKm: 2000,
  minDistance: 5,
  maxDistance: 25,
  minWorkingDays: 19,
});

const formData = ref({
  employee_id: props.initialData?.employee_id || null,
  month: props.initialData?.month || new Date().getMonth() + 1,
  year: props.initialData?.year || new Date().getFullYear(),
  distance_km: props.initialData?.distance_km || 0,
  working_days: props.initialData?.working_days || 0,
  total_allowance: props.initialData?.total_allowance || 0,
  keterangan: props.initialData?.keterangan || "",
});

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: new Date(2026, i).toLocaleDateString("id-ID", { month: "long" }),
  value: i + 1,
}));

const validationNote = ref("");

onMounted(async () => {
  await fetchEmployees();
  try {
    const { $axios } = useNuxtApp();
    const res = await ($axios as any).get("/api/transport-allowance/settings");
    if (res.data) {
      settings.value = { ...settings.value, ...res.data };
    }
  } catch {}
});

const effectiveKm = computed(() => {
  let km = formData.value.distance_km;
  if (km < settings.value.minDistance) return 0;
  if (km > settings.value.maxDistance) km = settings.value.maxDistance;
  const decimal = km - Math.floor(km);
  return decimal < 0.5 ? Math.floor(km) : Math.ceil(km);
});

const calculatedAmount = computed(() => {
  if (formData.value.working_days < settings.value.minWorkingDays) return 0;
  if (effectiveKm.value === 0) return 0;
  return (
    (settings.value.baseFare + settings.value.tariffPerKm * effectiveKm.value) *
    formData.value.working_days
  );
});

watch(
  calculatedAmount,
  (newVal) => {
    formData.value.total_allowance = newVal;
  },
  { immediate: true },
);

watch(
  () => [
    formData.value.distance_km,
    formData.value.working_days,
    settings.value,
  ],
  () => {
    validationNote.value = "";
    if (
      formData.value.distance_km > 0 &&
      formData.value.distance_km < settings.value.minDistance
    ) {
      validationNote.value = `Jarak kurang dari ${settings.value.minDistance}km tidak mendapatkan tunjangan.`;
    } else if (
      formData.value.working_days > 0 &&
      formData.value.working_days < settings.value.minWorkingDays
    ) {
      validationNote.value = `Hari kerja minimal ${settings.value.minWorkingDays} hari dalam sebulan.`;
    } else if (formData.value.distance_km > settings.value.maxDistance) {
      validationNote.value = `Maksimal jarak yang dihitung adalah ${settings.value.maxDistance}km.`;
    }
  },
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const submitForm = () => {
  if (!formData.value.employee_id) return;
  emit("submit", { ...formData.value });
};
</script>
