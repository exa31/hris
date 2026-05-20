<template>
  <div class="space-y-8">
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
            >Leave Management</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Manajemen Cuti
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Kelola permohonan izin dan cuti tahunan pegawai.
        </p>
      </Motion>
      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <Button
          v-if="hasPermission('leaves', 'create')"
          label="Ajukan Cuti Baru"
          icon="bi bi-plus-lg"
          class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          @click="openCreateModal"
        />
      </Motion>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Motion
        v-for="(stat, idx) in leaveStats"
        :key="stat.label"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.1 }"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all"
        >
          <div
            :class="[
              stat.color,
              'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0',
            ]"
          >
            <i :class="stat.icon"></i>
          </div>
          <div>
            <div
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
            >
              {{ stat.label }}
            </div>
            <div class="text-3xl font-black text-slate-800 dark:text-white">
              {{ stat.value }}
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Filters -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div class="md:col-span-4 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Pencarian</label
          >
          <span class="relative block group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              placeholder="Nama pegawai..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !text-xs !font-bold dark:!text-white"
            />
          </span>
        </div>
        <div class="md:col-span-3 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Status</label
          >
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none"
          />
        </div>
        <div class="md:col-span-3 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Jenis Cuti</label
          >
          <Select
            v-model="selectedLeaveType"
            :options="leaveTypeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none"
          />
        </div>
        <div class="md:col-span-2">
          <Button
            icon="bi bi-arrow-clockwise"
            severity="secondary"
            text
            class="!rounded-xl !h-[46px] !w-full !bg-slate-50 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
            @click="resetFilters"
            v-tooltip="'Reset Filter'"
          />
        </div>
      </div>
    </Motion>

    <!-- Table Section -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.3 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <DataTable
          :value="leaveRequests"
          class="p-datatable-overhaul"
          :loading="loading"
        >
          <Column header="Pegawai">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :image="
                    slotProps.data.photo_url ||
                    'https://ui-avatars.com/api/?name=' +
                      slotProps.data.employee_name +
                      '&background=random&size=40'
                  "
                  shape="circle"
                  class="shadow-sm"
                />
                <div>
                  <div
                    class="text-sm font-black text-slate-800 dark:text-white leading-tight"
                  >
                    {{ slotProps.data.employee_name }}
                  </div>
                  <div
                    class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >
                    {{ slotProps.data.department || "—" }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Tipe & Durasi">
            <template #body="slotProps">
              <div class="space-y-1">
                <Tag
                  :value="slotProps.data.leave_type_name"
                  class="!rounded-lg !px-2 !py-0.5 !text-[10px] !font-bold !bg-indigo-50 !text-indigo-600"
                />
                <div
                  class="text-sm font-black text-slate-700 dark:text-slate-300 ml-1"
                >
                  {{ slotProps.data.total_days }} HARI
                </div>
              </div>
            </template>
          </Column>

          <Column header="Rentang Waktu">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <span
                    class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                    >Mulai</span
                  >
                  <span
                    class="text-xs font-bold text-slate-700 dark:text-slate-300"
                    >{{ formatDate(slotProps.data.start_date) }}</span
                  >
                </div>
                <i
                  class="bi bi-arrow-right text-slate-300 dark:text-slate-600"
                ></i>
                <div class="flex flex-col">
                  <span
                    class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                    >Selesai</span
                  >
                  <span
                    class="text-xs font-bold text-slate-700 dark:text-slate-300"
                    >{{ formatDate(slotProps.data.end_date) }}</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <Column header="Alasan">
            <template #body="slotProps">
              <div class="max-w-xs">
                <p
                  class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate"
                  :title="slotProps.data.reason"
                >
                  {{ slotProps.data.reason }}
                </p>
                <div
                  v-if="slotProps.data.rejection_reason"
                  class="mt-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <i class="bi bi-x-circle"></i>
                  {{ slotProps.data.rejection_reason }}
                </div>
              </div>
            </template>
          </Column>

          <Column header="Status">
            <template #body="slotProps">
              <Tag
                :value="leaveStatusLabel(slotProps.data.status)"
                class="!rounded-lg !px-3 !py-1 !text-[10px] !font-bold flex items-center gap-1.5"
                :class="leaveStatusClass(slotProps.data.status)"
              >
                <template #icon>
                  <i :class="leaveStatusIcon(slotProps.data.status)"></i>
                </template>
              </Tag>
            </template>
          </Column>

          <Column header="Aksi" class="!text-center">
            <template #body="slotProps">
              <div class="flex items-center justify-center gap-1">
                <template v-if="slotProps.data.status === 'Pending'">
                  <Button
                    v-if="hasPermission('leaves', 'approve')"
                    icon="bi bi-check2-circle"
                    @click="handleApprove(slotProps.data.id)"
                    severity="success"
                    text
                    rounded
                    class="!w-10 !h-10 hover:!bg-emerald-50"
                  />
                  <Button
                    v-if="hasPermission('leaves', 'approve')"
                    icon="bi bi-x-circle"
                    @click="openRejectModal(slotProps.data.id)"
                    severity="danger"
                    text
                    rounded
                    class="!w-10 !h-10 hover:!bg-rose-50"
                  />
                  <Button
                    v-if="hasPermission('leaves', 'delete')"
                    icon="bi bi-trash"
                    @click="confirmDelete(slotProps.data.id)"
                    severity="secondary"
                    text
                    rounded
                    class="!w-10 !h-10 hover:!bg-slate-100"
                  />
                </template>
                <span
                  v-else
                  class="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest"
                  >Finalized</span
                >
              </div>
            </template>
          </Column>

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
                  <i class="bi bi-calendar-x text-4xl text-indigo-500"></i>
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
                Tidak Ada Permohonan Cuti
              </h3>
              <p
                class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8"
              >
                Belum ada pengajuan cuti yang sesuai dengan kriteria Anda.
              </p>
              <Button
                v-if="searchQuery || selectedStatus || selectedLeaveType"
                label="Reset Filter"
                icon="bi bi-arrow-counterclockwise"
                class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform"
                @click="resetFilters"
              />
            </div>
          </template>

          <template #footer>
            <div
              class="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <span
                class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >Total: {{ totalRequests }} Data</span
              >
              <Paginator
                v-model:first="first"
                :rows="itemsPerPage"
                :totalRecords="totalRequests"
                template="PrevPageLink PageLinks NextPageLink"
                @page="onPageChange"
                class="!bg-transparent !p-0"
              />
            </div>
          </template>
        </DataTable>
      </div>
    </Motion>

    <!-- Create Leave Dialog -->
    <Dialog
      v-model:visible="createModalOpen"
      modal
      header="Pengajuan Cuti / Izin"
      class="w-full max-w-xl"
      :pt="{
        root: {
          class:
            '!rounded-2xl !border !border-slate-100 dark:!border-slate-800 !shadow-2xl overflow-hidden !bg-white dark:!bg-slate-900',
        },
        header: {
          class:
            'px-8 pt-8 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:!text-white',
        },
        content: { class: 'px-8 py-6 !bg-transparent' },
        footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
      }"
    >
      <Message v-if="error" severity="error" :closable="false" class="mb-4">
        {{ error }}
      </Message>
      <div class="space-y-5">
        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Pegawai Pemohon <span class="text-rose-500">*</span></label
          >
          <Select
            v-model="createForm.employee_id"
            :options="employeeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Pegawai"
            filter
            :class="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none',
              formErrors.employee_id ? '!border !border-rose-500' : '',
            ]"
          />
          <small
            v-if="formErrors.employee_id"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.employee_id }}</small
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Jenis Cuti <span class="text-rose-500">*</span></label
            >
            <Select
              v-model="createForm.leave_type_id"
              :options="leaveTypeOptions.slice(1)"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Tipe"
              :class="[
                'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none',
                formErrors.leave_type_id ? '!border !border-rose-500' : '',
              ]"
            />
            <small
              v-if="formErrors.leave_type_id"
              class="text-rose-500 text-xs mt-1 ml-1 block"
              >{{ formErrors.leave_type_id }}</small
            >
          </div>
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Total Hari</label
            >
            <div
              class="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-black text-center text-sm"
            >
              {{ createForm.total_days }} HARI
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Tanggal Mulai <span class="text-rose-500">*</span></label
            >
            <InputText
              type="date"
              v-model="createForm.start_date"
              :class="[
                'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none dark:!text-white',
                formErrors.start_date ? '!border !border-rose-500' : '',
              ]"
            />
            <small
              v-if="formErrors.start_date"
              class="text-rose-500 text-xs mt-1 ml-1 block"
              >{{ formErrors.start_date }}</small
            >
          </div>
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Tanggal Selesai <span class="text-rose-500">*</span></label
            >
            <InputText
              type="date"
              v-model="createForm.end_date"
              :class="[
                'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none dark:!text-white',
                formErrors.end_date ? '!border !border-rose-500' : '',
              ]"
            />
            <small
              v-if="formErrors.end_date"
              class="text-rose-500 text-xs mt-1 ml-1 block"
              >{{ formErrors.end_date }}</small
            >
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Alasan Pengajuan <span class="text-rose-500">*</span></label
          >
          <Textarea
            v-model="createForm.reason"
            rows="3"
            placeholder="Jelaskan secara singkat keperluan Anda..."
            :class="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !p-4 dark:!text-white dark:placeholder:!text-slate-500',
              formErrors.reason ? '!border !border-rose-500' : '',
            ]"
          />
          <small
            v-if="formErrors.reason"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.reason }}</small
          >
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button
            label="Batal"
            text
            severity="secondary"
            @click="createModalOpen = false"
            class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest dark:!text-slate-400"
          />
          <Button
            label="Kirim Pengajuan"
            :loading="loading"
            @click="handleCreate"
            class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          />
        </div>
      </template>
    </Dialog>

    <!-- Reject Dialog -->
    <Dialog
      v-model:visible="rejectModalOpen"
      modal
      header="Tolak Pengajuan Cuti"
      class="w-full max-w-md"
      :pt="{
        root: {
          class:
            '!rounded-2xl !border !border-slate-100 dark:!border-slate-800 !shadow-2xl overflow-hidden !bg-white dark:!bg-slate-900',
        },
        header: {
          class:
            'px-8 pt-8 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:!text-white',
        },
        content: { class: 'px-8 py-6 !bg-transparent' },
        footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
      }"
    >
      <div class="space-y-4">
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Berikan alasan mengapa permohonan cuti ini ditolak agar pemohon
          mengetahui kendalanya.
        </p>
        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Alasan Penolakan <span class="text-rose-500">*</span></label
          >
          <Textarea
            v-model="rejectionReason"
            rows="3"
            placeholder="Tuliskan alasan penolakan..."
            :class="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !p-4 dark:!text-white dark:placeholder:!text-slate-500',
              formErrors.rejectionReason ? '!border !border-rose-500' : '',
            ]"
          />
          <small
            v-if="formErrors.rejectionReason"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.rejectionReason }}</small
          >
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button
            label="Batal"
            text
            severity="secondary"
            @click="rejectModalOpen = false"
            class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest dark:!text-slate-400"
          />
          <Button
            label="Konfirmasi Tolak"
            @click="handleReject"
            class="!rounded-xl !px-6 !py-3 !bg-rose-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest hover:!bg-rose-500 transition-colors"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useLeaveRequests } from "~/composables/useLeaveRequests";
