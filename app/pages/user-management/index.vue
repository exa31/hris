<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
      <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }" class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Identity & Access Management (IAM)
          </span>
        </div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          User Account Management
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Manage login credentials, role access permissions, and account status across Nexus.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, scale: 0.95 }" :animate="{ opacity: 1, scale: 1 }">
        <NuxtLink v-if="hasPermission('users', 'create')" to="/user-management/new">
          <Button
            label="Create New User"
            icon="bi bi-person-plus-fill"
            class="!rounded-xl !px-6 !py-3.5 !font-black !uppercase !text-[10px] !tracking-widest !bg-indigo-600 hover:!bg-indigo-700 !border-none shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
          />
        </NuxtLink>
      </Motion>
    </div>

    <!-- Quick Stats Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      <Motion
        v-for="(st, idx) in userStats"
        :key="st.label"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.08 }"
        class="h-full flex flex-col"
      >
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all h-full">
          <div :class="[st.color, 'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs']">
            <i :class="st.icon"></i>
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <div class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest min-h-[28px] flex items-center line-clamp-2 leading-tight">
              {{ st.label }}
            </div>
            <div class="text-2xl font-black text-slate-800 dark:text-white mt-0.5 truncate">
              {{ st.value }}
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Filter & View Switcher Toolbar -->
    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3 flex-1 min-w-[260px]">
          <div class="relative flex-1 max-w-md group">
            <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
            <InputText
              v-model="searchQuery"
              placeholder="Search username or employee name..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 focus:!ring-2 focus:!ring-indigo-500/20"
            />
          </div>

          <Select
            v-model="selectedRoleFilter"
            :options="roleFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Roles"
            class="!hidden sm:!flex !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 !py-1 !shadow-none"
          />
        </div>

        <div class="flex items-center gap-3">
          <!-- View Switcher -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer"
              :class="viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
              @click="viewMode = 'table'"
              v-tooltip.top="'Table View'"
            >
              <i class="bi bi-table"></i>
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer"
              :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
              @click="viewMode = 'grid'"
              v-tooltip.top="'Grid View'"
            >
              <i class="bi bi-grid-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </Motion>

    <!-- Content: Card Grid View -->
    <div v-if="viewMode === 'grid'" class="space-y-6">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-64 rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"></div>
      </div>

      <div
        v-else-if="filteredUsers.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center px-6"
      >
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-3xl text-indigo-500 mb-3 shadow-inner">
          <i class="bi bi-person-x-fill"></i>
        </div>
        <h3 class="text-base font-black text-slate-800 dark:text-white mb-1">
          No Users Found
        </h3>
        <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm">
          No user accounts match your active search or filter criteria.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Motion
          v-for="(u, idx) in filteredUsers"
          :key="u.id"
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.05 }"
          class="h-full flex flex-col"
        >
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
            <div class="space-y-4 flex-grow flex flex-col justify-between">
              <!-- Top Row: Avatar & Status -->
              <div class="flex items-start justify-between">
                <div class="relative">
                  <Avatar
                    :image="
                      u.employee?.photo_url ||
                      getAvatarUrl(u.username || 'U', '6366f1')
                    "
                    shape="circle"
                    class="!w-14 !h-14 border-2 border-white dark:border-slate-800 shadow-xs"
                  />
                  <span
                    class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"
                    :class="u.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
                  ></span>
                </div>

                <Tag
                  :value="u.role_name || 'User'"
                  :class="
                    u.role_id === 1
                      ? '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-100 dark:!border-indigo-500/20'
                      : '!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400'
                  "
                  class="!text-[9px] !font-black !px-2.5 !py-1 !rounded-lg !uppercase !tracking-wider"
                />
              </div>

              <!-- User Info -->
              <div>
                <h3 class="text-base font-black text-slate-800 dark:text-white leading-tight">
                  @{{ u.username }}
                </h3>
                <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  <i class="bi bi-person-badge text-indigo-500"></i>
                  <span>{{ u.employee_name || "No Linked Employee" }}</span>
                </div>
              </div>

              <!-- Linked Info Strip -->
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div class="flex justify-between">
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Account Status:</span>
                  <span class="font-black" :class="u.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                    {{ u.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 mt-auto">
              <NuxtLink v-if="hasPermission('users', 'update')" :to="`/user-management/${u.id}`">
                <Button
                  icon="bi bi-pencil-square"
                  label="Edit User"
                  size="small"
                  text
                  class="!rounded-xl !text-xs !font-bold !text-slate-600 dark:!text-slate-300 hover:!text-indigo-600 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/10"
                />
              </NuxtLink>
              <Button
                v-if="hasPermission('users', 'delete')"
                icon="bi bi-trash3-fill"
                severity="danger"
                text
                rounded
                class="!w-9 !h-9 !bg-rose-50 dark:!bg-rose-500/10 !text-rose-500 hover:!bg-rose-600 hover:!text-white transition-all"
                @click="confirmDelete(u)"
                v-tooltip.top="'Delete User'"
              />
            </div>
          </div>
        </Motion>
      </div>

      <!-- Paginator for Grid View -->
      <div class="flex items-center justify-center pt-4" v-if="totalUsers > itemsPerPage">
        <Paginator
          :rows="itemsPerPage"
          :totalRecords="totalUsers"
          template="PrevPageLink PageLinks NextPageLink"
          class="!bg-transparent !p-0"
          @page="onPageChange"
        />
      </div>
    </div>

    <!-- Content: Table View -->
    <Motion
      v-else
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      class="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <DataTable
        :value="filteredUsers"
        class="p-datatable-overhaul"
        :loading="loading"
        :rows="itemsPerPage"
        :pt="{
          wrapper: { class: '!bg-transparent' },
          footer: { class: '!bg-transparent' },
          footerRow: { class: '!bg-transparent' },
          footerCell: { class: '!bg-transparent !p-0 !border-none' },
        }"
      >
        <Column header="Account Identity">
          <template #body="slotProps">
            <div class="flex items-center gap-4 py-1">
              <Avatar
                :image="
                  slotProps.data.employee?.photo_url ||
                  getAvatarUrl(slotProps.data.username || 'U', '6366f1')
                "
                shape="circle"
                class="!w-10 !h-10 border-2 border-slate-100 dark:border-slate-700 shadow-xs"
              />
              <div class="flex flex-col">
                <span class="text-sm font-black text-slate-800 dark:text-white leading-tight">
                  @{{ slotProps.data.username }}
                </span>
                <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                  <i class="bi bi-person-badge"></i>
                  {{ slotProps.data.employee_name || "No Linked Employee" }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Role & Permissions">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.role_name || 'Guest'"
              class="!rounded-lg !px-3 !py-1 !text-[10px] !font-black !uppercase !tracking-wider"
              :class="
                slotProps.data.role_id === 1
                  ? '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:text-indigo-400 !border !border-indigo-100 dark:!border-indigo-500/20'
                  : '!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300'
              "
            />
          </template>
        </Column>

        <Column header="Account Status">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="slotProps.data.is_active ? 'bg-emerald-500' : 'bg-rose-500'"
              ></div>
              <span
                class="text-xs font-black uppercase tracking-wider text-[10px]"
                :class="slotProps.data.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
              >
                {{ slotProps.data.is_active ? "Active" : "Inactive" }}
              </span>
            </div>
          </template>
        </Column>

        <Column header="Actions" class="!text-right">
          <template #body="slotProps">
            <div class="flex items-center justify-end gap-2 pr-2">
              <NuxtLink
                v-if="hasPermission('users', 'update')"
                :to="`/user-management/${slotProps.data.id}`"
              >
                <Button
                  icon="bi bi-pencil-square"
                  severity="secondary"
                  text
                  rounded
                  class="!w-9 !h-9 !bg-slate-50 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/20 hover:!text-indigo-600 dark:hover:!text-indigo-400 transition-all"
                  v-tooltip.top="'Edit User'"
                />
              </NuxtLink>
              <Button
                v-if="hasPermission('users', 'delete')"
                icon="bi bi-trash3-fill"
                severity="danger"
                text
                rounded
                class="!w-9 !h-9 !bg-rose-50 dark:!bg-rose-500/10 !text-rose-500 hover:!bg-rose-600 hover:!text-white transition-all"
                @click="confirmDelete(slotProps.data)"
                v-tooltip.top="'Delete User'"
              />
            </div>
          </template>
        </Column>

        <template #footer>
          <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-4">
            <div class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total {{ totalUsers }} Registered User Accounts
            </div>
            <Paginator
              :rows="itemsPerPage"
              :totalRecords="totalUsers"
              template="PrevPageLink PageLinks NextPageLink"
              class="!bg-transparent !p-0"
              @page="onPageChange"
              :pt="{
                page: ({ context }: any) => ({
                  class: [
                    '!w-8 !h-8 !rounded-lg !text-[11px] !font-black !min-w-0 !transition-colors',
                    context.active
                      ? '!text-indigo-600 dark:!text-indigo-400'
                      : '!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800',
                  ],
                }),
                prev: { class: '!w-8 !h-8 !rounded-lg !text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800 !transition-colors' },
                next: { class: '!w-8 !h-8 !rounded-lg !text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800 !transition-colors' },
              }"
            />
          </div>
        </template>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-3xl text-indigo-500 mb-3 shadow-inner">
              <i class="bi bi-search"></i>
            </div>
            <h3 class="text-base font-black text-slate-800 dark:text-white mb-1">
              No Users Found
            </h3>
            <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-4">
              No user accounts match your active filter criteria.
            </p>
            <Button
              v-if="searchQuery"
              label="Reset Search"
              icon="bi bi-x-circle"
              class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 !border-none !text-[10px] !font-black !uppercase !tracking-widest"
              @click="searchQuery = ''; selectedRoleFilter = ''"
            />
          </div>
        </template>
      </DataTable>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUsers } from "~/composables/useUsers";
