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
                    <small class="text-muted mt-1 d-block px-1">Gunakan desimal jika perlu</small>
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
                     <small class="text-muted mt-1 d-block px-1">Jumlah hari aktf dalam sebulan</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Preview Perhitungan -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-3 bg-primary bg-opacity-10 h-100">
            <div class="card-body p-4 d-flex flex-column h-100">
              <h5 class="card-title mb-4 fw-bold"><i class="bi bi-calculator me-2"></i>Preview Perhitungan</h5>

              <div class="bg-white rounded-3 p-4 mb-4 shadow-sm border border-primary border-opacity-10 flex-grow-1">
                  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span class="text-muted small">Tarif Dasar (Settings)</span>
                    <span class="fw-bold text-primary">{{ formatCurrency(baseFare) }} / km</span>
                  </div>

                  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span class="text-muted small">Jarak Efektif</span>
                    <span class="fw-bold">{{ effectiveKm }} km</span>
                  </div>

                  <div class="d-flex justify-content-between mb-4 border-bottom pb-2">
                    <span class="text-muted small">Total Hari Masuk</span>
                    <span class="fw-bold">{{ formData.working_days }} Hari</span>
                  </div>

                  <div class="alert alert-light border border-dashed rounded-3 small p-2 mb-4 text-center">
                    <i class="bi bi-info-circle me-1"></i> {{ formatCurrency(baseFare) }} × {{ effectiveKm }}km × {{ formData.working_days }}hr
                  </div>

                  <div class="text-center pt-3 mt-auto">
                    <div class="text-muted small mb-2">Total Tunjangan Transpor</div>
                    <div class="display-6 fw-bold text-primary">{{ formatCurrency(calculatedAmount) }}</div>
                  </div>
              </div>

              <!-- Validation Message / Notes -->
              <div v-if="validationNote" class="alert alert-warning border-0 animate__animated animate__fadeIn">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ validationNote }}
              </div>

              <!-- Form Error Message -->
              <div v-if="formError" class="alert alert-danger border-0 animate__animated animate__shakeX">
                <i class="bi bi-x-circle-fill me-2"></i> {{ formError }}
              </div>

              <!-- Form Actions -->
              <div class="mt-auto d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg rounded-pill shadow-sm py-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-check-lg me-1"></i> {{ isEdit ? 'Simpan Perubahan' : 'Proses & Simpan'}}
                </button>
                <NuxtLink to="/transport-allowance" class="btn btn-link text-muted text-decoration-none">
                  Batal & Kembali
                </NuxtLink>
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

// Form Data matching DB model
const formData = ref({
  employee_id: props.initialData?.employee_id || 0,
  month: props.initialData?.month || new Date().getMonth() + 1,
  year: props.initialData?.year || new Date().getFullYear(),
  distance_km: props.initialData?.distance_km || 0,
  working_days: props.initialData?.working_days || 0,
  total_allowance: props.initialData?.total_allowance || 0,
  keterangan: props.initialData?.keterangan || ''
})

const formError = ref('')
const baseFare = ref(5000) // Default base fare 
const validationNote = ref('')

// Fetch necessary data
onMounted(async () => {
  await fetchEmployees()
  // Mock fetch settings for base fare - real one would come from /api/transport-allowance/settings
  try {
     const { $axios } = useNuxtApp()
     const res = await $axios.get('/api/transport-allowance/settings')
     if (res.data?.base_fare_per_km) {
         baseFare.value = parseFloat(res.data.base_fare_per_km)
     }
  } catch (e) {}
})

// Logic derived from DB rules and user requirements
const effectiveKm = computed(() => {
    let km = formData.value.distance_km
    if (km < 5) return 0
    if (km > 25) km = 25
    
    // Rounding logic: < .5 round down, >= .5 round up
    const decimal = km - Math.floor(km)
    return decimal < 0.5 ? Math.floor(km) : Math.ceil(km)
})

const calculatedAmount = computed(() => {
    if (formData.value.working_days < 19) return 0
    return baseFare.value * effectiveKm.value * formData.value.working_days
})

// SYNC total_allowance whenever input changes
watch(calculatedAmount, (newVal) => {
    formData.value.total_allowance = newVal
}, { immediate: true })

// Validation notes logic
watch(() => [formData.value.distance_km, formData.value.working_days], () => {
    validationNote.value = ''
    if (formData.value.distance_km > 0 && formData.value.distance_km < 5) {
        validationNote.value = 'Jarak kurang dari 5km tidak mendapatkan tunjangan.'
    } else if (formData.value.working_days > 0 && formData.value.working_days < 19) {
        validationNote.value = 'Hari masuk kerja minimal 19 hari untuk klaim tunjangan transpor.'
    } else if (formData.value.distance_km > 25) {
        validationNote.value = 'Maksimal jarak yang dihitung adalah 25km.'
    }
})

const submitForm = () => {
  formError.value = ''
  
  if (formData.value.employee_id === 0) {
    formError.value = 'Silakan pilih pegawai terlebih dahulu.'
    return
  }
  
  if (formData.value.distance_km <= 0 || formData.value.working_days <= 0) {
    formError.value = 'Jarak tempuh dan hari masuk kerja harus diisi.'
    return
  }
  
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
.transport-allowance-form {
  animation: fadeIn 0.5s ease;
}
.card { border-radius: 1rem; }
.form-select, .form-control { color: #1e293b; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
