<template>
  <div class="employees-list">
    <!-- Header -->
    <div class="page-header">
      <h1>Data Pegawai</h1>
      <p class="text-muted">Kelola data pegawai, tambah data baru, ubah, atau hapus data pegawai</p>
    </div>

    <!-- Action Buttons & Filters -->
    <div class="actions-panel mb-4">
      <div class="row g-3">
        <!-- Left Actions -->
        <div class="col-auto">
          <NuxtLink to="/employees/new" class="btn btn-primary">
            <i class="bi bi-plus-lg"></i> Data Baru
          </NuxtLink>
          <button class="btn btn-success ms-2" @click="downloadExcel" title="Download Excel">
            <i class="bi bi-file-earmark-spreadsheet"></i> Excel
          </button>
          <button class="btn btn-danger ms-2" @click="downloadPdf" title="Download PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
        </div>

        <!-- Right Actions -->
        <div class="col-auto ms-auto">
          <button
            v-if="selectedEmployees.length > 0"
            class="btn btn-outline-danger me-2"
            @click="showDeleteConfirm = true"
          >
            <i class="bi bi-trash"></i> Hapus ({{ selectedEmployees.length }})
          </button>
          <div v-if="selectedEmployees.length > 0" class="btn-group" role="group">
            <button
              class="btn btn-outline-warning"
              @click="updateStatusBulk(true)"
              title="Aktifkan"
            >
              Aktif
            </button>
            <button
              class="btn btn-outline-warning"
              @click="updateStatusBulk(false)"
              title="Nonaktifkan"
            >
              Nonaktif
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Filter Row -->
      <div class="row g-3 mt-2">
        <!-- Search -->
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text bg-light">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Cari nama/NIP/jabatan..."
            />
          </div>
        </div>

        <!-- Filter Jabatan -->
        <div class="col-md-3">
          <label class="form-label small fw-bold">Jabatan</label>
          <select
            v-model="selectedJabatan"
            multiple
            class="form-select form-select-sm"
            size="3"
          >
            <option value="Manager">Manager</option>
            <option value="Staf">Staf</option>
            <option value="Magang">Magang</option>
          </select>
        </div>

        <!-- Filter Masa Kerja -->
        <div class="col-md-3">
          <label class="form-label small fw-bold">Masa Kerja</label>
          <div class="input-group input-group-sm">
            <select v-model="masaKerjaOperator" class="form-select">
              <option value=">">Lebih dari</option>
              <option value="=">Sama dengan</option>
              <option value="<">Kurang dari</option>
            </select>
            <input
              v-model.number="masaKerjaValue"
              type="number"
              class="form-control"
              placeholder="Tahun"
              min="0"
            />
          </div>
        </div>

        <!-- Reset Button -->
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-outline-secondary btn-sm w-100" @click="resetFilters">
            <i class="bi bi-arrow-clockwise"></i> Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th style="width: 40px">
              <input
                type="checkbox"
                class="form-check-input"
                @change="toggleSelectAll()"
                :checked="
                  selectedEmployees.length ===
                  paginatedEmployees.length &&
                  paginatedEmployees.length > 0
                "
              />
            </th>
            <th @click="setSortBy('nip')" style="cursor: pointer" class="sortable">
              NIP
              <i
                v-if="sortBy === 'nip'"
                :class="
                  sortOrder === 'asc'
                    ? 'bi bi-sort-up'
                    : 'bi bi-sort-down'
                "
                class="bi ms-1"
              ></i>
            </th>
            <th @click="setSortBy('nama')" style="cursor: pointer" class="sortable">
              Nama
              <i
                v-if="sortBy === 'nama'"
                :class="
                  sortOrder === 'asc'
                    ? 'bi bi-sort-up'
                    : 'bi bi-sort-down'
                "
                class="bi ms-1"
              ></i>
            </th>
            <th @click="setSortBy('jabatan')" style="cursor: pointer" class="sortable">
              Jabatan
              <i
                v-if="sortBy === 'jabatan'"
                :class="
                  sortOrder === 'asc'
                    ? 'bi bi-sort-up'
                    : 'bi bi-sort-down'
                "
                class="bi ms-1"
              ></i>
            </th>
            <th @click="setSortBy('tanggalMasuk')" style="cursor: pointer" class="sortable">
              Tanggal Masuk
              <i
                v-if="sortBy === 'tanggalMasuk'"
                :class="
                  sortOrder === 'asc'
                    ? 'bi bi-sort-up'
                    : 'bi bi-sort-down'
                "
                class="bi ms-1"
              ></i>
            </th>
            <th @click="setSortBy('masaKerja')" style="cursor: pointer" class="sortable">
              Masa Kerja
              <i
                v-if="sortBy === 'masaKerja'"
                :class="
                  sortOrder === 'asc'
                    ? 'bi bi-sort-up'
                    : 'bi bi-sort-down'
                "
                class="bi ms-1"
              ></i>
            </th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(emp, idx) in paginatedEmployees" :key="emp.id">
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                v-model="selectedEmployees"
                :value="emp.id"
              />
            </td>
            <td>
              <small class="text-monospace">{{ emp.nip }}</small>
            </td>
            <td>
              <span class="fw-500">{{ emp.nama }}</span>
            </td>
            <td>
              <span class="badge bg-info">{{ emp.jabatan }}</span>
            </td>
            <td>
              <small>{{ formatDate(emp.tanggalMasuk) }}</small>
            </td>
            <td>
              <small>{{ emp.masaKerja }} tahun</small>
            </td>
            <td>
              <div class="btn-group btn-group-sm" role="group">
                <NuxtLink :to="`/employees/${emp.id}`" class="btn btn-outline-primary" title="Lihat Detail">
                  <i class="bi bi-eye"></i>
                </NuxtLink>
                <NuxtLink :to="`/employees/${emp.id}/edit`" class="btn btn-outline-warning" title="Edit">
                  <i class="bi bi-pencil"></i>
                </NuxtLink>
                <button
                  class="btn btn-outline-danger"
                  @click="deleteEmployee(emp.id)"
                  title="Hapus"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedEmployees.length === 0">
            <td colspan="7" class="text-center text-muted py-4">
              <i class="bi bi-inbox"></i> Tidak ada data pegawai
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, paginatedEmployees.length) }}
        dari {{ paginatedEmployees.length }} data
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

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="modal show d-block"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Konfirmasi Hapus</h5>
            <button type="button" class="btn-close" @click="showDeleteConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin menghapus {{ selectedEmployees.length }} data pegawai?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">
              Batal
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEmployees } from '~/composables/useEmployees'

