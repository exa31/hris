<template>
  <div class="employee-edit" v-if="!loading && employee">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink :to="`/employees/${employeeId}`" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">Edit Data Pegawai</h1>
      </div>
      <p class="text-muted mt-2">{{ employee.name }} - {{ employee.position }}</p>
    </div>

    <!-- Form Card -->
    <div class="card">
      <div class="card-body">
        <EmployeeForm 
          ref="formRef"
          :initialData="employee"
          @submit="handleFormSubmit" 
        />
      </div>
    </div>

    <!-- Status Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="false"
      cancel-text="Tutup"
      @close="modalConfig.isOpen = false"
    />
  </div>

  <div v-else-if="loading" class="alert alert-info">
    <i class="bi bi-hourglass-split"></i> Memuat data...
  </div>

  <div v-else class="alert alert-warning">
    <i class="bi bi-exclamation-triangle"></i> Data pegawai tidak ditemukan
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import type { Employee } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'
import { useEducations } from '~/composables/useEducations'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => parseInt(route.params.id as string))
const employee = ref<Partial<Employee> | null>(null)
const loading = ref(false)
const formRef = ref<any>(null)

// Modal State
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
  isConfirm: false
})

const handleFormSubmit = async (data: any) => {
  try {
    await useEmployees().updateEmployee(employeeId.value, data)
    
    // Sync educations if provided
    if (data.educationIds) {
      await useEducations().syncEmployeeEducations(employeeId.value, data.educationIds)
    }
    
    modalConfig.title = 'Berhasil'
    modalConfig.message = 'Data pegawai berhasil diperbarui!'
    modalConfig.type = 'success'
    modalConfig.isOpen = true
    
    setTimeout(() => {
        router.push(`/employees/${employeeId.value}`)
    }, 1500)
  } catch (error: any) {
    console.error('Error updating employee:', error)
    
    // Handle Duplicate Resource Specific Error
    const errorData = error.response?.data
    if (errorData?.code === 'DUPLICATE_RESOURCE' && errorData.data?.field) {
        const fieldMap: Record<string, string> = {
            'phone': 'Nomor HP sudah terdaftar di sistem',
            'nip': 'NIP sudah digunakan oleh pegawai lain',
            'email': 'Alamat email sudah terdaftar'
        }
        
        const field = errorData.data.field
        const message = fieldMap[field] || errorData.message
        
        formRef.value?.setExternalErrors({
            [field]: message
        })
        
        return
    }

    modalConfig.title = 'Error'
    modalConfig.message = errorData?.message || 'Gagal memperbarui data pegawai!'
    modalConfig.type = 'danger'
    modalConfig.isOpen = true
  }
}

onMounted(async () => {
  loading.value = true
  try {
    employee.value = await useEmployees().getEmployee(employeeId.value)
  } catch (error) {
    console.error('Failed to load employee:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.employee-edit {
  padding: 0;
}

.page-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
</style>