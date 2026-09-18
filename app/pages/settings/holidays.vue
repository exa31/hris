<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span class="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Settings</span>
        </div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Holidays & Day-Off Calendar
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Manage official company holidays and public holidays.
        </p>
      </Motion>

      <!-- Action Toolbar -->
      <Motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
        class="flex flex-wrap items-center gap-3"
      >
        <!-- View Mode Switcher -->
        <div class="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
          <button
            @click="viewMode = 'calendar'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2"
            :class="[
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            ]"
          >
            <i class="bi bi-calendar3"></i>
            <span>Calendar View</span>
          </button>
          <button
            @click="viewMode = 'list'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2"
            :class="[
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            ]"
          >
            <i class="bi bi-list-ul"></i>
            <span>List View</span>
          </button>
        </div>

        <Button
          label="Add Holiday"
          icon="bi bi-plus-lg"
          class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 hover:!bg-indigo-700 !border-none !text-white !font-black !text-xs !uppercase !tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none"
          @click="openAddModal()"
        />
      </Motion>
    </div>

    <!-- CALENDAR MODE -->
    <div v-if="viewMode === 'calendar'" class="space-y-4">
      <!-- Month Navigation Bar -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Button
            icon="bi bi-chevron-left"
            text
            rounded
            class="!text-slate-600 dark:!text-slate-300"
            @click="prevMonth"
          />
          <h2 class="text-xl font-black text-slate-800 dark:text-white min-w-[200px] text-center">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </h2>
          <Button
            icon="bi bi-chevron-right"
            text
            rounded
            class="!text-slate-600 dark:!text-slate-300"
            @click="nextMonth"
          />
        </div>

        <div class="flex items-center gap-2">
          <Button
            label="Today"
            size="small"
            severity="secondary"
            outlined
            class="!rounded-xl !text-xs !font-bold"
            @click="goToToday"
          />
          <span class="text-xs font-bold text-slate-400 px-2">
            {{ holidaysInCurrentMonth.length }} Holidays This Month
          </span>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs overflow-x-auto">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-2 mb-2 min-w-[700px]">
          <div
            v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="d"
            class="text-center text-[11px] font-black uppercase tracking-wider py-2"
            :class="d === 'Sun' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'"
          >
            {{ d }}
          </div>
        </div>

        <!-- Month Days Grid -->
        <div class="grid grid-cols-7 gap-2 min-w-[700px]">
          <div
            v-for="(cell, idx) in calendarDays"
            :key="idx"
            class="min-h-[105px] p-2.5 rounded-xl border transition-all relative flex flex-col justify-between group cursor-pointer"
            :class="[
              cell.isCurrentMonth
                ? cell.isToday
                  ? 'bg-indigo-50/40 dark:bg-indigo-500/5 border-indigo-300 dark:border-indigo-500/40'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/40'
                : 'bg-transparent border-transparent opacity-30 cursor-default'
            ]"
            @click="cell.isCurrentMonth ? onDateCellClick(cell.dateStr) : null"
          >
            <!-- Date Number & Badge -->
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-black"
                :class="[
                  cell.isToday
                    ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center -ml-1 -mt-1'
                    : cell.dayOfWeek === 0
                      ? 'text-rose-500 font-bold'
                      : 'text-slate-700 dark:text-slate-300'
                ]"
              >
                {{ cell.dayNumber }}
              </span>

              <!-- Plus icon on hover -->
              <span
                v-if="cell.isCurrentMonth && !cell.holiday"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600 text-xs"
                title="Add holiday on this date"
              >
                <i class="bi bi-plus-circle"></i>
              </span>
            </div>

            <!-- Holiday Item -->
            <div v-if="cell.holiday" class="mt-1">
              <div
                class="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black leading-tight hover:bg-rose-500/20 transition-colors"
                :title="cell.holiday.description || cell.holiday.name"
                @click.stop="openEditModal(cell.holiday)"
              >
                <div class="flex items-center gap-1">
                  <i class="bi bi-star-fill text-[8px] text-rose-500 shrink-0"></i>
                  <span class="truncate">{{ cell.holiday.name }}</span>
                </div>
              </div>
            </div>
            <div v-else class="h-6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST MODE -->
    <div v-else class="space-y-4">
      <!-- Search & Filter Bar -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-[260px]">
          <div class="relative flex-1 max-w-sm">
            <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              placeholder="Search holiday name..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            v-model="filterYear"
            class="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
          >
            <option :value="undefined">All Years</option>
            <option v-for="y in [2025, 2026, 2027, 2028]" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-400">
          Total: <span class="text-slate-800 dark:text-white font-black">{{ filteredHolidays.length }}</span> Holidays
        </div>
      </div>

      <!-- Holidays Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Holiday Name</th>
                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="h in filteredHolidays"
                :key="h.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Date -->
                <td class="p-4 text-xs font-bold whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs">
                      <i class="bi bi-calendar-event"></i>
                    </div>
                    <div>
                      <div class="font-black text-slate-800 dark:text-white">{{ formatHolidayDate(h.date) }}</div>
                      <div class="text-[10px] text-slate-400 font-medium">{{ getDayName(h.date) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Name -->
                <td class="p-4 text-xs font-black text-slate-800 dark:text-white">
                  {{ h.name }}
                </td>

                <!-- Description -->
                <td class="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate font-medium">
                  {{ h.description || '—' }}
                </td>

                <!-- Recurring Type -->
                <td class="p-4 text-xs font-bold">
                  <span
                    v-if="h.is_recurring"
                    class="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  >
                    Annual Recurring
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    One-off
                  </span>
                </td>

                <!-- Actions -->
                <td class="p-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <Button
                      icon="bi bi-pencil"
                      text
                      rounded
                      size="small"
                      severity="secondary"
                      class="!w-8 !h-8"
                      @click="openEditModal(h)"
                    />
                    <Button
                      icon="bi bi-trash"
                      text
                      rounded
                      size="small"
                      severity="danger"
                      class="!w-8 !h-8"
                      @click="handleDelete(h)"
                    />
                  </div>
                </td>
              </tr>

              <tr v-if="filteredHolidays.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400 text-xs font-medium">
                  No holidays found matching your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DIALOG ADD / EDIT HOLIDAY -->
    <Dialog
      v-model:visible="modalOpen"
      modal
      :header="isEditing ? 'Edit Holiday' : 'Add New Holiday'"
      class="w-full max-w-md"
      :pt="{
        root: { class: '!rounded-2xl !bg-white dark:!bg-slate-900 !border !border-slate-100 dark:!border-slate-800' },
        header: { class: '!p-6 !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:!text-white font-black' },
        content: { class: '!p-6' },
        footer: { class: '!p-6 !border-t !border-slate-100 dark:!border-slate-800' }
      }"
    >
      <div class="space-y-4">
        <!-- Holiday Name -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Holiday Name <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            placeholder="e.g. Independence Day"
            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <small v-if="formErrors.name" class="text-rose-500 text-[10px] font-bold block mt-1">
            {{ formErrors.name }}
          </small>
        </div>

        <!-- Date -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Date <span class="text-rose-500">*</span>
          </label>
          <input
            type="date"
            v-model="form.date"
            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <small v-if="formErrors.date" class="text-rose-500 text-[10px] font-bold block mt-1">
            {{ formErrors.date }}
          </small>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Description (Optional)
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Optional notes or details..."
            class="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          ></textarea>
        </div>

        <!-- Recurring Toggle -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-white">Annual Recurring Holiday</div>
            <div class="text-[10px] text-slate-400">Repeats every year on the same date</div>
          </div>
          <input
            type="checkbox"
            v-model="form.is_recurring"
            class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <Button
            label="Cancel"
            severity="secondary"
            text
            size="small"
            class="!rounded-xl !font-black !text-xs"
            @click="modalOpen = false"
          />
          <Button
            :label="isEditing ? 'Save Changes' : 'Add Holiday'"
            :loading="saving"
            size="small"
            class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 hover:!bg-indigo-700 !border-none !text-white !font-black !text-xs !uppercase !tracking-wider shadow-sm"
            @click="handleSave"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useHolidays, type Holiday } from '~/composables/useHolidays'