const showDeleteConfirm = ref(false)

const {
  sortBy,
  sortOrder,
  searchQuery,
  selectedJabatan,
  masaKerjaOperator,
  masaKerjaValue,
  currentPage,
  itemsPerPage,
  selectedEmployees,
  paginatedEmployees,
  totalPages,
  resetFilters: resetFiltersMethod,
  deleteEmployee: deleteEmployeeMethod,
  deleteSelectedEmployees,
  updateStatusBulk: updateStatusBulkMethod,
  toggleSelectAll
} = useEmployees()

const setSortBy = (field: any) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const deleteEmployee = (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    deleteEmployeeMethod(id)
  }
}

const confirmDelete = () => {
  deleteSelectedEmployees()
  showDeleteConfirm.value = false
}

const updateStatusBulk = (status: boolean) => {
  updateStatusBulkMethod(status)
}

const resetFilters = () => {
  resetFiltersMethod()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const downloadExcel = () => {
  alert('Fitur download Excel akan dikembangkan lebih lanjut')
}

const downloadPdf = () => {
  alert('Fitur download PDF akan dikembangkan lebih lanjut')
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

.actions-panel {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.sortable {
  user-select: none;
}

.sortable:hover {
  color: #667eea;
}

.text-monospace {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.fw-500 {
  font-weight: 500;
}

.modal.show {
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
