import { ref, computed } from 'vue'
import { useEmployees } from './useEmployees'

export interface TransportAllowance {
    id: number
    employee_id: number
    employeeName: string
    nip: string
    departemen: string
    month: number
    year: number
    distance_km: number
    working_days: number
    total_allowance: number
    created_at: string
}

// State
const allowances = ref<TransportAllowance[]>([])
const totalAllowances = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const searchQuery = ref('')
const filterMonth = ref(new Date().getMonth() + 1)
const filterYear = ref(new Date().getFullYear())
const currentPage = ref(1)
const itemsPerPage = ref(10)

export const useTransportAllowance = () => {
    const { $axios } = useNuxtApp()

    const fetchAllowances = async () => {
        loading.value = true
        error.value = null
        try {
            const params = {
                month: filterMonth.value,
                year: filterYear.value,
                search: searchQuery.value || undefined,
                limit: itemsPerPage.value,
                offset: (currentPage.value - 1) * itemsPerPage.value
            }
            const response = await $axios.get('/api/transport-allowance', { params })
            allowances.value = response.data.rows
            totalAllowances.value = response.data.total
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat data'
        } finally {
            loading.value = false
        }
    }

    const addAllowance = async (data: any) => {
        loading.value = true
        try {
            await $axios.post('/api/transport-allowance', data)
            await fetchAllowances()
        } catch (err: any) {
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateAllowance = async (id: number, data: any) => {
        loading.value = true
        try {
            await $axios.put(`/api/transport-allowance/${id}`, data)
            await fetchAllowances()
        } catch (err: any) {
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteAllowance = async (id: number) => {
        loading.value = true
        try {
            await $axios.delete(`/api/transport-allowance/${id}`)
            await fetchAllowances()
        } catch (err: any) {
             throw err
        } finally {
            loading.value = false
        }
    }

    const getMonthYear = () => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        return `${months[filterMonth.value - 1]} ${filterYear.value}`
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    const totalPages = computed(() => {
        return Math.ceil(totalAllowances.value / itemsPerPage.value)
    })

    return {
        // State
        allowances,
        loading,
        error,
        searchQuery,
        filterMonth,
        filterYear,
        currentPage,
        itemsPerPage,
        totalAllowances,
        totalPages,
        // Methods
        fetchAllowances,
        addAllowance,
        updateAllowance,
        deleteAllowance,
        getMonthYear,
        formatCurrency
    }
}
