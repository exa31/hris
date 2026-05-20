<template>
  <div class="space-y-8 max-w-6xl mx-auto pb-10">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }">
        <div class="flex items-center gap-5">
          <NuxtLink to="/user-management">
            <Button
              icon="bi bi-arrow-left"
              severity="secondary"
              text
              class="!w-12 !h-12 !rounded-2xl !bg-white dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 !text-slate-500 dark:!text-slate-400 hover:!text-indigo-600 dark:hover:!text-indigo-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/10 shadow-sm transition-all"
            />
          </NuxtLink>
          <div>
            <h1
              class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              Tambah Akses User
            </h1>
            <p
              class="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm"
            >
              Buat kredensial login baru untuk anggota tim Anda.
            </p>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Form Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div class="w-full">
        <UserForm :can-manage-roles="true" @submit="handleSubmit" />
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { useUsers } from "~/composables/useUsers";

const { createUser } = useUsers();
const { showSuccess, showError, notificationModal } = useNotification();
const router = useRouter();

const handleSubmit = async (formData: any) => {
  try {
    await createUser(formData);

    showSuccess(
      "Akses Dibuat",
      "Akun user baru telah berhasil didaftarkan dan siap digunakan untuk login.",
      async () => {
        router.push("/user-management");
      }
    );

    setTimeout(() => {
      if (notificationModal.value.isOpen) {
        notificationModal.value.isOpen = false;
        router.push("/user-management");
      }
    }, 2000);
  } catch (error: any) {
    showError(
      "Gagal Membuat User",
      error.response?.data?.message ||
        "Pastikan username belum digunakan dan data pegawai sudah benar."
    );
  }
};

definePageMeta({ layout: "default" });
</script>
