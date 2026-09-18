<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Settings</span>
        </div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Work Schedule & Hours
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Configure official company working days and operational hours (start/end) per day.
        </p>
      </Motion>

      <!-- Quick Actions -->
      <Motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :animate="{ opacity: 1, scale: 1 }"
        class="flex flex-wrap items-center gap-3"
      >
        <Button
          label="Preset 5-Day (Mon-Fri)"
          icon="bi bi-magic"
          severity="secondary"
          outlined
          size="small"
          class="!rounded-xl !text-xs !font-bold"
          @click="applyPreset(5)"
        />
        <Button
          label="Preset 6-Day (Mon-Sat)"
          icon="bi bi-magic"
          severity="secondary"
          outlined
          size="small"
          class="!rounded-xl !text-xs !font-bold"
          @click="applyPreset(6)"
        />
        <Button
          label="Save Schedule"
          icon="bi bi-check2-circle"
          :loading="saving"
          class="!rounded-xl !px-6 !py-3 !bg-indigo-600 hover:!bg-indigo-700 !border-none !text-white !font-black !text-xs !uppercase !tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
          @click="saveSchedule"
        />
      </Motion>
    </div>

    <!-- Alert Notifications -->
    <div v-if="saveSuccess" class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-3">
      <i class="bi bi-check-circle-fill text-lg"></i>
      <span>Work schedule saved and synchronized successfully across the system!</span>
    </div>

    <div v-if="saveError" class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-center gap-3">
      <i class="bi bi-exclamation-triangle-fill text-lg"></i>
      <span>{{ saveError }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="i in 7" :key="i" class="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
    </div>

    <!-- Schedule Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="(day, index) in localSchedules"
        :key="day.day_of_week"
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between"
        :class="[
          day.is_work_day
            ? 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800'
            : 'border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
        ]"
      >
        <!-- Card Header -->
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                :class="[
                  day.is_work_day
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                ]"
              >
                {{ getDayShortLabel(day.day_of_week) }}
              </div>
              <div>
                <h3 class="font-black text-base text-slate-800 dark:text-white leading-tight">
                  {{ getDayFullLabel(day.day_of_week) }}
                </h3>
                <span
                  class="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5"
                  :class="[
                    day.is_work_day
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  ]"
                >
                  {{ day.is_work_day ? 'Work Day' : 'Day Off' }}
                </span>
              </div>
            </div>

            <!-- Toggle Work Day -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="day.is_work_day"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <!-- Divider -->
          <div class="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

          <!-- Working Hours Inputs -->
          <div v-if="day.is_work_day" class="space-y-3">
            <div>
              <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Start Time (Clock In)
              </label>
              <div class="relative">
                <input
                  type="time"
                  v-model="day.start_time"
                  step="60"
                  class="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                End Time (Clock Out)
              </label>
              <div class="relative">
                <input
                  type="time"
                  v-model="day.end_time"
                  step="60"
                  class="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div v-else class="py-6 text-center text-slate-400 dark:text-slate-600 text-xs font-medium italic">
            <i class="bi bi-moon-stars text-xl block mb-1"></i>
            Scheduled Day Off
          </div>
        </div>

        <!-- Footer: Duration Badge -->
        <div class="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs">
          <span class="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Total Duration:</span>
          <span
            class="font-black"
            :class="day.is_work_day ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'"
          >
            {{ calculateDuration(day) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkSchedule, type WorkScheduleItem } from '~/composables/useWorkSchedule'
import { useAuth } from '~/composables/useAuth'

const { hasPermission } = useAuth()
const { schedules, loading, fetchWorkSchedules, updateWorkSchedules } = useWorkSchedule()

const localSchedules = ref<WorkScheduleItem[]>([])
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)

const dayNamesEn: Record<number, { full: string; short: string }> = {
  0: { full: 'Sunday', short: 'Sun' },
  1: { full: 'Monday', short: 'Mon' },
  2: { full: 'Tuesday', short: 'Tue' },
  3: { full: 'Wednesday', short: 'Wed' },
  4: { full: 'Thursday', short: 'Thu' },
  5: { full: 'Friday', short: 'Fri' },
  6: { full: 'Saturday', short: 'Sat' },
}

const getDayFullLabel = (dow: number) => dayNamesEn[dow]?.full || 'Day'
const getDayShortLabel = (dow: number) => dayNamesEn[dow]?.short || 'D'

onMounted(async () => {
  if (!hasPermission('attendance', 'read')) {
    return navigateTo('/dashboard')
  }
  const data = await fetchWorkSchedules()
  localSchedules.value = JSON.parse(JSON.stringify(data))
})

const calculateDuration = (day: WorkScheduleItem) => {
  if (!day.is_work_day || !day.start_time || !day.end_time) return '0 Hours'
  const [startH, startM] = day.start_time.split(':').map(Number)
  const [endH, endM] = day.end_time.split(':').map(Number)
  let minutes = (endH * 60 + endM) - (startH * 60 + startM)
  if (minutes < 0) minutes += 24 * 60
  const hours = Math.floor(minutes / 60)
  const remMin = minutes % 60
  if (remMin === 0) return `${hours} Hours`
  return `${hours}h ${remMin}m`
}

const applyPreset = (daysCount: number) => {
  localSchedules.value.forEach((day) => {
    // day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday
    if (daysCount === 5) {
      if (day.day_of_week >= 1 && day.day_of_week <= 5) {
        day.is_work_day = true
        day.start_time = '08:00:00'
        day.end_time = '17:00:00'
      } else {
        day.is_work_day = false
      }
    } else if (daysCount === 6) {
      if (day.day_of_week >= 1 && day.day_of_week <= 6) {
        day.is_work_day = true
        day.start_time = '08:00:00'
        day.end_time = day.day_of_week === 6 ? '14:00:00' : '17:00:00'
      } else {
        day.is_work_day = false
      }
    }
  })
}

const saveSchedule = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = null

  try {
    const payload = localSchedules.value.map((s) => ({
      ...s,
      day_name: dayNamesEn[s.day_of_week]?.full || s.day_name,
      start_time: s.start_time.length === 5 ? `${s.start_time}:00` : s.start_time,
      end_time: s.end_time.length === 5 ? `${s.end_time}:00` : s.end_time,
    }))

    await updateWorkSchedules(payload)
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  } catch (err: any) {
    saveError.value = err?.message || 'Failed to save work schedule'
  } finally {
    saving.value = false
  }
}

definePageMeta({ layout: 'default' })
</script>
