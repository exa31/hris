import { ref, computed } from 'vue'

export interface User {
    id: number
    employee_id: number
    employee_name: string
    username: string
    password_hash?: string
    role_id: number
    role_name: string
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export interface CreateUserPayload {
    employee_id: number
    username: string
    password: string
    role_id: number
    is_active: boolean
}

export interface UpdateUserPayload {
    username?: string
    role_id?: number
    is_active?: boolean
    password?: string
}

// Dummy Users Data
const dummyUsers: User[] = [
    {
        id: 1,
        employee_id: 1,
        employee_name: 'Budi Santoso',
        username: 'budi.santoso',
        role_id: 1,
        role_name: 'Superadmin',
        is_active: true,
        created_at: '2024-01-15T10:30:00Z'
    },
    {
        id: 2,
        employee_id: 2,
        employee_name: 'Siti Nurhaliza',
        username: 'siti.nurhaliza',
        role_id: 2,
        role_name: 'Manager HRD',
        is_active: true,
        created_at: '2024-01-20T14:20:00Z'
    },
    {
        id: 3,
        employee_id: 3,
        employee_name: 'Ahmad Rahman',
        username: 'ahmad.rahman',
        role_id: 3,
        role_name: 'Admin HRD',
        is_active: true,
        created_at: '2024-02-10T09:15:00Z'
    }
]

const users = ref<User[]>(dummyUsers)
let nextId = Math.max(...dummyUsers.map(u => u.id), 0) + 1

export const useUsers = () => {
    // Get all users
    const getUsers = async (): Promise<User[]> => {
        // return await $fetch('/api/users')
        return users.value
    }

    // Get user by ID
    const getUserById = (id: number): User | undefined => {
        return users.value.find(u => u.id === id)
    }

    // Get user by username
    const getUserByUsername = (username: string): User | undefined => {
        return users.value.find(u => u.username === username)
    }

    // Create new user
    const createUser = async (payload: CreateUserPayload): Promise<User> => {
        // Get employee name from employees data (simple approach)
        // In real app, this should come from the role lookup
        const employeeNameMap: Record<number, string> = {
            1: 'Budi Santoso',
            2: 'Siti Nurhaliza',
            3: 'Ahmad Rahman'
        }

        const newUser: User = {
            id: nextId++,
            employee_id: payload.employee_id,
            employee_name: employeeNameMap[payload.employee_id] || 'Employee',
            username: payload.username,
            role_id: payload.role_id,
            role_name: 'Role', // TODO: get from roles
            is_active: payload.is_active,
            created_at: new Date().toISOString()
        }
        users.value.push(newUser)
        return newUser
    }

    // Update user
    const updateUser = async (id: number, payload: UpdateUserPayload): Promise<User | null> => {
        const user = getUserById(id)
        if (!user) return null

        Object.assign(user, {
            ...payload,
            updated_at: new Date().toISOString()
        })
        return user
    }

    // Delete user
    const deleteUser = async (id: number): Promise<boolean> => {
        const index = users.value.findIndex(u => u.id === id)
        if (index === -1) return false
        users.value.splice(index, 1)
        return true
    }

    // Check if username exists
    const checkUsernameExists = (username: string, excludeId?: number): boolean => {
        return users.value.some(u => u.username === username && u.id !== excludeId)
    }

    // Filtered and paginated users
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const searchQuery = ref('')
    const filterStatus = ref<boolean | null>(null)

    const filteredUsers = computed(() => {
        return users.value.filter(user => {
            const matchesSearch =
                !searchQuery.value ||
                user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                user.employee_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                user.role_name.toLowerCase().includes(searchQuery.value.toLowerCase())

            const matchesStatus = filterStatus.value === null || user.is_active === filterStatus.value

            return matchesSearch && matchesStatus
        })
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
    })

    const paginatedUsers = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredUsers.value.slice(start, end)
    })

    // Reset pagination when filter changes
    const resetPagination = () => {
        currentPage.value = 1
    }

    return {
        users: computed(() => users.value),
        getUsers,
        getUserById,
        getUserByUsername,
        createUser,
        updateUser,
        deleteUser,
        checkUsernameExists,
        // Search and filter
        searchQuery,
        filterStatus,
        filteredUsers,
        paginatedUsers,
        currentPage,
        totalPages,
        itemsPerPage,
        resetPagination
    }
}
