<template>
  <!-- Modal -->
  <div
    class="modal fade"
    :class="{ show: isOpen }"
    :style="{ display: isOpen ? 'block' : 'none' }"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header border-0 bg-light">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square text-primary me-2"></i>
            Edit Role: {{ selectedRole?.name }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Role Name -->
            <div class="mb-4">
              <label class="form-label fw-500">Nama Role <span class="text-danger">*</span></label>
              <input
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                placeholder="Masukkan nama role"
              />
              <small v-if="errors.name" class="text-danger d-block mt-1">
                {{ errors.name }}
              </small>
            </div>

            <!-- Permissions Section -->
            <div class="mb-4">
              <label class="form-label fw-500 mb-3">
                <i class="bi bi-shield-check text-success me-2"></i>
                Permissions ({{ formData.selectedPermissions.length }} dipilih)
              </label>

              <div class="permissions-container">
                <div
                  v-for="(permsByModule, module) in groupedPermissions"
                  :key="module"
                  class="module-section mb-3"
                >
                  <!-- Module Header -->
                  <div class="d-flex align-items-center mb-2">
                    <div class="form-check">
                      <input
                        :id="`check-all-${module}`"
                        type="checkbox"
                        class="form-check-input"
                        :checked="isModuleAllChecked(module)"
                        :indeterminate="isModuleIndeterminate(module)"
                        @change="toggleModulePermissions(module)"
                      />
                      <label :for="`check-all-${module}`" class="form-check-label fw-600">
                        {{ module }}
                      </label>
                    </div>
                  </div>

                  <!-- Permissions -->
                  <div class="ps-4">
                    <div
                      v-for="perm in permsByModule"
                      :key="perm.id"
                      class="form-check mb-2"
                    >
                      <input
                        :id="`perm-${perm.id}`"
                        type="checkbox"
                        class="form-check-input"
                        :value="perm.id"
                        :checked="formData.selectedPermissions.includes(perm.id)"
                        @change="togglePermission(perm.id)"
                      />
                      <label :for="`perm-${perm.id}`" class="form-check-label">
                        {{ perm.name }}
                        <span class="badge bg-light text-dark small ms-2">{{ perm.action }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="d-flex gap-2 justify-content-end border-top pt-3">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">
                <i class="bi bi-x-lg"></i> Batal
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-check-lg"></i> Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div
    v-if="isOpen"
    class="modal-backdrop fade show"
    @click="closeModal"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Role, Permission } from '~/composables/useRoles'
import { useRoles } from '~/composables/useRoles'

interface Props {
  isOpen: boolean
  role?: Role
}

interface Emits {
  (e: 'close'): void
  (e: 'save', roleId: number, permissionIds: number[]): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false
})

const emit = defineEmits<Emits>()

const { getPermissionsByModule, updateRolePermissions } = useRoles()

// State
const selectedRole = ref<Role>()
const formData = ref({
  name: '',
  selectedPermissions: [] as number[]
})
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Computed
const groupedPermissions = computed(() => getPermissionsByModule.value)

const isModuleAllChecked = (module: string) => {
  const modulePerms = groupedPermissions.value[module] || []
  return modulePerms.length > 0 && modulePerms.every(p => 
    formData.value.selectedPermissions.includes(p.id)
  )
}

const isModuleIndeterminate = (module: string) => {
  const modulePerms = groupedPermissions.value[module] || []
  const checkedCount = modulePerms.filter(p => 
    formData.value.selectedPermissions.includes(p.id)
  ).length
  return checkedCount > 0 && checkedCount < modulePerms.length
}

// Methods
const togglePermission = (permId: number) => {
  const index = formData.value.selectedPermissions.indexOf(permId)
  if (index > -1) {
    formData.value.selectedPermissions.splice(index, 1)
  } else {
    formData.value.selectedPermissions.push(permId)
  }
}

const toggleModulePermissions = (module: string) => {
  const modulePerms = groupedPermissions.value[module] || []
  const allChecked = isModuleAllChecked(module)

  if (allChecked) {
    // Uncheck all permissions in this module
    modulePerms.forEach(p => {
      const index = formData.value.selectedPermissions.indexOf(p.id)
      if (index > -1) {
        formData.value.selectedPermissions.splice(index, 1)
      }
    })
  } else {
    // Check all permissions in this module
    modulePerms.forEach(p => {
      if (!formData.value.selectedPermissions.includes(p.id)) {
        formData.value.selectedPermissions.push(p.id)
      }
    })
  }
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Nama role harus diisi'
  }

  if (formData.value.selectedPermissions.length === 0) {
    errors.value.permissions = 'Pilih minimal 1 permission'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    if (selectedRole.value) {
      await updateRolePermissions(selectedRole.value.id, formData.value.selectedPermissions)
      emit('save', selectedRole.value.id, formData.value.selectedPermissions)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving role:', error)
    errors.value.submit = 'Gagal menyimpan role'
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
}

// Initialize form when role prop changes
watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      selectedRole.value = newRole
      formData.value = {
        name: newRole.name,
        selectedPermissions: (newRole.permissions || []).map(p => p.id)
      }
      errors.value = {}
    }
  },
  { deep: true }
)
</script>

<style scoped>
.modal {
  z-index: 1050;
}

.modal-backdrop {
  z-index: 1040;
}

.permissions-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.module-section {
  padding: 0.75rem;
  background-color: white;
  border-radius: 0.375rem;
  border-left: 3px solid #0d6efd;
}

.form-check-input:indeterminate {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-label {
  color: #212529;
  margin-bottom: 0.5rem;
}

.fw-500 {
  font-weight: 500;
}

.fw-600 {
  font-weight: 600;
}
</style>
