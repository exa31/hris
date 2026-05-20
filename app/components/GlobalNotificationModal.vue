<template>
  <Dialog 
    v-model:visible="notificationModal.isOpen" 
    modal 
    :header="notificationModal.title || 'Informasi'" 
    :style="{ width: '450px' }"
    :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
    class="confirm-dialog-premium dark:bg-slate-900 dark:text-white"
    :pt="{
      root: { class: 'dark:border dark:border-slate-800 !rounded-2xl overflow-hidden' },
      header: { class: 'dark:bg-slate-900 !px-8 !pt-8 !pb-4 !border-none' },
      content: { class: 'dark:bg-slate-900 !px-8 !pb-8 !bg-transparent' },
      footer: { class: 'dark:bg-slate-900 !px-8 !pb-8 !border-none' }
    }"
  >
    <div class="flex items-start gap-5">
      <div :class="[
        'w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl text-2xl shadow-lg',
        notificationModal.type === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 shadow-rose-100 dark:shadow-none' : 
        notificationModal.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 shadow-amber-100 dark:shadow-none' : 
        notificationModal.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 shadow-emerald-100 dark:shadow-none' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 shadow-indigo-100 dark:shadow-none'
      ]">
        <i :class="[
          'bi',
          notificationModal.type === 'danger' ? 'bi-exclamation-triangle-fill' : 
          notificationModal.type === 'warning' ? 'bi-exclamation-circle-fill' : 
          notificationModal.type === 'success' ? 'bi-patch-check-fill' : 'bi-info-circle-fill'
        ]"></i>
      </div>
      <div>
        <p class="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{{ notificationModal.message }}</p>
      </div>
    </div>
    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <Button label="Batal" severity="secondary" text @click="notificationModal.isOpen = false" class="!rounded-xl !font-bold" />
        <Button label="Mengerti" :severity="notificationModal.type === 'danger' ? 'danger' : 'primary'" @click="handleNotificationConfirm" class="!rounded-xl !px-8 !font-black !uppercase !text-[10px] !tracking-widest" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useNotification } from '~/composables/useNotification';

const { notificationModal, handleNotificationConfirm } = useNotification();
</script>
