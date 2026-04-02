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
          :initialData="employee"
          @submit="handleFormSubmit" 
        />
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="alert alert-info">
    <i class="bi bi-hourglass-split"></i> Memuat data...
  </div>

  <div v-else class="alert alert-warning">
    <i class="bi bi-exclamation-triangle"></i> Data pegawai tidak ditemukan
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Employee } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'
import { useEducations } from '~/composables/useEducations'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => parseInt(route.params.id as string))
const employee = ref<Partial<Employee> | null>(null)
const loading = ref(false)

const handleFormSubmit = async (data: any) => {
  try {
    await useEmployees().updateEmployee(employeeId.value, data)
    
    // Sync educations if provided
    if (data.educationIds) {
      await useEducations().syncEmployeeEducations(employeeId.value, data.educationIds)
    }
    
    alert('Data pegawai berhasil diperbarui!')
    router.push(`/employees/${employeeId.value}`)
  } catch (error) {
    alert('Gagal memperbarui data pegawai!')
    console.error(error)
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