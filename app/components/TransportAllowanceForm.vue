<template>
  <div class="transport-allowance-form">
    <form @submit.prevent="submitForm">
      <div class="row">
        <!-- Column 1: Pegawai & Jarak -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">Informasi Tunjangan</h5>

              <div class="mb-3">
                <label class="form-label fw-bold">Pegawai <span class="text-danger">*</span></label>
                <select v-model.number="formData.employeeId" class="form-select" required>
                  <option value="">-- Pilih Pegawai --</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.name }} ({{ emp.nip }})
                  </option>
                </select>
                <small class="text-muted">Pegawai untuk tunjangan transport</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Bulan <span class="text-danger">*</span></label>
                <select v-model.number="formData.bulan" class="form-select" required>
                  <option value="">-- Pilih Bulan --</option>
                  <option v-for="m in 12" :key="m" :value="m">
                    {{ new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'long' }) }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Tahun <span class="text-danger">*</span></label>
                <input
                  v-model.number="formData.tahun"
                  type="number"
                  class="form-control"
                  required
                  :value="new Date().getFullYear()"
                />
              </div>

              <hr />

              <div class="mb-3">
                <label class="form-label fw-bold">Jarak (km) <span class="text-danger">*</span></label>
                <input
                  v-model.number="formData.jarak"
                  type="number"
                  class="form-control"
                  required
                  step="0.1"
                  min="0"
                  placeholder="Contoh: 12.5"
                />
                <small class="text-muted">Jarak perjalanan dalam km (bisa desimal)</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Hari Masuk Kerja <span class="text-danger">*</span></label>
                <input
                  v-model.number="formData.hariMasukKerja"
                  type="number"
                  class="form-control"
                  required
                  min="0"
                  max="31"
                  placeholder="Contoh: 22"
                />
                <small class="text-muted">Jumlah hari pegawai masuk kerja pada bulan tersebut</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: Informasi & Status -->
        <div class="col-lg-6">
          <div class="card bg-light">
            <div class="card-body">
              <h5 class="card-title mb-4">Preview Perhitungan</h5>

              <div class="info-group mb-3">
                <small class="text-muted d-block">Base Fare</small>
                <h6>{{ formatCurrency(settings.baseFare) }}</h6>
              </div>

              <div class="info-group mb-3">
                <small class="text-muted d-block">Jarak (pembulatan)</small>
                <h6>{{ roundKm(formData.jarak) }} km</h6>
              </div>

              <div class="info-group mb-3">
                <small class="text-muted d-block">Hari Masuk Kerja</small>
                <h6>{{ formData.hariMasukKerja }} hari</h6>
              </div>

              <hr />

              <div class="alert alert-info small mb-3">
                <strong>Rumus:</strong><br />
                {{ formatCurrency(settings.baseFare) }} × {{ roundKm(formData.jarak) }} km × {{ formData.hariMasukKerja }} hari
              </div>

              <div class="info-group mb-4">
                <small class="text-muted d-block">Tunjangan Transport (Auto)</small>
                <h4 class="text-success">{{ formatCurrency(calculatedAllowance) }}</h4>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Status Pembayaran</label>
                <select v-model="formData.statusPembayaran" class="form-select">
                  <option value="pending">Pending</option>
                  <option value="paid">Dibayar</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Keterangan</label>
                <textarea
                  v-model="formData.keterangan"
                  class="form-control"
                  rows="3"
                  placeholder="Catatan/keterangan tambahan (opsional)"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Messages -->
      <div v-if="validationMessages.length > 0" class="alert alert-warning mt-3">
        <strong>Perhatian:</strong>
        <ul class="mb-0 mt-2">
          <li v-for="msg in validationMessages" :key="msg">{{ msg }}</li>
        </ul>
      </div>

      <!-- Form Actions -->
      <div class="mt-4">
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-circle"></i> {{ isEdit ? 'Update' : 'Simpan'}}
        </button>
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary ms-2">
          <i class="bi bi-arrow-left"></i> Batal
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEmployees } from '~/composables/useEmployees'
import { useTransportSettings } from '~/composables/useTransportSettings'
import { useTransportAllowance } from '~/composables/useTransportAllowance'

const props = defineProps<{
  initialData?: any
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: [data: any]
}>()

const { employees } = useEmployees()
const { formatCurrency, getSettings } = useTransportSettings()
const { calculateAllowance } = useTransportAllowance()

// Helper function for rounding km
const roundKm = (km: number): number => {
  const decimal = km - Math.floor(km)
  if (decimal < 0.5) {
    return Math.floor(km)
  } else {
    return Math.ceil(km)
  }
}

// Get settings as computed property
const settings = computed(() => getSettings())

const formData = ref({
  employeeId: props.initialData?.employeeId || 0,
  employeeName: props.initialData?.employeeName || '',
  nip: props.initialData?.nip || '',
  departemen: props.initialData?.departemen || '',
  bulan: props.initialData?.bulan || new Date().getMonth() + 1,
  tahun: props.initialData?.tahun || new Date().getFullYear(),
  jarak: props.initialData?.jarak || 0,
  hariMasukKerja: props.initialData?.hariMasukKerja || 0,
  statusPembayaran: props.initialData?.statusPembayaran || 'pending',
  keterangan: props.initialData?.keterangan || ''
})

const validationMessages = ref<string[]>([])

const calculatedAllowance = computed(() => {
  const tempAllowance = {
    id: 0,
    employeeId: formData.value.employeeId,
    employeeName: formData.value.employeeName,
    nip: formData.value.nip,
    departemen: formData.value.departemen,
    bulan: formData.value.bulan,
    tahun: formData.value.tahun,
    jarak: formData.value.jarak,
    hariMasukKerja: formData.value.hariMasukKerja,
    statusPembayaran: formData.value.statusPembayaran as any,
    tunjangan: 0,
    tanggalBuat: new Date().toISOString()
  }
  return calculateAllowance(tempAllowance)
})

// Update validation messages
watch(() => [formData.value.jarak, formData.value.hariMasukKerja], () => {
  validationMessages.value = []
  const s = getSettings()

  if (formData.value.jarak < s.minDistance) {
    validationMessages.value.push(`Jarak kurang dari ${s.minDistance} km - tidak mendapat tunjangan`)
  }
  if (formData.value.jarak > s.maxDistance) {
    validationMessages.value.push(`Jarak lebih dari ${s.maxDistance} km - hanya akan dihitung sampai ${s.maxDistance} km`)
  }
  if (formData.value.hariMasukKerja < s.minWorkingDays) {
    validationMessages.value.push(`Hari masuk kurang dari ${s.minWorkingDays} hari - tidak mendapat tunjangan`)
  }
}, { deep: true })

const submitForm = () => {
  if (!formData.value.employeeId || !formData.value.bulan || !formData.value.tahun) {
    alert('Mohon isi semua field yang required')
    return
  }

  emit('submit', {
    ...formData.value,
    tunjangan: calculatedAllowance.value
  })
}
</script>

<style scoped>
.info-group h6 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
