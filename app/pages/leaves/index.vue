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
          Leave Management
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Manage employee permit and annual leave applications.
        </p>
      </Motion>
      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <Button
          v-if="hasPermission('leaves', 'create')"
          label="Request Leave"
          icon="bi bi-plus-lg"
          class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          @click="openCreateModal"
        />
      </Motion>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      <Motion
        v-for="(stat, idx) in leaveStats"
        :key="stat.label"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.1 }"
        class="h-full flex flex-col"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all h-full"
        >
          <div
            :class="[
              stat.color,
              'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0',
            ]"
          >
            <i :class="stat.icon"></i>
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <div
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest min-h-[28px] flex items-center line-clamp-2 leading-tight"
            >
              {{ stat.label }}
            </div>
            <div class="text-3xl font-black text-slate-800 dark:text-white mt-0.5 truncate">
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
            >Search</label
          >
          <span class="relative block group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              placeholder="Employee name..."
              class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-white"
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
            placeholder="Select Status"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none !text-slate-800 dark:!text-slate-200"
          />
        </div>
        <div class="md:col-span-3 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Leave Type</label
          >
          <Select
            v-model="selectedLeaveType"
            :options="leaveTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Leave Type"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none !text-slate-800 dark:!text-slate-200"
          />
        </div>
        <div class="md:col-span-2">
          <Button
            icon="bi bi-arrow-clockwise"
            severity="secondary"
            text
            class="!rounded-xl !h-[46px] !w-full !bg-slate-50 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
            @click="resetFilters"
            v-tooltip="'Reset Filters'"
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
          :pt="{
            wrapper: { class: '!bg-transparent' },
            footer: { class: '!bg-transparent' },
            footerRow: { class: '!bg-transparent' },
            footerCell: { class: '!bg-transparent !p-0 !border-none' },
          }"
        >
          <Column header="Employee">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :image="slotProps.data.photo_url || getAvatarUrl(slotProps.data.employee_name, 'random')"
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

          <Column header="Type & Duration">
            <template #body="slotProps">
              <div class="space-y-1">
                <Tag
                  :value="slotProps.data.leave_type_name"
                  class="!rounded-lg !px-2 !py-0.5 !text-[10px] !font-bold !bg-indigo-50 !text-indigo-600"
                />
                <div
                  class="text-sm font-black text-slate-700 dark:text-slate-300 ml-1"
                >
                  {{ slotProps.data.total_days }} DAYS
                </div>
              </div>
            </template>
          </Column>

          <Column header="Date Range">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <span
                    class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                    >Start</span
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
                    >End</span
                  >
                  <span
                    class="text-xs font-bold text-slate-700 dark:text-slate-300"
                    >{{ formatDate(slotProps.data.end_date) }}</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <Column header="Reason">
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

          <Column header="Actions" class="!text-center">
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
                    v-tooltip.top="'Approve'"
                    class="!w-10 !h-10 hover:!bg-emerald-50 dark:hover:!bg-emerald-500/10"
                  />
                  <Button
                    v-if="hasPermission('leaves', 'approve')"
                    icon="bi bi-x-circle"
                    @click="openRejectModal(slotProps.data.id)"
                    severity="danger"
                    text
                    rounded
                    v-tooltip.top="'Reject'"
                    class="!w-10 !h-10 hover:!bg-rose-50 dark:hover:!bg-rose-500/10"
                  />
                  <Button
                    v-if="hasPermission('leaves', 'delete')"
                    icon="bi bi-trash"
                    @click="confirmDelete(slotProps.data.id)"
                    severity="secondary"
                    text
                    rounded
                    v-tooltip.top="'Delete'"
                    class="!w-10 !h-10 hover:!bg-slate-100 dark:hover:!bg-slate-800"
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
                  class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg dark:shadow-none z-20"
                >
                  <i class="bi bi-search text-xs"></i>
                </div>
              </div>
              <h3
                class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
              >
                No Leave Requests Found
              </h3>
              <p
                class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest mb-8"
              >
                No leave requests match your search criteria.
              </p>
              <Button
                v-if="searchQuery || selectedStatus || selectedLeaveType"
                label="Reset Filters"
                icon="bi bi-arrow-counterclockwise"
                class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-transform"
                @click="resetFilters"
              />
            </div>
          </template>

          <template #footer>
            <div
              class="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 bg-white dark:bg-slate-800/30"
            >
              <span
                class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >Total: {{ totalRequests }} Records</span
              >
              <Paginator
                v-model:first="first"
                :rows="itemsPerPage"
                :totalRecords="totalRequests"
                template="PrevPageLink PageLinks NextPageLink"
                @page="onPageChange"
                class="!bg-transparent !p-0"
                :pt="{
                  root: { class: '!bg-transparent !p-0 !border-none flex items-center gap-1.5' },
                  pages: { class: 'flex items-center gap-1.5' },
                  page: ({ context }: any) => ({
                    class: [
                      '!w-8 !h-8 !rounded-xl !text-xs !font-black !min-w-0 !transition-all !flex !items-center !justify-center',
                      context.active
                        ? '!bg-indigo-600 dark:!bg-indigo-500 !text-white dark:!text-white !shadow-md !shadow-indigo-500/30'
                        : '!bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white',
                    ],
                  }),
                  prev: {
                    class:
                      '!w-8 !h-8 !rounded-xl !bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white !transition-colors !flex !items-center !justify-center disabled:!opacity-30 disabled:!pointer-events-none',
                  },
                  next: {
                    class:
                      '!w-8 !h-8 !rounded-xl !bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white !transition-colors !flex !items-center !justify-center disabled:!opacity-30 disabled:!pointer-events-none',
                  },
                }"
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
      header="Submit Leave / Permit Request"
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
            >Applicant Employee <span class="text-rose-500">*</span></label
          >
          <Select
            v-model="createForm.employee_id"
            @change="formErrors.employee_id = ''"
            :options="employeeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Employee"
            filter
            class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !text-slate-800 dark:!text-slate-200 transition-all"
            :class="[
              formErrors.employee_id
                ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                : '!border-none',
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
              >Leave Type <span class="text-rose-500">*</span></label
            >
            <Select
              v-model="createForm.leave_type_id"
              @change="formErrors.leave_type_id = ''"
              :options="leaveTypeOptions.slice(1)"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Type"
              class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !text-slate-800 dark:!text-slate-200 transition-all"
              :class="[
                formErrors.leave_type_id
                  ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                  : '!border-none',
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
              >Total Days</label
            >
            <div
              class="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-black text-center text-sm"
            >
              {{ createForm.total_days }} DAYS
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Date / Date Range <span class="text-rose-500">*</span></label
          >
          <DatePicker
            v-model="createForm.date_range"
            @update:model-value="formErrors.date_range = ''"
            selectionMode="range"
            dateFormat="yy-mm-dd"
            placeholder="Select single date or date range"
            class="w-full"
            :inputClass="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !text-slate-800 dark:!text-white transition-all',
              formErrors.date_range
                ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                : '!border-none',
            ]"
          />

          <!-- Info banner for working days & off-days -->
          <div
            v-if="dateRangeInfo.calendarDays > 0"
            class="p-3 rounded-xl text-xs font-bold border transition-all mt-2"
            :class="[
              dateRangeInfo.workingDays > 0
                ? 'bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
            ]"
          >
            <div class="flex items-center gap-2.5">
              <i
                class="bi text-sm mt-0.5"
                :class="dateRangeInfo.workingDays > 0 ? 'bi-info-circle-fill text-indigo-500' : 'bi-exclamation-triangle-fill text-rose-500'"
              ></i>
              <div>
                <div>
                  <span class="font-black">{{ dateRangeInfo.calendarDays }} Calendar Days</span>:
                  <span class="font-black text-emerald-600 dark:text-emerald-400"> {{ dateRangeInfo.workingDays }} Work Days </span>
                  <span v-if="dateRangeInfo.offDays + dateRangeInfo.holidayDays > 0" class="text-slate-500 dark:text-slate-400">
                    ({{ dateRangeInfo.offDays + dateRangeInfo.holidayDays }} holidays / off-days automatically skipped)
                  </span>
                </div>
                <div v-if="dateRangeInfo.holidayNames.length > 0" class="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                  Public Holidays: {{ dateRangeInfo.holidayNames.join(', ') }}
                </div>
                <div v-if="dateRangeInfo.workingDays === 0" class="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  All selected dates are holidays / off-days. Cannot submit leave request.
                </div>
              </div>
            </div>
          </div>

          <small
            v-if="formErrors.date_range"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.date_range }}</small
          >
        </div>

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Reason for Request <span class="text-rose-500">*</span></label
          >
          <Textarea
            v-model="createForm.reason"
            @input="formErrors.reason = ''"
            rows="3"
            placeholder="Briefly explain your leave reason..."
            class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !p-4 !text-slate-800 dark:!text-white !placeholder:text-slate-400 dark:placeholder:!text-slate-500 transition-all"
            :class="[
              formErrors.reason
                ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                : '!border-none',
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
            label="Cancel"
            text
            severity="secondary"
            @click="createModalOpen = false"
            class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest dark:!text-slate-400"
          />
          <Button
            label="Submit Request"
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
      header="Reject Leave Request"
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
          Provide a reason why this leave request is being rejected so the applicant is informed.
        </p>
        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Rejection Reason <span class="text-rose-500">*</span></label
          >
          <Textarea
            v-model="rejectionReason"
            @input="formErrors.rejectionReason = ''"
            rows="3"
            placeholder="Enter rejection reason..."
            class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !p-4 !text-slate-800 dark:!text-white !placeholder:text-slate-400 dark:placeholder:!text-slate-500 transition-all"
            :class="[
              formErrors.rejectionReason
                ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                : '!border-none',
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
            label="Cancel"
            text
            severity="secondary"
            @click="rejectModalOpen = false"
            class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest dark:!text-slate-400"
          />
          <Button
            label="Confirm Rejection"
            @click="handleReject"
            class="!rounded-xl !px-6 !py-3 !bg-rose-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest hover:!bg-rose-500 transition-colors"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useLeaveRequests } from "~/composables/useLeaveRequests";