import { useEmployees } from "~/composables/useEmployees";
import { useAuth } from "~/composables/useAuth";

const confirm = useConfirm();
const { hasPermission } = useAuth();
const {
  leaveRequests,
  leaveTypes,
  loading,
  error,
  currentPage,
  itemsPerPage,
  totalRequests,
  totalPages,
  searchQuery,
  selectedStatus,
  selectedLeaveType,
  fetchLeaveRequests,
  fetchLeaveTypes,
  createLeaveRequest,
  approveLeaveRequest,
  deleteLeaveRequest,
  fetchSummary,
} = useLeaveRequests();

const { employees: employeeList, fetchEmployees: fetchEmps } = useEmployees();

const first = ref(0);
const createModalOpen = ref(false);
const rejectModalOpen = ref(false);
const deleteId = ref<number | null>(null);
const rejectId = ref<number | null>(null);
const rejectionReason = ref("");

const createForm = reactive({
  employee_id: null as number | null,
  leave_type_id: null as number | null,
  start_date: "",
  end_date: "",
  total_days: 1,
  reason: "",
});

const formErrors = reactive({
  employee_id: "",
  leave_type_id: "",
  start_date: "",
  end_date: "",
  reason: "",
  rejectionReason: "",
});

const validateForm = () => {
  let valid = true;
  formErrors.employee_id = "";
  formErrors.leave_type_id = "";
  formErrors.start_date = "";
  formErrors.end_date = "";
  formErrors.reason = "";

  if (!createForm.employee_id) {
    formErrors.employee_id = "Pegawai harus dipilih";
    valid = false;
  }
  if (!createForm.leave_type_id) {
    formErrors.leave_type_id = "Tipe cuti harus dipilih";
    valid = false;
  }
  if (!createForm.start_date) {
    formErrors.start_date = "Tanggal mulai harus diisi";
    valid = false;
  }
  if (!createForm.end_date) {
    formErrors.end_date = "Tanggal selesai harus diisi";
    valid = false;
  }
  if (!createForm.reason) {
    formErrors.reason = "Alasan tidak boleh kosong";
    valid = false;
  }
  return valid;
};

