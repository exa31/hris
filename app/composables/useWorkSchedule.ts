import { ref } from 'vue'
import { getErrorMessageAxios } from '~/utils/handleError'

export interface WorkScheduleItem {
  id?: number
  day_of_week: number
  day_name: string
  is_work_day: boolean
  start_time: string
  end_time: string
}

const schedules = ref<WorkScheduleItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useWorkSchedule = () => {
  const { $axios } = useNuxtApp()

  const fetchWorkSchedules = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.get('/api/work-schedules')
      const data = response.data?.data || response.data
      schedules.value = data || []
      return schedules.value
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || 'Failed to load work schedule'
      return []
    } finally {
      loading.value = false
    }
  }

  const updateWorkSchedules = async (newSchedules: WorkScheduleItem[]) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.put('/api/work-schedules', { schedules: newSchedules })
      const data = response.data?.data || response.data
      schedules.value = data || []
      return data
    } catch (err: any) {
      const msg = getErrorMessageAxios(err) || 'Failed to save work schedule'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    loading,
    error,
    fetchWorkSchedules,
    updateWorkSchedules,
  }
}
