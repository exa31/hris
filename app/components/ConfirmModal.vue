<template>
  <div>
    <!-- Modal -->
    <div
      class="modal fade"
      :class="{ show: isOpen }"
      :style="{ display: isOpen ? 'block' : 'none' }"
      tabindex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ title }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4">
            <div class="d-flex align-items-start">
              <div v-if="type === 'danger'" class="bg-danger-subtle p-3 rounded-circle me-3">
                <i class="bi bi-exclamation-triangle text-danger fs-4"></i>
              </div>
              <div v-else-if="type === 'warning'" class="bg-warning-subtle p-3 rounded-circle me-3">
                <i class="bi bi-exclamation-circle text-warning fs-4"></i>
              </div>
              <div v-else-if="type === 'success'" class="bg-success-subtle p-3 rounded-circle me-3">
                <i class="bi bi-check-circle text-success fs-4"></i>
              </div>
              <div v-else class="bg-primary-subtle p-3 rounded-circle me-3">
                <i class="bi bi-info-circle text-primary fs-4"></i>
              </div>
              <div>
                <p class="mb-0 text-secondary">{{ message }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light px-4" @click="closeModal">
              {{ cancelText }}
            </button>
            <button 
                v-if="isConfirm"
                type="button" 
                class="btn px-4" 
                :class="confirmBtnClass"
                @click="onConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  message: string
  type?: 'primary' | 'danger' | 'warning' | 'success'
  confirmText?: string
  cancelText?: string
  isConfirm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: 'Konfirmasi',
  type: 'primary',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  isConfirm: true
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const confirmBtnClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'btn-danger'
    case 'warning': return 'btn-warning text-white'
    case 'success': return 'btn-success'
    default: return 'btn-primary'
  }
})

const closeModal = () => emit('close')
const onConfirm = () => emit('confirm')
</script>

<style scoped>
.modal {
  z-index: 1060;
}
.modal-backdrop {
  z-index: 1050;
}
.modal-content {
  border-radius: 12px;
}
.bg-danger-subtle { background-color: #fee2e2; }
.bg-warning-subtle { background-color: #fef3c7; }
.bg-success-subtle { background-color: #d1fae5; }
.bg-primary-subtle { background-color: #dbeafe; }
</style>
