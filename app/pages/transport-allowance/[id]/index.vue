<template>
  <div class="transport-allowance-detail px-2 py-4">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="h4 mb-0 fw-bold" v-if="allowance">Detail Tunjangan Transport</h1>
        <div v-else-if="loading" class="spinner-border spinner-border-sm text-primary"></div>
      </div>
    </div>

    <div v-if="allowance" class="animate__animated animate__fadeIn">
        <!-- Action Buttons -->
        <div class="mb-4">
          <button class="btn btn-outline-danger px-4 rounded-pill shadow-none" @click="confirmDelete">
              <i class="bi bi-trash me-1"></i> Hapus Catatan Ini
          </button>
        </div>

        <!-- Information Cards -->
        <div class="row g-4">
        <!-- Column 1: Pegawai Info -->
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100 rounded-3">
            <div class="card-body p-4">
                <h5 class="card-title mb-4 fw-bold text-primary"><i class="bi bi-person-circle me-2"></i>Data Pegawai</h5>

                <div class="info-row mb-3">
                    <label class="text-muted small fw-bold">NIP</label>
                    <p class="h5 fw-bold text-dark">{{ allowance.nip }}</p>
                </div>

                <div class="info-row mb-3">
                    <label class="text-muted small fw-bold">Nama Lengkap</label>
                    <p class="h5 fw-bold text-dark">{{ allowance.employeeName }}</p>
                </div>

                <div class="info-row mb-3">
                    <label class="text-muted small fw-bold">Departemen</label>
                    <p class="text-dark">{{ allowance.departemen }}</p>
                </div>

                <hr class="my-4 opacity-25" />

                <div class="info-row mb-3">
                    <label class="text-muted small fw-bold">Periode Tunjangan</label>
                    <p class="h5 fw-bold text-primary">{{ getMonthYear(allowance.month, allowance.year) }}</p>
                </div>

                <div class="info-row">
                    <label class="text-muted small fw-bold">Dicatat Pada</label>
                    <p class="text-muted small">{{ formatDate(allowance.created_at) }}</p>
                </div>
            </div>
            </div>
        </div>

        <!-- Column 2: Perhitungan Info -->
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100 rounded-3 bg-light">
            <div class="card-body p-4">
                <h5 class="card-title mb-4 fw-bold text-primary"><i class="bi bi-calculator-fill me-2"></i>Rincian Tunjangan</h5>

                <div class="info-row mb-3">
                    <label class="text-muted small fw-bold">Jarak Tempuh</label>
                    <div class="d-flex align-items-center">
                        <p class="h4 fw-bold text-dark mb-0 me-2">{{ allowance.distance_km }} km</p>
                        <span v-if="allowance.distance_km > 25" class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill">Dibatasi 25km</span>
                    </div>
                </div>

                <div class="info-row mb-3">
                    <label class="text-muted small fw-bold">Jumlah Hari Masuk</label>
                    <p :class="['h4 fw-bold mb-0', allowance.working_days >= 19 ? 'text-success' : 'text-danger']">
                        {{ allowance.working_days }} Hari
                    </p>
                    <small v-if="allowance.working_days < 19" class="text-danger">
                        <i class="bi bi-x-circle me-1"></i>Kurang dari batas minimum 19 hari
                    </small>
                </div>

                <hr class="my-4 opacity-50" />

                <div class="info-row mb-4 text-center py-3 bg-white rounded-3 shadow-sm border border-primary border-opacity-10">
                    <label class="text-primary small fw-bold mb-2 d-block">TOTAL TUNJANGAN</label>
                    <p class="text-primary fw-bold display-6 mb-0">{{ formatCurrency(allowance.total_allowance) }}</p>
                </div>

                <div class="alert alert-secondary border-0 small mb-0 rounded-3 text-center">
                    <i class="bi bi-info-circle me-1"></i> Perhitungan otomatis berdasarkan tarif per-KM yang berlaku saat ini.
                </div>
            </div>
            </div>
        </div>
        </div>

        <!-- Additional Info -->
        <div class="card border-0 shadow-sm rounded-3 mt-4" v-if="allowance.keterangan">
            <div class="card-body p-4">
                <h5 class="card-title fw-bold text-primary mb-3">Keterangan Tambahan</h5>
                <p class="text-dark mb-0">{{ allowance.keterangan }}</p>
            </div>
        </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!loading" class="alert alert-danger rounded-3 p-4 text-center">
        <i class="bi bi-exclamation-octagon display-4 d-block mb-3"></i>
        <h4 class="fw-bold">Data Tidak Ditemukan</h4>
        <p>Maaf, catatan tunjangan transport yang Anda cari tidak tersedia di sistem.</p>
        <NuxtLink to="/transport-allowance" class="btn btn-outline-danger px-4 rounded-pill mt-2">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="modalConfig.isConfirm"
      @close="onModalClose"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransportAllowance } from '~/composables/useTransportAllowance'

const route = useRoute()
const router = useRouter()
const { deleteAllowance, formatCurrency } = useTransportAllowance()

const allowanceId = computed(() => parseInt(route.params.id as string))
const allowance = ref<any>(null)
const loading = ref(true)

// Modal state
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'danger' as any,
  isConfirm: true
})

onMounted(async () => {
    loading.value = true
    try {
        const { $axios } = useNuxtApp()
        const res = await $axios.get(`/api/transport-allowance/${allowanceId.value}`)
        allowance.value = res.data
    } catch (e) {
        console.error('Error loading allowance detail:', e)
    } finally {
        loading.value = false
    }
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMonthYear = (bulan: number, tahun: number) => {
  if (!bulan || !tahun) return '-'
  const date = new Date(tahun, bulan - 1)
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
}

const confirmDelete = () => {
    modalConfig.title = 'Konfirmasi Hapus'
    modalConfig.message = 'Apakah Anda yakin ingin menghapus catatan tunjangan transport ini? Tindakan ini tidak dapat dibatalkan.'
    modalConfig.type = 'danger'
    modalConfig.isConfirm = true
    modalConfig.isOpen = true
}

const executeDelete = async () => {
    modalConfig.isOpen = false
    try {
        await deleteAllowance(allowanceId.value)
        router.push('/transport-allowance')
    } catch (err) {
        // Log or handle error
    }
}

const onModalClose = () => {
    modalConfig.isOpen = false
}

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.transport-allowance-detail { max-width: 1200px; margin: 0 auto; }
.card { border-radius: 12px; }
.info-row label { letter-spacing: 0.02em; }
</style>
