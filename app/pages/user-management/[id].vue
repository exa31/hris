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
              Edit Hak Akses
            </h1>
            <p
              v-if="user"
              class="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm"
            >
              Mengelola akun untuk:
              <span class="text-indigo-600 dark:text-indigo-400 font-bold">{{
                user.employee_name || user.username
              }}</span>
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
        <UserForm
          v-if="user"
          :initial-data="user"
          is-edit
          :can-manage-roles="currentUser?.role?.id === 1"
          @submit="handleSubmit"
        />
        <div
          v-else
          class="flex flex-col items-center justify-center py-40 gap-4"
        >
          <ProgressSpinner strokeWidth="4" />
          <span
            class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
            >Memuat Kredensial...</span
          >
        </div>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUsers } from "~/composables/useUsers";
import { useAuth } from "~/composables/useAuth";

const route = useRoute();
const { user: currentUser } = useAuth();
const { showSuccess, showError, notificationModal } = useNotification();
const { fetchUserById, updateUser } = useUsers();
const user = ref<any>(null);

onMounted(async () => {
  const userId = Number(route.params.id);
  const result = await fetchUserById(userId);
  user.value = result;

  if (!user.value) {
    navigateTo("/user-management");
  }
});

const handleSubmit = async (formData: any) => {
  try {
    const userId = Number(route.params.id);
    await updateUser(userId, {
      username: formData.username,
      role_id: formData.role_id,
      is_active: formData.is_active,
      ...(formData.password && { password: formData.password }),
    });

    showSuccess(
      "Perubahan Disimpan",
      "Kredensial user telah berhasil diperbarui dan disinkronkan.",
      async () => {
        navigateTo("/user-management");
      }
    );

    setTimeout(() => {
      if (notificationModal.value.isOpen) {
        notificationModal.value.isOpen = false;
        navigateTo("/user-management");
      }
    }, 2000);
  } catch (error: any) {
    showError(
      "Gagal Memperbarui",
      error.response?.data?.message ||
        "Terjadi kesalahan saat mencoba menyimpan perubahan."
    );
  }
};

definePageMeta({ layout: "default" });
</script>
