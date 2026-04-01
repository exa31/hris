<template>
  <div class="transport-allowance-detail" v-if="allowance">
    <!-- Header -->
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">Detail Tunjangan Transport</h1>
        <span :class="[
          'badge ms-auto',
          allowance.statusPembayaran === 'paid' ? 'bg-success' : '',
          allowance.statusPembayaran === 'pending' ? 'bg-warning' : '',
          allowance.statusPembayaran === 'rejected' ? 'bg-danger' : ''
        ]">
          {{ allowance.statusPembayaran.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-3">
      <NuxtLink
        :to="`/transport-allowance/${allowance.id}/edit`"
        class="btn btn-primary"
      >
        <i class="bi bi-pencil"></i> Edit
      </NuxtLink>
      <button class="btn btn-outline-danger ms-2" @click="deleteRecord">
        <i class="bi bi-trash"></i> Hapus
      </button>
    </div>

    <!-- Information Cards -->
    <div class="row">
      <!-- Column 1: Pegawai Info -->
      <div class="col-lg-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Informasi Pegawai</h5>

            <div class="info-row mb-3">
              <label class="text-muted small">NIP</label>
              <p class="fw-bold">{{ allowance.nip }}</p>
            </div>

            <div class="info-row mb-3">
              <label class="text-muted small">Nama</label>
              <p class="fw-bold">{{ allowance.employeeName }}</p>
            </div>

            <div class="info-row mb-3">
              <label class="text-muted small">Departemen</label>
              <p>{{ allowance.departemen }}</p>
            </div>

            <hr />

            <div class="info-row mb-3">
              <label class="text-muted small">Bulan/Tahun</label>
              <p class="fw-bold">{{ getMonthYear(allowance.bulan, allowance.tahun) }}</p>
            </div>

            <div class="info-row">
              <label class="text-muted small">Tanggal Buat</label>
              <p class="small">{{ formatDate(allowance.tanggalBuat) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2: Perhitungan Info -->
      <div class="col-lg-6 mb-3">
        <div class="card bg-light">
          <div class="card-body">
            <h5 class="card-title mb-4">Perhitungan Tunjangan</h5>

            <div class="info-row mb-3">
              <label class="text-muted small">Jarak (km)</label>
              <p class="fw-bold">{{ allowance.jarak }} km
                <small v-if="allowance.jarak > settings.maxDistance" class="text-danger">
                  (dibatasi max {{ settings.maxDistance }} km)
                </small>
              </p>
            </div>

            <div class="info-row mb-3">
              <label class="text-muted small">Hari Masuk Kerja</label>
              <p class="fw-bold">
                <span :class="allowance.hariMasukKerja >= settings.minWorkingDays ? 'text-success' : 'text-danger'">
                  {{ allowance.hariMasukKerja }}
                </span>
                <small v-if="allowance.hariMasukKerja < settings.minWorkingDays" class="text-danger d-block">
                  (Kurang dari minimum {{ settings.minWorkingDays }} hari)
                </small>
              </p>
            </div>

            <hr />

            <div class="info-row mb-4">
              <label class="text-muted small">Tunjangan Transport</label>
              <p class="text-success fw-bold" style="font-size: 1.5rem">{{ formatCurrency(allowance.tunjangan) }}</p>
            </div>

            <div class="alert alert-info small mb-0">
              <strong>Rumus:</strong><br />
              {{ formatCurrency(settings.baseFare) }} × {{ Math.min(allowance.jarak, settings.maxDistance) }} km × {{ allowance.hariMasukKerja }} hari
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="card" v-if="allowance.keterangan">
      <div class="card-body">
        <h5 class="card-title">Keterangan</h5>
        <p>{{ allowance.keterangan }}</p>
      </div>
    </div>
  </div>

  <div v-else class="alert alert-warning">
    <i class="bi bi-exclamation-triangle"></i> Data tunjangan tidak ditemukan
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransportAllowance } from '~/composables/useTransportAllowance'
import { useTransportSettings } from '~/composables/useTransportSettings'

const route = useRoute()
const router = useRouter()
const { allowances, deleteAllowance } = useTransportAllowance()
const { formatCurrency, getSettings } = useTransportSettings()

const settings = computed(() => getSettings())

const allowanceId = computed(() => parseInt(route.params.id as string))

const allowance = computed(() => {
  return allowances.value.find(a => a.id === allowanceId.value)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMonthYear = (bulan: number, tahun: number) => {
  const date = new Date(tahun, bulan - 1)
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
}

const deleteRecord = () => {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    deleteAllowance(allowanceId.value)
    router.push('/transport-allowance')
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
  margin-bottom: 0;
}

.info-row label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.info-row p {
  margin: 0;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