const summaryStats = ref({ pending: 0, approved: 0, rejected: 0 });

const leaveStats = computed(() => [
  {
    label: "Menunggu",
    value: summaryStats.value.pending,
    icon: "bi bi-hourglass-split",
    color: "bg-amber-50 text-amber-500",
  },
  {
    label: "Disetujui",
    value: summaryStats.value.approved,
    icon: "bi bi-check2-circle",
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "Ditolak",
    value: summaryStats.value.rejected,
    icon: "bi bi-x-circle",
    color: "bg-rose-50 text-rose-500",
  },
]);

const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Disetujui", value: "Approved" },
  { label: "Ditolak", value: "Rejected" },
];

const leaveTypeOptions = computed(() => {
  const options = [{ label: "Semua Jenis", value: null }];
  leaveTypes.value.forEach((lt) => {
    options.push({
      label: `${lt.name} (maks. ${lt.max_days} hari)`,
      value: lt.id as any,
    });
  });
  return options;
});

const employeeOptions = computed(() => {
  return employeeList.value.map((emp) => ({
    label: `${emp.nip} - ${emp.name}`,
    value: emp.id,
  }));
});

const countByStatus = (status: string) => {
  return leaveRequests.value.filter((r) => r.status === status).length;
};

const loadSummary = async () => {
  const data = await fetchSummary();
  summaryStats.value = data;
};

