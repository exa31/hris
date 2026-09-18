import { ref } from 'vue'
import { getErrorMessageAxios } from '~/utils/handleError'

export interface Holiday {
  id: number
  name: string
  date: string // YYYY-MM-DD
  description?: string | null
  is_recurring?: boolean
  created_at?: string
  updated_at?: string
}

const holidays = ref<Holiday[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useHolidays = () => {
  const { $axios } = useNuxtApp()

  const fetchHolidays = async (params: { year?: number; month?: number; search?: string } = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.get('/api/holidays', { params })
      const data = response.data?.data || response.data
      holidays.value = data || []
      return holidays.value
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || 'Failed to load holidays'
      return []
    } finally {
      loading.value = false
    }
  }

  const createHoliday = async (payload: { name: string; date: string; description?: string; is_recurring?: boolean }) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.post('/api/holidays', payload)
      const data = response.data?.data || response.data
      await fetchHolidays()
      return data
    } catch (err: any) {
      const msg = getErrorMessageAxios(err) || 'Failed to create holiday'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  const updateHoliday = async (
    id: number,
    payload: { name?: string; date?: string; description?: string; is_recurring?: boolean }
  ) => {
    loading.value = true
    error.value = null
    try {
      const response = await $axios.put(`/api/holidays/${id}`, payload)
      const data = response.data?.data || response.data
      await fetchHolidays()
      return data
    } catch (err: any) {
      const msg = getErrorMessageAxios(err) || 'Failed to update holiday'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  const deleteHoliday = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await $axios.delete(`/api/holidays/${id}`)
      await fetchHolidays()
      return true
    } catch (err: any) {
      const msg = getErrorMessageAxios(err) || 'Failed to delete holiday'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  return {
    holidays,
    loading,
    error,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}
