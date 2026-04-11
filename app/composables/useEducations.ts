import { ref } from 'vue'
import { getErrorMessageAxios } from '~/utils/handleError'

export interface Education {
    id: number
    name: string
}

const educations = ref<Education[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useEducations = () => {
    const $axios = useNuxtApp().$axios

    /**
     * Fetch All Educations from API
     */
    const fetchEducations = async (): Promise<Education[]> => {
        loading.value = true
        error.value = null
        try {
            const response = await $axios.get('/api/educations')
            educations.value = response.data || []
            return educations.value
        } catch (err: any) {
            error.value = getErrorMessageAxios(err) || 'Gagal mengambil data pendidikan'
            console.error('Failed to fetch educations:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Create New Education
     */
    const createEducation = async (name: string): Promise<Education | null> => {
        error.value = null
        try {
            const response = await $axios.post('/api/educations', { name })
            const education = response.data
            educations.value.push(education)
            return education
        } catch (err: any) {
            error.value = getErrorMessageAxios(err) || 'Gagal membuat pendidikan baru'
            console.error('Failed to create education:', err)
            return null
        }
    }

    const getEducations = async (): Promise<Education[]> => {
        if (educations.value.length === 0) {
            await fetchEducations()
        }
        return educations.value
    }

    const getEducationById = (id: number): Education | undefined => {
        return educations.value.find(e => e.id === id)
    }

    const getEducationsByIds = (ids: number[]): Education[] => {
        return educations.value.filter(e => ids.includes(e.id))
    }

    /**
     * Sync Employee Educations
     */
    const syncEmployeeEducations = async (employeeId: number, educationIds: number[]): Promise<boolean> => {
        error.value = null
        try {
            await $axios.put(`/api/educations/${employeeId}`, { educationIds })
            return true
        } catch (err: any) {
            error.value = getErrorMessageAxios(err) || 'Gagal menyimpan pendidikan pegawai'
            console.error('Failed to sync education:', err)
            return false
        }
    }

    /**
     * Delete Education
     */
    const removeGlobalEducation = async (id: number): Promise<boolean> => {
        error.value = null
        try {
            const educationId = Number(id)
            if (!Number.isInteger(educationId) || educationId <= 0) {
                throw new Error('Invalid education ID')
            }

            await $axios.delete(`/api/educations/${educationId}`)
            educations.value = educations.value.filter(e => e.id !== educationId)
            return true
        } catch (err: any) {
            error.value = getErrorMessageAxios(err) || 'Gagal menghapus pendidikan'
            console.error('Failed to delete education:', err)
            throw new Error(error.value!)
        }
    }

    return {
        educations,
        loading,
        error,
        fetchEducations,
        getEducations,
        getEducationById,
        getEducationsByIds,
        createEducation,
        syncEmployeeEducations,
        removeGlobalEducation
    }
}