const formatDate = (d: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const leaveStatusClass = (status: string) => {
  const map: Record<string, string> = {
    Pending: "!bg-amber-50 !text-amber-600 !border-amber-100",
    Approved: "!bg-emerald-50 !text-emerald-600 !border-emerald-100",
    Rejected: "!bg-rose-50 !text-rose-600 !border-rose-100",
  };
  return map[status] || "!bg-slate-50 !text-slate-600 !border-slate-100";
};

const leaveStatusIcon = (status: string) => {
  const map: Record<string, string> = {
    Pending: "bi-hourglass-split",
    Approved: "bi-check-circle-fill",
    Rejected: "bi-x-circle-fill",
  };
  return map[status] || "";
};

const leaveStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    Pending: "Pending",
    Approved: "Disetujui",
    Rejected: "Ditolak",
  };
  return map[status] || status;
};

const openCreateModal = () => {
  createForm.employee_id = null;
  createForm.leave_type_id = null;
  createForm.start_date = "";
  createForm.end_date = "";
  createForm.total_days = 1;
  createForm.reason = "";

  formErrors.employee_id = "";
  formErrors.leave_type_id = "";
  formErrors.start_date = "";
  formErrors.end_date = "";
  formErrors.reason = "";

  createModalOpen.value = true;
};

