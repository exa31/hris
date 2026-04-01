<template>
  <div class="container-lg py-4">
    <!-- Header -->
    <div class="mb-4">
      <NuxtLink to="/user-management" class="link-secondary text-decoration-none small">
        <i class="bi bi-chevron-left"></i> Kembali ke Manajemen User
      </NuxtLink>
      <h2 class="mt-2">Tambah User Baru</h2>
    </div>

    <!-- Form -->
    <UserForm @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useUsers } from '~/composables/useUsers'

const { createUser } = useUsers()
const router = useRouter()

const handleSubmit = async (formData: any) => {
  try {
    await createUser(formData)
    await navigateTo('/user-management')
  } catch (error) {
    console.error('Error creating user:', error)
    alert('Gagal membuat user. Silakan coba lagi.')
  }
}
</script>
