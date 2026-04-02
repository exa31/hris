import { ref, computed } from 'vue'

export interface TransportAllowance {
    id: number
    employee_id: number
    employeeName: string
    nip: string
    departemen: string
    employee_type: string
    month: number
    year: number
    working_days: number
    base_fare: number
    distance_km: number
    calculated_km: number
    amount: number
    generated_at: string
}

// State
const allowances = ref<TransportAllowance[]>([])
const totalAllowances = ref(0)
const loading = ref(false)
const generating = ref(false)
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
            allowances.value = response.data.rows || response.data?.data?.rows || []
            totalAllowances.value = response.data.total || response.data?.data?.total || 0
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat data'
        } finally {
            loading.value = false
        }
    }

    const generateAllowances = async (month: number, year: number, force: boolean = false) => {
        generating.value = true
        error.value = null
        try {
            const response = await $axios.post('/api/transport-allowance/generate', {
                month,
                year,
                force,
            })
            await fetchAllowances()
            return response.data
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gagal generate data tunjangan'
            error.value = msg
            throw err
        } finally {
            generating.value = false
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
        generating,
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
        generateAllowances,
        getMonthYear,
        formatCurrency,
    }
}
