<template>
  <div class="transport-allowance-edit">
    <!-- Header -->
    <div class="page-header">
      <div class="d-flex align-items-center gap-3" v-if="allowance">
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">Edit Tunjangan Transport - {{ allowance.employeeName }}</h1>
      </div>
    </div>

    <!-- Form -->
    <TransportAllowanceForm v-if="allowance" :initialData="allowance" :isEdit="true" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTransportAllowance } from '~/composables/useTransportAllowance'

const route = useRoute()
const router = useRouter()
const { allowances, updateAllowance } = useTransportAllowance()

const allowanceId = computed(() => parseInt(route.params.id as string))

const allowance = computed(() => {
  return allowances.value.find(a => a.id === allowanceId.value)
})

const handleSubmit = (data: any) => {
  updateAllowance(allowanceId.value, data)
  alert('Data tunjangan transport berhasil diupdate!')
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
