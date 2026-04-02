import { ref, computed, watch } from 'vue'
import type { User, SearchUsersInput } from '~~/server/model/user.model'

export const useUsers = () => {
    const { $axios } = useNuxtApp()

    // State
    const users = ref<User[]>([])
    const totalCount = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Filters & Pagination
    const searchQuery = ref('')
    const filterStatus = ref<boolean | null>(null)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const getUsers = async () => {
        loading.value = true
        error.value = null
        try {
            const params: Partial<SearchUsersInput> = {
                limit: itemsPerPage.value,
                offset: (currentPage.value - 1) * itemsPerPage.value,
                search: searchQuery.value || undefined,
                is_active: filterStatus.value !== null ? filterStatus.value : undefined
            }

            const response = await $axios.get('/api/users', { params })
            // Our API returns { status, message, data: { users, pagination } }
            // But if there is a global interceptor, it might be different.
            // Based on server/utils/response.ts, it returns { status: 'success', message, data }
            const result = response.data
            users.value = result.users
            totalCount.value = result.pagination.total
            return result
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat data user'
            console.error('Error fetching users:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getUserById = async (id: number) => {
        loading.value = true
        try {
            const response = await $axios.get(`/api/users/${id}`)
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memuat detail user'
            throw err
        } finally {
            loading.value = false
        }
    }

    const createUser = async (data: any) => {
        loading.value = true
        try {
            const response = await $axios.post('/api/users', data)
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal membuat user'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateUser = async (id: number, data: any) => {
        loading.value = true
        try {
            const response = await $axios.put(`/api/users/${id}`, data)
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal memperbarui user'
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteUser = async (id: number) => {
        loading.value = true
        try {
            await $axios.delete(`/api/users/${id}`)
            await getUsers() // Refresh list
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Gagal menghapus user'
            throw err
        } finally {
            loading.value = false
        }
    }

    const getRoles = async () => {
        try {
            const response = await $axios.get('/api/users/roles')
            return response.data
        } catch (err) {
            console.error('Failed to fetch roles:', err)
            return []
        }
    }

    // Computed
    const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value))
    const filteredUsers = computed(() => users.value) // Already filtered from server
    const paginatedUsers = computed(() => users.value) // Already paginated from server

    // Watchers for automatic refresh
    let searchTimeout: any = null
    watch([searchQuery, filterStatus], () => {
        if (searchTimeout) clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            currentPage.value = 1
            getUsers()
        }, 500)
    })

    watch(currentPage, () => {
        getUsers()
    })

    return {
        users,
        totalCount,
        loading,
        error,
        searchQuery,
        filterStatus,
        currentPage,
        itemsPerPage,
        totalPages,
        filteredUsers,
        paginatedUsers,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        getRoles
    }
}

export type { User }