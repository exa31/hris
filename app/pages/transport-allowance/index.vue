<template>
  <div class="transport-allowance-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="bi bi-truck text-primary"></i> Tunjangan Transport</h1>
          <p class="text-muted mb-0">Kelola tunjangan transport pegawai berdasarkan jarak tempuh dan hari masuk kerja</p>
        </div>
        <NuxtLink to="/transport-allowance/new" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Tambah Data
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="row g-2 mb-3">
      <div class="col-md-4">
        <div class="input-group">
          <span class="input-group-text bg-light">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Cari nama/NIP..."
          />
        </div>
      </div>

      <div class="col-md-2">
        <select v-model.number="filterMonth" class="form-select">
          <option v-for="m in 12" :key="m" :value="m">
            {{ new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'short' }) }}
          </option>
        </select>
      </div>

      <div class="col-md-2">
        <input v-model.number="filterYear" type="number" class="form-control" />
      </div>

      <div class="col-md-2">
        <select v-model="filterStatus" class="form-select">
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Dibayar</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div class="col-md-2">
        <button class="btn btn-outline-secondary w-100" @click="resetFilters">
          <i class="bi bi-arrow-clockwise"></i> Reset
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th style="width: 80px">NIP</th>
            <th>Nama</th>
            <th>Departemen</th>
            <th>Jarak (km)</th>
            <th>Hari Masuk</th>
            <th class="text-end">Tunjangan</th>
            <th style="width: 100px">Status</th>
            <th style="width: 100px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="allowance in paginatedAllowances" :key="allowance.id">
            <td>
              <small class="text-monospace fw-bold">{{ allowance.nip }}</small>
            </td>
            <td>
              <span class="fw-500">{{ allowance.employeeName }}</span>
            </td>
            <td>
              <small class="text-muted">{{ allowance.departemen }}</small>
            </td>
            <td>
              <small class="badge bg-light text-dark">{{ allowance.jarak }} km</small>
            </td>
            <td class="text-center">
              <span :class="[
                'badge',
                allowance.hariMasukKerja >= 19 ? 'bg-success' : 'bg-warning'
              ]">
                {{ allowance.hariMasukKerja }}
              </span>
            </td>
            <td class="text-end">
              <strong>{{ formatCurrency(allowance.tunjangan) }}</strong>
            </td>
            <td>
              <select
                :value="allowance.statusPembayaran"
                @change="(e) => updateStatus(allowance.id, (e.target as HTMLSelectElement).value as any)"
                :class="[
                  'form-select form-select-sm',
                  allowance.statusPembayaran === 'paid' ? 'bg-success bg-opacity-10' : '',
                  allowance.statusPembayaran === 'pending' ? 'bg-warning bg-opacity-10' : '',
                  allowance.statusPembayaran === 'rejected' ? 'bg-danger bg-opacity-10' : ''
                ]"
              >
                <option value="pending">Pending</option>
                <option value="paid">Dibayar</option>
                <option value="rejected">Ditolak</option>
              </select>
            </td>
            <td>
              <div class="btn-group btn-group-sm" role="group">
                <NuxtLink
                  :to="`/transport-allowance/${allowance.id}`"
                  class="btn btn-outline-primary"
                  title="Detail"
                >
                  <i class="bi bi-eye"></i>
                </NuxtLink>
                <NuxtLink
                  :to="`/transport-allowance/${allowance.id}/edit`"
                  class="btn btn-outline-warning"
                  title="Edit"
                >
                  <i class="bi bi-pencil"></i>
                </NuxtLink>
                <button
                  class="btn btn-outline-danger"
                  @click="deleteAllowanceRecord(allowance.id)"
                  title="Hapus"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedAllowances.length === 0">
            <td colspan="8" class="text-center text-muted py-4">
              <i class="bi bi-inbox"></i> Tidak ada data tunjangan transport
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, totalAllowances) }}
        dari {{ totalAllowances }} data
      </small>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button
              class="page-link"
              @click="currentPage--"
              :disabled="currentPage === 1"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="currentPage = page">
              {{ page }}
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button
              class="page-link"
              @click="currentPage++"
              :disabled="currentPage === totalPages"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Info Box -->
    <div class="alert alert-info mt-4 small">
      <i class="bi bi-info-circle"></i>
      <strong>Bulan:</strong> {{ getMonthYear() }} |
      <strong>Total Tunjangan:</strong> {{ formatCurrency(totalAllowanceAmount) }} |
      <strong>Rata-rata:</strong> {{ formatCurrency(averageAllowance) }}
    </div>
  </div>
  </div>    
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTransportAllowance } from '~/composables/useTransportAllowance'

const {
  searchQuery,
  filterMonth,
  filterYear,
  filterStatus,
  currentPage,
  itemsPerPage,
  paginatedAllowances,
  totalPages,
  totalAllowances,
  filteredAllowances,
  updateStatus,
  getMonthYear,
  formatCurrency
} = useTransportAllowance()

const totalAllowanceAmount = computed(() => {
  return filteredAllowances.value.reduce((sum, a) => sum + a.tunjangan, 0)
})

const averageAllowance = computed(() => {
  return filteredAllowances.value.length > 0 ? totalAllowanceAmount.value / filteredAllowances.value.length : 0
})

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  currentPage.value = 1
}

const downloadExcel = () => {
  alert('Fitur download Excel akan dikembangkan lebih lanjut')
}

const deleteAllowanceRecord = async (id: number) => {
  const { useTransportAllowance: useTA } = await import('~/composables/useTransportAllowance')
  const transport = useTA()
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    transport.deleteAllowance(id)
  }
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.transport-allowance-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  padding-top: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 0.875rem;
  margin-bottom: 0;
}

.actions-panel {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.text-monospace {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>
