<template>
  <form @submit.prevent="submitForm">
    <div class="row">
      <!-- Left Column -->
      <div class="col-lg-8">
        <!-- Employee Name (Autosuggest) -->
        <div class="mb-3">
          <label class="form-label">Nama Pegawai <span class="text-danger">*</span></label>
          <div class="position-relative">
            <input
              v-model="form.employee_name"
              type="text"
              class="form-control"
              placeholder="Ketik minimal 2 karakter..."
              :class="{ 'is-invalid': errors.employee_name, 'is-valid': form.employee_id }"
              :disabled="isEdit"
              @input="filterEmployees"
              @focus="showSuggestions = true"
              @blur="closeSuggestions"
            />
            <!-- Autosuggest Dropdown -->
            <div
              v-if="showSuggestions && suggestedEmployees.length > 0"
              class="position-absolute top-100 start-0 end-0 bg-white border border-light rounded shadow-sm mt-1 z-3"
              style="max-height: 300px; overflow-y-auto"
            >
              <button
                v-for="emp in suggestedEmployees"
                :key="emp.id"
                type="button"
                class="w-100 text-start px-3 py-2 border-0 bg-white hover-light"
                @click="selectEmployee(emp)"
              >
                <div class="small">
                  <strong>{{ emp.name }}</strong>
                  <span class="text-muted">({{ emp.nip }})</span>
                </div>
                <small class="text-muted">{{ emp.position }} - {{ emp.department }}</small>
              </button>
            </div>
          </div>
          <small v-if="errors.employee_name" class="text-danger d-block mt-1">{{ errors.employee_name }}</small>
          <small v-else-if="form.employee_id" class="text-success d-block mt-1">
            <i class="bi bi-check-circle"></i> Pegawai dipilih
          </small>
        </div>

        <!-- Username -->
        <div class="mb-3">
          <label class="form-label">Username <span class="text-danger">*</span></label>
          <input
            v-model="form.username"
            type="text"
            class="form-control"
            placeholder="minimal 6 karakter, lowercase, tanpa spasi"
            :class="{ 'is-invalid': errors.username, 'is-valid': !errors.username && form.username }"
            :disabled="isEdit"
            @input="validateUsernameField"
          />
          <small v-if="errors.username" class="text-danger d-block mt-1">{{ errors.username }}</small>
          <div v-else-if="form.username">
            <small class="text-success d-block mt-1">
              <i class="bi bi-check-circle"></i> Username valid
            </small>
          </div>
        </div>

        <!-- Password -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Password <span class="text-danger">*</span></label>
            <button
              v-if="isEdit"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="regeneratePassword"
            >
              <i class="bi bi-arrow-repeat"></i> Generate Ulang
            </button>
          </div>
          <div class="input-group">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              placeholder="Min 8 karakter, huruf besar, kecil, angka, dan karakter khusus"
              :class="{ 'is-invalid': errors.password }"
              @input="validatePasswordField"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

          <!-- Password Strength Indicator -->
          <div v-if="form.password" class="mt-2">
            <small class="d-block mb-1">Kekuatan password:</small>
            <div class="progress" :style="{ height: '6px' }">
              <div
                class="progress-bar"
                :class="{
                  'bg-danger': passwordStrength === 'weak',
                  'bg-warning': passwordStrength === 'medium',
                  'bg-success': passwordStrength === 'strong'
                }"
                :style="{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }"
              ></div>
            </div>
          </div>

          <!-- Password Errors -->
          <small v-if="errors.password" class="text-danger d-block mt-1">{{ errors.password }}</small>
        </div>

        <!-- Confirm Password -->
        <div class="mb-3">
          <label class="form-label">Konfirmasi Password <span class="text-danger">*</span></label>
          <div class="input-group">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-control"
              placeholder="Ketik ulang password"
              :class="{ 'is-invalid': errors.confirmPassword }"
              @input="validateConfirmPasswordField"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <small v-if="errors.confirmPassword" class="text-danger d-block mt-1">{{ errors.confirmPassword }}</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Role <span class="text-danger">*</span></label>
          <select v-model.number="form.role_id" class="form-select" :class="{ 'is-invalid': errors.role_id }" :disabled="!canManageRoles">
            <option value="">-- Pilih Role --</option>
            <option v-for="role in allRoles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <small v-if="errors.role_id" class="text-danger d-block mt-1">{{ errors.role_id }}</small>
          <small v-if="!canManageRoles" class="text-muted d-block mt-1">Anda tidak memiliki izin untuk mengubah role</small>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-lg-4">
        <div class="card border-0 bg-light">
          <div class="card-body">
            <!-- Status -->
            <div class="mb-3">
              <label class="form-label">Status</label>
              <div class="form-check">
                <input
                  id="statusAktif"
                  v-model="form.is_active"
                  type="checkbox"
                  class="form-check-input"
                  :disabled="!canManageRoles"
                />
                <label class="form-check-label" for="statusAktif">
                  Aktif
                </label>
              </div>
              <small v-if="!form.is_active" class="text-warning d-block mt-2">
                <i class="bi bi-exclamation-circle"></i> User non-aktif tidak dapat login
              </small>
            </div>

            <!-- Info Box -->
            <div class="alert alert-info small mb-0">
              <strong>Catatan:</strong>
              <ul class="mb-0 mt-2 ps-3">
                <li>Password akan di-generate otomatis untuk user baru</li>
                <li>User dapat mengubah password di halaman profil</li>
                <li>Username harus unik dan tidak dapat diubah</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Buttons -->
    <div class="d-flex gap-2 mt-4">
      <button type="submit" class="btn btn-primary">
        <i class="bi bi-check-lg"></i> {{ isEdit ? 'Update' : 'Simpan' }}
      </button>
      <NuxtLink to="/user-management" class="btn btn-outline-secondary">
        <i class="bi bi-x-lg"></i> Batal
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { User } from '~/composables/useUsers'
import { useRoles } from '~/composables/useRoles'
import {
  validatePassword,
  validateConfirmPassword,
  validateUsername,
  generatePassword,
  type PasswordValidation
} from '~/utils/userValidation'

