<template>
  <div class="transport-allowance-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="bi bi-truck text-primary"></i> Tunjangan Transport</h1>
          <p class="text-muted mb-0">Kelola tunjangan transport pegawai berdasarkan jarak tempuh dan hari masuk kerja</p>
        </div>
        <NuxtLink v-if="hasPermission('transport', 'create')" to="/transport-allowance/new" class="btn btn-primary shadow-sm rounded-pill px-4">
          <i class="bi bi-plus-lg"></i> Tambah Data
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="row g-3 mb-4 align-items-end">
      <div class="col-md-4">
        <label class="form-label small fw-bold">Cari Nama / NIP</label>
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control border-start-0"
            placeholder="Ketik nama pegawai..."
          />
        </div>
      </div>

      <div class="col-md-2">
        <label class="form-label small fw-bold">Bulan</label>
        <select v-model.number="filterMonth" class="form-select">
          <option v-for="m in 12" :key="m" :value="m">
            {{ new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'long' }) }}
          </option>
        </select>
      </div>

      <div class="col-md-2">
        <label class="form-label small fw-bold">Tahun</label>
        <input v-model.number="filterYear" type="number" class="form-control" />
      </div>

      <div class="col-md-2">
        <label class="form-label small fw-bold">Aksi</label>
        <button class="btn btn-outline-secondary w-100" @click="resetFilters">
          <i class="bi bi-arrow-clockwise"></i> Reset
        </button>
      </div>
      
      <div class="col-md-2">
        <label class="form-label small fw-bold">Export</label>
        <button class="btn btn-success w-100" @click="downloadExcel">
          <i class="bi bi-file-earmark-excel"></i> Excel
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light">
            <tr>
              <th class="px-4 py-3" style="width: 100px">NIP</th>
              <th class="py-3">Nama Lengkap</th>
              <th class="py-3">Departemen</th>
              <th class="py-3 text-center">Jarak (km)</th>
              <th class="py-3 text-center">Hari Masuk</th>
              <th class="py-3 text-end px-4">Tunjangan</th>
              <th v-if="hasPermission('transport', 'delete')" class="py-3 text-center" style="width: 150px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-5 text-muted">
                <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                Memuat data...
              </td>
            </tr>
            <tr v-else-if="allowances.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                Tidak ada data tunjangan transport ditemukan
              </td>
            </tr>
            <tr v-else v-for="allowance in allowances" :key="allowance.id">
              <td class="px-4">
                <small class="text-monospace fw-bold text-primary">{{ allowance.nip }}</small>
              </td>
              <td>
                <span class="fw-medium text-dark">{{ allowance.employeeName }}</span>
              </td>
              <td>
                <span class="badge bg-secondary-subtle text-secondary small">{{ allowance.departemen }}</span>
              </td>
              <td class="text-center">
                <span class="text-dark small">{{ allowance.distance_km }} km</span>
              </td>
              <td class="text-center">
                <span :class="[
                  'badge rounded-pill px-3',
                  allowance.working_days >= 19 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'
                ]">
                  {{ allowance.working_days }} Hari
                </span>
              </td>
              <td class="text-end px-4 fw-bold text-dark">
                {{ formatCurrency(allowance.total_allowance) }}
              </td>
              <td v-if="hasPermission('transport', 'delete')" class="text-center px-4">
                <button class="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-none" @click="handleDelete(allowance.id)" title="Hapus">
                  <i class="bi bi-trash me-1"></i> Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-4 px-1">
      <small class="text-muted">
        Total <span class="fw-bold">{{ totalAllowances }}</span> data ditemukan
      </small>
      <nav v-if="totalPages > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link shadow-none" @click="currentPage--">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
            <button class="page-link shadow-none" @click="currentPage = page">
              {{ page }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link shadow-none" @click="currentPage++">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Info Summary Card -->
    <div v-if="allowances.length > 0" class="card mt-4 border-0 bg-primary-subtle rounded-3 p-3">
        <div class="row align-items-center">
            <div class="col-md-4 border-end border-primary-subtle text-center">
                <div class="small text-primary-emphasis mb-1">Periode</div>
                <div class="h5 mb-0 fw-bold">{{ getMonthYear() }}</div>
            </div>
            <div class="col-md-4 border-end border-primary-subtle text-center">
                <div class="small text-primary-emphasis mb-1">Total Dana Tunjangan</div>
                <div class="h5 mb-0 fw-bold">{{ formatCurrency(totalAmount) }}</div>
            </div>
            <div class="col-md-4 text-center">
                <div class="small text-primary-emphasis mb-1">Rata-rata per Orang</div>
                <div class="h5 mb-0 fw-bold">{{ formatCurrency(avgAmount) }}</div>
            </div>
        </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="modalConfig.isConfirm"
      @close="modalConfig.isOpen = false"
      @confirm="executeAction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, reactive } from 'vue'
import { useTransportAllowance } from '~/composables/useTransportAllowance'
import { useAuth } from '~/composables/useAuth'

const { hasPermission } = useAuth()

const {
  allowances,
  loading,
  searchQuery,
  filterMonth,
  filterYear,
  currentPage,
  totalAllowances,
  totalPages,
  fetchAllowances,
  deleteAllowance,
  getMonthYear,
  formatCurrency
} = useTransportAllowance()

// Modal state
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as any,
  isConfirm: true,
  action: null as any,
  payload: null as any
})

const totalAmount = computed(() => {
    return allowances.value.reduce((sum, a) => sum + parseFloat(a.total_allowance as any), 0)
})

const avgAmount = computed(() => {
    return allowances.value.length > 0 ? totalAmount.value / allowances.value.length : 0
})

const fetch = () => {
    fetchAllowances()
}

onMounted(() => fetch())
watch([filterMonth, filterYear, currentPage, searchQuery], () => fetch())

const resetFilters = () => {
  searchQuery.value = ''
  filterMonth.value = new Date().getMonth() + 1
  filterYear.value = new Date().getFullYear()
  currentPage.value = 1
}

const handleDelete = (id: number) => {
    modalConfig.title = 'Konfirmasi Hapus'
    modalConfig.message = 'Apakah Anda yakin ingin menghapus catatan tunjangan transport ini?'
    modalConfig.type = 'danger'
    modalConfig.isConfirm = true
    modalConfig.action = 'delete'
    modalConfig.payload = id
    modalConfig.isOpen = true
}

const executeAction = async () => {
    modalConfig.isOpen = false
    if (modalConfig.action === 'delete') {
        try {
            await deleteAllowance(modalConfig.payload)
        } catch (err: any) {
            modalConfig.title = 'Terjadi Kesalahan'
            modalConfig.message = 'Gagal menghapus data: ' + (err.response?.data?.message || err.message)
            modalConfig.type = 'danger'
            modalConfig.isConfirm = false
            modalConfig.isOpen = true
        }
    }
}

const downloadExcel = () => {
    modalConfig.title = 'Excel Export'
    modalConfig.message = 'Fitur ekspor Excel sedang disiapkan.'
    modalConfig.type = 'success'
    modalConfig.isConfirm = false
    modalConfig.isOpen = true
}

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.transport-allowance-list { max-width: 1300px; margin: 0 auto; padding: 2rem 1rem; }
.page-header h1 { font-size: 2rem; }
.table-responsive { border-radius: 12px; }
.text-monospace { font-family: 'Courier New', Courier, monospace; letter-spacing: 0.05rem; }
.page-link:hover { background-color: var(--bs-primary-bg-subtle); color: var(--bs-primary); }
</style>
