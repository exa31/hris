<template>
  <div class="space-y-8">
    <!-- Sophisticated Header & Stats -->
    <div class="flex flex-col gap-8">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <Motion
          :initial="{ opacity: 0, x: -20 }"
          :animate="{ opacity: 1, x: 0 }"
          class="space-y-1"
        >
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
            <h1
              class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
            >
              Management Talent
            </h1>
          </div>
          <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
            Orchestrate your workforce with precision and elegance.
          </p>
        </Motion>

        <Motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
        >
          <NuxtLink
            v-if="hasPermission('employees', 'create')"
            to="/employees/new"
          >
            <Button
              label="Onboard Talent"
              icon="bi bi-person-plus-fill"
              class="!rounded-xl !px-6 !py-3.5 !font-black !uppercase !text-[10px] !tracking-widest !bg-indigo-600 !border-none !shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-700 transition-all"
            />
          </NuxtLink>
        </Motion>
      </div>

      <!-- Quick Stats Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          v-for="stat in quickStats"
          :key="stat.label"
          class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all"
        >
          <div
            :class="[
              stat.color,
              'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm',
            ]"
          >
            <i :class="stat.icon"></i>
          </div>
          <div>
            <div
              class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >
              {{ stat.label }}
            </div>
            <div
              class="text-lg font-black text-slate-800 dark:text-white leading-none"
            >
              {{ stat.value }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Area -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
      class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex items-center gap-4 flex-1">
        <div class="relative flex-1 max-w-md group">
          <i
            class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"
          ></i>
          <InputText
            v-model="searchQuery"
            placeholder="Search by Name, NIP, or Email..."
            class="!w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/50 !border-none !rounded-xl !text-xs !font-bold transition-all focus:!ring-2 focus:!ring-indigo-500/10"
          />
        </div>
        <div class="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>
        <Select
          v-model="selectedType"
          :options="selectedTypeOptions"
          class="!bg-transparent !border-none !shadow-none !text-[10px] !font-black !uppercase !tracking-widest !h-10 flex items-center"
        />
      </div>

      <div class="flex items-center gap-2">
        <Button
          icon="bi bi-funnel"
          :severity="isFilterActive ? 'primary' : 'secondary'"
          text
          class="!rounded-lg !text-slate-400"
          @click="isFilterOpen = true"
          v-tooltip.top="'Advanced Filters'"
        />
        <Button
          icon="bi bi-arrow-clockwise"
          text
          class="!rounded-lg !text-slate-400"
          @click="fetchEmployees"
          v-tooltip.top="'Refresh Data'"
        />
      </div>
    </Motion>

    <!-- Advanced Filter Modal -->
    <Dialog
      v-model:visible="isFilterOpen"
      modal
      header="Advanced Filters"
      class="w-full max-w-md !rounded-[32px] !border-none !shadow-2xl overflow-hidden"
      :pt="{
        root: { class: 'bg-white/90 backdrop-blur-2xl dark:bg-slate-900/90' },
        header: { class: 'px-8 pt-8 pb-4 !bg-transparent !border-none' },
        content: { class: 'px-8 pb-8 !bg-transparent' },
        footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
      }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"
          >
            <i
              class="bi bi-funnel-fill text-indigo-600 dark:text-indigo-400"
            ></i>
          </div>
          <span
            class="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs"
            >Advanced Filters</span
          >
        </div>
      </template>

      <div class="flex flex-col gap-8">
        <!-- Sort Section -->
        <div class="space-y-4">
          <label
            class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1"
            >Sorting & Ordering</label
          >
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-2">
              <label class="text-[9px] font-bold text-slate-500 uppercase px-1"
                >Sort By</label
              >
              <Select
                v-model="localFilters.sortColumn"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[9px] font-bold text-slate-500 uppercase px-1"
                >Direction</label
              >
              <Select
                v-model="localFilters.sortDirection"
                :options="[
                  { label: 'Ascending', value: 'asc' },
                  { label: 'Descending', value: 'desc' },
                ]"
                optionLabel="label"
                optionValue="value"
                class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none"
              />
            </div>
          </div>
        </div>

        <!-- Filter Section -->
        <div class="space-y-6">
          <label
            class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1"
            >Filter Criteria</label
          >

          <div class="flex flex-col gap-2">
            <label class="text-[9px] font-bold text-slate-500 uppercase px-1"
              >Department</label
            >
            <Select
              v-model="localFilters.selectedDepartment"
              :options="metadata.departments"
              optionLabel="name"
              optionValue="id"
              placeholder="All Departments"
              showClear
              class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[9px] font-bold text-slate-500 uppercase px-1"
              >Positions</label
            >
            <MultiSelect
              v-model="localFilters.selectedPositions"
              :options="metadata.positions"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Positions"
              :maxSelectedLabels="2"
              class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[9px] font-bold text-slate-500 uppercase px-1"
              >Status</label
            >
            <div
              class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl"
            >
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="localFilters.selectedStatus"
                  :value="null"
                  inputId="status-all"
                />
                <label for="status-all" class="text-xs font-bold">All</label>
              </div>
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="localFilters.selectedStatus"
                  :value="true"
                  inputId="status-active"
                />
                <label
                  for="status-active"
                  class="text-xs font-bold text-emerald-500"
                  >Active</label
                >
              </div>
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="localFilters.selectedStatus"
                  :value="false"
                  inputId="status-off"
                />
                <label for="status-off" class="text-xs font-bold text-slate-400"
                  >Off-duty</label
                >
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[9px] font-bold text-slate-500 uppercase px-1"
              >Tenure (Years)</label
            >
            <div class="flex items-center gap-2">
              <Select
                v-model="localFilters.tenureOperator"
                :options="['>', '<', '=']"
                class="!w-20 !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none"
              />
              <InputNumber
                v-model="localFilters.tenureValue"
                placeholder="Years"
                :min="0"
                class="!flex-1"
                inputClass="!rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !w-full !px-4 !py-3 !text-xs !font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center gap-3 w-full">
          <Button
            label="Reset Filters"
            severity="secondary"
            text
            class="flex-1 !rounded-xl !font-bold !text-[10px] !uppercase !tracking-widest"
            @click="resetLocalFilters"
          />
          <Button
            label="Apply Filters"
            severity="primary"
            class="flex-1 !rounded-xl !font-black !text-[10px] !uppercase !tracking-widest !bg-indigo-600 hover:!bg-indigo-700 !border-none"
            @click="applyFilters"
          />
        </div>
      </template>
    </Dialog>

    <!-- Main Content Table -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.3 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <DataTable
          :value="employees"
          class="p-datatable-overhaul-v2"
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
              <div class="relative mb-6">
                <div
                  class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"
                ></div>
                <div
                  class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700"
                >
                  <i class="bi bi-person-slash text-4xl text-indigo-500"></i>
                </div>
                <div
                  class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg dark:shadow-none z-20"
                >
                  <i class="bi bi-search text-xs"></i>
                </div>
              </div>
              <h3
                class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
              >
                No Talent Found
              </h3>
              <p
                class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8"
              >
                Your search parameters did not match any records in our database
              </p>
              <Button
                label="Reset Active Filters"
                icon="bi bi-arrow-counterclockwise"
                class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform"
                @click="resetFilters"
              />
            </div>
          </template>

          <Column header="Talent">
            <template #body="slotProps">
              <div class="flex items-center gap-4 py-2">
                <div class="relative">
                  <Avatar
                    :image="
                      slotProps.data.photo_url ||
                      'https://ui-avatars.com/api/?name=' +
                        slotProps.data.name +
                        '&background=random&size=100'
                    "
                    shape="circle"
                    class="!w-12 !h-12 border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-slate-100 dark:ring-slate-700"
                  />
                  <div
                    class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"
                    :class="
                      slotProps.data.status ? 'bg-emerald-500' : 'bg-slate-300'
                    "
                  ></div>
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-sm font-black text-slate-800 dark:text-white leading-tight"
                    >{{ slotProps.data.name }}</span
                  >
                  <span
                    class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                    >{{ slotProps.data.nip }}</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <Column header="Designation">
            <template #body="slotProps">
              <div class="flex flex-col gap-1">
                <span
                  class="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest"
                  >{{ slotProps.data.position_name }}</span
                >
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500"
                  >{{ slotProps.data.department_name }}</span
                >
              </div>
            </template>
          </Column>

          <Column header="Contract">
            <template #body="slotProps">
              <div class="flex flex-col gap-1.5">
                <Tag
                  :value="slotProps.data.type"
                  class="!rounded-lg !px-3 !py-1 !text-[9px] !font-black !uppercase !tracking-widest !w-fit"
                  :class="
                    slotProps.data.type === 'Kontrak'
                      ? '!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border !border-amber-100/50'
                      : '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border !border-indigo-100/50'
                  "
                />
                <span
                  class="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase"
                  >{{ formatDate(slotProps.data.join_date) }}</span
                >
              </div>
            </template>
          </Column>

          <Column header="Contact">
            <template #body="slotProps">
              <div class="flex flex-col gap-1">
                <div
                  class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  <i class="bi bi-envelope text-slate-300 dark:text-slate-600"></i>
                  <span class="truncate max-w-[150px]">{{
                    slotProps.data.email
                  }}</span>
                </div>
                <div
                  class="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500"
                >
                  <i class="bi bi-phone text-slate-300 dark:text-slate-600"></i>
                  {{ slotProps.data.phone }}
                </div>
              </div>
            </template>
          </Column>

          <Column header="Status" class="!text-center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <div
                  v-if="slotProps.data.status"
                  class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span
                    class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
                    >Active</span
                  >
                </div>
                <div
                  v-else
                  class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-400/10 border border-slate-100 dark:border-slate-800"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest"
                    >Off-duty</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <Column header="Actions" class="!text-right">
            <template #body="slotProps">
              <div class="flex items-center justify-end gap-1 px-2">
                <NuxtLink :to="`/employees/${slotProps.data.id}`">
                  <Button
                    icon="bi bi-chevron-right"
                    severity="secondary"
                    text
                    class="!rounded-lg !w-9 !h-9 !bg-slate-50 dark:!bg-slate-800 !text-slate-400 hover:!bg-indigo-600 hover:!text-white transition-all"
                    v-tooltip.top="'View Details'"
                  />
                </NuxtLink>
                <NuxtLink
                  v-if="hasPermission('employees', 'update')"
                  :to="`/employees/${slotProps.data.id}/edit`"
                >
                  <Button
                    icon="bi bi-pencil"
                    severity="secondary"
                    text
                    class="!rounded-lg !w-9 !h-9 !bg-slate-50 dark:!bg-slate-800 !text-slate-400 hover:!bg-amber-500 hover:!text-white transition-all"
                    v-tooltip.top="'Edit Talent'"
                  />
                </NuxtLink>
                <Button
                  v-if="hasPermission('employees', 'delete')"
                  icon="bi bi-trash"
                  severity="danger"
                  text
                  class="!rounded-lg !w-9 !h-9 !bg-rose-50 dark:!bg-rose-500/10 !text-rose-500 hover:!bg-rose-600 hover:!text-white transition-all"
                  @click="confirmDelete(slotProps.data)"
                  v-tooltip.top="'Remove'"
                />
              </div>
            </template>
          </Column>

          <template #footer>
            <div
              class="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 bg-white dark:bg-slate-900/50"
            >
              <div class="flex items-center gap-4">
                <span
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >Showing {{ employees.length }} Talent Nodes</span
                >
                <div class="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                <Button
                  label="Export Excel"
                  icon="bi bi-file-earmark-spreadsheet"
                  text
                  @click="exportExcel"
                  class="!rounded-lg !text-[9px] !font-black !uppercase !tracking-widest !text-emerald-600 dark:!text-emerald-400 hover:!bg-emerald-50 dark:hover:!bg-emerald-500/10 transition-colors"
                />
              </div>
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useEmployees } from "~/composables/useEmployees";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: "default" });

