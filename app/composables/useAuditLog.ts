import { ref, computed } from 'vue'

export interface AuditLog {
    id: number
    userId: string
    userName: string
    timestamp: string
    modul: string
    aksi: 'create' | 'read' | 'update' | 'delete'
    deskripsi: string
    ipAddress?: string
    userAgent?: string
}

// Dummy audit logs
const dummyLogs: AuditLog[] = [
    {
        id: 1,
        userId: 'user001',
        userName: 'Budi Santoso',
        timestamp: '2026-04-01T08:30:00',
        modul: 'Pegawai',
        aksi: 'read',
        deskripsi: 'Melihat list data pegawai',
        ipAddress: '192.168.1.100'
    },
    {
        id: 2,
        userId: 'user002',
        userName: 'Siti Nur Syamsi',
        timestamp: '2026-04-01T09:15:00',
        modul: 'Tunjangan Transport',
        aksi: 'update',
        deskripsi: 'Update tunjangan transport untuk bulan Maret',
        ipAddress: '192.168.1.101'
    },
    {
        id: 3,
        userId: 'user001',
        userName: 'Budi Santoso',
        timestamp: '2026-04-01T10:00:00',
        modul: 'Pegawai',
        aksi: 'create',
        deskripsi: 'Tambah data pegawai baru',
        ipAddress: '192.168.1.100'
    },
    {
        id: 4,
        userId: 'user003',
        userName: 'Rinto Harahap',
        timestamp: '2026-04-01T10:45:00',
        modul: 'Setting Tunjangan',
        aksi: 'update',
        deskripsi: 'Ubah tariff per km menjadi Rp 2.500',
        ipAddress: '192.168.1.102'
    },
    {
        id: 5,
        userId: 'user001',
        userName: 'Budi Santoso',
        timestamp: '2026-04-01T11:30:00',
        modul: 'Pegawai',
        aksi: 'delete',
        deskripsi: 'Hapus data pegawai ID #5',
        ipAddress: '192.168.1.100'
    }
]

// State
const logs = ref<AuditLog[]>(dummyLogs)
const searchQuery = ref('')
const filterModul = ref<string>('all')
const filterAksi = ref<string>('all')
const filterUser = ref<string>('all')
const filterDateFrom = ref<string>('')
const filterDateTo = ref<string>('')
const currentPage = ref(1)
const itemsPerPage = ref(15)
const sortBy = ref<'timestamp' | 'userName' | 'modul' | 'aksi'>('timestamp')
const sortOrder = ref<'asc' | 'desc'>('desc')

export const useAuditLog = () => {
    // Get unique values for filters
    const uniqueModuls = computed(() => {
        const moduls = [...new Set(logs.value.map(l => l.modul))]
        return moduls.sort()
    })

    const uniqueUsers = computed(() => {
        const users = [...new Set(logs.value.map(l => l.userName))]
        return users.sort()
    })

    const uniqueAksi = computed(() => {
        const aksi = [...new Set(logs.value.map(l => l.aksi))]
        return aksi.sort()
    })

    // Filter & Sort
    const filteredLogs = computed(() => {
        let filtered = logs.value.filter(log => {
            const matchSearch =
                log.userName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                log.modul.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                log.deskripsi.toLowerCase().includes(searchQuery.value.toLowerCase())

            const matchModul = filterModul.value === 'all' ? true : log.modul === filterModul.value
            const matchAksi = filterAksi.value === 'all' ? true : log.aksi === filterAksi.value
            const matchUser = filterUser.value === 'all' ? true : log.userName === filterUser.value

            let matchDate = true
            if (filterDateFrom.value) {
                matchDate = matchDate && log.timestamp >= filterDateFrom.value
            }
            if (filterDateTo.value) {
                matchDate = matchDate && log.timestamp <= filterDateTo.value
            }

            return matchSearch && matchModul && matchAksi && matchUser && matchDate
        })

        // Sort
        filtered.sort((a, b) => {
            let compareValue = 0
            switch (sortBy.value) {
                case 'timestamp':
                    compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    break
                case 'userName':
                    compareValue = a.userName.localeCompare(b.userName)
                    break
                case 'modul':
                    compareValue = a.modul.localeCompare(b.modul)
                    break
                case 'aksi':
                    compareValue = a.aksi.localeCompare(b.aksi)
                    break
            }
            return sortOrder.value === 'asc' ? compareValue : -compareValue
        })

        return filtered
    })

    // Pagination
    const paginatedLogs = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        return filteredLogs.value.slice(start, start + itemsPerPage.value)
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredLogs.value.length / itemsPerPage.value)
    })

    const totalLogs = computed(() => {
        return filteredLogs.value.length
    })

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const addLog = (log: Omit<AuditLog, 'id'>) => {
        const newLog: AuditLog = {
            ...log,
            id: Math.max(...logs.value.map(l => l.id), 0) + 1
        }
        logs.value.unshift(newLog) // prepend
    }

    const resetFilters = () => {
        searchQuery.value = ''
        filterModul.value = 'all'
        filterAksi.value = 'all'
        filterUser.value = 'all'
        filterDateFrom.value = ''
        filterDateTo.value = ''
        currentPage.value = 1
    }

    return {
        // State
        logs,
        searchQuery,
        filterModul,
        filterAksi,
        filterUser,
        filterDateFrom,
        filterDateTo,
        currentPage,
        itemsPerPage,
        sortBy,
        sortOrder,
        // Computed
        uniqueModuls,
        uniqueUsers,
        uniqueAksi,
        filteredLogs,
        paginatedLogs,
        totalPages,
        totalLogs,
        // Methods
        formatDateTime,
        addLog,
        resetFilters
    }
}
