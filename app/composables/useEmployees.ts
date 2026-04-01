import { ref, computed } from 'vue'

export interface Employee {
    id: number
    nip: string
    nama: string
    jabatan: string
    tanggalMasuk: string
    masaKerja: number
    email: string
    noHp: string
    tempatLahir: string
    alamatKecamatan: string
    alamatKabupaten: string
    alamatProvinsi: string
    alamatLengkap: string
    tanggalLahir: string
    statusKawin: string
    jumlahAnak: number
    departemen: string
    usia: number
    pendidikan: Array<{ tingkat: string; sekolah: string; tahunLulus: string }>
    statusAktif: boolean
    foto?: string
}

// Dummy data
const dummyEmployees: Employee[] = [
    {
        id: 1,
        nip: '2024001',
        nama: 'Budi Santoso',
        jabatan: 'Manager',
        tanggalMasuk: '2020-01-15',
        masaKerja: 4,
        email: 'budi@company.com',
        noHp: '+6282218458888',
        tempatLahir: 'Jakarta',
        alamatKecamatan: 'Kramat Jati',
        alamatKabupaten: 'Jakarta Timur',
        alamatProvinsi: 'DKI Jakarta',
        alamatLengkap: 'Jl. Merpati No 123, Jakarta',
        tanggalLahir: '1990-05-20',
        statusKawin: 'kawin',
        jumlahAnak: 2,
        departemen: 'HRD',
        usia: 34,
        pendidikan: [
            { tingkat: 'S1', sekolah: 'Universitas Indonesia', tahunLulus: '2012' }
        ],
        statusAktif: true
    },
    {
        id: 2,
        nip: '2024002',
        nama: 'Siti Nur Syamsi',
        jabatan: 'Staf',
        tanggalMasuk: '2021-03-10',
        masaKerja: 3,
        email: 'siti@company.com',
        noHp: '+6281234567890',
        tempatLahir: 'Bandung',
        alamatKecamatan: 'Andir',
        alamatKabupaten: 'Bandung',
        alamatProvinsi: 'Jawa Barat',
        alamatLengkap: 'Jl. Sukajadi No 456, Bandung',
        tanggalLahir: '1995-08-15',
        statusKawin: 'tidak kawin',
        jumlahAnak: 0,
        departemen: 'Marketing',
        usia: 29,
        pendidikan: [
            { tingkat: 'S1', sekolah: 'ITB', tahunLulus: '2017' }
        ],
        statusAktif: true
    },
    {
        id: 3,
        nip: '2024003',
        nama: 'Rinto Harahap',
        jabatan: 'Magang',
        tanggalMasuk: '2024-01-20',
        masaKerja: 0,
        email: 'rinto@company.com',
        noHp: '+6285555666777',
        tempatLahir: 'Medan',
        alamatKecamatan: 'Medan Baru',
        alamatKabupaten: 'Medan',
        alamatProvinsi: 'Sumatera Utara',
        alamatLengkap: 'Jl. Gatot Subroto No 789, Medan',
        tanggalLahir: '2003-02-10',
        statusKawin: 'tidak kawin',
        jumlahAnak: 0,
        departemen: 'Production',
        usia: 21,
        pendidikan: [
            { tingkat: 'D3', sekolah: 'Politeknik Negeri Medan', tahunLulus: '2023' }
        ],
        statusAktif: true
    }
]