const confirm = useConfirm();

const { hasPermission } = useAuth();
const {
  employees,
  totalEmployees,
  loading,
  currentPage,
  searchQuery,
  itemsPerPage,
  fetchEmployees,
  deleteEmployee,
  summary,
  fetchSummary,
  metadata,
  fetchMetadata,
  selectedDepartment,
  selectedStatus,
  selectedPositions,
  tenureOperator,
  tenureValue,
  sortColumn,
  sortDirection,
  resetFilters,
  exportExcel,
  selectedType,
} = useEmployees();

const isFilterOpen = ref(false);
const sortOptions = [
  { label: "Join Date", value: "join_date" },
  { label: "Name", value: "name" },
  { label: "NIP", value: "nip" },
  { label: "Position", value: "position" },
  { label: "Created At", value: "created_at" },
];

const localFilters = reactive<{
  sortColumn: string;
  sortDirection: "asc" | "desc";
  selectedDepartment: number | null;
  selectedPositions: number[];
  selectedStatus: boolean | null;
  tenureOperator: string;
  tenureValue: number | null;
}>({
  sortColumn: "join_date",
  sortDirection: "desc",
  selectedDepartment: null as number | null,
  selectedPositions: [] as number[],
  selectedStatus: null as boolean | null,
  tenureOperator: ">",
  tenureValue: null as number | null,
});

