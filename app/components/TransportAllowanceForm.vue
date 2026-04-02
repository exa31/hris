<template>
  <div class="transport-allowance-form px-1">
    <form @submit.prevent="submitForm">
      <div class="row g-4 text-dark">
        <!-- Column 1: Pegawai & Jarak -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-3">
            <div class="card-body p-4">
              <h5 class="card-title mb-4 fw-bold"><i class="bi bi-person-badge me-2"></i>Informasi Tunjangan</h5>

              <div class="mb-4">
                <label class="form-label small fw-bold">Pegawai <span class="text-danger">*</span></label>
                <div v-if="employeesLoading" class="text-muted small mb-2">
                    <span class="spinner-border spinner-border-sm me-1"></span> Memuat daftar pegawai...
                </div>
                <select v-model.number="formData.employee_id" class="form-select shadow-none p-3 bg-light border-0 rounded-3" required>
                  <option value="0" disabled>-- Pilih Pegawai --</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.name }} ({{ emp.nip }})
                  </option>
                </select>
                <small class="text-muted mt-1 d-block px-1">Pilih pegawai yang berhak menerima tunjangan transport</small>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Bulan <span class="text-danger">*</span></label>
                    <select v-model.number="formData.month" class="form-select shadow-none p-3 bg-light border-0 rounded-3" required>
                    <option v-for="m in 12" :key="m" :value="m">
                        {{ new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'long' }) }}
                    </option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Tahun <span class="text-danger">*</span></label>
                    <input
                    v-model.number="formData.year"
                    type="number"
                    class="form-control shadow-none p-3 bg-light border-0 rounded-3"
                    required
                    />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Keterangan</label>
                <textarea
                  v-model="formData.keterangan"
                  class="form-control shadow-none p-3 bg-light border-0 rounded-3"
                  rows="3"
                  placeholder="Catatan/keterangan tambahan (opsional)"
                ></textarea>
              </div>

              <hr class="my-4 opacity-50" />

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Jarak (km) <span class="text-danger">*</span></label>
                    <div class="input-group">
                        <input
                        v-model.number="formData.distance_km"
                        type="number"
                        class="form-control shadow-none p-3 bg-light border-0 rounded-3"
                        required
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        />
                        <span class="input-group-text bg-light border-0 rounded-3 ms-1 fw-bold">KM</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Hari Masuk Kerja <span class="text-danger">*</span></label>
                    <div class="input-group">
                        <input
                        v-model.number="formData.working_days"
                        type="number"
                        class="form-control shadow-none p-3 bg-light border-0 rounded-3"
                        required
                        min="0"
                        max="31"
                        placeholder="0"
                        />
                         <span class="input-group-text bg-light border-0 rounded-3 ms-1 fw-bold">Hari</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Perhitungan Info -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-3 bg-primary bg-opacity-10 h-100">
            <div class="card-body p-4 d-flex flex-column h-100">
              <h5 class="card-title mb-4 fw-bold"><i class="bi bi-calculator me-2"></i>Preview Perhitungan</h5>

              <div class="bg-white rounded-3 p-4 mb-4 shadow-sm border border-primary border-opacity-10 flex-grow-1">
                  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span class="text-muted small">Tarif Dasar</span>
                    <span class="fw-bold text-primary">{{ formatCurrency(settings.baseFare) }}</span>
                  </div>

                  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span class="text-muted small">Tarif per KM</span>
                    <span class="fw-bold text-primary">{{ formatCurrency(settings.tariffPerKm) }} / km</span>
                  </div>

                  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span class="text-muted small">Jarak Efektif</span>
                    <span class="fw-bold">{{ effectiveKm }} km</span>
                  </div>

                  <div class="d-flex justify-content-between mb-4 border-bottom pb-2">
                    <span class="text-muted small">Total Hari Masuk</span>
                    <span class="fw-bold">{{ formData.working_days }} Hari</span>
                  </div>

                  <div class="alert alert-light border border-dashed rounded-3 small p-2 mb-4 text-center lh-sm">
                    <i class="bi bi-info-circle me-1"></i> ({{ formatCurrency(settings.baseFare) }} + ({{ formatCurrency(settings.tariffPerKm) }} &times; {{ effectiveKm }}km)) &times; {{ formData.working_days }}hari
                  </div>

                  <div class="text-center pt-3 mt-auto">
                    <div class="text-muted small mb-2">Total Tunjangan Transport</div>
                    <div class="display-6 fw-bold text-primary">{{ formatCurrency(calculatedAmount) }}</div>
                  </div>
              </div>

              <!-- Validation Note -->
              <div v-if="validationNote" class="alert alert-warning border-0 animate__animated animate__fadeIn mb-4">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ validationNote }}
              </div>

              <!-- Form Actions -->
              <div class="mt-auto d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg rounded-pill shadow-sm py-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-lg me-1"></i> Simpan Tunjangan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployees } from '~/composables/useEmployees'

