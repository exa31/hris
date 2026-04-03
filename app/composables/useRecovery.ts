import { ref, computed, watch } from 'vue'

export const useRecovery = () => {
    const { $axios } = useNuxtApp()

    // State for Employees
    const deletedEmployees = ref<any[]>([])
    const totalEmployees = ref(0)
    const employeesLoading = ref(false)
    const employeesError = ref<string | null>(null)
    const employeePage = ref(1)
    const employeeSearch = ref('')

    // State for Users
    const deletedUsers = ref<any[]>([])
    const totalUsers = ref(0)
    const usersLoading = ref(false)
    const usersError = ref<string | null>(null)
    const userPage = ref(1)
    const userSearch = ref('')

    const itemsPerPage = ref(10)

    const fetchDeletedEmployees = async () => {
        employeesLoading.value = true
        employeesError.value = null
        try {
            const params = {
                limit: itemsPerPage.value,
                offset: (employeePage.value - 1) * itemsPerPage.value,
                search: employeeSearch.value || undefined,
            }
            const response = await $axios.get('/api/recovery/employees', { params })
            const result = response.data?.data || response.data
            deletedEmployees.value = result.employees
            totalEmployees.value = result.pagination.total
        } catch (err: any) {
            employeesError.value = err.response?.data?.message || 'Gagal memuat data pegawai yang dihapus'
        } finally {
            employeesLoading.value = false
        }
    }

    const fetchDeletedUsers = async () => {
        usersLoading.value = true
        usersError.value = null
        try {
            const params = {
                limit: itemsPerPage.value,
                offset: (userPage.value - 1) * itemsPerPage.value,
                search: userSearch.value || undefined,
            }
            const response = await $axios.get('/api/recovery/users', { params })
            const result = response.data?.data || response.data
            deletedUsers.value = result.users
            totalUsers.value = result.pagination.total
        } catch (err: any) {
            usersError.value = err.response?.data?.message || 'Gagal memuat data user yang dihapus'
        } finally {
            usersLoading.value = false
        }
    }

    const restoreEmployee = async (id: number) => {
        try {
            const response = await $axios.post(`/api/recovery/employees/${id}/restore`)
            await fetchDeletedEmployees()
            return response.data
        } catch (err: any) {
            throw err.response?.data?.message || 'Gagal memulihkan pegawai'
        }
    }

    const restoreUser = async (id: number) => {
        try {
            const response = await $axios.post(`/api/recovery/users/${id}/restore`)
            await fetchDeletedUsers()
            return response.data
        } catch (err: any) {
            throw err.response?.data?.message || 'Gagal memulihkan user'
        }
    }

    // Computed total pages
    const employeeTotalPages = computed(() => Math.ceil(totalEmployees.value / itemsPerPage.value))
    const userTotalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage.value))

    // Watchers for Employees
    let empSearchTimeout: any = null
    watch(employeeSearch, () => {
        if (empSearchTimeout) clearTimeout(empSearchTimeout)
        empSearchTimeout = setTimeout(() => {
            employeePage.value = 1
            fetchDeletedEmployees()
        }, 500)
    })
    watch(employeePage, () => fetchDeletedEmployees())

    // Watchers for Users
    let userSearchTimeout: any = null
    watch(userSearch, () => {
        if (userSearchTimeout) clearTimeout(userSearchTimeout)
        userSearchTimeout = setTimeout(() => {
            userPage.value = 1
            fetchDeletedUsers()
        }, 500)
    })
    watch(userPage, () => fetchDeletedUsers())

    return {
        // Employees
        deletedEmployees,
        totalEmployees,
        employeesLoading,
        employeesError,
        employeePage,
        employeeSearch,
        employeeTotalPages,
        fetchDeletedEmployees,
        restoreEmployee,

        // Users
        deletedUsers,
        totalUsers,
        usersLoading,
        usersError,
        userPage,
        userSearch,
        userTotalPages,
        fetchDeletedUsers,
        restoreUser,

        itemsPerPage
    }
}
