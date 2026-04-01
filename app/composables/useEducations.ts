import { ref } from 'vue'

export interface Education {
    id: number
    name: string
}

// Dummy Education Data
const dummyEducations: Education[] = []

const educations = ref<Education[]>(dummyEducations)
let nextId = 1

export const useEducations = () => {
    /**
     * Fetch All Educations
     * TODO: Replace with API call to /api/educations
     */
    const getEducations = async (): Promise<Education[]> => {
        // return await $fetch('/api/educations')
        return educations.value
    }

    const getEducationById = (id: number): Education | undefined => {
        return educations.value.find(e => e.id === id)
    }

    const getEducationsByIds = (ids: number[]): Education[] => {
        return educations.value.filter(e => ids.includes(e.id))
    }

    /**
     * Create New Education
     * TODO: Replace with API call to POST /api/educations
     */
    const createEducation = async (name: string): Promise<Education> => {
        const newEducation: Education = {
            id: nextId++,
            name
        }
        educations.value.push(newEducation)
        return newEducation
    }

    return {
        getEducations,
        getEducationById,
        getEducationsByIds,
        createEducation
    }
}