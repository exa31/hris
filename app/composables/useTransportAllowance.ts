import { ref, computed } from 'vue'
import { useTransportSettings } from './useTransportSettings'
import { useEmployees } from './useEmployees'

export interface TransportAllowance {
    id: number
    employeeId: number
    employeeName: string
    nip: string
    departemen: string
    bulan: number // 1-12
    tahun: number
    jarak: number // km (bisa desimal)
    hariMasukKerja: number
    statusPembayaran: 'pending' | 'paid' | 'rejected'
    tunjangan: number // Rp (auto-calculated)
    keterangan?: string
    tanggalBuat: string
}

// Dummy data untuk tunjangan transport
const dummyAllowances: TransportAllowance[] = [
    {
        id: 1,
        employeeId: 1,
        employeeName: 'Budi Santoso',
        nip: '2024001',
        departemen: 'HRD',
        bulan: 3,
        tahun: 2026,
        jarak: 12.3,
        hariMasukKerja: 22,
        statusPembayaran: 'paid',
        tunjangan: 0,
        tanggalBuat: '2026-03-01'
    },
    {
        id: 2,
        employeeId: 2,
        employeeName: 'Siti Nur Syamsi',
        nip: '2024002',
        departemen: 'Marketing',
        bulan: 3,
        tahun: 2026,
        jarak: 8.7,
        hariMasukKerja: 20,
        statusPembayaran: 'pending',
        tunjangan: 0,
        tanggalBuat: '2026-03-01'
    },
    {
        id: 3,
        employeeId: 3,
        employeeName: 'Rinto Harahap',
        nip: '2024003',
        departemen: 'Production',
        bulan: 3,
        tahun: 2026,
        jarak: 3.2,
        hariMasukKerja: 19,
        statusPembayaran: 'pending',
        tunjangan: 0,
        tanggalBuat: '2026-03-01'
    }
]

// State
const allowances = ref<TransportAllowance[]>(dummyAllowances)
const searchQuery = ref('')
const filterMonth = ref(new Date().getMonth() + 1)
const filterYear = ref(new Date().getFullYear())
const filterStatus = ref<'all' | 'pending' | 'paid' | 'rejected'>('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Helper: Pembulatan km sesuai aturan
const roundKm = (km: number): number => {
    const decimal = km - Math.floor(km)
    if (decimal < 0.5) {
        return Math.floor(km)
    } else {
        return Math.ceil(km)
    }
}

// Helper: Hitung tunjangan transport
const calculateAllowance = (allowance: TransportAllowance): number => {
    const settings = useTransportSettings()
    const s = settings.getSettings()

    // Check if employee is tetap (permanent)
    const employees = useEmployees()
    const employee = employees.getEmployee(allowance.employeeId)
    if (!employee) return 0

    // Minimal hari kerja harus 19 hari
    if (allowance.hariMasukKerja < s.minWorkingDays) {
        return 0
    }

    // Jarak harus minimal 5km
    if (allowance.jarak < s.minDistance) {
        return 0
    }

    // Jarak maksimal 25km
    let effectiveKm = allowance.jarak > s.maxDistance ? s.maxDistance : allowance.jarak

    // Pembulatan km
    effectiveKm = roundKm(effectiveKm)

    // Rumus: base fare x km x hari masuk
    const tunjangan = s.baseFare * effectiveKm * allowance.hariMasukKerja

    return tunjangan
}

export const useTransportAllowance = () => {
    // Calculate allowance untuk semua entries
    const calculateAllAllowances = () => {
        allowances.value.forEach(a => {
            a.tunjangan = calculateAllowance(a)
        })
    }

    // Filter & Sort
    const filteredAllowances = computed(() => {
        calculateAllAllowances()

        return allowances.value.filter(a => {
            const matchSearch =
                a.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                a.nip.includes(searchQuery.value)
            const matchMonth = a.bulan === filterMonth.value
            const matchYear = a.tahun === filterYear.value
            const matchStatus = filterStatus.value === 'all' ? true : a.statusPembayaran === filterStatus.value

            return matchSearch && matchMonth && matchYear && matchStatus
        })
    })

    // Pagination
    const paginatedAllowances = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        return filteredAllowances.value.slice(start, start + itemsPerPage.value)
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredAllowances.value.length / itemsPerPage.value)
    })

    const totalAllowances = computed(() => {
        return filteredAllowances.value.length
    })

    const addAllowance = (allowance: Omit<TransportAllowance, 'id' | 'tunjangan'>) => {
        const newAllowance: TransportAllowance = {
            ...allowance,
            id: Math.max(...allowances.value.map(a => a.id), 0) + 1,
            tunjangan: 0
        }
        newAllowance.tunjangan = calculateAllowance(newAllowance)
        allowances.value.push(newAllowance)
    }

    const updateAllowance = (id: number, updates: Partial<TransportAllowance>) => {
        const idx = allowances.value.findIndex(a => a.id === id)
        if (idx !== -1) {
            allowances.value[idx] = { ...allowances.value[idx], ...updates } as TransportAllowance
            if (allowances.value[idx]) {
                allowances.value[idx].tunjangan = calculateAllowance(allowances.value[idx])
            }
        }
    }

    const deleteAllowance = (id: number) => {
        allowances.value = allowances.value.filter(a => a.id !== id)
    }

    const updateStatus = (id: number, status: 'pending' | 'paid' | 'rejected') => {
        const idx = allowances.value.findIndex(a => a.id === id)
        if (idx !== -1 && allowances.value[idx]) {
            allowances.value[idx].statusPembayaran = status
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

    return {
        // State
        allowances,
        searchQuery,
        filterMonth,
        filterYear,
        filterStatus,
        currentPage,
        itemsPerPage,
        // Computed
        filteredAllowances,
        paginatedAllowances,
        totalPages,
        totalAllowances,
        // Methods
        addAllowance,
        updateAllowance,
        deleteAllowance,
        updateStatus,
        calculateAllowance,
        getMonthYear,
        formatCurrency
    }
}
