<template>
  <div class="container-lg py-4">
    <!-- Header -->
    <div class="mb-4">
      <NuxtLink to="/user-management" class="link-secondary text-decoration-none small">
        <i class="bi bi-chevron-left"></i> Kembali ke Manajemen User
      </NuxtLink>
      <h2 class="mt-2">Tambah User Baru</h2>
    </div>
    <UserForm :can-manage-roles="true" @submit="handleSubmit" />

    <!-- Status Modal -->
    <ConfirmModal
      :is-open="modal.isOpen"
      :title="modal.title"
      :message="modal.message"
      :type="modal.type"
      :is-confirm="false"
      cancel-text="Tutup"
      @close="modal.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useUsers } from '~/composables/useUsers'
import { useAuth } from '~/composables/useAuth'
import { getErrorMessageAxios } from '~/utils/handleError'

const { createUser } = useUsers()
const { user: currentUser } = useAuth()
const router = useRouter()

const modal = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success'
})

const handleSubmit = async (formData: any) => {
  try {
    await createUser(formData)
    await navigateTo('/user-management')
  } catch (error: any) {
    console.error('Error creating user:', error)
    modal.title = 'Gagal Membuat User'
    modal.message = getErrorMessageAxios(error) || 'Terjadi kesalahan saat menyimpan data.'
    modal.type = 'danger'
    modal.isOpen = true
  }
}
</script>
