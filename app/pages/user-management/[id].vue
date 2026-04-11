<template>
  <div class="container-lg py-4">
    <!-- Header -->
    <div class="mb-4">
      <NuxtLink to="/user-management" class="link-secondary text-decoration-none small">
        <i class="bi bi-chevron-left"></i> Kembali ke Manajemen User
      </NuxtLink>
      <h2 class="mt-2">Edit User</h2>
    </div>
    <!-- Form -->
    <UserForm 
      v-if="user" 
      :initial-data="user" 
      is-edit 
      :can-manage-roles="currentUser?.role?.id === 1"
      @submit="handleSubmit" 
    />
    <div v-else class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

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
import { ref, onMounted, reactive } from 'vue'
import { useUsers } from '~/composables/useUsers'
import { useAuth } from '~/composables/useAuth'
import { getErrorMessageAxios } from '~/utils/handleError'

const route = useRoute()
const { hasPermission, user: currentUser } = useAuth()
const { getUserById, updateUser } = useUsers()
const user = ref<any>(null)

const modal = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success'
})

onMounted(async () => {
  const userId = Number(route.params.id)
  const result = await getUserById(userId)
  user.value = result
  
  if (!user.value) {
    navigateTo('/user-management')
  }
})

const handleSubmit = async (formData: any) => {
  try {
    const userId = Number(route.params.id)
    await updateUser(userId, {
      username: formData.username,
      role_id: formData.role_id,
      is_active: formData.is_active,
      ...(formData.password && { password: formData.password })
    })
    await navigateTo('/user-management')
  } catch (error: any) {
    console.error('Error updating user:', error)
    modal.title = 'Gagal Update User'
    modal.message = getErrorMessageAxios(error) || 'Terjadi kesalahan saat menyimpan data.'
    modal.type = 'danger'
    modal.isOpen = true
  }
}
</script>