export const useEmployees = () => {
    const employees = ref<Employee[]>(dummyEmployees)
    const loading = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const searchQuery = ref('')
    const selectedJabatan = ref<string[]>([])
    const masaKerjaOperator = ref('>')
    const masaKerjaValue = ref<number | null>(null)
    const sortBy = ref<keyof Employee>('tanggalMasuk')
    const sortOrder = ref<'asc' | 'desc'>('desc')
    const selectedEmployees = ref<number[]>([])

    // Filtering dan searching
    const filteredEmployees = computed(() => {
        let result = [...employees.value]

        // Search
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            result = result.filter(emp =>
                emp.nama.toLowerCase().includes(q) ||
                emp.nip.toLowerCase().includes(q) ||
                emp.jabatan.toLowerCase().includes(q)
            )
        }

        // Filter jabatan
        if (selectedJabatan.value.length > 0) {
            result = result.filter(emp => selectedJabatan.value.includes(emp.jabatan))
        }

        // Filter masa kerja
        if (masaKerjaValue.value !== null) {
            result = result.filter(emp => {
                if (masaKerjaOperator.value === '>') return emp.masaKerja > masaKerjaValue.value!
                if (masaKerjaOperator.value === '<') return emp.masaKerja < masaKerjaValue.value!
                if (masaKerjaOperator.value === '=') return emp.masaKerja === masaKerjaValue.value!
                return true
            })
        }

        return result
    })

    // Sorting
    const sortedEmployees = computed(() => {
        const result = [...filteredEmployees.value]
        result.sort((a, b) => {
            const aVal = a[sortBy.value]
            const bVal = b[sortBy.value]

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
            }

            const aStr = String(aVal).toLowerCase()
            const bStr = String(bVal).toLowerCase()
            return sortOrder.value === 'asc'
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr)
        })
        return result
    })

    // Pagination
    const paginatedEmployees = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return sortedEmployees.value.slice(start, end)
    })

    const totalPages = computed(() =>
        Math.ceil(sortedEmployees.value.length / itemsPerPage.value)
    )

    const totalEmployees = computed(() => sortedEmployees.value.length)

    // Methods
    const getEmployee = (id: number) => {
        return employees.value.find(emp => emp.id === id)
    }

    const addEmployee = (data: Omit<Employee, 'id'>) => {
        const newId = Math.max(...employees.value.map(e => e.id), 0) + 1
        const newEmployee: Employee = {
            id: newId,
            ...data
        }
        employees.value.push(newEmployee)
        return newEmployee
    }

    const updateEmployee = (id: number, data: Partial<Employee>) => {
        const index = employees.value.findIndex(emp => emp.id === id)
        if (index !== -1 && employees.value[index]) {
            employees.value[index] = { ...employees.value[index], ...data }
            return employees.value[index]
        }
        return null
    }

    const deleteEmployee = (id: number) => {
        const index = employees.value.findIndex(emp => emp.id === id)
        if (index !== -1) {
            employees.value.splice(index, 1)
            return true
        }
        return false
    }

    const deleteSelectedEmployees = () => {
        employees.value = employees.value.filter(emp => !selectedEmployees.value.includes(emp.id))
        selectedEmployees.value = []
    }

    const updateStatusBulk = (status: boolean) => {
        selectedEmployees.value.forEach(id => {
            const emp = employees.value.find(e => e.id === id)
            if (emp) emp.statusAktif = status
        })
        selectedEmployees.value = []
    }

    const toggleSelectAll = () => {
        if (selectedEmployees.value.length === paginatedEmployees.value.length) {
            selectedEmployees.value = []
        } else {
            selectedEmployees.value = paginatedEmployees.value.map(emp => emp.id)
        }
    }

    const resetFilters = () => {
        searchQuery.value = ''
        selectedJabatan.value = []
        masaKerjaValue.value = null
        masaKerjaOperator.value = '>'
        currentPage.value = 1
    }

    return {
        // State
        employees,
        loading,
        currentPage,
        itemsPerPage,
        searchQuery,
        selectedJabatan,
        masaKerjaOperator,
        masaKerjaValue,
        sortBy,
        sortOrder,
        selectedEmployees,
        // Computed
        filteredEmployees,
        sortedEmployees,
        paginatedEmployees,
        totalPages,
        totalEmployees,
        // Methods
        getEmployee,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        deleteSelectedEmployees,
        updateStatusBulk,
        toggleSelectAll,
        resetFilters
    }
}
