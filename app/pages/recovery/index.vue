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
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
          ></span>
          <span
            class="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400"
            >Data Recovery</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Pusat Pemulihan
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Pulihkan data pegawai atau akses user yang telah dihapus sebelumnya.
        </p>
      </Motion>
    </div>

    <!-- Main Container -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <!-- Tabs -->
        <div
          class="flex border-b border-slate-50 dark:border-slate-800 p-2 gap-2"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800',
            ]"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>

        <!-- Filter & Actions -->
        <div
          class="p-6 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center gap-4 border-b border-slate-50 dark:border-slate-800"
        >
          <div class="flex-1 min-w-[300px] relative group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              :placeholder="
                activeTab === 'employees'
                  ? 'Cari Nama / NIP...'
                  : 'Cari Username / Nama...'
              "
              class="w-full !pl-12 !py-3 !bg-white dark:!bg-slate-900 !border-slate-100 dark:!border-slate-700 !rounded-xl !text-sm dark:text-white focus:!ring-indigo-500/20"
            />
          </div>
          <Button
            icon="bi bi-arrow-clockwise"
            text
            @click="refreshData"
            class="!rounded-xl !bg-white dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-700"
            :loading="loading"
          />
        </div>

        <!-- Content Area -->
        <div class="p-0">
          <DataTable
            :value="displayData"
            class="p-datatable-premium"
            :loading="loading"
          >
            <template v-if="activeTab === 'employees'">
              <Column header="Pegawai">
                <template #body="slotProps">
                  <div class="flex items-center gap-3">
                    <Avatar
                      :label="slotProps.data.name.charAt(0)"
                      shape="circle"
                      class="!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 !font-bold"
                    />
                    <div>
                      <div
                        class="text-sm font-bold text-slate-800 dark:text-slate-200"
                      >
                        {{ slotProps.data.name }}
                      </div>
                      <div
                        class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter"
                      >
                        {{ slotProps.data.nip }}
                      </div>
                    </div>
                  </div>
                </template>
              </Column>
              <Column header="Jabatan & Dept">
                <template #body="slotProps">
                  <div class="flex flex-col gap-1">
                    <span
                      class="text-xs font-bold text-slate-600 dark:text-slate-300"
                      >{{ slotProps.data.position }}</span
                    >
                    <Tag
                      :value="slotProps.data.department"
                      class="!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 !font-bold !text-[9px] !w-fit"
                    />
                  </div>
                </template>
              </Column>
            </template>

            <template v-else>
              <Column header="User Identity">
                <template #body="slotProps">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs"
                    >
                      @
                    </div>
                    <div>
                      <div
                        class="text-sm font-bold text-indigo-600 dark:text-indigo-400"
                      >
                        {{ slotProps.data.username }}
                      </div>
                      <div
                        class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                      >
                        {{ slotProps.data.employee_name }}
                      </div>
                    </div>
                  </div>
                </template>
              </Column>
              <Column header="Role">
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.role_name"
                    class="!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !font-bold !text-[9px]"
                  />
                </template>
              </Column>
            </template>

            <Column header="Dihapus Pada">
              <template #body="slotProps">
                <div class="flex flex-col">
                  <span
                    class="text-xs font-bold text-slate-600 dark:text-slate-300"
                    >{{ formatDate(slotProps.data.deleted_at) }}</span
                  >
                  <span
                    class="text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase"
                    >Legacy System</span
                  >
                </div>
              </template>
            </Column>

            <Column header="Aksi" class="!text-center">
              <template #body="slotProps">
                <Button
                  icon="bi bi-arrow-counterclockwise"
                  label="Pulihkan"
                  @click="handleRestore(slotProps.data.id)"
                  class="!rounded-lg !text-[10px] !font-black !uppercase !px-4 !py-2 !bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border-none hover:!bg-emerald-600 hover:!text-white transition-all shadow-sm"
                />
              </template>
            </Column>

            <template #empty>
              <div
                class="flex flex-col items-center justify-center py-20 px-6 text-center"
              >
                <div class="relative mb-6">
                  <div
                    class="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"
                  ></div>
                  <div
                    class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700"
                  >
                    <i class="bi bi-shield-check text-4xl text-emerald-500"></i>
                  </div>
                  <div
                    class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg z-20"
                  >
                    <i class="bi bi-search text-xs"></i>
                  </div>
                </div>
                <h3
                  class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
                >
                  Database Bersih
                </h3>
                <p
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8"
                >
                  Tidak ada data yang perlu dipulihkan atau sesuai kriteria
                  pencarian.
                </p>
                <Button
                  v-if="searchQuery"
                  label="Clear Search"
                  icon="bi bi-arrow-counterclockwise"
                  class="!rounded-xl !px-8 !py-3.5 !bg-emerald-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-emerald-100 dark:shadow-none hover:scale-105 transition-transform"
                  @click="searchQuery = ''"
                />
              </div>
            </template>

            <template #footer>
              <div
                class="flex items-center justify-between px-8 py-4 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <span
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >Total: {{ displayData.length }} Data Terhapus</span
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
                />
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRecovery } from "~/composables/useRecovery";

const activeTab = ref("employees");
const tabs = [
  { id: "employees", label: "Data Pegawai", icon: "bi bi-person-badge" },
  { id: "users", label: "Akses Login", icon: "bi bi-shield-lock" },
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
  const type = activeTab.value === "employees" ? "pegawai" : "akses user";
  showSuccess(
    "Konfirmasi Pemulihan",
    `Apakah Anda yakin ingin memulihkan ${type} ini ke sistem aktif? Data akan kembali dapat diakses sepenuhnya.`,
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

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
definePageMeta({ layout: "default" });
</script>
