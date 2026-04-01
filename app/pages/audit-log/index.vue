<template>
  <div class="audit-log">
    <!-- Header -->
    <div class="page-header">
      <h1>Log Aktivitas Sistem</h1>
      <p class="text-muted">Pantau aktivitas login, logout, dan perubahan data dalam sistem</p>
    </div>

    <!-- Filters -->
    <div class="filters-panel mb-4">
      <div class="row g-3">
        <!-- Search -->
        <div class="col-md-4">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Cari nama/modul/deskripsi..."
            />
          </div>
        </div>

        <!-- Filter Modul -->
        <div class="col-md-2">
          <select v-model="filterModul" class="form-select form-select-sm">
            <option value="all">Semua Modul</option>
            <option v-for="m in uniqueModuls" :key="m" :value="m">
              {{ m }}
            </option>
          </select>
        </div>

        <!-- Filter Aksi -->
        <div class="col-md-2">
          <select v-model="filterAksi" class="form-select form-select-sm">
            <option value="all">Semua Aksi</option>
            <option value="create">Create</option>
            <option value="read">Read</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        <!-- Filter User -->
        <div class="col-md-2">
          <select v-model="filterUser" class="form-select form-select-sm">
            <option value="all">Semua User</option>
            <option v-for="u in uniqueUsers" :key="u" :value="u">
              {{ u }}
            </option>
          </select>
        </div>

        <!-- Reset Button -->
        <div class="col-md-2">
          <button class="btn btn-outline-secondary btn-sm w-100" @click="resetFilters">
            <i class="bi bi-arrow-clockwise"></i> Reset
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="row g-3 mt-2">
        <div class="col-md-4">
          <label class="form-label small fw-bold mb-1">Dari Tanggal</label>
          <input
            v-model="filterDateFrom"
            type="datetime-local"
            class="form-control form-control-sm"
          />
        </div>

        <div class="col-md-4">
          <label class="form-label small fw-bold mb-1">Sampai Tanggal</label>
          <input
            v-model="filterDateTo"
            type="datetime-local"
            class="form-control form-control-sm"
          />
        </div>

        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-outline-primary btn-sm w-100" @click="exportLogs">
            <i class="bi bi-download"></i> Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th style="width: 180px">Tanggal & Waktu</th>
            <th style="width: 120px">User</th>
            <th style="width: 130px">Modul</th>
            <th style="width: 80px">Aksi</th>
            <th>Deskripsi</th>
            <th style="width: 140px">IP Address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in paginatedLogs" :key="log.id">
            <td>
              <small class="text-monospace">{{ formatDateTime(log.timestamp) }}</small>
            </td>
            <td>
              <span class="badge bg-light text-dark">{{ log.userName }}</span>
            </td>
            <td>
              <small class="fw-500">{{ log.modul }}</small>
            </td>
            <td>
              <span :class="[
                'badge',
                log.aksi === 'create' ? 'bg-success' : '',
                log.aksi === 'read' ? 'bg-info' : '',
                log.aksi === 'update' ? 'bg-warning' : '',
                log.aksi === 'delete' ? 'bg-danger' : ''
              ]">
                {{ log.aksi.toUpperCase() }}
              </span>
            </td>
            <td>
              <small>{{ log.deskripsi }}</small>
            </td>
            <td>
              <small class="text-muted">{{ log.ipAddress || '-' }}</small>
            </td>
          </tr>
          <tr v-if="paginatedLogs.length === 0">
            <td colspan="6" class="text-center text-muted py-4">
              <i class="bi bi-inbox"></i> Tidak ada log aktivitas
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, totalLogs) }}
        dari {{ totalLogs }} log
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

    <!-- Summary -->
    <div class="row mt-4">
      <div class="col-md-3">
        <div class="card bg-light">
          <div class="card-body text-center">
            <i class="bi bi-file-text" style="font-size: 1.5rem; color: #667eea"></i>
            <h6 class="text-muted mt-2">Total Log</h6>
            <h4>{{ totalLogs }}</h4>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-light">
          <div class="card-body text-center">
            <i class="bi bi-pencil-square" style="font-size: 1.5rem; color: #f59e0b"></i>
            <h6 class="text-muted mt-2">Update</h6>
            <h4>{{ countByAction('update') }}</h4>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-light">
          <div class="card-body text-center">
            <i class="bi bi-plus-circle" style="font-size: 1.5rem; color: #10b981"></i>
            <h6 class="text-muted mt-2">Create</h6>
            <h4>{{ countByAction('create') }}</h4>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-light">
          <div class="card-body text-center">
            <i class="bi bi-trash" style="font-size: 1.5rem; color: #ef4444"></i>
            <h6 class="text-muted mt-2">Delete</h6>
            <h4>{{ countByAction('delete') }}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuditLog } from '~/composables/useAuditLog'

const {
  searchQuery,
  filterModul,
  filterAksi,
  filterUser,
  filterDateFrom,
  filterDateTo,
  currentPage,
  itemsPerPage,
  paginatedLogs,
  totalPages,
  totalLogs,
  filteredLogs,
  uniqueModuls,
  uniqueUsers,
  formatDateTime,
  resetFilters
} = useAuditLog()

const countByAction = (action: string) => {
  return filteredLogs.value.filter(log => log.aksi === action).length
}

const exportLogs = () => {
  alert('Fitur export CSV akan dikembangkan lebih lanjut')
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

.filters-panel {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.text-monospace {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