const props = withDefaults(
  defineProps<{
    initialData?: User
    isEdit?: boolean
    canManageRoles?: boolean
  }>(),
  {
    isEdit: false,
    canManageRoles: true
  }
)

const emit = defineEmits<{
  submit: [data: any]
}>()

// State
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showSuggestions = ref(false)
const errors = ref<Record<string, string>>({})
const passwordValidation = ref<PasswordValidation>({ isValid: false, errors: [], strength: 'weak' })
const suggestedEmployees = ref<any[]>([])
const { $axios } = useNuxtApp()

// Composables
const { getRoles } = useRoles()
const allRoles = ref<any[]>([])

// Form data
const form = ref({
  employee_id: props.initialData?.employee_id || 0,
  employee_name: props.initialData?.employee_name || '',
  username: props.initialData?.username || '',
  password: '',
  confirmPassword: '',
  role_id: props.initialData?.role_id || 0,
  is_active: props.initialData?.is_active ?? true
})

// Mount
onMounted(async () => {
  const rolesData = await getRoles()
  allRoles.value = rolesData
  
  // Generate password for new user
  if (!props.isEdit) {
    if (!props.canManageRoles) {
      form.value.role_id = 3 // Default to Admin HRD
    }
    form.value.password = generatePassword()
    form.value.confirmPassword = form.value.password
    validatePasswordField()
    validateConfirmPasswordField()
  }
})

const passwordStrength = computed(() => passwordValidation.value.strength)