import { useAuth } from "~/composables/useAuth";
import { useConfirm } from "primevue/useconfirm";

definePageMeta({
  layout: "default",
  middleware: [
    () => navigateTo("/employees", { redirectCode: 301 }),
  ],
});

const {
  users,
  totalUsers,
  loading,
  page,
  searchQuery,
  itemsPerPage,
  fetchUsers,
  deleteUser,
} = useUsers();

const { hasPermission } = useAuth();
const confirm = useConfirm();

const viewMode = ref<"table" | "grid">("grid");
const selectedRoleFilter = ref("");

const roleFilterOptions = [
  { label: "All Roles", value: "" },
  { label: "Super Admin", value: "Super Admin" },
  { label: "HR Manager", value: "Manager HRD" },
  { label: "HR Admin", value: "Admin HRD" },
  { label: "Employee", value: "Karyawan" },
];

const userStats = computed(() => {
  const active = users.value.filter((u) => u.is_active).length;
  const inactive = users.value.filter((u) => !u.is_active).length;
  const admins = users.value.filter((u) => u.role_id === 1 || u.role_name?.toLowerCase().includes("admin")).length;

  return [
    {
      label: "Total Users",
      value: totalUsers.value,
      icon: "bi bi-people-fill",
      color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Active Accounts",
      value: active,
      icon: "bi bi-check-circle-fill",
      color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Inactive Accounts",
      value: inactive,
      icon: "bi bi-x-circle-fill",
      color: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      label: "Admin Access",
      value: admins,
      icon: "bi bi-shield-lock-fill",
      color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];
});

const filteredUsers = computed(() => {
  if (!selectedRoleFilter.value) return users.value;
  return users.value.filter((u) => u.role_name === selectedRoleFilter.value);
});

onMounted(() => fetchUsers());

const onPageChange = (event: any) => {
  page.value = event.page + 1;
};

const confirmDelete = (user: any) => {
  confirm.require({
    message: `Are you sure you want to delete the user account for "${user.username}"? This action can be restored in the Recovery Center.`,
    header: "Delete User Account",
    icon: "bi bi-exclamation-triangle text-rose-500 text-2xl",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      text: true,
    },
    acceptProps: {
      label: "Yes, Delete Account",
      severity: "danger",
    },
    accept: async () => {
      await deleteUser(user.id);
      fetchUsers();
    },
  });
};
</script>

<style>
.p-datatable-overhaul .p-datatable-thead > tr > th {
  @apply !bg-slate-50/80 dark:!bg-slate-800/80 !text-slate-400 dark:!text-slate-500 !text-[11px] !font-black !uppercase !tracking-[0.25em] !px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800;
}
.p-datatable-overhaul .p-datatable-tbody > tr > td {
  @apply !px-8 !py-5 !border-b !border-slate-50 dark:!border-slate-800 !bg-white dark:!bg-slate-900 transition-all duration-300;
}
.p-datatable-overhaul .p-datatable-tbody > tr:hover > td {
  @apply !bg-slate-50/30 dark:!bg-slate-800/30;
}
</style>
