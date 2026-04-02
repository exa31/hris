<template>
  <div class="transport-allowance-new">
    <!-- Header -->
    <div class="page-header px-1">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0 h4 fw-bold">Tambah Tunjangan Transport</h1>
      </div>
    </div>

    <!-- Form -->
    <TransportAllowanceForm :loading="isSubmitting" @submit="handleSubmit" />

    <!-- Status Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="false"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTransportAllowance } from '~/composables/useTransportAllowance'

const router = useRouter()
const { addAllowance } = useTransportAllowance()

const isSubmitting = ref(false)

// Modal state
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as any
})

const handleSubmit = async (data: any) => {
  isSubmitting.value = true
  try {
     await addAllowance(data)
     modalConfig.title = 'Berhasil'
     modalConfig.message = 'Catatan tunjangan transport telah berhasil disimpan ke sistem.'
     modalConfig.type = 'success'
     modalConfig.isOpen = true
  } catch (err: any) {
     modalConfig.title = 'Terjadi Kesalahan'
     if (err.response?.status === 409) {
         modalConfig.message = 'Gagal menyimpan: Data tunjangan untuk pegawai, bulan, dan tahun tersebut sudah ada.'
     } else {
         modalConfig.message = err.response?.data?.message || 'Gagal menyimpan data ke server.'
     }
     modalConfig.type = 'danger'
     modalConfig.isOpen = true
  } finally {
     isSubmitting.value = false
  }
}

const onModalClose = () => {
    modalConfig.isOpen = false
    if (modalConfig.type === 'success') {
        router.push('/transport-allowance')
    }
}

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.transport-allowance-new { max-width: 1200px; margin: 0 auto; padding-top: 1rem; }
</style>
