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
    <UserForm v-if="user" :initial-data="user" is-edit @submit="handleSubmit" />
    <div v-else class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUsers } from '~/composables/useUsers'

const route = useRoute()
const { getUserById, updateUser } = useUsers()
const user = ref<any>(null)

onMounted(() => {
  const userId = Number(route.params.id)
  user.value = getUserById(userId)
  
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
  } catch (error) {
    console.error('Error updating user:', error)
    alert('Gagal update user. Silakan coba lagi.')
  }
}
</script>
