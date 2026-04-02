import { ref } from 'vue'

export interface Education {
    id: number
    name: string
}

const educations = ref<Education[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export const useEducations = () => {
    /**
     * Fetch All Educations from API
     */
    const fetchEducations = async (): Promise<Education[]> => {
        loading.value = true
        error.value = null
        try {
            const response = await $fetch<any>('/api/educations')
            educations.value = response.data || []
            return educations.value
        } catch (err: any) {
            error.value = err.data?.message || 'Gagal mengambil data pendidikan'
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
            const response = await $fetch<any>('/api/educations', {
                method: 'POST',
                body: { name },
            })
            const education = response.data
            educations.value.push(education)
            return education
        } catch (err: any) {
            error.value = err.data?.message || 'Gagal membuat pendidikan baru'
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
            await $fetch(`/api/educations/${employeeId}`, {
                method: 'PUT',
                body: { educationIds },
            })
            return true
        } catch (err: any) {
            error.value = err.data?.message || 'Gagal menyimpan pendidikan pegawai'
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
            await $fetch(`/api/educations/${id}`, {
                method: 'DELETE',
            })
            educations.value = educations.value.filter(e => e.id !== id)
            return true
        } catch (err: any) {
            error.value = err.data?.message || 'Gagal menghapus pendidikan'
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