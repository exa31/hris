<template>
  <div class="transport-settings">
    <!-- Header -->
    <div class="page-header">
      <h1>Pengaturan Tunjangan Transport</h1>
      <p class="text-muted">Atur tarif dasar dan batas jarak untuk tunjangan transport pegawai</p>
    </div>

    <!-- Settings Form -->
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Konfigurasi Tarif</h5>

            <div class="mb-3">
              <label class="form-label fw-bold">Base Fare (Rp)</label>
              <input
                v-model.number="localSettings.baseFare"
                type="number"
                class="form-control form-control-lg"
                placeholder="Tarif dasar per hari"
                min="0"
                step="500"
              />
              <small class="text-muted">Tarif dasar untuk tunjangan transport</small>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Tarif Per KM (Rp)</label>
              <input
                v-model.number="localSettings.tariffPerKm"
                type="number"
                class="form-control form-control-lg"
                placeholder="Tarif per kilometer"
                min="0"
                step="500"
              />
              <small class="text-muted">Besaran tunjangan untuk setiap 1 km perjalanan</small>
            </div>

            <hr />

            <h5 class="card-title mb-3">Batas Jarak</h5>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Jarak Minimum (km)</label>
                <input
                  v-model.number="localSettings.minDistance"
                  type="number"
                  class="form-control"
                  placeholder="Minimal jarak"
                  min="0"
                  step="0.5"
                />
                <small class="text-muted">Jarak kurang dari ini tidak mendapat tunjangan</small>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Jarak Maksimal (km)</label>
                <input
                  v-model.number="localSettings.maxDistance"
                  type="number"
                  class="form-control"
                  placeholder="Maksimal jarak"
                  min="0"
                  step="0.5"
                />
                <small class="text-muted">Jarak lebih dari ini hanya dihitung sampai maksimal</small>
              </div>
            </div>

            <hr />

            <h5 class="card-title mb-3">Hari Kerja Minimum</h5>

            <div class="mb-3">
              <label class="form-label fw-bold">Minimal Hari Masuk Kerja (hari)</label>
              <input
                v-model.number="localSettings.minWorkingDays"
                type="number"
                class="form-control"
                placeholder="Minimal hari masuk"
                min="1"
                max="31"
              />
              <small class="text-muted">Pegawai harus masuk minimal ini hari agar mendapat tunjangan</small>
            </div>

            <div class="d-flex gap-2 mt-4">
              <button class="btn btn-primary" @click="saveSettings">
                <i class="bi bi-check-circle"></i> Simpan Pengaturan
              </button>
              <button class="btn btn-outline-secondary" @click="resetSettings">
                <i class="bi bi-arrow-clockwise"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview / Info -->
      <div class="col-md-6">
        <div class="card bg-light">
          <div class="card-body">
            <h5 class="card-title mb-4">Informasi Pengaturan</h5>

            <div class="info-group mb-4">
              <h6 class="text-muted">Tarif Saat Ini</h6>
              <p class="h5 mb-1">
                <strong>{{ formatCurrency(settings.baseFare) }} × KM × Hari Masuk</strong>
              </p>
              <small class="text-muted d-block mb-2">
                Tarif per km: {{ formatCurrency(settings.tariffPerKm) }}
              </small>
            </div>

            <hr />

            <div class="info-group mb-4">
              <h6 class="text-muted">Batas Jarak</h6>
              <p class="mb-1">
                <strong>{{ settings.minDistance }} km - {{ settings.maxDistance }} km</strong>
              </p>
              <small class="text-muted">
                Pegawai yang perjalanan kurang dari {{ settings.minDistance }} km atau lebih dari {{ settings.maxDistance }} km akan disesuaikan perhitungannya
              </small>
            </div>

            <hr />

            <div class="info-group mb-4">
              <h6 class="text-muted">Minimum Hari Kerja</h6>
              <p class="h5 mb-1">
                <strong>{{ settings.minWorkingDays }} hari</strong>
              </p>
              <small class="text-muted">
                Pegawai yang masuk kurang dari {{ settings.minWorkingDays }} hari tidak mendapat tunjangan transport bulan tersebut
              </small>
            </div>

            <hr />

            <div class="info-group">
              <h6 class="text-muted">Contoh Perhitungan</h6>
              <small class="text-muted d-block mb-2">
                <strong>Asumsi:</strong>
              </small>
              <ul class="small text-muted" style="margin-left: 1rem">
                <li>Jarak: 12 km</li>
                <li>Hari masuk: 22 hari</li>
                <li>Base fare: {{ formatCurrency(settings.baseFare) }}</li>
              </ul>
              <small class="text-muted mt-2">
                <strong>Rumus:</strong> {{ formatCurrency(settings.baseFare) }} × 12 km × 22 hari = 
                <strong>{{ formatCurrency(settings.baseFare * 12 * 22) }}</strong>
              </small>
            </div>

            <div class="alert alert-info mt-4 small">
              <i class="bi bi-info-circle"></i>
              <strong>Info:</strong> Pengaturan ini akan mempengaruhi perhitungan tunjangan transport untuk semua pegawai di sistem
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTransportSettings } from '~/composables/useTransportSettings'

const { settings, updateSettings, formatCurrency } = useTransportSettings()

// Local state untuk form
const localSettings = ref({ ...settings.value })

const saveSettings = async () => {
  // Validate
  if (
    localSettings.value.baseFare <= 0 ||
    localSettings.value.tariffPerKm <= 0 ||
    localSettings.value.minDistance < 0 ||
    localSettings.value.maxDistance <= 0 ||
    localSettings.value.minWorkingDays < 1
  ) {
    alert('Nilai harus valid (positif)')
    return
  }

  if (localSettings.value.minDistance >= localSettings.value.maxDistance) {
    alert('Jarak minimum harus kurang dari jarak maksimal')
    return
  }

  updateSettings(localSettings.value)
  const { useAuditLog } = await import('~/composables/useAuditLog')
  const auditLog = useAuditLog()
  auditLog.addLog({
    userId: 'current_user',
    userName: 'Admin',
    timestamp: new Date().toISOString(),
    modul: 'Pengaturan Tunjangan Transport',
    aksi: 'update',
    deskripsi: 'Update pengaturan tarif tunjangan transport'
  })

  alert('Pengaturan berhasil disimpan!')
}

const resetSettings = () => {
  if (confirm('Apakah Anda yakin ingin membatalkan perubahan?')) {
    localSettings.value = { ...settings.value }
  }
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.info-group h6 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