// Methods
let employeeTimeout: any = null
const filterEmployees = async () => {
  if (form.value.employee_name.length < 2) {
    showSuggestions.value = false
    suggestedEmployees.value = []
    // Reset selection if name cleared
    if (form.value.employee_name === '') {
        form.value.employee_id = 0
    }
    if (employeeTimeout) clearTimeout(employeeTimeout)
    return
  }
  
  if (employeeTimeout) clearTimeout(employeeTimeout)
  employeeTimeout = setTimeout(async () => {
    try {
        const response = await $axios.get('/api/users/employee-search', {
            params: { search: form.value.employee_name }
        })
        // The API returns the list directly in response.data (success wrapper handled by axios)
        suggestedEmployees.value = response.data
        showSuggestions.value = suggestedEmployees.value.length > 0
    } catch (error) {
        console.error('Error searching employees:', error)
    }
  }, 300)
}

const selectEmployee = (employee: any) => {
  form.value.employee_id = employee.id
  form.value.employee_name = employee.name
  showSuggestions.value = false
  
  // Clear any error
  delete errors.value.employee_name
}

const closeSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

let usernameTimeout: any = null
const validateUsernameField = async () => {
  const validation = validateUsername(form.value.username)
  if (!validation.isValid) {
    errors.value.username = validation.errors[0] || 'Username tidak valid'
    return
  } else {
    delete errors.value.username
  }
  
  // Debounce API check
  if (usernameTimeout) clearTimeout(usernameTimeout)
  if (!form.value.username || props.isEdit) return // No check and no need for edit mode

  usernameTimeout = setTimeout(async () => {
    try {
      const response = await $axios.get('/api/users/check-username', {
        params: { username: form.value.username }
      })
      if (!response.data.isAvailable) {
        errors.value.username = 'Username sudah digunakan'
      } else {
        delete errors.value.username
      }
    } catch (error) {
      console.error('Error checking username:', error)
    }
  }, 500)
}

const validatePasswordField = () => {
  passwordValidation.value = validatePassword(form.value.password)
  if (!passwordValidation.value.isValid) {
    errors.value.password = passwordValidation.value.errors[0] || 'Password tidak valid'
  } else {
    delete errors.value.password
  }
}

const validateConfirmPasswordField = () => {
  const validation = validateConfirmPassword(form.value.password, form.value.confirmPassword)
  if (!validation.isValid) {
    errors.value.confirmPassword = validation.error || 'Konfirmasi password tidak valid'
  } else {
    delete errors.value.confirmPassword
  }
}

const regeneratePassword = () => {
  form.value.password = generatePassword()
  form.value.confirmPassword = form.value.password
  validatePasswordField()
  validateConfirmPasswordField()
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.employee_id) {
    errors.value.employee_name = 'Pilih pegawai dari daftar'
  }

  const usernameValidation = validateUsername(form.value.username)
  if (!usernameValidation.isValid) {
    errors.value.username = usernameValidation.errors[0] || 'Username tidak valid'
  }

  if (!props.isEdit && !form.value.password) {
    errors.value.password = 'Password harus diisi'
  } else if (form.value.password) {
    const pwValidation = validatePassword(form.value.password)
    if (!pwValidation.isValid) {
      errors.value.password = pwValidation.errors[0] || 'Password tidak valid'
    }
  }

  if (form.value.password || form.value.confirmPassword) {
    const confirmValidation = validateConfirmPassword(form.value.password, form.value.confirmPassword)
    if (!confirmValidation.isValid) {
      errors.value.confirmPassword = confirmValidation.error || 'Konfirmasi password tidak valid'
    }
  }

  if (!form.value.role_id) {
    errors.value.role_id = 'Role harus dipilih'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (validateForm()) {
    emit('submit', {
      employee_id: form.value.employee_id,
      username: form.value.username,
      password: form.value.password,
      role_id: form.value.role_id,
      is_active: form.value.is_active
    })
  }
}
</script>

<style scoped>
.hover-light {
  transition: background-color 0.15s ease-in-out;
}

.hover-light:hover {
  background-color: #f0f4f8 !important;
}

.z-3 {
  z-index: 1000;
}

.progress {
  border-radius: 3px;
}
</style>
