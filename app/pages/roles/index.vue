<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"
          ></span>
          <span
            class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400"
            >Security & Access</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Role Configuration
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Configure authority and access rights for each user tier.
        </p>
      </Motion>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        v-for="i in 4"
        :key="i"
        class="!rounded-[32px] border-none shadow-sm"
      >
        <template #content>
          <div class="space-y-4">
            <Skeleton width="40%" height="2rem" />
            <Skeleton width="100%" height="4rem" />
          </div>
        </template>
      </Card>
    </div>

    <!-- Roles Grid -->
    <div
      v-else-if="roles.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <Motion
        v-for="(role, idx) in roles"
        :key="role.id"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.1 }"
        class="group"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden h-full flex flex-col"
        >
          <div class="flex items-start justify-between mb-8">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
              >
                <i class="bi bi-shield-lock"></i>
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                  {{ role.name }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                  ></span>
                  <span
                    class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    >{{ role.permissions?.length || 0 }} Permissions</span
                  >
                </div>
              </div>
            </div>
            <Button
              icon="bi bi-gear"
              text
              rounded
              class="!w-8 !h-8 !text-slate-400 hover:!text-indigo-600 dark:hover:!text-indigo-400 hover:!bg-slate-50 dark:hover:!bg-slate-800"
              @click="openEditModal(role)"
            />
          </div>

          <div class="flex-grow">
            <label
              class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block"
              >Permissions Summary:</label
            >
            <div
              v-if="role.permissions?.length === 0"
              class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-medium italic"
            >
              No permissions configured for this role.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <span
                v-for="perm in role.permissions?.slice(0, 8)"
                :key="perm.id"
                class="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold border border-slate-100 dark:border-slate-700 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/30 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/10 transition-colors"
              >
                {{ perm.name }}
              </span>
              <span
                v-if="(role.permissions?.length || 0) > 8"
                class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold border border-indigo-100 dark:border-indigo-500/20"
              >
                +{{ (role.permissions?.length || 0) - 8 }} MORE
              </span>
            </div>
          </div>

          <div
            class="mt-6 pt-5 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between"
          >
            <span class="text-[9px] font-black text-slate-300 dark:text-slate-600"
              >CREATED BY SYSTEM</span
            >
            <Button
              label="Manage Permissions"
              size="small"
              text
              class="!rounded-lg !text-indigo-600 dark:!text-indigo-400 !font-bold !text-[10px]"
              @click="openEditModal(role)"
            />
          </div>
        </div>
      </Motion>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div class="relative mb-6">
        <div
          class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"
        ></div>
        <div
          class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700"
        >
          <i class="bi bi-shield-slash text-4xl text-indigo-500"></i>
        </div>
      </div>
      <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">No Roles Found</h3>
      <p class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest">
        Contact system administrator to initialize role data.
      </p>
    </div>
    <!-- Edit Role Modal -->
    <RoleEditModal
      :is-open="showEditModal"
      :role="selectedRole"
      @close="closeEditModal"
      @save="onRoleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Role } from "~/composables/useRoles";
import { useRoles } from "~/composables/useRoles";
import RoleEditModal from "~/components/RoleEditModal.vue";

const { getRoles, getPermissions, roles, loading } = useRoles();

const showEditModal = ref(false);
const selectedRole = ref<Role>();

const openEditModal = (role: Role) => {
  selectedRole.value = role;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedRole.value = undefined;
};

const onRoleSaved = (roleId: number, permissionIds: number[]) => {
  closeEditModal();
};

onMounted(async () => {
  await Promise.all([getRoles(), getPermissions()]);
});

definePageMeta({ layout: "default" });
</script>