watch(isFilterOpen, (val) => {
  if (val) {
    localFilters.sortColumn = sortColumn.value;
    localFilters.sortDirection = sortDirection.value;
    localFilters.selectedDepartment = selectedDepartment.value;
    localFilters.selectedPositions = [...selectedPositions.value];
    localFilters.selectedStatus = selectedStatus.value;
    localFilters.tenureOperator = tenureOperator.value;
    localFilters.tenureValue = tenureValue.value;
  }
});

const applyFilters = () => {
  sortColumn.value = localFilters.sortColumn;
  sortDirection.value = localFilters.sortDirection;
  selectedDepartment.value = localFilters.selectedDepartment;
  selectedPositions.value = [...localFilters.selectedPositions];
  selectedStatus.value = localFilters.selectedStatus;
  tenureOperator.value = localFilters.tenureOperator;
  tenureValue.value = localFilters.tenureValue;

  isFilterOpen.value = false;
  fetchEmployees();
};

const resetLocalFilters = () => {
  localFilters.sortColumn = "join_date";
  localFilters.sortDirection = "desc";
  localFilters.selectedDepartment = null;
  localFilters.selectedPositions = [];
  localFilters.selectedStatus = null;
  localFilters.tenureOperator = ">";
  localFilters.tenureValue = null;
  applyFilters();
};

