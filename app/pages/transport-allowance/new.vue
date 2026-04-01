<template>
  <div class="transport-allowance-new">
    <!-- Header -->
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">Tambah Tunjangan Transport</h1>
      </div>
    </div>

    <!-- Form -->
    <TransportAllowanceForm @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTransportAllowance } from '~/composables/useTransportAllowance'

const router = useRouter()
const { addAllowance } = useTransportAllowance()

const handleSubmit = (data: any) => {
  addAllowance({
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    nip: data.nip,
    departemen: data.departemen,
    bulan: data.bulan,
    tahun: data.tahun,
    jarak: data.jarak,
    hariMasukKerja: data.hariMasukKerja,
    statusPembayaran: data.statusPembayaran,
    keterangan: data.keterangan,
    tanggalBuat: new Date().toISOString()
  })

  alert('Data tunjangan transport berhasil ditambahkan!')
  router.push('/transport-allowance')
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0;
}
</style>
