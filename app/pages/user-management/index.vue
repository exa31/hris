<template>
  <div class="user-management-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="bi bi-people-fill text-primary"></i> Manajemen User</h1>
          <p class="text-muted mb-0">Kelola user dan hak akses sistem</p>
        </div>
        <NuxtLink v-if="hasPermission('users', 'create')" to="/user-management/new" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Tambah User
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="row mb-3 g-2">
      <div class="col-md-8">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Cari berdasarkan username, nama, atau role..."
        />
      </div>
      <div class="col-md-4">
        <select v-model="filterStatus" class="form-select">
          <option :value="null">Semua Status</option>
          <option :value="true">Aktif</option>
          <option :value="false">Non-Aktif</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div class="row g-2 mb-3">
      <div class="col-md-4">
        <div class="card border-0 bg-light">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-0 small">Total User</p>
                <h5 class="mb-0">{{ users.length }}</h5>
              </div>
              <i class="bi bi-people text-primary" style="font-size: 2rem"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 bg-light">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-0 small">User Aktif</p>
                <h5 class="mb-0">{{ users.filter(u => u.is_active).length }}</h5>
              </div>
              <i class="bi bi-check-circle text-success" style="font-size: 2rem"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 bg-light">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-0 small">User Non-Aktif</p>
                <h5 class="mb-0">{{ users.filter(u => !u.is_active).length }}</h5>
              </div>
              <i class="bi bi-x-circle text-danger" style="font-size: 2rem"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 5%">#</th>
              <th>Username</th>
              <th>Nama Pegawai</th>
              <th>Role</th>
              <th>Status</th>
              <th v-if="hasPermission('users', 'update') || hasPermission('users', 'delete')" style="width: 10%">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 mb-0 text-muted">Memuat data user...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.3"></i>
                <p class="mt-3 mb-0 fw-semibold">Tidak ada data user</p>
                <small>Coba gunakan kata kunci pencarian lain</small>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr v-else v-for="(user, idx) in paginatedUsers" :key="user.id">
              <td class="text-muted small">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="p-2 bg-light rounded text-primary me-2">
                    <i class="bi bi-person-fill fs-5"></i>
                  </div>
                  <div>
                    <strong>{{ user.username }}</strong>
                    <div class="small text-muted">ID: #{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.employee_name }}</td>
              <td>
                <span class="badge bg-info text-dark">{{ user.role_name }}</span>
              </td>
              <td>
                <span
                  :class="{
                    'badge bg-success': user.is_active,
                    'badge bg-secondary': !user.is_active
                  }"
                >
                  {{ user.is_active ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </td>
              <td v-if="hasPermission('users', 'update') || hasPermission('users', 'delete')">
                <div class="btn-group btn-group-sm">
                  <NuxtLink v-if="hasPermission('users', 'update')" :to="`/user-management/${user.id}`" class="btn btn-outline-primary" title="Edit User">
                    <i class="bi bi-pencil"></i>
                  </NuxtLink>
                  <div class="d-inline-block" :title="user.role_name?.toLowerCase().replace(/\s/g, '') === 'superadmin' ? 'Role Super Admin tidak dapat dihapus' : 'Hapus User'">
                    <button 
                      v-if="hasPermission('users', 'delete')" 
                      type="button" 
                      class="btn btn-outline-danger" 
                      @click="confirmDelete(user.id)" 
                      :disabled="user.role_name?.toLowerCase().replace(/\s/g, '') === 'superadmin'"
                      :class="{ 'opacity-50 cursor-not-allowed': user.role_name?.toLowerCase().replace(/\s/g, '') === 'superadmin' }"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer bg-light d-flex justify-content-between align-items-center">
        <small class="text-muted">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, totalCount) }} dari {{ totalCount }}
        </small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li :class="{ 'page-item disabled': currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                Sebelumnya
              </button>
            </li>
            <li v-for="page in totalPages" :key="page" :class="{ 'page-item active': currentPage === page }">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li :class="{ 'page-item disabled': currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                Berikutnya
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      @close="modalConfig.isOpen = false"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useUsers } from '~/composables/useUsers'
import { useAuth } from '~/composables/useAuth'

const { hasPermission } = useAuth()

const { 
  users, 
  loading,
  totalCount,
  getUsers, 
  deleteUser, 
  searchQuery, 
  filterStatus, 
  paginatedUsers, 
  currentPage, 
  totalPages, 
  itemsPerPage 
} = useUsers()

// Modal State
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
  targetId: null as number | null
})

onMounted(async () => {
  await getUsers()
})

const confirmDelete = (userId: number) => {
  modalConfig.title = 'Hapus User'
  modalConfig.message = 'Apakah Anda yakin ingin menghapus user ini secara permanen?'
  modalConfig.type = 'danger'
  modalConfig.targetId = userId
  modalConfig.isOpen = true
}

const handleConfirm = async () => {
  if (modalConfig.targetId) {
    try {
      await deleteUser(modalConfig.targetId)
      modalConfig.isOpen = false
      modalConfig.targetId = null
    } catch (error) {
      modalConfig.title = 'Error'
      modalConfig.message = 'Gagal menghapus user.'
      modalConfig.type = 'danger'
      modalConfig.targetId = null
      // Keep it open to show error or close if needed? Usually better as an alert modal
    }
  }
}
</script>

<style scoped>
.user-management-list {
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

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