import { useAuth } from '~/composables/useAuth'

const { hasPermission } = useAuth()
const { holidays, fetchHolidays, createHoliday, updateHoliday, deleteHoliday } = useHolidays()

const viewMode = ref<'calendar' | 'list'>('calendar')
const searchQuery = ref('')
const filterYear = ref<number | undefined>(new Date().getFullYear())

// Calendar state
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0 - 11

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Modal Form State
const modalOpen = ref(false)
const isEditing = ref(false)
const editId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  date: '',
  description: '',
  is_recurring: false,
})

const formErrors = reactive({
  name: '',
  date: '',
})

onMounted(async () => {
  if (!hasPermission('attendance', 'read')) {
    return navigateTo('/dashboard')
  }
  await fetchHolidays()
})

// Map of holidays by Date (YYYY-MM-DD)
const holidayMap = computed(() => {
  const map = new Map<string, Holiday>()
  for (const h of holidays.value) {
    map.set(h.date, h)
  }
  return map
})

const holidaysInCurrentMonth = computed(() => {
  return holidays.value.filter((h) => {
    const d = new Date(h.date)
    return d.getFullYear() === currentYear.value && d.getMonth() === currentMonth.value
  })
})

const filteredHolidays = computed(() => {
  return holidays.value.filter((h) => {
    const d = new Date(h.date)
    const matchYear = !filterYear.value || d.getFullYear() === filterYear.value
    const query = searchQuery.value.toLowerCase().trim()
    const matchQuery = !query || h.name.toLowerCase().includes(query) || (h.description && h.description.toLowerCase().includes(query))
    return matchYear && matchQuery
  })
})