const props = defineProps<{
  initialData?: any
  isEdit?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: any]
}>()

const { employees, fetchEmployees, loading: employeesLoading } = useEmployees()

// State
const settings = ref({
    baseFare: 5000,
    tariffPerKm: 2000,
    minDistance: 5,
    maxDistance: 25,
    minWorkingDays: 19
})

const formData = ref({
  employee_id: props.initialData?.employee_id || 0,
  month: props.initialData?.month || new Date().getMonth() + 1,
  year: props.initialData?.year || new Date().getFullYear(),
  distance_km: props.initialData?.distance_km || 0,
  working_days: props.initialData?.working_days || 0,
  total_allowance: props.initialData?.total_allowance || 0,
  keterangan: props.initialData?.keterangan || ''
})

const validationNote = ref('')

onMounted(async () => {
  await fetchEmployees()
  try {
     const { $axios } = useNuxtApp()
     const res = await $axios.get('/api/transport-allowance/settings')
     if (res.data) {
         settings.value = {
             baseFare: res.data.baseFare || 5000,
             tariffPerKm: res.data.tariffPerKm || 2000,
             minDistance: res.data.minDistance || 5,
             maxDistance: res.data.maxDistance || 25,
             minWorkingDays: res.data.minWorkingDays || 19
         }
     }
  } catch (e) {}
})

// Logic
const effectiveKm = computed(() => {
    let km = formData.value.distance_km
    if (km < settings.value.minDistance) return 0
    if (km > settings.value.maxDistance) km = settings.value.maxDistance
    
    // Rounding logic: < .5 round down, >= .5 round up
    const decimal = km - Math.floor(km)
    return decimal < 0.5 ? Math.floor(km) : Math.ceil(km)
})

const calculatedAmount = computed(() => {
    // Note: User's logic in calc summary was: (baseFare + (tariffPerKm * km)) * days
    if (formData.value.working_days < settings.value.minWorkingDays) return 0
    if (effectiveKm.value === 0) return 0
    
    return (settings.value.baseFare + (settings.value.tariffPerKm * effectiveKm.value)) * formData.value.working_days
})

watch(calculatedAmount, (newVal) => {
    formData.value.total_allowance = newVal
}, { immediate: true })

watch(() => [formData.value.distance_km, formData.value.working_days, settings.value], () => {
    validationNote.value = ''
    if (formData.value.distance_km > 0 && formData.value.distance_km < settings.value.minDistance) {
        validationNote.value = `Jarak kurang dari ${settings.value.minDistance}km tidak mendapatkan tunjangan.`
    } else if (formData.value.working_days > 0 && formData.value.working_days < settings.value.minWorkingDays) {
        validationNote.value = `Hari kerja minimal ${settings.value.minWorkingDays} hari dalam sebulan.`
    } else if (formData.value.distance_km > settings.value.maxDistance) {
        validationNote.value = `Maksimal jarak yang dihitung adalah ${settings.value.maxDistance}km.`
    }
})

const submitForm = () => {
  if (formData.value.employee_id === 0) return
  emit('submit', { ...formData.value })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.transport-allowance-form { animation: fadeIn 0.5s ease; }
.card { border-radius: 1rem; }
.form-select, .form-control { color: #1e293b; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
