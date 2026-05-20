<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    :style="{ width: '450px' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    class="confirm-modal-premium"
    :closable="true"
    @hide="closeModal"
  >
    <div class="flex items-start gap-5 pt-4">
      <div
        :class="[
          'w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl text-2xl shadow-sm transition-all duration-500',
          type === 'danger'
            ? 'bg-rose-50 text-rose-500'
            : type === 'warning'
              ? 'bg-amber-50 text-amber-500'
              : type === 'success'
                ? 'bg-emerald-50 text-emerald-500'
                : 'bg-indigo-50 text-indigo-500',
        ]"
      >
        <i
          :class="[
            'bi',
            type === 'danger'
              ? 'bi-exclamation-triangle'
              : type === 'warning'
                ? 'bi-exclamation-circle'
                : type === 'success'
                  ? 'bi-check-circle'
                  : 'bi-info-circle',
          ]"
        ></i>
      </div>
      <div class="space-y-2">
        <p class="text-slate-600 font-medium leading-relaxed">{{ message }}</p>
        <p
          v-if="type === 'danger'"
          class="text-[10px] font-black text-rose-400 uppercase tracking-widest"
        >
          Tindakan ini tidak dapat dibatalkan
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 pt-4">
        <Button
          :label="cancelText"
          severity="secondary"
          text
          class="!rounded-xl !px-6 !font-bold !text-slate-400"
          @click="closeModal"
        />
        <Button
          v-if="isConfirm"
          :label="confirmText"
          :severity="
            type === 'danger'
              ? 'danger'
              : type === 'warning'
                ? 'warn'
                : type === 'success'
                  ? 'success'
                  : 'primary'
          "
          class="!rounded-xl !px-8 !font-black !uppercase !text-[11px] !tracking-widest shadow-lg shadow-indigo-100"
          @click="onConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "primary" | "danger" | "warning" | "success";
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: "Konfirmasi Sistem",
  type: "primary",
  confirmText: "Ya, Lanjutkan",
  cancelText: "Batalkan",
  isConfirm: true,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const visible = ref(props.isOpen);

watch(
  () => props.isOpen,
  (newVal) => {
    visible.value = newVal;
  },
);

const closeModal = () => emit("close");
const onConfirm = () => emit("confirm");
</script>

<style>
.confirm-modal-premium .p-dialog-header {
  @apply !pt-8 !px-8 !pb-0 !border-none;
}
.confirm-modal-premium .p-dialog-header-title {
  @apply !text-sm !font-black !uppercase !tracking-[0.2em] !text-slate-400;
}
.confirm-modal-premium .p-dialog-content {
  @apply !px-8 !pb-8 !pt-2;
}
.confirm-modal-premium .p-dialog-footer {
  @apply !px-8 !pb-8 !pt-0 !border-none;
}
</style>