const isFilterActive = computed(() => {
  return (
    selectedDepartment.value ||
    selectedStatus.value !== null ||
    selectedPositions.value.length > 0 ||
    tenureValue.value !== null
  );
});

const selectedTypeOptions = ["All Types", "Tetap", "Kontrak", "Magang"];
onMounted(() => {
  selectedType.value = "All Types";
  fetchEmployees();
  fetchSummary();
  fetchMetadata();
});

// Watch for filter changes outside modal
watch(
  [searchQuery, currentPage, selectedType],
  () => {
    fetchEmployees();
  },
  { deep: true },
);

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1;
};

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const quickStats = computed(() => [
  {
    label: "Total Talent",
    value: summary.value.total_talent,
    icon: "bi bi-people-fill",
    color: "bg-indigo-600",
  },
  {
    label: "Active Crew",
    value: summary.value.active_crew,
    icon: "bi bi-shield-check",
    color: "bg-emerald-500",
  },
  {
    label: "New Talent",
    value: summary.value.new_talent,
    icon: "bi bi-lightning-fill",
    color: "bg-amber-500",
  },
  {
    label: "On Leave",
    value: summary.value.on_leave,
    icon: "bi bi-moon-stars-fill",
    color: "bg-violet-600",
  },
]);

const confirmDelete = (employee: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin menghapus data pegawai "${employee.name}" secara permanen?`,
    header: "Hapus Data Pegawai",
    icon: "bi bi-exclamation-triangle-fill text-rose-500",
    rejectProps: {
      label: "Batal",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Hapus",
      severity: "danger",
    },
    accept: async () => {
      await deleteEmployee(employee.id);
      fetchEmployees();
    },
  });
};
</script>

<style>
.p-datatable-overhaul-v2 .p-datatable-thead > tr > th {
  @apply !bg-slate-50 dark:!bg-slate-800/50 !text-slate-400 dark:!text-slate-500 !text-[10px] !font-black !uppercase !tracking-[0.2em] !px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800;
}
.p-datatable-overhaul-v2 .p-datatable-tbody > tr > td {
  @apply !px-8 !py-5 !border-b !border-slate-50 dark:!border-slate-800 !bg-white dark:!bg-slate-900 transition-all duration-300;
}
.p-datatable-overhaul-v2 .p-datatable-tbody > tr:hover > td {
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
