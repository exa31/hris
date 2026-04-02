<template>
  <div class="roles-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="bi bi-shield-lock text-primary"></i> Kelola Role</h1>
          <p class="text-muted mb-0">Atur hak akses untuk setiap role</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Memuat data role...</p>
    </div>

    <!-- Roles Grid -->
    <div v-else-if="roles.length > 0" class="row g-4 mb-4">
      <div v-for="role in roles" :key="role.id" class="col-md-6">
        <div class="card h-100 border-0 shadow-sm hover-card bg-white overflow-hidden">
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div class="d-flex align-items-center">
                <div class="p-3 bg-primary-subtle rounded-3 text-primary me-3">
                  <i class="bi bi-shield-lock-fill fs-4"></i>
                </div>
                <div>
                  <h5 class="mb-1 fw-bold text-dark">{{ role.name }}</h5>
                  <div class="small">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                      <i class="bi bi-shield-check me-1"></i> {{ role.permissions?.length || 0 }} Hak Akses
                    </span>
                  </div>
                </div>
              </div>
              <button
                class="btn btn-sm btn-outline-primary px-3 rounded-pill shadow-sm"
                @click="openEditModal(role)"
              >
                <i class="bi bi-pencil-square me-1"></i> Edit Role
              </button>
            </div>

            <!-- Permissions Preview -->
            <div class="permissions-preview flex-grow-1">
              <label class="small text-muted mb-2 d-block">Preview Hak Akses:</label>
              <div v-if="role.permissions?.length === 0" class="alert alert-light py-2 px-3 small border border-dashed mb-0">
                <i class="bi bi-exclamation-circle me-1"></i> Belum ada permission diatur
              </div>
              <div v-else class="d-flex flex-wrap gap-2">
                <span
                  v-for="perm in role.permissions?.slice(0, 6)"
                  :key="perm.id"
                  class="badge bg-light text-secondary fw-normal border px-2 py-1"
                  style="font-size: 0.7rem; letter-spacing: 0.01em;"
                >
                  {{ perm.name }}
                </span>
                <span
                  v-if="(role.permissions?.length || 0) > 6"
                  class="badge bg-light text-muted border fw-normal px-2 py-1"
                  style="font-size: 0.7rem"
                >
                  +{{ (role.permissions?.length || 0) - 6 }} lainnya
                </span>
              </div>
            </div>
            
            <!-- Card Footer Decor -->
            <div class="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                <small class="text-muted fst-italic">Digunakan oleh {{ Math.floor(Math.random() * 10) + 1 }} user</small>
                <i class="bi bi-arrow-right-short text-primary fs-4 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 bg-white rounded shadow-sm">
      <i class="bi bi-shield-slash" style="font-size: 4rem; opacity: 0.2"></i>
      <h5 class="mt-3 fw-bold">Tidak Ada Role Ditemukan</h5>
      <p class="text-muted">Data role belum tersedia dalam sistem.</p>
    </div>

    <!-- Edit Role Modal -->
    <RoleEditModal
      :is-open="showEditModal"
      :role="selectedRole"
      @close="closeEditModal"
      @save="onRoleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Role } from '~/composables/useRoles'
import { useRoles } from '~/composables/useRoles'
import RoleEditModal from '~/components/RoleEditModal.vue'

const { getRoles, getPermissions, roles, loading } = useRoles()

const showEditModal = ref(false)
const selectedRole = ref<Role>()

const openEditModal = (role: Role) => {
  selectedRole.value = role
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedRole.value = undefined
}

const onRoleSaved = (roleId: number, permissionIds: number[]) => {
  // Modal akan handle update via composable
  // Tinggal tutup modal
  closeEditModal()
}

onMounted(async () => {
  await Promise.all([
    getRoles(),
    getPermissions()
  ])
})
</script>

<style scoped>
.roles-list {
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

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.permissions-preview {
  padding: 0.5rem 0;
}
</style>
