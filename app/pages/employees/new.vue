<template>
  <div class="employees-new">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/employees" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">Tambah Data Pegawai Baru</h1>
      </div>
      <p class="text-muted mt-2">Isi formulir di bawah untuk menambahkan pegawai baru ke sistem</p>
    </div>

    <!-- Form Card -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <EmployeeForm ref="formRef" @submit="handleFormSubmit" />
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
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Employee } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'
import { useEducations } from '~/composables/useEducations'

const { addEmployee, loading } = useEmployees()
const { syncEmployeeEducations } = useEducations()
const router = useRouter()

// Modal State
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success'
})

const formRef = ref<any>(null)

const handleFormSubmit = async (data: any) => {
  try {
    const createdEmployee = await addEmployee(data)
    
    // Show success message or redirect
    modalConfig.title = 'Berhasil'
    modalConfig.message = 'Data pegawai baru berhasil ditambahkan!'
    modalConfig.type = 'success'
    modalConfig.isOpen = true
    
    setTimeout(() => {
        navigateTo('/employees')
    }, 1500)
  } catch (error: any) {
    console.error('Error adding employee:', error)
    
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
        
        return // Stop here, no need to show modal if it's field-specific
    }

    modalConfig.title = 'Terjadi Kesalahan'
    modalConfig.message = errorData?.message || 'Gagal menambahkan data pegawai.'
    modalConfig.type = 'danger'
    modalConfig.isOpen = true
  }
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