import { useEmployees } from "~/composables/useEmployees";
import { useAuth } from "~/composables/useAuth";
import { useWorkSchedule } from "~/composables/useWorkSchedule";
import { useHolidays } from "~/composables/useHolidays";

const confirm = useConfirm();
const { hasPermission } = useAuth();
const { schedules: workSchedules, fetchWorkSchedules } = useWorkSchedule();
const { holidays: allHolidays, fetchHolidays } = useHolidays();
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
  date_range: null as Date[] | null,
  total_days: 1,
  reason: "",
});

const formErrors = reactive({
  employee_id: "",
  leave_type_id: "",
  date_range: "",
  reason: "",
  rejectionReason: "",
});

const dateRangeInfo = computed(() => {
  const range = createForm.date_range;
  if (!range || !range[0]) {
    return { calendarDays: 0, workingDays: 0, offDays: 0, holidayDays: 0, holidayNames: [] as string[] };
  }

  const start = new Date(range[0]);
  const end = range[1] ? new Date(range[1]) : new Date(range[0]);
  if (end < start) {
    return { calendarDays: 0, workingDays: 0, offDays: 0, holidayDays: 0, holidayNames: [] as string[] };
  }

  const scheduleMap = new Map<number, boolean>();
  workSchedules.value.forEach((s) => {
    scheduleMap.set(s.day_of_week, s.is_work_day);
  });

  const holidayMap = new Map<string, string>();
  allHolidays.value.forEach((h) => {
    holidayMap.set(h.date, h.name);
  });

  let calendarDays = 0;
  let workingDays = 0;
  let offDays = 0;
  let holidayDays = 0;
  const holidayNames: string[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    calendarDays++;
    const dayOfWeek = cur.getDay();
    const isWeeklyWorkDay = scheduleMap.has(dayOfWeek)
      ? scheduleMap.get(dayOfWeek)!
      : dayOfWeek !== 0 && dayOfWeek !== 6;

    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    const curDateStr = `${y}-${m}-${d}`;

    const holidayName = holidayMap.get(curDateStr);

    if (!isWeeklyWorkDay) {
      offDays++;
    } else if (holidayName) {
      holidayDays++;
      if (!holidayNames.includes(holidayName)) {
        holidayNames.push(holidayName);
      }
    } else {
      workingDays++;
    }

    cur.setDate(cur.getDate() + 1);
  }

  return {
    calendarDays,
    workingDays,
    offDays,
    holidayDays,
    holidayNames,
  };
});