// Calendar Days calculation
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const days: Array<{
    dayNumber: number
    dateStr: string
    isCurrentMonth: boolean
    isToday: boolean
    dayOfWeek: number
    holiday?: Holiday
  }> = []

  // Preceding month padding days
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sun
  const prevMonthLastDate = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dNum = prevMonthLastDate - i
    const d = new Date(year, month - 1, dNum)
    const dStr = formatYMD(d)
    days.push({
      dayNumber: dNum,
      dateStr: dStr,
      isCurrentMonth: false,
      isToday: false,
      dayOfWeek: d.getDay(),
      holiday: holidayMap.value.get(dStr),
    })
  }

  // Current month days
  const todayStr = formatYMD(today)
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i)
    const dStr = formatYMD(d)
    days.push({
      dayNumber: i,
      dateStr: dStr,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      dayOfWeek: d.getDay(),
      holiday: holidayMap.value.get(dStr),
    })
  }

  // Trailing next month padding days (fill up to 35 or 42 grid cells)
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dStr = formatYMD(d)
    days.push({
      dayNumber: i,
      dateStr: dStr,
      isCurrentMonth: false,
      isToday: false,
      dayOfWeek: d.getDay(),
      holiday: holidayMap.value.get(dStr),
    })
  }

  return days
})

const formatYMD = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${date}`
}

const formatHolidayDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getDayName = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToToday = () => {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

const onDateCellClick = (dateStr: string) => {
  const existing = holidayMap.value.get(dateStr)
  if (existing) {
    openEditModal(existing)
  } else {
    openAddModal(dateStr)
  }
}

const openAddModal = (defaultDate?: string) => {
  isEditing.value = false
  editId.value = null
  form.name = ''
  form.date = defaultDate || formatYMD(new Date())
  form.description = ''
  form.is_recurring = false
  formErrors.name = ''
  formErrors.date = ''
  modalOpen.value = true
}

const openEditModal = (holiday: Holiday) => {
  isEditing.value = true
  editId.value = holiday.id
  form.name = holiday.name
  form.date = holiday.date
  form.description = holiday.description || ''
  form.is_recurring = holiday.is_recurring ?? false
  formErrors.name = ''
  formErrors.date = ''
  modalOpen.value = true
}

const handleSave = async () => {
  formErrors.name = ''
  formErrors.date = ''

  if (!form.name.trim()) {
    formErrors.name = 'Holiday name is required'
    return
  }
  if (!form.date) {
    formErrors.date = 'Date is required'
    return
  }

  saving.value = true
  try {
    if (isEditing.value && editId.value) {
      await updateHoliday(editId.value, {
        name: form.name.trim(),
        date: form.date,
        description: form.description.trim() || undefined,
        is_recurring: form.is_recurring,
      })
    } else {
      await createHoliday({
        name: form.name.trim(),
        date: form.date,
        description: form.description.trim() || undefined,
        is_recurring: form.is_recurring,
      })
    }
    modalOpen.value = false
  } catch (err: any) {
    alert(err?.message || 'Failed to save holiday')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (holiday: Holiday) => {
  if (confirm(`Are you sure you want to delete holiday "${holiday.name}" (${holiday.date})?`)) {
    try {
      await deleteHoliday(holiday.id)
    } catch (err: any) {
      alert(err?.message || 'Failed to delete holiday')
    }
  }
}

definePageMeta({ layout: 'default' })
</script>
