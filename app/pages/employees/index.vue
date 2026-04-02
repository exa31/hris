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
          <NuxtLink v-if="hasPermission('employees', 'create')" to="/employees/new" class="btn btn-primary">
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
        <div class="col-auto ms-auto" v-if="hasPermission('employees', 'delete') || hasPermission('employees', 'update')">
          <button
            v-if="selectedEmployees.length > 0 && hasPermission('employees', 'delete')"
            class="btn btn-outline-danger me-2"
            @click="confirmBulkDelete"
          >
            <i class="bi bi-trash"></i> Hapus ({{ selectedEmployees.length }})
          </button>
          <div v-if="selectedEmployees.length > 0 && hasPermission('employees', 'update')" class="btn-group" role="group">
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
      <div class="row g-3 mt-3 align-items-end">
        <!-- Search -->
        <div class="col-md-3">
          <label class="form-label small fw-bold">Cari Pegawai</label>
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control border-start-0"
              placeholder="Nama / NIP..."
            />
          </div>
        </div>

        <!-- Filter Jabatan -->
        <div class="col-md-4">
          <label class="form-label small fw-bold">Filter Jabatan</label>
          <div class="d-flex flex-wrap gap-2 py-1">
            <div v-for="pos in ['Manager', 'Staf', 'Magang']" :key="pos">
              <input 
                type="checkbox" 
                class="btn-check" 
                :id="'filterPos' + pos" 
                :value="pos"
                v-model="selectedPositions"
                autocomplete="off"
              >
              <label 
                class="btn btn-outline-primary btn-sm px-3 rounded-pill" 
                :for="'filterPos' + pos"
              >
                {{ pos }}
              </label>
            </div>
          </div>
        </div>

        <!-- Filter Masa Kerja -->
        <div class="col-md-3">
          <label class="form-label small fw-bold">Masa Kerja (Thn)</label>
          <div class="input-group">
            <select v-model="tenureOperator" class="form-select border-end-0" style="max-width: 65px;">
              <option value=">">&gt;</option>
              <option value="=">=</option>
              <option value="<">&lt;</option>
            </select>
            <input 
              type="number" 
              class="form-control" 
              v-model="tenureValue" 
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <!-- Reset Button -->
        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100" @click="resetFilters" title="Reset Filter">
            <i class="bi bi-arrow-clockwise"></i> Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive bg-white rounded shadow-sm">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th style="width: 40px">
              <input
                type="checkbox"
                class="form-check-input"
                @change="toggleSelectAll()"
                :checked="selectedEmployees.length === employees.length && employees.length > 0"
              />
            </th>
            <th>No.</th>
            <th class="sortable" @click="handleSort('nip')">NIP</th>
            <th class="sortable" @click="handleSort('name')">Nama</th>
            <th>Jabatan</th>
            <th>Masa Kerja</th>
            <th style="width: 15%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-5">
              <div class="spinner-border text-primary spinner-border-sm me-2"></div>
              Memuat data...
            </td>
          </tr>
          <tr v-else-if="employees.length === 0">
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-2 d-block mb-2"></i>
              Tidak ada data pegawai
            </td>
          </tr>
          <tr v-else v-for="(emp, idx) in employees" :key="emp.id">
            <td>
              <input type="checkbox" class="form-check-input" v-model="selectedEmployees" :value="emp.id" />
            </td>
            <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
            <td><code>{{ emp.nip }}</code></td>
            <td class="fw-bold">{{ emp.name }}</td>
            <td><span class="badge bg-info-subtle text-info border border-info-subtle">{{ emp.position }}</span></td>
            <td>{{ calculateTenure(emp.join_date) }} Thn</td>
            <td>
              <div class="btn-group btn-group-sm">
                <NuxtLink :to="`/employees/${emp.id}`" class="btn btn-outline-primary" title="Detail">
                  <i class="bi bi-eye"></i>
                </NuxtLink>
                <NuxtLink v-if="hasPermission('employees', 'update')" :to="`/employees/${emp.id}/edit`" class="btn btn-outline-warning" title="Edit">
                  <i class="bi bi-pencil"></i>
                </NuxtLink>
                <button v-if="hasPermission('employees', 'delete')" class="btn btn-outline-danger" @click="deleteEmployee(emp.id)" title="Hapus">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-3" v-if="totalPages > 1">
        <small class="text-muted">Total {{ totalEmployees }} data</small>
        <nav>
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="currentPage--"><i class="bi bi-chevron-left"></i></button>
                </li>
                <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="currentPage++"><i class="bi bi-chevron-right"></i></button>
                </li>
            </ul>
        </nav>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="modalConfig.isConfirm"
      @close="modalConfig.isOpen = false"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useEmployees } from '~/composables/useEmployees'