const validateForm = () => {
  let valid = true;
  formErrors.employee_id = "";
  formErrors.leave_type_id = "";
  formErrors.date_range = "";
  formErrors.reason = "";

  if (!createForm.employee_id) {
    formErrors.employee_id = "Employee must be selected";
    valid = false;
  }
  if (!createForm.leave_type_id) {
    formErrors.leave_type_id = "Leave type must be selected";
    valid = false;
  }
  if (!createForm.date_range || !createForm.date_range[0]) {
    formErrors.date_range = "Date selection is required";
    valid = false;
  } else if (dateRangeInfo.value.workingDays <= 0) {
    formErrors.date_range = "Selected dates are all holidays / off-days (0 work days)";
    valid = false;
  }
  if (!createForm.reason) {
    formErrors.reason = "Reason cannot be empty";
    valid = false;
  }
  return valid;
};

const summaryStats = ref({ pending: 0, approved: 0, rejected: 0 });

const leaveStats = computed(() => [
  {
    label: "Pending",
    value: summaryStats.value?.pending ?? 0,
    icon: "bi bi-hourglass-split",
    color: "bg-amber-50 text-amber-500",
  },
  {
    label: "Approved",
    value: summaryStats.value?.approved ?? 0,
    icon: "bi bi-check2-circle",
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "Rejected",
    value: summaryStats.value?.rejected ?? 0,
    icon: "bi bi-x-circle",
    color: "bg-rose-50 text-rose-500",
  },
]);

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const leaveTypeOptions = computed(() => {
  const options = [{ label: "All Types", value: null }];
  leaveTypes.value.forEach((lt) => {
    options.push({
      label: `${lt.name} (max. ${lt.max_days} days)`,
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
  if (data) {
    summaryStats.value = {
      pending: Number(data.pending) || 0,
      approved: Number(data.approved) || 0,
      rejected: Number(data.rejected) || 0,
    };
  }
};

const formatDate = (d: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const leaveStatusClass = (status: string) => {
  const map: Record<string, string> = {
    Pending:
      "!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border-amber-100 dark:!border-amber-500/20",
    Approved:
      "!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !border-emerald-100 dark:!border-emerald-500/20",
    Rejected:
      "!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !border-rose-100 dark:!border-rose-500/20",
  };
  return (
    map[status] ||
    "!bg-slate-50 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400 !border-slate-100 dark:!border-slate-700"
  );
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
    Approved: "Approved",
    Rejected: "Rejected",
  };
  return map[status] || status;
};

const openCreateModal = () => {
  createForm.employee_id = null;
  createForm.leave_type_id = null;
  createForm.date_range = null;
  createForm.total_days = 1;
  createForm.reason = "";

  formErrors.employee_id = "";
  formErrors.leave_type_id = "";
  formErrors.date_range = "";
  formErrors.reason = "";

  createModalOpen.value = true;
};

const formatToYMD = (val: any) => {
  if (!val) return "";
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(val);
};

const handleCreate = async () => {
  if (!validateForm()) return;
  try {
    await createLeaveRequest({
      employee_id: createForm.employee_id || undefined,
      leave_type_id: createForm.leave_type_id || undefined,
      start_date: formatToYMD(createForm.date_range![0]),
      end_date: formatToYMD(createForm.date_range![1] || createForm.date_range![0]),
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
    message: "Are you sure you want to approve this leave request?",
    header: "Approve Leave Request",
    icon: "bi bi-check-circle-fill text-emerald-500",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Approve",
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
    formErrors.rejectionReason = "Rejection reason cannot be empty";
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
      "Are you sure you want to permanently delete this leave request record?",
    header: "Delete Leave Request",
    icon: "bi bi-exclamation-triangle-fill text-rose-500",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
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

watch(dateRangeInfo, (info) => {
  createForm.total_days = info.workingDays;
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
let isMounted = false;

onMounted(async () => {
  await Promise.all([
    fetchLeaveRequests(),
    loadSummary(),
    fetchLeaveTypes(),
    fetchEmps(),
    fetchWorkSchedules(),
    fetchHolidays(),
  ]);
  nextTick(() => {
    isMounted = true;
  });
});

watch(searchQuery, (newVal) => {
  if (!isMounted) return;
  if (searchDebounce) clearTimeout(searchDebounce);
  const delay = newVal ? 400 : 0;
  searchDebounce = setTimeout(() => {
    currentPage.value = 1;
    fetchLeaveRequests();
    loadSummary();
  }, delay);
});

watch([currentPage], () => {
  if (!isMounted) return;
  fetchLeaveRequests();
});

watch([selectedStatus, selectedLeaveType], () => {
  if (!isMounted) return;
  currentPage.value = 1;
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
  @apply !bg-slate-50 dark:!bg-slate-800/80;
}

.p-paginator {
  @apply !bg-transparent !p-0 !border-none;
}
.p-paginator .p-paginator-page,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-prev {
  @apply !w-8 !h-8 !rounded-xl !text-xs !font-black !min-w-0 !bg-slate-100 dark:!bg-slate-800/90 !text-slate-500 dark:!text-slate-400 hover:!bg-indigo-50 dark:hover:!bg-slate-700 hover:!text-indigo-600 dark:hover:!text-white transition-all !flex !items-center !justify-center;
}
.p-paginator .p-paginator-page.p-highlight,
.p-paginator .p-paginator-page.p-paginator-page-selected {
  @apply !bg-indigo-600 dark:!bg-indigo-500 !text-white dark:!text-white !shadow-md !shadow-indigo-500/30 !border-none;
}
</style>
