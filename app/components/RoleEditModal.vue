<template>
  <Dialog
    :visible="isOpen"
    @update:visible="closeModal"
    modal
    :header="'Konfigurasi Hak Akses: ' + (role?.name || '')"
    class="w-full max-w-4xl !rounded-[32px] !border !border-slate-100 dark:!border-slate-800 !shadow-2xl overflow-hidden"
    :pt="{
      root: { class: 'bg-white dark:bg-slate-900' },
      header: { class: 'px-8 pt-8 pb-4 !bg-transparent !border-none !text-slate-800 dark:!text-white' },
      content: { class: 'px-8 pb-8 !bg-transparent' },
      footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
    }"
  >
    <div class="space-y-8">
      <!-- Role Name Input -->
      <div class="space-y-2">
        <label
          class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
          >Nama Role</label
        >
        <InputText
          v-model="formData.name"
          placeholder="Masukkan nama role"
          class="w-full !py-3.5 !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !rounded-2xl focus:!bg-white dark:focus:!bg-slate-900 focus:!ring-4 focus:!ring-indigo-500/10 transition-all font-bold text-slate-700 dark:text-white"
          :class="{ 'p-invalid': errors.name }"
        />
        <small
          v-if="errors.name"
          class="text-rose-500 text-xs font-bold ml-1"
          >{{ errors.name }}</small
        >
      </div>

      <!-- Permissions List -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <label
            class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >Daftar Hak Akses</label
          >
          <Tag
            :value="
              formData.selectedPermissions.length + ' Permission Terpilih'
            "
            severity="info"
            class="!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !font-bold !rounded-lg"
          />
        </div>

        <div
          class="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-8"
        >
          <div
            v-for="(permsByModule, module) in groupedPermissions"
            :key="module"
            class="space-y-4"
          >
            <!-- Module Header -->
            <div
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
            >
              <div class="flex items-center gap-2 flex-1">
                <div class="w-2 h-6 bg-indigo-500 rounded-full"></div>
                <h4
                  class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider"
                >
                  {{ formatModuleName(String(module)) }}
                </h4>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500"
                  >Pilih Semua</span
                >
                <input
                  type="checkbox"
                  class="w-5 h-5 rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  :checked="isModuleAllChecked(String(module))"
                  @change="toggleModulePermissions(String(module))"
                />
              </div>
            </div>

            <!-- Permissions Grid -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-2"
            >
              <div
                v-for="perm in permsByModule"
                :key="perm.id"
                @click="togglePermission(perm.id)"
                class="p-4 rounded-2xl border transition-all cursor-pointer group select-none"
                :class="
                  formData.selectedPermissions.includes(perm.id)
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800'
                "
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5"
                    :class="
                      formData.selectedPermissions.includes(perm.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-indigo-400'
                    "
                  >
                    <i
                      v-if="formData.selectedPermissions.includes(perm.id)"
                      class="bi bi-check-lg text-white text-[10px]"
                    ></i>
                  </div>
                  <div class="flex-1">
                    <div class="text-xs font-bold leading-tight"
                      :class="formData.selectedPermissions.includes(perm.id) ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'">
                      {{ perm.name }}
                    </div>
                    <div
                      class="text-[9px] font-bold mt-1 uppercase tracking-tighter"
                      :class="formData.selectedPermissions.includes(perm.id) ? 'text-indigo-400 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'">
                      {{ perm.action }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 mt-4">
        <Button
          label="Batalkan"
          severity="secondary"
          text
          class="!rounded-2xl !font-bold dark:!text-slate-400"
          @click="closeModal"
        />
        <Button
          label="Simpan Konfigurasi"
          icon="bi bi-check-lg"
          :loading="isSubmitting"
          class="!rounded-2xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors text-white"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Role } from "~/composables/useRoles";
import { useRoles } from "~/composables/useRoles";
import { getErrorMessageAxios } from "~/utils/handleError";

interface Props {
  isOpen: boolean;
  role?: Role;
}

interface Emits {
  (e: "close"): void;
  (e: "save", roleId: number, permissionIds: number[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
});

const emit = defineEmits<Emits>();

const { getPermissionsByModule, updateRolePermissions } = useRoles();

const formData = ref({
  name: "",
  selectedPermissions: [] as number[],
});
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

const groupedPermissions = computed(() => getPermissionsByModule.value);

const isModuleAllChecked = (module: string) => {
  const modulePerms = groupedPermissions.value[module] || [];
  return (
    modulePerms.length > 0 &&
    modulePerms.every((p) => formData.value.selectedPermissions.includes(p.id))
  );
};

const togglePermission = (permId: number) => {
  const index = formData.value.selectedPermissions.indexOf(permId);
  if (index > -1) {
    formData.value.selectedPermissions.splice(index, 1);
  } else {
    formData.value.selectedPermissions.push(permId);
  }
};

const toggleModulePermissions = (module: string) => {
  const modulePerms = groupedPermissions.value[module] || [];
  const allChecked = isModuleAllChecked(module);

  if (allChecked) {
    modulePerms.forEach((p) => {
      const index = formData.value.selectedPermissions.indexOf(p.id);
      if (index > -1) {
        formData.value.selectedPermissions.splice(index, 1);
      }
    });
  } else {
    modulePerms.forEach((p) => {
      if (!formData.value.selectedPermissions.includes(p.id)) {
        formData.value.selectedPermissions.push(p.id);
      }
    });
  }
};

const validateForm = () => {
  errors.value = {};
  if (!formData.value.name.trim()) {
    errors.value.name = "Nama role wajib diisi";
  }
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isSubmitting.value = true;
    if (props.role) {
      await updateRolePermissions(
        props.role.id,
        formData.value.selectedPermissions,
        formData.value.name,
      );
      emit("save", props.role.id, formData.value.selectedPermissions);
    }
    closeModal();
  } catch (error: any) {
    console.error("Error saving role:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit("close");
};

const formatModuleName = (module: string) => {
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    users: "Manajemen User",
    employees: "Data Pegawai",
    transport: "Tunjangan Transport",
    logs: "Log Aktivitas",
    transport_setting: "Pengaturan Transport",
    roles: "Kelola Role",
  };
  return map[module] || module.charAt(0).toUpperCase() + module.slice(1);
};

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      formData.value = {
        name: newRole.name,
        selectedPermissions: (newRole.permissions || []).map((p) => p.id),
      };
      errors.value = {};
    }
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