import { useAuth } from '~/composables/useAuth'

// Auth Context
const { hasPermission } = useAuth()

// Modal State
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
  isConfirm: true,
  action: null as 'delete' | 'bulkDelete' | 'bulkStatus' | 'alert' | null,
  payload: null as any
})

const {
  employees,
  loading,
  currentPage,
  itemsPerPage,
  totalEmployees,
  totalPages,
  searchQuery,
  selectedEmployees,
  sortColumn,
  sortDirection,
  selectedPositions,
  tenureOperator,
  tenureValue,
  fetchEmployees,
  deleteEmployee: deleteMethod,
  deleteSelectedEmployees,
  updateStatusBulk: statusMethod,
  toggleSelectAll,
  resetFilters: resetFiltersMethod,
} = useEmployees()

const showAlert = (title: string, message: string, type: any = 'primary') => {
  modalConfig.title = title
  modalConfig.message = message
  modalConfig.type = type
  modalConfig.isConfirm = false
  modalConfig.action = 'alert'
  modalConfig.isOpen = true
}

const handleModalConfirm = async () => {
    modalConfig.isOpen = false
    try {
        if (modalConfig.action === 'delete') {
            await deleteMethod(modalConfig.payload)
        } else if (modalConfig.action === 'bulkDelete') {
            await deleteSelectedEmployees()
        } else if (modalConfig.action === 'bulkStatus') {
            await statusMethod(modalConfig.payload)
        }
        await fetchEmployees()
    } catch (err) {
        showAlert('Error', 'Gagal memproses data', 'danger')
    }
}

const deleteEmployee = (id: number) => {
  modalConfig.title = 'Hapus Pegawai'
  modalConfig.message = 'Yakin ingin menghapus data ini?'
  modalConfig.type = 'danger'
  modalConfig.isConfirm = true
  modalConfig.action = 'delete'
  modalConfig.payload = id
  modalConfig.isOpen = true
}

const confirmBulkDelete = () => {
  modalConfig.title = 'Hapus Terpilih'
  modalConfig.message = `Hapus ${selectedEmployees.value.length} data terpilih?`
  modalConfig.type = 'danger'
  modalConfig.isConfirm = true
  modalConfig.action = 'bulkDelete'
  modalConfig.isOpen = true
}

const updateStatusBulk = (status: boolean) => {
  modalConfig.title = 'Update Status'
  modalConfig.message = `Update status ${selectedEmployees.value.length} data menjadi ${status ? 'Aktif' : 'Nonaktif'}?`
  modalConfig.type = 'warning'
  modalConfig.isConfirm = true
  modalConfig.action = 'bulkStatus'
  modalConfig.payload = status
  modalConfig.isOpen = true
}

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const calculateTenure = (joinDate: string) => {
  if (!joinDate) return 0
  const join = new Date(joinDate)
  const now = new Date()
  let years = now.getFullYear() - join.getFullYear()
  if (now.getMonth() < join.getMonth() || (now.getMonth() === join.getMonth() && now.getDate() < join.getDate())) {
    years--
  }
  return years > 0 ? years : 0
}

const resetFilters = () => {
  resetFiltersMethod()
  fetchEmployees()
}

const downloadExcel = () => {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedPositions.value.length > 0) params.append('positions', selectedPositions.value.join(','))
    if (tenureOperator.value) params.append('tenureOperator', tenureOperator.value)
    if (tenureValue.value !== null) params.append('tenureValue', String(tenureValue.value))
    if (sortColumn.value) params.append('sortColumn', sortColumn.value)
    if (sortDirection.value) params.append('sortDirection', sortDirection.value)

    window.open(`/api/employees/export-excel?${params.toString()}`, '_blank')
}

const downloadPdf = () => {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedPositions.value.length > 0) params.append('positions', selectedPositions.value.join(','))
    if (tenureOperator.value) params.append('tenureOperator', tenureOperator.value)
    if (tenureValue.value !== null) params.append('tenureValue', String(tenureValue.value))
    if (sortColumn.value) params.append('sortColumn', sortColumn.value)
    if (sortDirection.value) params.append('sortDirection', sortDirection.value)

    window.open(`/api/employees/export-pdf?${params.toString()}`, '_blank')
}

onMounted(() => fetchEmployees())
watch([currentPage, searchQuery, selectedPositions, tenureOperator, tenureValue, sortColumn, sortDirection], () => fetchEmployees())

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.page-header h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; }
.actions-panel { background: #f8fafc; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
.sortable { cursor: pointer; }
.sortable:hover { color: #0d6efd; }
</style>
