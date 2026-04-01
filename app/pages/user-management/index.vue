<template>
  <div class="user-management-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="bi bi-people-fill text-primary"></i> Manajemen User</h1>
          <p class="text-muted mb-0">Kelola user dan hak akses sistem</p>
        </div>
        <NuxtLink to="/user-management/new" class="btn btn-primary">
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
              <th style="width: 10%">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                <i class="bi bi-inbox" style="font-size: 2rem; opacity: 0.5"></i>
                <p class="mt-2 mb-0">Tidak ada data user</p>
              </td>
            </tr>
            <tr v-for="(user, idx) in paginatedUsers" :key="user.id">
              <td class="text-muted small">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              <td>
                <strong>{{ user.username }}</strong>
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
              <td>
                <div class="btn-group btn-group-sm" role="group">
                  <NuxtLink :to="`/user-management/${user.id}`" class="btn btn-outline-primary">
                    <i class="bi bi-pencil"></i>
                  </NuxtLink>
                  <button type="button" class="btn btn-outline-danger" @click="deleteUser(user.id)">
                    <i class="bi bi-trash"></i>
                  </button>
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
          {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} dari {{ filteredUsers.length }}
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '~/composables/useUsers'

const { users, getUsers, deleteUser, searchQuery, filterStatus, filteredUsers, paginatedUsers, currentPage, totalPages, itemsPerPage } = useUsers()

onMounted(async () => {
  await getUsers()
})

const confirmDelete = (userId: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
    deleteUser(userId)
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