const handleCreate = async () => {
  if (!validateForm()) return;
  try {
    await createLeaveRequest({
      employee_id: createForm.employee_id || undefined,
      leave_type_id: createForm.leave_type_id || undefined,
      start_date: createForm.start_date,
      end_date: createForm.end_date,
      total_days: createForm.total_days,
      reason: createForm.reason,
    });
    createModalOpen.value = false;
    fetchLeaveRequests();
    loadSummary();
  } catch (err) {
    console.error(err);
  }
};

const handleApprove = async (id: number) => {
  confirm.require({
    message: "Apakah Anda yakin ingin menyetujui permohonan cuti ini?",
    header: "Setujui Pengajuan",
    icon: "bi bi-check-circle-fill text-emerald-500",
    rejectProps: {
      label: "Batal",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Setujui",
      severity: "success",
    },
    accept: async () => {
      await approveLeaveRequest(id, "Approved");
      await fetchLeaveRequests();
      loadSummary();
    },
  });
};

const openRejectModal = (id: number) => {
  rejectId.value = id;
  rejectionReason.value = "";
  formErrors.rejectionReason = "";
  rejectModalOpen.value = true;
};

const handleReject = async () => {
  if (!rejectionReason.value.trim()) {
    formErrors.rejectionReason = "Alasan penolakan tidak boleh kosong";
    return;
  }

  if (rejectId.value) {
    try {
      await approveLeaveRequest(
        rejectId.value,
        "Rejected",
        rejectionReason.value,
      );
      rejectModalOpen.value = false;
      fetchLeaveRequests();
      loadSummary();
    } catch {}
  }
};

const confirmDelete = (id: number) => {
  confirm.require({
    message:
      "Apakah Anda yakin ingin menghapus catatan pengajuan cuti ini secara permanen?",
    header: "Hapus Pengajuan",
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
      await deleteLeaveRequest(id);
      await fetchLeaveRequests();
      loadSummary();
    },
  });
};

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1;
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = "";
  selectedLeaveType.value = null;
  currentPage.value = 1;
  fetchLeaveRequests();
  loadSummary();
};

watch([() => createForm.start_date, () => createForm.end_date], () => {
  if (createForm.start_date && createForm.end_date) {
    const start = new Date(createForm.start_date);
    const end = new Date(createForm.end_date);
    const diff =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    createForm.total_days = diff > 0 ? diff : 1;
  }
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  fetchLeaveRequests();
  loadSummary();
  fetchLeaveTypes();
  fetchEmps();
});

watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentPage.value = 1;
    fetchLeaveRequests();
    loadSummary();
  }, 400);
});

watch([currentPage], () => {
  fetchLeaveRequests();
});

watch([selectedStatus, selectedLeaveType], () => {
  fetchLeaveRequests();
  loadSummary();
});

definePageMeta({ layout: "default" });
</script>

<style>
.p-datatable-overhaul .p-datatable-thead > tr > th {
  @apply !bg-slate-50/80 dark:!bg-slate-800/80 !text-slate-400 dark:!text-slate-500 !text-[11px] !font-black !uppercase !tracking-[0.25em] !px-12 !py-10 !border-b !border-slate-100 dark:!border-slate-800;
}
.p-datatable-overhaul .p-datatable-tbody > tr > td {
  @apply !px-12 !py-8 !border-b !border-slate-50 dark:!border-slate-800 !bg-white dark:!bg-slate-900 transition-all duration-300;
}
.p-datatable-overhaul .p-datatable-tbody > tr:hover > td {
  @apply !bg-slate-50/30 dark:!bg-slate-800/30;
}
</style>
