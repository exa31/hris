<template>
  <Dialog
    :visible="isOpen"
    @update:visible="closeModal"
    modal
    :header="'Access Control Matrix: ' + (role?.name || '')"
    class="w-full max-w-4xl !rounded-[32px] !border !border-slate-100 dark:!border-slate-800 !shadow-2xl overflow-hidden"
    :pt="{
      root: { class: 'bg-white dark:bg-slate-900' },
      header: { class: 'px-8 pt-8 pb-4 !bg-transparent !border-none !text-slate-800 dark:!text-white' },
      content: { class: 'px-8 pb-8 !bg-transparent' },
      footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
    }"
  >
    <div class="space-y-8">
      <!-- Superadmin Lock Banner -->
      <div
        v-if="isSuperAdmin"
        class="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30"
      >
        <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <i class="bi bi-shield-lock-fill text-amber-600 dark:text-amber-400"></i>
        </div>
        <div>
          <div class="text-sm font-black text-amber-800 dark:text-amber-300 leading-tight">Protected System Role</div>
          <div class="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            The <span class="font-black">Super Admin</span> role is system-protected and retains irrevocable full permissions.
          </div>
        </div>
      </div>

      <!-- Role Name Input -->
      <div class="space-y-2">
        <label
          class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
          >Role Name</label
        >
        <InputText
          v-model="formData.name"
          placeholder="Enter role title..."
          :disabled="isSuperAdmin"
          class="w-full !py-3.5 !bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700 !rounded-2xl focus:!bg-white dark:focus:!bg-slate-900 focus:!ring-4 focus:!ring-indigo-500/10 transition-all font-bold text-slate-700 dark:text-white"
          :class="{ 'p-invalid': errors.name, 'opacity-60 cursor-not-allowed': isSuperAdmin }"
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
            >Permissions Matrix</label
          >
          <Tag
            :value="
              formData.selectedPermissions.length + ' Permissions Selected'
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
              <div class="flex items-center gap-2" v-if="!isSuperAdmin">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500"
                  >Select All</span
                >
                <Checkbox
                  :modelValue="isModuleAllChecked(String(module))"
                  :binary="true"
                  @change="toggleModulePermissions(String(module))"
                />
              </div>
              <div v-else class="w-5 h-5 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <i class="bi bi-lock-fill text-[11px]"></i>
              </div>
            </div>

            <!-- Permissions Grid -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-2"
            >
              <div
                v-for="perm in permsByModule"
                :key="perm.id"
                @click="!isSuperAdmin && togglePermission(perm.id)"
                class="p-4 rounded-2xl border transition-all select-none"
                :class="[
                  isSuperAdmin
                    ? 'cursor-not-allowed opacity-50 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                    : formData.selectedPermissions.includes(perm.id)
                      ? 'cursor-pointer group bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                      : 'cursor-pointer group bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800',
                ]"
              >
                <div class="flex items-start gap-3">
                  <Checkbox
                    :modelValue="formData.selectedPermissions.includes(perm.id)"
                    :binary="true"
                    :disabled="isSuperAdmin"
                    class="mt-0.5"
                  />
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
          label="Close"
          severity="secondary"
          text
          class="!rounded-2xl !font-bold dark:!text-slate-400"
          @click="closeModal"
        />
        <Button
          v-if="!isSuperAdmin"
          label="Save Permissions"
          icon="bi bi-check-lg"
          :loading="isSubmitting"
          class="!rounded-2xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors text-white"
          @click="handleSubmit"
        />
        <div
          v-else
          class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold"
        >
          <i class="bi bi-lock-fill text-[11px]"></i>
          Protected System Role
        </div>
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

// Superadmin is identified by id === 1 OR name 'superadmin' (case-insensitive)
const isSuperAdmin = computed(
  () =>
    props.role?.id === 1 ||
    props.role?.name?.toLowerCase() === 'superadmin',
);

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
    errors.value.name = "Role name is required";
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
    dashboard: "Dashboard & Analytics",
    users: "IAM & Users",
    employees: "Talent Directory",
    transport: "Transport Allowance",
    logs: "Audit Logs",
    transport_setting: "Allowance Settings",
    roles: "Roles & Permissions",
    leaves: "Leave Management",
    attendance: "Attendance Tracking",
    announcements: "Announcements & Broadcasts",
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
