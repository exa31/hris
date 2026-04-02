<template>
  <div class="transport-settings">
    <!-- Header -->
    <div class="page-header">
      <h1><i class="bi bi-gear-fill text-primary me-2"></i>Pengaturan Tunjangan Transport</h1>
      <p class="text-muted">Atur base fare dan status aktif untuk perhitungan tunjangan transport pegawai</p>
    </div>

    <div class="row g-4">
      <!-- Settings Form -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body p-4">
            <h5 class="card-title mb-4 d-flex align-items-center">
              <i class="bi bi-sliders text-primary me-2"></i> Konfigurasi Tarif
            </h5>

            <!-- Base Fare -->
            <div class="mb-4">
              <label class="form-label fw-bold">Base Fare (Rp) <span class="text-danger">*</span></label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-white fw-bold text-primary">Rp</span>
                <input
                  v-model.number="localSettings.base_fare"
                  type="number"
                  class="form-control form-control-lg"
                  placeholder="Contoh: 2000"
                  min="0"
                  step="500"
                  :disabled="!hasPermission('transport_setting', 'update') || saving"
                />
              </div>
              <small class="text-muted">Base fare per kilometer per hari kerja. Rumus: <code>base_fare × km × hari_kerja</code></small>
            </div>

            <!-- Is Active -->
            <div class="mb-4">
              <label class="form-label fw-bold">Status Pengaturan</label>
              <div class="form-check form-switch">
                <input
                  id="isActiveSwitch"
                  v-model="localSettings.is_active"
                  type="checkbox"
                  class="form-check-input"
                  role="switch"
                  style="width: 3em; height: 1.5em;"
                  :disabled="!hasPermission('transport_setting', 'update') || saving"
                />
                <label class="form-check-label ms-2 fw-medium" for="isActiveSwitch">
                  <span v-if="localSettings.is_active" class="text-success">
                    <i class="bi bi-check-circle-fill me-1"></i> Aktif
                  </span>
                  <span v-else class="text-danger">
                    <i class="bi bi-x-circle-fill me-1"></i> Nonaktif
                  </span>
                </label>
              </div>
              <small class="text-muted">Jika nonaktif, fitur Generate Tunjangan tidak dapat digunakan</small>
            </div>

            <hr />

            <div v-if="hasPermission('transport_setting', 'update')" class="d-flex gap-2">
              <button class="btn btn-primary px-4" @click="saveSettings" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-circle me-1"></i>
                {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
              </button>
              <button class="btn btn-outline-secondary" @click="resetForm" :disabled="saving">
                <i class="bi bi-arrow-clockwise me-1"></i> Reset
              </button>
            </div>
            <div v-else class="alert alert-warning small mb-0 shadow-sm border-0 bg-warning opacity-75">
              <i class="bi bi-lock-fill me-1"></i> Mode Read-Only: Anda tidak memiliki izin untuk mengubah pengaturan ini.
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="saveSuccess" class="alert alert-success alert-dismissible fade show mt-3 shadow-sm">
          <i class="bi bi-check-circle-fill me-2"></i> Pengaturan berhasil disimpan!
          <button type="button" class="btn-close" @click="saveSuccess = false"></button>
        </div>
        <div v-if="saveError" class="alert alert-danger alert-dismissible fade show mt-3 shadow-sm">
          <i class="bi bi-exclamation-circle-fill me-2"></i> {{ saveError }}
          <button type="button" class="btn-close" @click="saveError = null"></button>
        </div>
      </div>

      <!-- Preview & Business Rules -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm rounded-3 bg-light">
          <div class="card-body p-4">
            <h5 class="card-title mb-4 d-flex align-items-center">
              <i class="bi bi-info-circle text-primary me-2"></i> Informasi & Aturan Bisnis
            </h5>

            <!-- Current Rate -->
            <div class="info-group mb-4">
              <h6 class="text-muted">Base Fare Saat Ini</h6>
              <p class="h4 mb-1 fw-bold text-primary">
                {{ formatCurrency(localSettings.base_fare) }} <small class="text-muted fs-6">/ km / hari</small>
              </p>
            </div>

            <hr />

            <!-- Business Rules -->
            <div class="info-group mb-4">
              <h6 class="text-muted">Aturan Perhitungan</h6>
              <ul class="list-unstyled small mb-0">
                <li class="mb-2 d-flex align-items-start gap-2">
                  <i class="bi bi-check-circle-fill text-success mt-1"></i>
                  <span>Hanya pegawai <strong>Tetap</strong> yang eligible (Kontrak/Magang = Rp0)</span>
                </li>
                <li class="mb-2 d-flex align-items-start gap-2">
                  <i class="bi bi-check-circle-fill text-success mt-1"></i>
                  <span>Minimum <strong>19 hari kerja</strong> → kurang dari itu = Rp0</span>
                </li>
                <li class="mb-2 d-flex align-items-start gap-2">
                  <i class="bi bi-check-circle-fill text-success mt-1"></i>
                  <span>Jarak ≤ <strong>5 km</strong> → tunjangan = Rp0</span>
                </li>
                <li class="mb-2 d-flex align-items-start gap-2">
                  <i class="bi bi-check-circle-fill text-success mt-1"></i>
                  <span>Jarak > <strong>25 km</strong> → dibatasi maksimal 25 km</span>
                </li>
                <li class="mb-2 d-flex align-items-start gap-2">
                  <i class="bi bi-check-circle-fill text-success mt-1"></i>
                  <span>Pembulatan: desimal < 0.5 → bulatkan ke bawah, ≥ 0.5 → ke atas</span>
                </li>
              </ul>
            </div>

            <hr />

            <!-- Example Calculation -->
            <div class="info-group mb-3">
              <h6 class="text-muted">Contoh Perhitungan</h6>
              <div class="bg-white rounded-3 p-3 border">
                <div class="d-flex flex-column gap-2 small">
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Base fare</span>
                    <span class="fw-bold">{{ formatCurrency(localSettings.base_fare) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Jarak tempuh</span>
                    <span class="fw-bold">12.3 km → 12 km (pembulatan)</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Hari kerja</span>
                    <span class="fw-bold">22 hari</span>
                  </div>
                  <hr class="my-1" />
                  <div class="d-flex justify-content-between">
                    <span class="fw-bold text-muted">Total Tunjangan</span>
                    <span class="fw-bold text-success fs-5">{{ formatCurrency(localSettings.base_fare * 12 * 22) }}</span>
                  </div>
                </div>
                <div class="mt-3 small text-muted bg-light rounded p-2">
                  <strong>Rumus:</strong> base_fare × km × hari_kerja<br/>
                  {{ formatCurrency(localSettings.base_fare) }} × 12 × 22 = <strong>{{ formatCurrency(localSettings.base_fare * 12 * 22) }}</strong>
                </div>
              </div>
            </div>

            <div class="alert alert-info small mb-0">
              <i class="bi bi-info-circle me-1"></i>
              Pengaturan ini digunakan saat fitur <strong>Generate Tunjangan</strong> dijalankan. 
              Setiap pegawai dihitung: <code>base_fare × calculated_km × working_days</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTransportSettings } from '~/composables/useTransportSettings'
import { useAuth } from '~/composables/useAuth'

const { hasPermission } = useAuth()
const { settings, updateSettings, formatCurrency, fetchSettings, loading, error } = useTransportSettings()

const localSettings = ref({ base_fare: 2000, is_active: true })
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

onMounted(async () => {
  if (!hasPermission('transport_setting', 'read')) {
    return navigateTo('/')
  }
  await fetchSettings()
  localSettings.value = {
    base_fare: settings.value.base_fare || 2000,
    is_active: settings.value.is_active ?? true,
  }
})

const saveSettings = async () => {
  saveError.value = null
  saveSuccess.value = false
  saving.value = true

  if (!localSettings.value.base_fare || localSettings.value.base_fare <= 0) {
    saveError.value = 'Base fare harus lebih dari 0'
    saving.value = false
    return
  }

  try {
    await updateSettings({
      base_fare: localSettings.value.base_fare,
      is_active: localSettings.value.is_active,
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = err.response?.data?.message || error.value || 'Gagal menyimpan pengaturan'
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  localSettings.value = {
    base_fare: settings.value.base_fare || 2000,
    is_active: settings.value.is_active ?? true,
  }
  saveError.value = null
}

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.transport-settings { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
.info-group h6 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
</style>
