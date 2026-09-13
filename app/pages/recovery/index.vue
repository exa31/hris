<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
          ></span>
          <span
            class="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400"
            >Recycle Bin & Data Recovery</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Data Recovery Center
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Restore soft-deleted employee records or user login credentials back to active status.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, scale: 0.95 }" :animate="{ opacity: 1, scale: 1 }">
        <Button
          label="Refresh Data"
          icon="bi bi-arrow-clockwise"
          class="!rounded-xl !px-6 !py-3.5 !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 !text-slate-700 dark:!text-slate-200 !font-black !uppercase !text-[10px] !tracking-widest shadow-xs hover:!bg-slate-50 dark:hover:!bg-slate-700 transition-colors"
          @click="refreshData"
          :loading="loading"
        />
      </Motion>
    </div>

    <!-- Safety Information Banner -->
    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.1 }">
      <div class="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
          <i class="bi bi-shield-exclamation"></i>
        </div>
        <div class="space-y-1">
          <h4 class="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            Data Integrity Protection (Soft-Delete Guard)
          </h4>
          <p class="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed font-medium">
            Entities deleted in NexusHR are safely archived in the backup repository. Restoring an entity revitalizes all related records, including attendance and leave histories.
          </p>
        </div>
      </div>
    </Motion>

    <!-- Main Tabs & Table Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <!-- Modern Tabs Switcher -->
        <div class="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2 bg-slate-50/50 dark:bg-slate-950/30">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-widest cursor-pointer',
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            ]"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-black"
              :class="activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
            >
              {{ tab.id === 'employees' ? deletedEmployees.length : deletedUsers.length }}
            </span>
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div
          class="p-4 sm:p-5 flex flex-wrap items-center gap-4 border-b border-slate-100 dark:border-slate-800"
        >
          <div class="flex-1 min-w-[280px] relative group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              :placeholder="
                activeTab === 'employees'
                  ? 'Search deleted employee name or NIP...'
                  : 'Search username or employee name...'
              "
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-white focus:!ring-2 focus:!ring-indigo-500/20"
            />
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :value="displayData"
          class="p-datatable-overhaul"
          :loading="loading"
          :pt="{
            wrapper: { class: '!bg-transparent' },
            footer: { class: '!bg-transparent' },
            footerRow: { class: '!bg-transparent' },
            footerCell: { class: '!bg-transparent !p-0 !border-none' },
          }"
        >
          <!-- Employees Tab Columns -->
          <template v-if="activeTab === 'employees'">
            <Column header="Employee Identity">
              <template #body="slotProps">
                <div class="flex items-center gap-3">
                  <Avatar
                    :label="slotProps.data.name?.charAt(0) || 'P'"
                    shape="circle"
                    class="!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !font-black !w-10 !h-10 border border-rose-100 dark:border-rose-900/30"
                  />
                  <div>
                    <div
                      class="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight"
                    >
                      {{ slotProps.data.name }}
                    </div>
                    <div
                      class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5"
                    >
                      NIP: {{ slotProps.data.nip }}
                    </div>
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Position & Department">
              <template #body="slotProps">
                <div class="flex flex-col gap-1">
                  <span
                    class="text-xs font-black text-slate-700 dark:text-slate-300"
                    >{{ slotProps.data.position || "Staff" }}</span
                  >
                  <Tag
                    :value="slotProps.data.department === 'Umum' ? 'General' : (slotProps.data.department || 'General')"
                    class="!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 !font-bold !text-[9px] !w-fit !rounded-md"
                  />
                </div>
              </template>
            </Column>
          </template>

          <!-- Users Tab Columns -->
          <template v-else>
            <Column header="Account Login Identity">
              <template #body="slotProps">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm"
                  >
                    <i class="bi bi-person-lock"></i>
                  </div>
                  <div>
                    <div
                      class="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-tight"
                    >
                      @{{ slotProps.data.username }}
                    </div>
                    <div
                      class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5"
                    >
                      {{ slotProps.data.employee_name || "No Linked Employee" }}
                    </div>
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Authorized Role">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.role_name || 'User'"
                  class="!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !font-black !text-[9px] !rounded-md"
                />
              </template>
            </Column>
          </template>

          <!-- Shared Columns -->
          <Column header="Deletion Time">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span
                  class="text-xs font-bold text-slate-700 dark:text-slate-300"
                  >{{ formatDate(slotProps.data.deleted_at) }}</span
                >
                <span
                  class="text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mt-0.5"
                  >Temporarily Archived</span
                >
              </div>
            </template>
          </Column>

          <Column header="Recovery Action" class="!text-right">
            <template #body="slotProps">
              <Button
                icon="bi bi-arrow-counterclockwise"
                label="Restore Record"
                @click="handleRestore(slotProps.data.id)"
                class="!rounded-xl !text-[10px] !font-black !uppercase !tracking-wider !px-4 !py-2.5 !bg-emerald-600 hover:!bg-emerald-700 !text-white !border-none transition-all shadow-sm"
              />
            </template>
          </Column>

          <template #empty>
            <div
              class="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-3xl text-emerald-500 mb-3 shadow-inner">
                <i class="bi bi-shield-check"></i>
              </div>
              <h3
                class="text-base font-black text-slate-800 dark:text-white mb-1"
              >
                Recycle Bin Clean
              </h3>
              <p
                class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-4"
              >
                No deleted records awaiting recovery in this category.
              </p>
              <Button
                v-if="searchQuery"
                label="Clear Search Filter"
                icon="bi bi-x-circle"
                class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 !border-none !text-[10px] !font-black !uppercase !tracking-widest"
                @click="searchQuery = ''"
              />
            </div>
          </template>

          <template #footer>
            <div
              class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-4"
            >
              <span
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >Total {{ displayData.length }} Archived Records</span
              >
              <Paginator
                :rows="itemsPerPage"
                :totalRecords="
                  activeTab === 'employees'
                    ? deletedEmployees.length
                    : deletedUsers.length
                "
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
import { ref, computed, onMounted } from "vue";
import { useRecovery } from "~/composables/useRecovery";

