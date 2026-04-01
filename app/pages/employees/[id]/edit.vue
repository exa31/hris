<template>
  <div class="employee-edit" v-if="employee">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink :to="`/employees/${employeeId}`" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">Edit Data Pegawai</h1>
      </div>
      <p class="text-muted mt-2">{{ employee.nama }} - {{ employee.jabatan }}</p>
    </div>

    <!-- Form Card -->
    <div class="card">
      <div class="card-body">
        <EmployeeForm 
          :initialData="employee"
          :isEdit="true"
          @submit="handleFormSubmit" 
        />
      </div>
    </div>
  </div>

  <div v-else class="alert alert-warning">
    <i class="bi bi-exclamation-triangle"></i> Data pegawai tidak ditemukan
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Employee } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => parseInt(route.params.id as string))

const employee = computed(() => {
  return useEmployees().getEmployee(employeeId.value)
})

const handleFormSubmit = (data: Omit<Employee, 'id'>) => {
  try {
    useEmployees().updateEmployee(employeeId.value, data)
    alert('Data pegawai berhasil diperbarui!')
    router.push(`/employees/${employeeId.value}`)
  } catch (error) {
    console.error('Error updating employee:', error)
    alert('Gagal memperbarui data pegawai')
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
