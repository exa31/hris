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
    <div class="card">
      <div class="card-body">
        <EmployeeForm @submit="handleFormSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Employee } from '~/composables/useEmployees'
import { useEmployees } from '~/composables/useEmployees'

const router = useRouter()

const handleFormSubmit = (data: Omit<Employee, 'id'>) => {
  try {
    useEmployees().addEmployee(data)
    alert('Data pegawai berhasil ditambahkan!')
    router.push('/employees')
  } catch (error) {
    console.error('Error adding employee:', error)
    alert('Gagal menambahkan data pegawai')
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
