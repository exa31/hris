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
          Restore soft-deleted talent profiles and their linked system access accounts back to active status.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, scale: 0.95 }" :animate="{ opacity: 1, scale: 1 }">
        <Button
          label="Refresh Data"
          icon="bi bi-arrow-clockwise"
          class="!rounded-xl !px-6 !py-3.5 !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 !text-slate-700 dark:!text-slate-200 !font-black !uppercase !text-[10px] !tracking-widest shadow-xs hover:!bg-slate-50 dark:hover:!bg-slate-700 transition-colors"
          @click="refreshData"
          :loading="employeesLoading"
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
            Talent records in NexusHR are safely archived when deleted. Restoring an archived talent revitalizes their employee profile, attendance logs, and system login credentials simultaneously.
          </p>
        </div>
      </div>
    </Motion>

    <!-- Main Table Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <!-- Filter & Search Toolbar -->
        <div
          class="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20"
        >
          <div class="flex-1 min-w-[280px] max-w-md relative group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="employeeSearch"
              placeholder="Search deleted talent by name, NIP, or username..."
              class="w-full !pl-11 !py-3 !bg-white dark:!bg-slate-800/80 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-white focus:!ring-2 focus:!ring-indigo-500/20 shadow-xs"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {{ totalEmployees }} Talent Record(s) in Archive
            </span>
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :value="deletedEmployees"
          class="p-datatable-overhaul"
          :loading="employeesLoading"
          :pt="{
            wrapper: { class: '!bg-transparent' },
            footer: { class: '!bg-transparent' },
            footerRow: { class: '!bg-transparent' },
            footerCell: { class: '!bg-transparent !p-0 !border-none' },
          }"
        >
          <Column header="Talent Identity">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.name?.charAt(0) || 'T'"
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

          <Column header="Designation & Department">
            <template #body="slotProps">
              <div class="flex flex-col gap-1">
                <span
                  class="text-xs font-black text-slate-700 dark:text-slate-300"
                  >{{ slotProps.data.position_name || slotProps.data.position || "Staff" }}</span
                >
                <Tag
                  :value="slotProps.data.department_name || slotProps.data.department || 'General'"
                  class="!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 !font-bold !text-[9px] !w-fit !rounded-md"
                />
              </div>
            </template>
          </Column>

          <Column header="Linked Account & Role">
            <template #body="slotProps">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5">
                  <span
                    v-if="slotProps.data.username"
                    class="text-xs font-black text-indigo-600 dark:text-indigo-400"
                  >
                    @{{ slotProps.data.username }}
                  </span>
                  <span v-else class="text-xs font-medium text-slate-400 italic">No account</span>
                </div>
                <Tag
                  :value="slotProps.data.role_name || 'Pegawai'"
                  class="!rounded-md !px-2 !py-0.5 !text-[9px] !font-black !uppercase !tracking-widest !w-fit"
                  :class="
                    slotProps.data.role_name?.toLowerCase().includes('admin')
                      ? '!bg-purple-50 dark:!bg-purple-500/10 !text-purple-600 dark:!text-purple-400'
                      : slotProps.data.role_name?.toLowerCase().includes('manager')
                      ? '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400'
                      : '!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400'
                  "
                />
              </div>
            </template>
          </Column>

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
                label="Restore Talent & Account"
                @click="handleRestore(slotProps.data.id, slotProps.data.name)"
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
                No archived talent records awaiting recovery.
              </p>
              <Button
                v-if="employeeSearch"
                label="Clear Search Filter"
                icon="bi bi-x-circle"
                class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 !border-none !text-[10px] !font-black !uppercase !tracking-widest"
                @click="employeeSearch = ''"
              />
            </div>
          </template>

          <template #footer>
            <div
              class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-4"
            >
              <span
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >Total {{ totalEmployees }} Archived Records</span
              >
              <Paginator
                :rows="itemsPerPage"
                :totalRecords="totalEmployees"
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
import { onMounted } from "vue";
import { useRecovery } from "~/composables/useRecovery";

definePageMeta({ layout: "default" });

const {
  deletedEmployees,
  totalEmployees,
  employeesLoading,
  employeePage,
  employeeSearch,
  fetchDeletedEmployees,
  restoreEmployee,
  itemsPerPage,
} = useRecovery();

const { showSuccess } = useNotification();

onMounted(() => {
  fetchDeletedEmployees();
});

const refreshData = () => fetchDeletedEmployees();

const onPageChange = (event: any) => {
  employeePage.value = event.page + 1;
};

const handleRestore = (id: number, name?: string) => {
  showSuccess(
    "Recovery Confirmation",
    `Are you sure you want to restore ${name || 'this talent'}? Their employee profile, attendance logs, and user login credentials will be revitalized to active status.`,
    async () => {
      await restoreEmployee(id);
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