definePageMeta({ layout: "default" });

const activeTab = ref("employees");
const tabs = [
  { id: "employees", label: "Employee Records", icon: "bi bi-person-badge" },
  { id: "users", label: "User Accounts", icon: "bi bi-shield-lock" },
];

const {
  deletedEmployees,
  employeesLoading,
  employeePage,
  employeeSearch,
  fetchDeletedEmployees,
  restoreEmployee,
  deletedUsers,
  usersLoading,
  userPage,
  userSearch,
  fetchDeletedUsers,
  restoreUser,
  itemsPerPage,
} = useRecovery();

const { showSuccess } = useNotification();

const searchQuery = computed({
  get: () =>
    activeTab.value === "employees" ? employeeSearch.value : userSearch.value,
  set: (val) => {
    if (activeTab.value === "employees") employeeSearch.value = val;
    else userSearch.value = val;
  },
});

const displayData = computed(() =>
  activeTab.value === "employees" ? deletedEmployees.value : deletedUsers.value,
);
const loading = computed(() =>
  activeTab.value === "employees" ? employeesLoading.value : usersLoading.value,
);

onMounted(() => {
  fetchDeletedEmployees();
  fetchDeletedUsers();
});

const refreshData = () =>
  activeTab.value === "employees"
    ? fetchDeletedEmployees()
    : fetchDeletedUsers();

const onPageChange = (event: any) => {
  if (activeTab.value === "employees") employeePage.value = event.page + 1;
  else userPage.value = event.page + 1;
};

const handleRestore = (id: number) => {
  const type = activeTab.value === "employees" ? "employee" : "user account";
  showSuccess(
    "Recovery Confirmation",
    `Are you sure you want to restore this ${type} to active status? All associated records will be fully accessible.`,
    async () => {
      if (activeTab.value === "employees") await restoreEmployee(id);
      else await restoreUser(id);
      refreshData();
    },
  );
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  date.setHours(date.getHours() + 7);

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
