<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20"
          >
            <i class="bi bi-people-fill text-2xl"></i>
          </div>
          <div>
            <h1
              class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              User Accounts
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage system access, roles, and credentials.
            </p>
          </div>
        </div>
      </Motion>

      <Motion
        :initial="{ opacity: 0, x: 20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="flex flex-col sm:flex-row items-center gap-4"
      >
        <div class="relative group w-full sm:w-auto">
          <i
            class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
          ></i>
          <InputText
            v-model="searchQuery"
            placeholder="Search users..."
            class="!w-full sm:!w-[280px] !pl-11 !py-3 !bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 !rounded-xl shadow-sm focus:!ring-2 focus:!ring-indigo-500/20 transition-all text-sm font-medium"
          />
        </div>
        <NuxtLink
          v-if="hasPermission('users', 'create')"
          to="/user-management/new"
          class="w-full sm:w-auto"
        >
          <Button
            icon="bi bi-plus-lg"
            label="Add User"
            class="!w-full sm:!w-auto !rounded-xl !px-6 !py-3 !bg-indigo-600 hover:!bg-indigo-700 !border-none !font-bold !text-sm !shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          />
        </NuxtLink>
      </Motion>
    </div>

    <!-- Data Table Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <DataTable
          :value="users"
          class="p-datatable-premium"
          :loading="loading"
          :rows="itemsPerPage"
          scrollable
          :pt="{
            footer: { class: '!bg-transparent' },
            footerRow: { class: '!bg-transparent' },
            footerCell: { class: '!bg-transparent !p-0 !border-none' },
          }"
        >
          <template #empty>
            <div
              class="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div
                class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
              >
                <i class="bi bi-search text-3xl text-slate-400"></i>
              </div>
              <h3
                class="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight"
              >
                No Users Found
              </h3>
              <p
                class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6"
              >
                We couldn't find any user accounts matching your current search
                criteria.
              </p>
              <Button
                v-if="searchQuery"
                label="Clear Search"
                icon="bi bi-x-lg"
                severity="secondary"
                class="!rounded-xl !px-6 !py-2.5 !font-bold"
                @click="searchQuery = ''"
              />
            </div>
          </template>

          <Column header="User Profile" class="min-w-[250px]">
            <template #body="slotProps">
              <div class="flex items-center gap-4 py-2">
                <Avatar
                  :image="
                    slotProps.data.employee?.photo_url ||
                    'https://ui-avatars.com/api/?name=' +
                      (slotProps.data.username || 'U') +
                      '&background=6366f1&color=fff'
                  "
                  shape="circle"
                  class="!w-12 !h-12 border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                />
                <div class="flex flex-col">
                  <span
                    class="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1"
                    >{{ slotProps.data.username }}</span
                  >
                  <span
                    class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                  >
                    <i class="bi bi-person-badge text-slate-400"></i>
                    {{ slotProps.data.employee_name || "No linked employee" }}
                  </span>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Role & Access" class="min-w-[150px]">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <Tag
                  :value="slotProps.data.role_name || 'Guest'"
                  class="!rounded-lg !px-3 !py-1.5 !text-xs !font-bold"
                  :class="
                    slotProps.data.role_id === 1
                      ? '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-100 dark:!border-indigo-500/20'
                      : '!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300'
                  "
                />
              </div>
            </template>
          </Column>

          <Column header="Status" class="min-w-[120px]">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    slotProps.data.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                  "
                ></div>
                <span
                  class="text-xs font-bold"
                  :class="
                    slotProps.data.is_active
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  "
                >
                  {{ slotProps.data.is_active ? "Active" : "Inactive" }}
                </span>
              </div>
            </template>
          </Column>

          <Column header="Actions" class="!text-right min-w-[100px]">
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
                    class="!w-10 !h-10 !bg-slate-50 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-500/20 hover:!text-indigo-600 dark:hover:!text-indigo-400 transition-all"
                    v-tooltip.top="'Edit Account'"
                  />
                </NuxtLink>
                <Button
                  v-if="hasPermission('users', 'delete')"
                  icon="bi bi-trash3-fill"
                  severity="danger"
                  text
                  rounded
                  class="!w-10 !h-10 !bg-rose-50 dark:!bg-rose-500/10 !text-rose-500 hover:!bg-rose-600 hover:!text-white transition-all"
                  @click="confirmDelete(slotProps.data)"
                  v-tooltip.top="'Delete Account'"
                />
              </div>
            </template>
          </Column>

          <template #footer>
            <div
              class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 gap-4"
            >
              <div
                class="text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                Showing
                <span class="font-bold text-slate-900 dark:text-white">{{
                  users.length
                }}</span>
                of
                <span class="font-bold text-slate-900 dark:text-white">{{
                  totalUsers
                }}</span>
                users
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
        </DataTable>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUsers } from "~/composables/useUsers";
import { useAuth } from "~/composables/useAuth";

import { useConfirm } from "primevue/useconfirm";

definePageMeta({ layout: "default" });

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

onMounted(() => fetchUsers());

const onPageChange = (event: any) => {
  page.value = event.page + 1;
};

const confirmDelete = (user: any) => {
  confirm.require({
    message: `Are you sure you want to permanently delete the account for "${user.username}"? This action cannot be undone.`,
    header: "Delete User Account",
    icon: "bi bi-exclamation-triangle text-rose-500 text-2xl",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete Account",
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
.p-datatable-premium .p-datatable-thead > tr > th {
  @apply !bg-slate-50 dark:!bg-slate-800/80 !text-slate-500 dark:!text-slate-400 !text-xs !font-bold !uppercase !tracking-wider !px-6 !py-4 !border-b !border-slate-200 dark:!border-slate-700;
}
.p-datatable-premium .p-datatable-tbody > tr > td {
  @apply !px-6 !py-4 !border-b !border-slate-100 dark:!border-slate-800/60 !bg-white dark:!bg-slate-900 transition-colors duration-200;
}
.p-datatable-premium .p-datatable-tbody > tr:hover > td {
  @apply !bg-slate-50/50 dark:!bg-slate-800/30;
}

.p-paginator {
  @apply !bg-transparent !p-0 !border-none;
}
.p-paginator .p-paginator-page,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-prev {
  @apply !w-8 !h-8 !rounded-lg !text-[11px] !font-black !min-w-0 !bg-transparent !text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-800 transition-colors;
}
.p-paginator .p-paginator-page.p-highlight {
  @apply !bg-transparent !text-indigo-600 dark:!text-indigo-400 !shadow-none;
}
</style>
