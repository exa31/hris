<template>
  <div class="roles-list">
    <!-- Page Header -->
    <div class="page-header">
      <h1><i class="bi bi-shield-lock text-primary"></i> Kelola Role</h1>
      <p class="text-muted">Atur hak akses untuk setiap role</p>
    </div>

    <!-- Roles Grid -->
    <div class="row g-3 mb-4">
      <div v-for="role in roles" :key="role.id" class="col-md-6 mb-3">
        <div class="card border-0 shadow-sm hover-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">{{ role.name }}</h5>
                <small class="text-muted">
                  <i class="bi bi-shield-check"></i> {{ role.permissions?.length || 0 }} permission
                </small>
              </div>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="openEditModal(role)"
              >
                <i class="bi bi-pencil"></i> Edit
              </button>
            </div>

            <!-- Permissions Preview -->
            <div class="permissions-preview">
              <div v-if="role.permissions?.length === 0" class="text-muted small">
                <i class="bi bi-exclamation-circle"></i> Belum ada permission
              </div>
              <div v-else class="d-flex flex-wrap gap-1">
                <span
                  v-for="(perm, idx) in role.permissions?.slice(0, 3)"
                  :key="perm.id"
                  class="badge bg-light text-dark small"
                  :title="perm.name"
                >
                  {{ perm.module }}
                </span>
                <span
                  v-if="(role.permissions?.length || 0) > 3"
                  class="badge bg-light text-muted small"
                >
                  +{{ (role.permissions?.length || 0) - 3 }} lebih
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="roles.length === 0" class="text-center py-5">
      <i class="bi bi-inbox" style="font-size: 3rem; opacity: 0.5"></i>
      <p class="text-muted mt-3">Tidak ada role</p>
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

const { getRoles, roles } = useRoles()

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
  await getRoles()
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
  max-height: 100px;
  overflow: hidden;
}
</style>
