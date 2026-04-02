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
        <div class="col-md-3">
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

        <!-- Filter Jabatan (Multi select) -->
        <div class="col-md-3">
          <label class="form-label small fw-bold">Jabatan</label>
          <select
            v-model="selectedPositions"
            class="form-select form-select-sm"
            multiple
            size="3"
          >
            <option value="Manager">Manager</option>
            <option value="Staf">Staf</option>
            <option value="Magang">Magang</option>
          </select>
          <small class="text-muted" style="font-size: 0.7em;">Tahan Ctrl/Cmd untuk memilih lebih dari satu</small>
        </div>

        <!-- Filter Masa Kerja -->
        <div class="col-md-4">
          <label class="form-label small fw-bold">Masa Kerja (Tahun)</label>
          <div class="input-group input-group-sm">
            <select v-model="tenureOperator" class="form-select" style="max-width: 80px;">
              <option value=">">&gt;</option>
              <option value="=">=</option>
              <option value="<">&lt;</option>
            </select>
            <input 
              type="number" 
              class="form-control" 
              v-model="tenureValue" 
              placeholder="Angka (Contoh: 5)"
              min="0"
            />
          </div>
        </div>

        <!-- Reset Button -->
        <div class="col-md-2 d-flex align-items-end mb-1">
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
                  selectedEmployees.length === employees.length &&
                  employees.length > 0
                "
              />
            </th>
            <th>No.</th>
            <th class="sortable" @click="handleSort('nip')">
              NIP <i v-if="sortColumn === 'nip'" :class="sortDirection === 'asc' ? 'bi bi-sort-numeric-up' : 'bi bi-sort-numeric-down'"></i>
            </th>
            <th class="sortable" @click="handleSort('name')">
              Nama <i v-if="sortColumn === 'name'" :class="sortDirection === 'asc' ? 'bi bi-sort-alpha-up' : 'bi bi-sort-alpha-down'"></i>
            </th>
            <th class="sortable" @click="handleSort('position')">
              Jabatan <i v-if="sortColumn === 'position'" :class="sortDirection === 'asc' ? 'bi bi-sort-alpha-up' : 'bi bi-sort-alpha-down'"></i>
            </th>
            <th class="sortable" @click="handleSort('join_date')">
              Tanggal Masuk <i v-if="sortColumn === 'join_date'" :class="sortDirection === 'asc' ? 'bi bi-sort-numeric-up' : 'bi bi-sort-numeric-down'"></i>
            </th>
            <th class="sortable" @click="handleSort('join_date')">
              Masa Kerja <i v-if="sortColumn === 'join_date'" :class="sortDirection === 'asc' ? 'bi bi-sort-numeric-up' : 'bi bi-sort-numeric-down'"></i>
            </th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(emp, idx) in employees" :key="emp.id">
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                v-model="selectedEmployees"
                :value="emp.id"
              />
            </td>
            <td>
              <small>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</small>
            </td>
            <td>
              <small class="text-monospace">{{ emp.nip }}</small>
            </td>
            <td>
              <span class="fw-500">{{ emp.name }}</span>
            </td>
            <td>
              <span class="badge bg-info">{{ emp.position }}</span>
            </td>
            <td>
              <small>{{ formatDate(emp.join_date) }}</small>
            </td>
            <td>
              <small>{{ calculateTenure(emp.join_date) }} Tahun</small>
            </td>
            <td>
              <div class="btn-group btn-group-sm" role="group">
                <NuxtLink :to="`/employees/${emp.id}`" class="btn btn-outline-primary" title="Detail">
                  <i class="bi bi-eye"></i> Detail
                </NuxtLink>
                <NuxtLink :to="`/employees/${emp.id}/edit`" class="btn btn-outline-warning" title="Edit">
                  <i class="bi bi-pencil"></i> Edit
                </NuxtLink>
                <button
                  class="btn btn-outline-success"
                  @click="downloadPersonalPdf(emp)"
                  title="Download PDF"
                >
                  <i class="bi bi-download"></i> PDF
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="employees.length === 0 && !loading">
            <td colspan="8" class="text-center text-muted py-4">
              <i class="bi bi-inbox"></i> Tidak ada data pegawai
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="8" class="text-center text-muted py-4">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Memuat data...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
        {{ Math.min(currentPage * itemsPerPage, totalEmployees) }}
        dari {{ totalEmployees }} data
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
import { ref, onMounted, watch } from 'vue'
import { useEmployees } from '~/composables/useEmployees'

const showDeleteConfirm = ref(false)

const {
  employees,
  loading,
  error,
  currentPage,
  itemsPerPage,
  totalEmployees,
  totalPages,
  searchQuery,
  selectedDepartment,
  selectedStatus,
  selectedEmployees,
  sortColumn,
  sortDirection,
  selectedPositions,
  tenureOperator,
  tenureValue,
  fetchEmployees,
  deleteEmployee: deleteEmployeeMethod,
  deleteSelectedEmployees,
  updateStatusBulk: updateStatusBulkMethod,
  toggleSelectAll,
  resetFilters: resetFiltersMethod,
} = useEmployees()

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const calculateTenure = (joinDate: string) => {
  const join = new Date(joinDate)
  const now = new Date()
  let years = now.getFullYear() - join.getFullYear()
  if (now.getMonth() < join.getMonth() || (now.getMonth() === join.getMonth() && now.getDate() < join.getDate())) {
    years--
  }
  return years > 0 ? years : 0
}

const downloadPersonalPdf = (emp: any) => {
  alert(`Mendownload data ${emp.name} (PDF)... (Akan dikembangkan lebih lanjut)`)
}

// Load employees on mount
onMounted(() => {
  fetchEmployees()
})

// Refetch when filters or pagination changes
watch([currentPage, itemsPerPage, searchQuery, selectedPositions, tenureOperator, tenureValue, sortColumn, sortDirection], () => {
  fetchEmployees()
})

const deleteEmployee = async (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      await deleteEmployeeMethod(id)
      await fetchEmployees()
    } catch (err) {
      alert('Gagal menghapus data pegawai')
    }
  }
}

const confirmDelete = async () => {
  try {
    await deleteSelectedEmployees()
    await fetchEmployees()
    showDeleteConfirm.value = false
  } catch (err) {
    alert('Gagal menghapus data pegawai')
  }
}

const updateStatusBulk = async (status: boolean) => {
  try {
    await updateStatusBulkMethod(status)
    await fetchEmployees()
  } catch (err) {
    alert('Gagal memperbarui status pegawai')
  }
}

const resetFilters = () => {
  resetFiltersMethod()
  fetchEmployees()
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
